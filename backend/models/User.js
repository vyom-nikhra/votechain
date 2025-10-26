import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  walletAddress: {
    type: String,
    sparse: true, // allows multiple null values
    lowercase: true
  },
  didToken: {
    type: String,
    default: null
  },
  zkProofHash: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isKycVerified: {
    type: Boolean,
    default: false
  },
  nftBadges: [{
    tokenId: String,
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election'
    },
    badgeType: {
      type: String,
      enum: ['voter', 'early_voter', 'first_time_voter', 'active_participant']
    },
    mintedAt: {
      type: Date,
      default: Date.now
    }
  }],
  votingHistory: [{
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election'
    },
    votedAt: Date,
    voteType: {
      type: String,
      enum: ['simple', 'ranked', 'quadratic']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  lastLogin: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1, studentId: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ department: 1, year: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate student display name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

export default mongoose.model('User', userSchema);