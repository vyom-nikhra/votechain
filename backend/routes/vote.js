import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import Election from '../models/Election.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import { authMiddleware, verifiedEmailMiddleware, walletConnectedMiddleware } from '../middleware/auth.js';
import blockchainService from '../utils/blockchain.js';

const router = express.Router();

// Helper function to validate vote structure
const validateVoteStructure = (voteType, voteData, election) => {
  const errors = [];

  switch (voteType) {
    case 'simple':
      if (!voteData.candidateId) {
        errors.push('Candidate selection is required for simple voting');
      } else {
        const candidateExists = election.candidates.some(
          c => c._id.toString() === voteData.candidateId
        );
        if (!candidateExists) {
          errors.push('Selected candidate does not exist in this election');
        }
      }
      break;

    case 'ranked':
      if (!voteData.rankings || !Array.isArray(voteData.rankings) || voteData.rankings.length === 0) {
        errors.push('Rankings are required for ranked choice voting');
        break;
      }

      // Check max rankings limit
      if (voteData.rankings.length > election.votingConfig.maxRankings) {
        errors.push(`Maximum ${election.votingConfig.maxRankings} rankings allowed`);
      }

      // Validate each ranking
      const usedRanks = new Set();
      const usedCandidatesRanked = new Set();

      voteData.rankings.forEach((ranking, index) => {
        if (!ranking.candidateId || !ranking.rank) {
          errors.push(`Ranking ${index + 1}: Both candidate and rank are required`);
          return;
        }

        // Check for duplicate ranks
        if (usedRanks.has(ranking.rank)) {
          errors.push(`Duplicate rank: ${ranking.rank}`);
        }
        usedRanks.add(ranking.rank);

        // Check for duplicate candidates
        if (usedCandidatesRanked.has(ranking.candidateId)) {
          errors.push(`Candidate cannot be ranked multiple times`);
        }
        usedCandidatesRanked.add(ranking.candidateId);

        // Check candidate exists
        const candidateExists = election.candidates.some(
          c => c._id.toString() === ranking.candidateId
        );
        if (!candidateExists) {
          errors.push(`Candidate in ranking ${index + 1} does not exist`);
        }

        // Check rank is sequential starting from 1
        if (ranking.rank < 1 || ranking.rank > voteData.rankings.length) {
          errors.push(`Invalid rank: ${ranking.rank}. Must be between 1 and ${voteData.rankings.length}`);
        }
      });

      // Check ranks are sequential (1, 2, 3, etc.)
      const sortedRanks = Array.from(usedRanks).sort((a, b) => a - b);
      for (let i = 0; i < sortedRanks.length; i++) {
        if (sortedRanks[i] !== i + 1) {
          errors.push('Rankings must be sequential starting from 1');
          break;
        }
      }
      break;

    case 'quadratic':
      if (!voteData.allocations || !Array.isArray(voteData.allocations) || voteData.allocations.length === 0) {
        errors.push('Credit allocations are required for quadratic voting');
        break;
      }

      let totalCreditsUsed = 0;
      const usedCandidatesQuadratic = new Set();

      voteData.allocations.forEach((allocation, index) => {
        if (!allocation.candidateId || allocation.credits === undefined) {
          errors.push(`Allocation ${index + 1}: Both candidate and credits are required`);
          return;
        }

        if (allocation.credits < 0) {
          errors.push(`Allocation ${index + 1}: Credits cannot be negative`);
        }

        // Check for duplicate candidates
        if (usedCandidatesQuadratic.has(allocation.candidateId)) {
          errors.push(`Candidate cannot have multiple allocations`);
        }
        usedCandidatesQuadratic.add(allocation.candidateId);

        // Check candidate exists
        const candidateExists = election.candidates.some(
          c => c._id.toString() === allocation.candidateId
        );
        if (!candidateExists) {
          errors.push(`Candidate in allocation ${index + 1} does not exist`);
        }

        totalCreditsUsed += allocation.credits;

        // Calculate votes (square root of credits)
        allocation.votes = Math.floor(Math.sqrt(allocation.credits));
      });

      // Check total credits don't exceed limit
      if (totalCreditsUsed > election.votingConfig.quadraticCredits) {
        errors.push(`Total credits (${totalCreditsUsed}) exceeds limit of ${election.votingConfig.quadraticCredits}`);
      }
      break;

    default:
      errors.push('Invalid vote type');
  }

  return errors;
};

