import express from 'express';
import Election from '../models/Election.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for current user
// @access  Private
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's voting statistics
    const totalVotes = await Vote.countDocuments({ voterId: userId });
    
    // Get elections user can participate in
    const user = await User.findById(userId);
    const totalElections = await Election.countDocuments({
      isActive: true,
      $or: [
        { eligibleDepartments: { $size: 0 } }, // Open to all departments
        { eligibleDepartments: user.department },
        { eligibleYears: { $size: 0 } }, // Open to all years
        { eligibleYears: user.year }
      ]
    });

    // Get active elections count
    const now = new Date();
    const activeElections = await Election.countDocuments({
      isActive: true,
      votingStartTime: { $lte: now },
      votingEndTime: { $gte: now }
    });

    // Get NFT badges count (mock for now - will connect to blockchain later)
    const nftBadges = totalVotes; // For now, 1 NFT per vote

    // Get recent voting activity
    const recentVotes = await Vote.find({ voterId: userId })
      .populate('electionId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalElections,
        votescast: totalVotes,
        activeElections,
        nftBadges,
        recentActivity: recentVotes.map(vote => ({
          electionTitle: vote.electionId?.title || 'Unknown Election',
          votedAt: vote.createdAt,
          transactionHash: vote.transactionHash
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

// @route   GET /api/analytics/elections/:id
// @desc    Get analytics for specific election
// @access  Public
router.get('/elections/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Get vote distribution
    const voteDistribution = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: { _id: '$candidateId', count: { $sum: 1 } } },
      { $lookup: {
        from: 'elections',
        localField: '_id',
        foreignField: 'candidates._id',
        as: 'candidate'
      }}
    ]);

    // Get voting timeline (votes per hour/day)
    const votingTimeline = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    // Get participation by department
    const participationByDepartment = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $lookup: {
        from: 'users',
        localField: 'voterId',
        foreignField: '_id',
        as: 'voter'
      }},
      { $unwind: '$voter' },
      { $group: {
        _id: '$voter.department',
        count: { $sum: 1 }
      }}
    ]);

    // Get participation by year
    const participationByYear = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $lookup: {
        from: 'users',
        localField: 'voterId',
        foreignField: '_id',
        as: 'voter'
      }},
      { $unwind: '$voter' },
      { $group: {
        _id: '$voter.year',
        count: { $sum: 1 }
      }}
    ]);

    const totalVotes = await Vote.countDocuments({ electionId: election._id });
    const totalEligibleUsers = await User.countDocuments({
      isActive: true,
      emailVerified: true,
      ...(election.eligibleDepartments?.length > 0 && {
        department: { $in: election.eligibleDepartments }
      }),
      ...(election.eligibleYears?.length > 0 && {
        year: { $in: election.eligibleYears }
      })
    });

    const participationRate = totalEligibleUsers > 0 
      ? Math.round((totalVotes / totalEligibleUsers) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        electionId: election._id,
        title: election.title,
        totalVotes,
        totalEligibleUsers,
        participationRate,
        voteDistribution,
        votingTimeline,
        participationByDepartment,
        participationByYear,
        status: election.currentPhase,
        startDate: election.votingStartTime,
        endDate: election.votingEndTime
      }
    });

  } catch (error) {
    console.error('Election analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election analytics'
    });
  }
});

