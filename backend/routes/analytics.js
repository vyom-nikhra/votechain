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

export default router;