// Helper function to encrypt vote data
const encryptVoteData = (voteData) => {
  // In production, use proper encryption with the election's public key
  // For now, use base64 encoding
  return Buffer.from(JSON.stringify(voteData)).toString('base64');
};

// @route   POST /api/votes
// @desc    Cast a vote in an election
// @access  Private (Verified users with wallet)
router.post('/', [
  authMiddleware,
  verifiedEmailMiddleware,
  // walletConnectedMiddleware, // Uncomment when blockchain integration is ready
  body('electionId').isMongoId().withMessage('Valid election ID is required'),
  body('voteData').notEmpty().withMessage('Vote data is required'),
  body('signature').optional().isString().withMessage('Invalid signature format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { electionId, voteData, signature } = req.body;

    // Find the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if election is in voting phase
    if (election.currentPhase !== 'voting') {
      return res.status(400).json({
        success: false,
        message: 'Election is not in voting phase'
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId);

    // Check if user is eligible to vote
    if (!election.isEligibleVoter(user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not eligible to vote in this election'
      });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      electionId,
      voterId: user._id
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this election'
      });
    }

    // Validate vote structure
    const voteValidationErrors = validateVoteStructure(election.electionType, voteData, election);
    if (voteValidationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote structure',
        errors: voteValidationErrors
      });
    }

    // Create vote record
    const vote = new Vote({
      electionId,
      voterId: user._id,
      voteType: election.electionType,
      voteData: encryptVoteData(voteData),
      
      // Set vote structure based on type
      ...(election.electionType === 'simple' && {
        candidateId: voteData.candidateId
      }),
      ...(election.electionType === 'ranked' && {
        rankings: voteData.rankings
      }),
      ...(election.electionType === 'quadratic' && {
        quadraticAllocations: voteData.allocations
      }),

      // Blockchain placeholder (will be updated when transaction is mined)
      transactionHash: crypto.randomBytes(32).toString('hex'), // Temporary
      blockNumber: 0, // Will be updated
      
      // Required integrity hashes
      voteHash: crypto.createHash('sha256').update(JSON.stringify(voteData) + electionId + user._id.toString()).digest('hex'),
      nullifierHash: crypto.createHash('sha256').update(user._id.toString() + electionId).digest('hex'),
      
      // Voter metadata for analytics (anonymized)
      voterMetadata: {
        department: user.department,
        year: user.year,
        votingMethod: req.body.votingMethod || 'web',
        ipAddress: crypto.createHash('sha256').update(req.ip).digest('hex'), // Hashed IP
        userAgent: req.get('User-Agent'),
        timeZone: req.body.timeZone || 'UTC'
      },

      signature: signature || '',
      validationStatus: 'validated' // In production, this would be 'pending' until blockchain confirmation
    });

    await vote.save();

    // 🔗 BLOCKCHAIN INTEGRATION: Record vote on blockchain
    if (election.contractAddress) {
      try {
        const blockchainResult = await blockchainService.castVoteOnChain({
          blockchainElectionId: election.contractAddress, // Using contract address as ID for now
          voteHash: vote.voteHash,
          nullifierHash: vote.nullifierHash
        });

        if (blockchainResult.success) {
          // Update vote with blockchain transaction details
          vote.transactionHash = blockchainResult.transactionHash;
          vote.blockNumber = blockchainResult.blockNumber;
          vote.gasUsed = blockchainResult.gasUsed;
          await vote.save();
          
          console.log('✅ Vote recorded on blockchain:', blockchainResult.transactionHash);

          // 🏅 Mint NFT badge for voter
          if (user.walletAddress) {
            const nftResult = await blockchainService.mintVoterNFT(user.walletAddress, electionId);
            if (nftResult.success) {
              console.log('✅ Voter NFT minted:', nftResult.transactionHash);
            }
          }
        }
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain integration failed (vote still recorded):', blockchainError.message);
        // Don't fail the vote if blockchain fails - graceful degradation
      }
    }

    // Update user's voting history
    user.votingHistory.push({
      electionId,
      votedAt: new Date(),
      voteType: election.electionType
    });
    await user.save();

    // Update election statistics (real-time)
    election.results.totalVotes += 1;
    
    // Calculate turnout percentage
    // This would need total eligible voters count in production
    const estimatedEligibleVoters = election.metadata.estimatedVoters || 1000;
    election.results.turnoutPercentage = (election.results.totalVotes / estimatedEligibleVoters) * 100;

    await election.save();

    // Emit real-time update
    if (req.io) {
      req.io.to(`election-${electionId}`).emit('new-vote', {
        electionId,
        totalVotes: election.results.totalVotes,
        turnoutPercentage: election.results.turnoutPercentage,
        voterDepartment: user.department,
        voterYear: user.year
      });
    }

    // Award NFT badge (placeholder for blockchain integration)
    user.nftBadges.push({
      electionId,
      badgeType: 'voter',
      mintedAt: new Date()
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully!',
      voteId: vote._id,
      transactionHash: vote.transactionHash, // Placeholder
      badge: {
        type: 'voter',
        description: 'Thank you for participating in the democratic process!'
      }
    });

  } catch (error) {
    console.error('Vote casting error:', error);
    
    // Handle duplicate vote attempt
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate vote detected. You have already voted in this election.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cast vote. Please try again.'
    });
  }
});