// @route   GET /api/analytics/user
// @desc    Get detailed user analytics
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's complete voting history
    const votingHistory = await Vote.find({ voterId: userId })
      .populate('electionId', 'title description votingStartTime votingEndTime')
      .sort({ createdAt: -1 });

    // Get user's voting streak
    const votingDates = votingHistory.map(vote => 
      new Date(vote.createdAt).toDateString()
    );
    const uniqueVotingDays = [...new Set(votingDates)].length;

    // Calculate voting frequency by month
    const monthlyVoting = votingHistory.reduce((acc, vote) => {
      const month = new Date(vote.createdAt).toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Get participation stats
    const user = await User.findById(userId);
    const joinDate = user.createdAt;
    const accountAge = Math.floor((Date.now() - joinDate) / (1000 * 60 * 60 * 24)); // days

    res.json({
      success: true,
      data: {
        totalVotes: votingHistory.length,
        uniqueVotingDays,
        accountAge,
        joinDate,
        votingHistory: votingHistory.slice(0, 10), // Last 10 votes
        monthlyVoting,
        averageVotesPerMonth: Object.keys(monthlyVoting).length > 0 
          ? Math.round(votingHistory.length / Object.keys(monthlyVoting).length) 
          : 0
      }
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

// @route   GET /api/analytics/system
// @desc    Get system-wide analytics (Admin only)
// @access  Private/Admin
router.get('/system', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Get overall statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalElections = await Election.countDocuments({ isActive: true });
    const totalVotes = await Vote.countDocuments();
    const verifiedUsers = await User.countDocuments({ emailVerified: true });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get user distribution by department
    const usersByDepartment = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get user distribution by year
    const usersByYear = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get election activity over time
    const electionActivity = await Election.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get voting activity over time
    const votingActivity = await Vote.aggregate([
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top performing elections
    const topElections = await Vote.aggregate([
      { $group: { _id: '$electionId', voteCount: { $sum: 1 } } },
      { $lookup: {
        from: 'elections',
        localField: '_id',
        foreignField: '_id',
        as: 'election'
      }},
      { $unwind: '$election' },
      { $project: {
        title: '$election.title',
        voteCount: 1,
        participationRate: 1
      }},
      { $sort: { voteCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalElections,
          totalVotes,
          verifiedUsers,
          recentRegistrations,
          verificationRate: Math.round((verifiedUsers / totalUsers) * 100)
        },
        userDistribution: {
          byDepartment: usersByDepartment,
          byYear: usersByYear
        },
        activity: {
          elections: electionActivity,
          votes: votingActivity
        },
        topElections
      }
    });

  } catch (error) {
    console.error('System analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system analytics'
    });
  }
});

// @route   GET /api/analytics/overview-stats
// @desc    Get complete overview statistics for dashboard
// @access  Private
router.get('/overview-stats', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    
    // Basic counts
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ 
      status: 'active',
      votingStartTime: { $lte: new Date() },
      votingEndTime: { $gte: new Date() }
    });
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalVotes = await Vote.countDocuments();
    
    // Elections by status
    const upcomingElections = await Election.countDocuments({
      votingStartTime: { $gt: new Date() }
    });
    const completedElections = await Election.countDocuments({
      votingEndTime: { $lt: new Date() }
    });
    
    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVotes = await Vote.countDocuments({
      createdAt: { $gte: weekAgo }
    });
    const recentElections = await Election.countDocuments({
      createdAt: { $gte: weekAgo }
    });
    
    // Participation rates by department
    const departmentStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 }
        }
      }
    ]);

    const votingByDepartment = await Vote.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'voterId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          votes: { $sum: 1 },
          uniqueVoters: { $addToSet: '$voterId' }
        }
      },
      {
        $addFields: {
          uniqueVoterCount: { $size: '$uniqueVoters' }
        }
      }
    ]);

    // Merge department data
    const departmentParticipation = departmentStats.map(dept => {
      const voting = votingByDepartment.find(v => v._id === dept._id) || { votes: 0, uniqueVoterCount: 0 };
      return {
        department: dept._id || 'Unknown',
        totalStudents: dept.totalStudents,
        votes: voting.votes,
        uniqueVoters: voting.uniqueVoterCount,
        participationRate: dept.totalStudents > 0 ? Math.round((voting.uniqueVoterCount / dept.totalStudents) * 100) : 0
      };
    });

    // Recent elections with vote counts
    const recentElectionsList = await Election.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
    const electionsWithStats = await Promise.all(recentElectionsList.map(async (election) => {
      const voteCount = await Vote.countDocuments({ electionId: election._id });
      return {
        ...election,
        voteCount
      };
    }));

    // Voting trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const votingTrends = await Vote.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          votes: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalElections,
          activeElections,
          upcomingElections,
          completedElections,
          totalUsers,
          totalVotes,
          recentActivity: {
            votesThisWeek: recentVotes,
            electionsThisWeek: recentElections
          }
        },
        departmentParticipation,
        recentElections: electionsWithStats,
        votingTrends: votingTrends.map(trend => ({
          date: trend._id,
          votes: trend.votes
        })),
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics'
    });
  }
});

