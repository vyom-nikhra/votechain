import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Election from '../models/Election.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import { authMiddleware, adminMiddleware, verifiedEmailMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/elections
// @desc    Get all elections with filtering and pagination
// @access  Public
router.get('/', [
  query('status').optional().isIn(['draft', 'registration', 'voting', 'completed', 'cancelled']),
  query('category').optional().isIn(['student_council', 'department', 'club', 'society', 'general']),
  query('department').optional().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      status,
      category,
      department,
      page = 1,
      limit = 10,
      search = ''
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) {
      filter.$or = [
        { eligibleDepartments: { $in: [department] } },
        { eligibleDepartments: { $size: 0 } } // Elections open to all departments
      ];
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get elections with pagination
    const elections = await Election.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('moderators', 'firstName lastName email')
      .select('-candidates.manifesto') // Exclude large fields for list view
      .sort({ votingStartTime: -1 })
      .skip(skip)
      .limit(limit);

    const totalElections = await Election.countDocuments(filter);

    // Add current phase to each election
    const electionsWithPhase = elections.map(election => {
      const electionObj = election.toObject();
      electionObj.currentPhase = election.currentPhase;
      return electionObj;
    });

    res.json({
      success: true,
      elections: electionsWithPhase,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalElections / limit),
        totalElections,
        limit
      }
    });

  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elections'
    });
  }
});

// @route   GET /api/elections/:id
// @desc    Get single election by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email department')
      .populate('moderators', 'firstName lastName email');

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (!election.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Election not available'
      });
    }

    const electionObj = election.toObject();
    electionObj.currentPhase = election.currentPhase;

    // If user is authenticated, check if they can vote
    if (req.header('Authorization')) {
      try {
        // Verify token without failing the request
        const jwt = await import('jsonwebtoken');
        const token = req.header('Authorization').substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'voting_secret_key');
        const user = await User.findById(decoded.userId);
        
        if (user) {
          electionObj.userCanVote = election.isEligibleVoter(user);
          
          // Check if user already voted
          const existingVote = await Vote.findOne({
            electionId: election._id,
            voterId: user._id
          });
          electionObj.userHasVoted = !!existingVote;
        }
      } catch (err) {
        // Token invalid but continue without user context
      }
    }

    res.json({
      success: true,
      election: electionObj
    });

  } catch (error) {
    console.error('Get election error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election'
    });
  }
});

// @route   POST /api/elections
// @desc    Create new election
// @access  Private (Admin)
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
  body('electionType').isIn(['simple', 'ranked', 'quadratic', 'multi-tier']).withMessage('Invalid election type'),
  body('category').isIn(['student_council', 'department', 'club', 'society', 'general']).withMessage('Invalid category'),
  body('candidates').isArray({ min: 2 }).withMessage('At least 2 candidates required'),
  body('candidates.*.name').trim().notEmpty().withMessage('Candidate name is required'),
  body('candidates.*.description').trim().notEmpty().withMessage('Candidate description is required'),
  body('registrationStartTime').isISO8601().withMessage('Invalid registration start time'),
  body('registrationEndTime').isISO8601().withMessage('Invalid registration end time'),
  body('votingStartTime').isISO8601().withMessage('Invalid voting start time'),
  body('votingEndTime').isISO8601().withMessage('Invalid voting end time')
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

    const {
      title,
      description,
      electionType,
      category,
      eligibleDepartments = [],
      eligibleYears = [],
      candidates,
      votingConfig = {},
      registrationStartTime,
      registrationEndTime,
      votingStartTime,
      votingEndTime,
      metadata = {}
    } = req.body;

    // Validate time sequence
    const regStart = new Date(registrationStartTime);
    const regEnd = new Date(registrationEndTime);
    const voteStart = new Date(votingStartTime);
    const voteEnd = new Date(votingEndTime);

    if (regStart >= regEnd) {
      return res.status(400).json({
        success: false,
        message: 'Registration end time must be after start time'
      });
    }

    if (voteStart >= voteEnd) {
      return res.status(400).json({
        success: false,
        message: 'Voting end time must be after start time'
      });
    }

    if (voteStart <= regEnd) {
      return res.status(400).json({
        success: false,
        message: 'Voting must start after registration ends'
      });
    }

    // Create election
    const election = new Election({
      title,
      description,
      electionType,
      category,
      eligibleDepartments,
      eligibleYears,
      candidates,
      votingConfig: {
        maxRankings: votingConfig.maxRankings || 3,
        quadraticCredits: votingConfig.quadraticCredits || 100,
        allowAbstain: votingConfig.allowAbstain !== false,
        requireZkProof: votingConfig.requireZkProof || false
      },
      registrationStartTime: regStart,
      registrationEndTime: regEnd,
      votingStartTime: voteStart,
      votingEndTime: voteEnd,
      metadata,
      createdBy: req.user.userId,
      status: 'draft'
    });

    await election.save();

    // Emit real-time update
    if (req.io) {
      req.io.emit('election-created', {
        electionId: election._id,
        title: election.title,
        category: election.category
      });
    }

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election
    });

  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create election'
    });
  }
});