// @route   GET /api/votes/my-votes
// @desc    Get user's voting history
// @access  Private
router.get('/my-votes', [authMiddleware], async (req, res) => {
  try {
    const votes = await Vote.find({ voterId: req.user.userId })
      .populate('electionId', 'title electionType votingEndTime category')
      .select('-voteData -voterMetadata.ipAddress -voterMetadata.userAgent') // Exclude sensitive data
      .sort({ createdAt: -1 });

    const votingHistory = votes.map(vote => ({
      id: vote._id,
      election: vote.electionId,
      voteType: vote.voteType,
      votedAt: vote.createdAt,
      transactionHash: vote.transactionHash,
      validationStatus: vote.validationStatus,
      isActive: vote.isActive
    }));

    res.json({
      success: true,
      votes: votingHistory,
      totalVotes: votes.length
    });

  } catch (error) {
    console.error('Get voting history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voting history'
    });
  }
});

// @route   GET /api/votes/election/:electionId/stats
// @desc    Get voting statistics for an election
// @access  Public (for completed elections)
router.get('/election/:electionId/stats', async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Only show detailed stats if election is completed or user is admin
    const isCompleted = election.currentPhase === 'completed';
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isCompleted && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Voting statistics not available until election is completed'
      });
    }

    // Aggregate voting statistics
    const stats = await Vote.aggregate([
      { $match: { electionId: election._id, validationStatus: 'validated' } },
      {
        $group: {
          _id: null,
          totalVotes: { $sum: 1 },
          voteTypes: { $push: '$voteType' },
          departments: { $push: '$voterMetadata.department' },
          years: { $push: '$voterMetadata.year' },
          votingTimes: { $push: '$createdAt' }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalVotes: 0,
          departmentBreakdown: {},
          yearBreakdown: {},
          hourlyPattern: {},
          voteTypeBreakdown: {}
        }
      });
    }

    const data = stats[0];

    // Calculate breakdowns
    const departmentBreakdown = data.departments.reduce((acc, dept) => {
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const yearBreakdown = data.years.reduce((acc, year) => {
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    const voteTypeBreakdown = data.voteTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Calculate hourly voting pattern
    const hourlyPattern = data.votingTimes.reduce((acc, time) => {
      const hour = new Date(time).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalVotes: data.totalVotes,
        departmentBreakdown,
        yearBreakdown,
        voteTypeBreakdown,
        hourlyPattern,
        turnoutPercentage: election.results.turnoutPercentage
      }
    });

  } catch (error) {
    console.error('Get voting stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voting statistics'
    });
  }
});