// @route   GET /api/analytics/live-results/:electionId
// @desc    Get live voting results for an election
// @access  Private (Admin)
router.get('/live-results/:electionId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { electionId } = req.params;

    // Get election details
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    console.log('Election found:', election.title);
    console.log('Election candidates:', election.candidates?.map(c => ({ id: c._id, name: c.name })));

    // Get all votes for this election with candidate details
    const votes = await Vote.find({ electionId })
      .populate('voterId', 'firstName lastName studentId department')
      .sort({ createdAt: -1 });

    console.log('Votes found:', votes.length);
    console.log('Sample vote:', votes[0] ? { 
      candidateId: votes[0].candidateId, 
      voterId: votes[0].voterId?._id,
      voteType: votes[0].voteType 
    } : 'No votes');

    // Calculate results based on election type
    let results = [];
    const totalVotes = votes.length;

    if (election.electionType === 'simple') {
      // Simple voting - count votes per candidate
      const voteCounts = {};
      
      // Ensure we have candidates and initialize with 0 votes
      if (!election.candidates || election.candidates.length === 0) {
        console.log('No candidates found in election');
        results = [];
      } else {
        election.candidates.forEach(candidate => {
          const candidateId = candidate._id.toString();
          console.log('Initializing simple candidate:', candidateId, candidate.name);
          voteCounts[candidateId] = {
            candidate: candidate,
            votes: 0,
            percentage: 0,
            voters: []
          };
        });
      }

      if (Object.keys(voteCounts).length > 0) {
        votes.forEach(vote => {
          // For simple elections, use the direct candidateId field
          if (vote.candidateId) {
            const candidateId = vote.candidateId.toString();
            console.log('Processing vote for candidate:', candidateId);
            if (voteCounts[candidateId]) {
              voteCounts[candidateId].votes++;
              voteCounts[candidateId].voters.push({
                name: `${vote.voterId.firstName} ${vote.voterId.lastName}`,
                studentId: vote.voterId.studentId,
                department: vote.voterId.department,
                timestamp: vote.createdAt
              });
            } else {
              console.log('Vote for unknown candidate:', candidateId);
            }
          }
        });

        // Calculate percentages and convert to array
        results = Object.values(voteCounts).map(item => ({
          ...item,
          percentage: totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100 * 100) / 100 : 0
        })).sort((a, b) => b.votes - a.votes);

        console.log('Final results array:', results.map(r => ({ 
          candidateName: r.candidate?.name, 
          votes: r.votes, 
          percentage: r.percentage 
        })));
      }

    } else if (election.electionType === 'ranked') {
      // Ranked voting - implement instant runoff or simple first choice count
      // For now, count first choices
      const firstChoiceCounts = {};
      
      election.candidates.forEach(candidate => {
        firstChoiceCounts[candidate._id] = {
          candidate: candidate,
          votes: 0,
          percentage: 0,
          voters: []
        };
      });

      votes.forEach(vote => {
        try {
          const decryptedVoteData = vote.decryptVoteData();
          if (decryptedVoteData && decryptedVoteData.rankings && decryptedVoteData.rankings.length > 0) {
            const firstChoice = decryptedVoteData.rankings.find(r => r.rank === 1);
            if (firstChoice && firstChoiceCounts[firstChoice.candidateId]) {
              firstChoiceCounts[firstChoice.candidateId].votes++;
              firstChoiceCounts[firstChoice.candidateId].voters.push({
                name: `${vote.voterId.firstName} ${vote.voterId.lastName}`,
                studentId: vote.voterId.studentId,
                department: vote.voterId.department,
                timestamp: vote.createdAt
              });
            }
          }
        } catch (error) {
          console.error('Error decrypting vote data:', error);
        }
      });

      results = Object.values(firstChoiceCounts).map(item => ({
        ...item,
        percentage: totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100 * 100) / 100 : 0
      })).sort((a, b) => b.votes - a.votes);

    } else if (election.electionType === 'quadratic') {
      // Quadratic voting - calculate weighted votes based on credits spent
      const quadraticCounts = {};
      
      election.candidates.forEach(candidate => {
        const candidateId = candidate._id.toString();
        console.log('Initializing quadratic candidate:', candidateId, candidate.name);
        quadraticCounts[candidateId] = {
          candidate: candidate,
          votes: 0,
          credits: 0,
          percentage: 0,
          voters: []
        };
      });

      if (Object.keys(quadraticCounts).length > 0) {
        votes.forEach(vote => {
          try {
            // For quadratic elections, try to decrypt vote data to get credits
            const decryptedVoteData = vote.decryptVoteData();
            if (decryptedVoteData && decryptedVoteData.quadraticVotes) {
              // Process quadratic vote allocations
              Object.entries(decryptedVoteData.quadraticVotes).forEach(([candidateId, credits]) => {
                if (quadraticCounts[candidateId] && credits > 0) {
                  const votes = Math.sqrt(credits); // Quadratic: votes = sqrt(credits)
                  quadraticCounts[candidateId].votes += votes;
                  quadraticCounts[candidateId].credits += credits;
                  quadraticCounts[candidateId].voters.push({
                    name: `${vote.voterId.firstName} ${vote.voterId.lastName}`,
                    studentId: vote.voterId.studentId,
                    department: vote.voterId.department,
                    timestamp: vote.createdAt,
                    credits: credits,
                    votes: votes
                  });
                }
              });
            } else if (vote.candidateId) {
              // Fallback: treat as simple vote if decryption fails
              const candidateId = vote.candidateId.toString();
              console.log('Processing fallback quadratic vote for candidate:', candidateId);
              if (quadraticCounts[candidateId]) {
                quadraticCounts[candidateId].votes++;
                quadraticCounts[candidateId].credits += 1;
                quadraticCounts[candidateId].voters.push({
                  name: `${vote.voterId.firstName} ${vote.voterId.lastName}`,
                  studentId: vote.voterId.studentId,
                  department: vote.voterId.department,
                  timestamp: vote.createdAt,
                  credits: 1,
                  votes: 1
                });
              }
            }
          } catch (error) {
            console.error('Error processing quadratic vote data:', error);
            // Fallback: treat as simple vote
            if (vote.candidateId && quadraticCounts[vote.candidateId.toString()]) {
              const candidateId = vote.candidateId.toString();
              quadraticCounts[candidateId].votes++;
              quadraticCounts[candidateId].credits += 1;
            }
          }
        });

        // Calculate percentages and convert to array
        const totalQuadraticVotes = Object.values(quadraticCounts).reduce((sum, item) => sum + item.votes, 0);
        results = Object.values(quadraticCounts).map(item => ({
          ...item,
          percentage: totalQuadraticVotes > 0 ? Math.round((item.votes / totalQuadraticVotes) * 100 * 100) / 100 : 0
        })).sort((a, b) => b.votes - a.votes);

        console.log('Final quadratic results:', results.map(r => ({ 
          candidateName: r.candidate?.name, 
          votes: r.votes, 
          credits: r.credits,
          percentage: r.percentage 
        })));
      } else {
        // No candidates found, return empty results
        results = [];
      }
    } else {
      // Unknown election type, fallback to simple initialization
      console.log('Unknown election type:', election.electionType, 'falling back to simple counting');
      const fallbackCounts = {};
      
      if (election.candidates && election.candidates.length > 0) {
        election.candidates.forEach(candidate => {
          const candidateId = candidate._id.toString();
          fallbackCounts[candidateId] = {
            candidate: candidate,
            votes: 0,
            percentage: 0,
            voters: []
          };
        });

        // Count votes as simple votes
        votes.forEach(vote => {
          if (vote.candidateId) {
            const candidateId = vote.candidateId.toString();
            if (fallbackCounts[candidateId]) {
              fallbackCounts[candidateId].votes++;
            }
          }
        });

        results = Object.values(fallbackCounts).map(item => ({
          ...item,
          percentage: totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100 * 100) / 100 : 0
        })).sort((a, b) => b.votes - a.votes);
      } else {
        results = [];
      }
    }

    // Get voting timeline (votes per hour for the last 24 hours)
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const votingTimeline = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - (i - 1) * 60 * 60 * 1000);
      
      const votesInHour = votes.filter(vote => 
        vote.createdAt >= hourStart && vote.createdAt < hourEnd
      ).length;
      
      votingTimeline.push({
        hour: hourStart.toISOString(),
        votes: votesInHour,
        label: hourStart.getHours() + ':00'
      });
    }

    // Calculate participation by department
    const departmentStats = {};
    votes.forEach(vote => {
      const dept = vote.voterId.department || 'Unknown';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });

    const departmentParticipation = Object.entries(departmentStats).map(([dept, count]) => ({
      department: dept,
      votes: count,
      percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100 * 100) / 100 : 0
    })).sort((a, b) => b.votes - a.votes);

    res.json({
      success: true,
      data: {
        election: {
          id: election._id,
          title: election.title,
          electionType: election.electionType,
          status: election.status,
          startTime: election.votingStartTime,
          endTime: election.votingEndTime
        },
        summary: {
          totalVotes,
          totalCandidates: election.candidates.length,
          turnoutPercentage: election.eligibleVoters || 0, // Would need to calculate eligible voters
          lastUpdated: new Date()
        },
        results,
        votingTimeline,
        departmentParticipation,
        recentVotes: votes.slice(0, 10).map(vote => {
          let candidateName = 'Ranked/Quadratic Vote';
          
          // For simple elections, use direct candidateId field
          if (vote.candidateId) {
            candidateName = election.candidates.find(c => c._id.toString() === vote.candidateId.toString())?.name || 'Unknown';
          } else {
            // For ranked/quadratic elections, try to decrypt vote data
            try {
              const decryptedVoteData = vote.decryptVoteData();
              if (decryptedVoteData?.candidateId) {
                candidateName = election.candidates.find(c => c._id.toString() === decryptedVoteData.candidateId)?.name || 'Unknown';
              }
            } catch (error) {
              console.error('Error decrypting vote data for recent votes:', error);
            }
          }
          
          return {
            voter: `${vote.voterId.firstName} ${vote.voterId.lastName}`,
            studentId: vote.voterId.studentId,
            department: vote.voterId.department,
            timestamp: vote.createdAt,
            candidate: candidateName
          };
        })
      }
    });

  } catch (error) {
    console.error('Live results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live results'
    });
  }
});

export default router;