// @route   PUT /api/elections/:id
// @desc    Update election
// @access  Private (Admin/Creator)
router.put('/:id', [
  authMiddleware,
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 })
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

    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check permissions
    const isCreator = election.createdBy.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isModerator = election.moderators.some(mod => mod.toString() === req.user.userId);

    if (!isCreator && !isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this election'
      });
    }

    // Prevent updates if voting has started
    if (election.currentPhase === 'voting' || election.currentPhase === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update election during or after voting period'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'eligibleDepartments', 'eligibleYears',
      'registrationStartTime', 'registrationEndTime', 
      'votingStartTime', 'votingEndTime', 'votingConfig', 'metadata'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        election[field] = req.body[field];
      }
    });

    await election.save();

    // Emit real-time update
    if (req.io) {
      req.io.to(`election-${election._id}`).emit('election-updated', {
        electionId: election._id,
        changes: req.body
      });
    }

    res.json({
      success: true,
      message: 'Election updated successfully',
      election
    });

  } catch (error) {
    console.error('Update election error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update election'
    });
  }
});

// @route   POST /api/elections/:id/activate
// @desc    Activate election (move from draft to registration)
// @access  Private (Admin/Creator)
router.post('/:id/activate', [authMiddleware], async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check permissions
    const isCreator = election.createdBy.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to activate this election'
      });
    }

    if (election.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft elections can be activated'
      });
    }

    // Validate election has minimum requirements
    if (election.candidates.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Election must have at least 2 candidates'
      });
    }

    election.status = 'registration';
    await election.save();

    // Emit real-time update
    if (req.io) {
      req.io.emit('election-activated', {
        electionId: election._id,
        title: election.title
      });
    }

    res.json({
      success: true,
      message: 'Election activated successfully',
      election
    });

  } catch (error) {
    console.error('Activate election error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate election'
    });
  }
});

// @route   GET /api/elections/:id/results
// @desc    Get election results
// @access  Public (only if voting ended)
router.get('/:id/results', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if results should be public
    const currentPhase = election.currentPhase;
    if (currentPhase !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Results not available until voting is completed'
      });
    }

    // Get vote statistics
    const voteStats = await Vote.aggregate([
      { $match: { electionId: election._id, validationStatus: 'validated' } },
      {
        $group: {
          _id: null,
          totalVotes: { $sum: 1 },
          departments: { $push: '$voterMetadata.department' },
          years: { $push: '$voterMetadata.year' },
          voteTypes: { $push: '$voteType' }
        }
      }
    ]);

    const stats = voteStats[0] || { totalVotes: 0, departments: [], years: [], voteTypes: [] };

    // Calculate department and year breakdowns
    const departmentBreakdown = stats.departments.reduce((acc, dept) => {
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const yearBreakdown = stats.years.reduce((acc, year) => {
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      results: {
        election: {
          id: election._id,
          title: election.title,
          electionType: election.electionType,
          candidates: election.candidates,
          votingEndTime: election.votingEndTime
        },
        totalVotes: stats.totalVotes,
        turnoutPercentage: election.results.turnoutPercentage,
        candidateResults: election.results.candidateResults,
        winner: election.results.winner,
        analytics: {
          departmentBreakdown,
          yearBreakdown,
          voteTypeBreakdown: stats.voteTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        },
        isFinalized: election.results.isFinalized
      }
    });

  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election results'
    });
  }
});

// @route   GET /api/elections/my/created
// @desc    Get elections created by current user
// @access  Private
router.get('/my/created', [authMiddleware], async (req, res) => {
  try {
    const elections = await Election.find({ 
      createdBy: req.user.userId,
      isActive: true 
    })
    .populate('moderators', 'firstName lastName email')
    .sort({ createdAt: -1 });

    const electionsWithPhase = elections.map(election => {
      const electionObj = election.toObject();
      electionObj.currentPhase = election.currentPhase;
      return electionObj;
    });

    res.json({
      success: true,
      elections: electionsWithPhase
    });

  } catch (error) {
    console.error('Get my elections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your elections'
    });
  }
});

// @route   GET /api/elections/my/eligible
// @desc    Get elections user is eligible to vote in
// @access  Private
router.get('/my/eligible', [authMiddleware, verifiedEmailMiddleware], async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    // Find elections user is eligible for
    const eligibleElections = await Election.find({
      isActive: true,
      status: { $in: ['registration', 'voting'] },
      $or: [
        { eligibleDepartments: { $size: 0 } }, // Open to all departments
        { eligibleDepartments: { $in: [user.department] } }
      ],
      $or: [
        { eligibleYears: { $size: 0 } }, // Open to all years
        { eligibleYears: { $in: [user.year] } }
      ]
    }).sort({ votingStartTime: 1 });

    // Check voting status for each election
    const electionsWithStatus = await Promise.all(
      eligibleElections.map(async (election) => {
        const electionObj = election.toObject();
        electionObj.currentPhase = election.currentPhase;
        
        // Check if user already voted
        const existingVote = await Vote.findOne({
          electionId: election._id,
          voterId: user._id
        });
        
        electionObj.userHasVoted = !!existingVote;
        return electionObj;
      })
    );

    res.json({
      success: true,
      elections: electionsWithStatus
    });

  } catch (error) {
    console.error('Get eligible elections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch eligible elections'
    });
  }
});

// @route   DELETE /api/elections/:id
// @desc    Delete election (Admin only)
// @access  Private/Admin
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if election has started
    const now = new Date();
    const startTime = election.votingStartTime;
    
    if (now >= startTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an election that has already started'
      });
    }

    // Check if there are any votes
    const voteCount = await Vote.countDocuments({ electionId: election._id });
    if (voteCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an election that has votes'
      });
    }

    // Soft delete - mark as inactive instead of removing
    election.isActive = false;
    await election.save();

    res.json({
      success: true,
      message: 'Election deleted successfully'
    });

  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete election'
    });
  }
});

export default router;