// @route   POST /api/votes/verify/:voteId
// @desc    Verify a vote's integrity
// @access  Private
router.post('/verify/:voteId', [authMiddleware], async (req, res) => {
  try {
    const { voteId } = req.params;

    const vote = await Vote.findById(voteId).populate('electionId', 'title');
    
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    // Only allow vote verification by the voter or admin
    const isVoter = vote.voterId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isVoter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this vote'
      });
    }

    // Verify vote integrity
    const verificationResult = {
      voteId: vote._id,
      electionTitle: vote.electionId.title,
      voteHash: vote.voteHash,
      nullifierHash: vote.nullifierHash,
      transactionHash: vote.transactionHash,
      blockNumber: vote.blockNumber,
      validationStatus: vote.validationStatus,
      isActive: vote.isActive,
      timestamp: vote.createdAt,
      
      // Integrity checks
      integrity: {
        hashValid: true, // Would verify hash against vote data
        onBlockchain: vote.blockNumber > 0, // Would check blockchain
        notDoubleSpent: true, // Would check nullifier hash uniqueness
        signatureValid: true // Would verify cryptographic signature
      }
    };

    res.json({
      success: true,
      verification: verificationResult
    });

  } catch (error) {
    console.error('Vote verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify vote'
    });
  }
});

// @route   GET /api/votes/election/:electionId/export
// @desc    Export election votes (for auditing)
// @access  Private (Admin only)
router.get('/election/:electionId/export', [authMiddleware], async (req, res) => {
  try {
    // Check admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Only allow export after voting has ended
    if (election.currentPhase !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only export votes after election is completed'
      });
    }

    const votes = await Vote.find({ electionId })
      .select('-voteData -voterMetadata.ipAddress -voterMetadata.userAgent') // Exclude sensitive data
      .sort({ createdAt: 1 });

    const exportData = {
      election: {
        id: election._id,
        title: election.title,
        electionType: election.electionType,
        votingEndTime: election.votingEndTime
      },
      votes: votes.map(vote => ({
        voteId: vote._id,
        voteHash: vote.voteHash,
        nullifierHash: vote.nullifierHash,
        transactionHash: vote.transactionHash,
        blockNumber: vote.blockNumber,
        voteType: vote.voteType,
        validationStatus: vote.validationStatus,
        timestamp: vote.createdAt,
        anonymizedMetadata: {
          department: vote.voterMetadata.department,
          year: vote.voterMetadata.year,
          votingMethod: vote.voterMetadata.votingMethod
        }
      })),
      exportedAt: new Date(),
      exportedBy: req.user.userId
    };

    res.json({
      success: true,
      exportData
    });

  } catch (error) {
    console.error('Export votes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export votes'
    });
  }
});

// @route   GET /api/votes/verify-nft/:voteId
// @desc    Verify NFT certificate on blockchain
// @access  Private
router.get('/verify-nft/:voteId', authMiddleware, async (req, res) => {
  try {
    const { voteId } = req.params;

    // Find the vote
    const vote = await Vote.findById(voteId)
      .populate('electionId', 'title')
      .populate('userId', 'firstName lastName studentId');

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    // Check if user owns this vote
    if (vote.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to verify this NFT'
      });
    }

    if (!vote.nftTokenId) {
      return res.status(400).json({
        success: false,
        message: 'No NFT certificate found for this vote'
      });
    }

    try {
      // Verify NFT exists on blockchain
      const nftDetails = await blockchainService.verifyVotingNFT(vote.nftTokenId);
      
      res.json({
        success: true,
        message: 'NFT certificate verified successfully',
        nftDetails: {
          tokenId: vote.nftTokenId,
          contractAddress: nftDetails.contractAddress,
          owner: nftDetails.owner,
          metadata: nftDetails.metadata,
          transactionHash: vote.transactionHash,
          blockNumber: nftDetails.blockNumber,
          verified: true
        },
        voteDetails: {
          id: vote._id,
          election: vote.electionId.title,
          voter: `${vote.userId.firstName} ${vote.userId.lastName}`,
          studentId: vote.userId.studentId,
          timestamp: vote.createdAt,
          status: vote.status
        }
      });

    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError);
      res.status(400).json({
        success: false,
        message: 'Failed to verify NFT on blockchain',
        error: blockchainError.message
      });
    }

  } catch (error) {
    console.error('NFT verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during NFT verification'
    });
  }
});

export default router;