import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  manifesto: {
    type: String,
    required: true
  },
  imageUrl: String,
  studentId: String,
  department: String,
  year: Number,
  socialLinks: {
    instagram: String,
    twitter: String,
    linkedin: String
  }
});

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  electionType: {
    type: String,
    enum: ['simple', 'ranked', 'quadratic', 'multi-tier'],
    required: true
  },
  category: {
    type: String,
    enum: ['student_council', 'department', 'club', 'society', 'general'],
    required: true
  },
  eligibleDepartments: [{
    type: String
  }],
  eligibleYears: [{
    type: Number,
    min: 1,
    max: 4
  }],
  candidates: [candidateSchema],
  
  // Voting configuration
  votingConfig: {
    maxRankings: {
      type: Number,
      default: 3 // for ranked choice voting
    },
    quadraticCredits: {
      type: Number,
      default: 100 // for quadratic voting
    },
    allowAbstain: {
      type: Boolean,
      default: true
    },
    requireZkProof: {
      type: Boolean,
      default: false
    }
  },

  // Time management
  registrationStartTime: {
    type: Date,
    required: true
  },
  registrationEndTime: {
    type: Date,
    required: true
  },
  votingStartTime: {
    type: Date,
    required: true
  },
  votingEndTime: {
    type: Date,
    required: true
  },
  
  // Blockchain integration
  contractAddress: {
    type: String,
    lowercase: true
  },
  transactionHash: String,
  blockNumber: Number,
  
  // Election status
  status: {
    type: String,
    enum: ['draft', 'registration', 'voting', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Results
  results: {
    isFinalized: {
      type: Boolean,
      default: false
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    turnoutPercentage: {
      type: Number,
      default: 0
    },
    candidateResults: [{
      candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'candidates'
      },
      votes: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      },
      quadraticScore: {
        type: Number,
        default: 0
      },
      rankings: [{
        position: Number,
        count: Number
      }]
    }],
    winner: {
      candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'candidates'
      },
      margin: Number
    }
  },
  
  // Analytics
  analytics: {
    departmentBreakdown: [{
      department: String,
      voterCount: Number,
      turnoutRate: Number
    }],
    yearBreakdown: [{
      year: Number,
      voterCount: Number,
      turnoutRate: Number
    }],
    hourlyVotingPattern: [{
      hour: Number,
      voteCount: Number
    }]
  },
  
  // Admin and moderation
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // IPFS and metadata
  ipfsHash: String,
  metadata: {
    tags: [String],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'complex'],
      default: 'medium'
    },
    estimatedVoters: Number,
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
electionSchema.index({ status: 1, category: 1 });
electionSchema.index({ votingStartTime: 1, votingEndTime: 1 });
electionSchema.index({ eligibleDepartments: 1 });
electionSchema.index({ eligibleYears: 1 });
electionSchema.index({ contractAddress: 1 });

// Virtual for election phase
electionSchema.virtual('currentPhase').get(function() {
  const now = new Date();
  
  if (now < this.registrationStartTime) return 'upcoming';
  if (now >= this.registrationStartTime && now < this.registrationEndTime) return 'registration';
  if (now >= this.registrationEndTime && now < this.votingStartTime) return 'waiting';
  if (now >= this.votingStartTime && now < this.votingEndTime) return 'voting';
  return 'completed';
});

// Method to check if user is eligible to vote
electionSchema.methods.isEligibleVoter = function(user) {
  const departmentEligible = this.eligibleDepartments.length === 0 || 
                           this.eligibleDepartments.includes(user.department);
  const yearEligible = this.eligibleYears.length === 0 || 
                      this.eligibleYears.includes(user.year);
  
  return departmentEligible && yearEligible && user.isEmailVerified;
};

// Method to calculate results
electionSchema.methods.calculateResults = function() {
  // This will be implemented when we integrate with blockchain
  // For now, return placeholder
  return {
    totalVotes: this.results.totalVotes,
    turnoutPercentage: this.results.turnoutPercentage
  };
};

export default mongoose.model('Election', electionSchema);