import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      role = '',
      department = '',
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== '') filter.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get specific user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')
      .populate('votingHistory.electionId', 'title description');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional user statistics
    const totalVotes = await Vote.countDocuments({ voterId: user._id });
    const recentVotes = await Vote.find({ voterId: user._id })
      .populate('electionId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const userWithStats = {
      ...user.toObject(),
      statistics: {
        totalVotes,
        recentVotes,
        accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) // days
      }
    };

    res.json({
      success: true,
      user: userWithStats
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user (Admin only)
// @access  Private/Admin
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Student ID must be 6-15 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  body('year')
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  body('role')
    .optional()
    .isIn(['student', 'admin', 'moderator'])
    .withMessage('Invalid role')
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

    const { studentId, email, password, firstName, lastName, department, year, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Student ID already registered'
      });
    }

    // Create new user
    const user = new User({
      studentId,
      email,
      password,
      firstName,
      lastName,
      department,
      year,
      role,
      emailVerified: true, // Admin created users are auto-verified
      isActive: true
    });

    await user.save();

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.emailVerificationToken;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private/Admin
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail(),
  body('department')
    .optional()
    .notEmpty(),
  body('year')
    .optional()
    .isInt({ min: 1, max: 4 }),
  body('role')
    .optional()
    .isIn(['student', 'admin', 'moderator']),
  body('isActive')
    .optional()
    .isBoolean()
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

    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.password;
    delete updates.studentId;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Check if email is being updated and ensure it's unique
    if (updates.email) {
      const existingUser = await User.findOne({ 
        email: updates.email, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    // Prevent removing the last admin
    if (updates.role && updates.role !== 'admin') {
      const user = await User.findById(id);
      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot remove the last admin user'
          });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Instead of hard delete, we'll deactivate the user
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`; // Prevent email conflicts
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private/Admin
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ emailVerified: true, isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin', isActive: true });
    const studentUsers = await User.countDocuments({ role: 'student', isActive: true });
    
    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    // Users by department
    const usersByDepartment = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Users by year
    const usersByYear = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Registration trend (last 12 months)
    const twelveMonthsAgo = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000);
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo }, isActive: true } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          verifiedUsers,
          adminUsers,
          studentUsers,
          recentRegistrations,
          verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
        },
        distribution: {
          byDepartment: usersByDepartment,
          byYear: usersByYear
        },
        trends: {
          registrations: registrationTrend
        }
      }
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

export default router;