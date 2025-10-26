import mongoose from 'mongoose';
import crypto from 'crypto';

const voteSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Vote content (encrypted for privacy)
  voteData: {
    type: String, // Encrypted vote data
    required: true
  },
  
  // Vote type and structure
  voteType: {
    type: String,
    enum: ['simple', 'ranked', 'quadratic'],
    required: true
  },
  
  // For simple voting
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election.candidates'
  },
  
  // For ranked choice voting
  rankings: [{
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election.candidates'
    },
    rank: {
      type: Number,
      min: 1
    }
  }],
  
  // For quadratic voting
  quadraticAllocations: [{
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election.candidates'
    },
    credits: {
      type: Number,
      min: 0
    },
    votes: {
      type: Number,
      min: 0
    }
  }],
  
  // Blockchain integration
  transactionHash: {
    type: String,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  blockHash: String,
  gasUsed: Number,
  gasPrice: String,
  
  // Zero-Knowledge Proof
  zkProof: {
    proof: {
      type: Object,
      required: function() {
        return this.election?.votingConfig?.requireZkProof;
      }
    },
    publicSignals: [String],
    verificationKey: Object,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Vote verification and integrity
  voteHash: {
    type: String,
    required: true
  },
  nullifierHash: {
    type: String,
    required: true
  },
  commitmentHash: String,
  
  // Voter metadata (for analytics, anonymized)
  voterMetadata: {
    department: String,
    year: Number,
    votingMethod: {
      type: String,
      enum: ['web', 'mobile'],
      default: 'web'
    },
    ipAddress: String, // Hashed for privacy
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    timeZone: String
  },
  
  // Vote validation
  validationStatus: {
    type: String,
    enum: ['pending', 'validated', 'invalid', 'disputed'],
    default: 'pending'
  },
  validationErrors: [String],
  
  // Privacy and security
  encryptionKey: String, // For vote decryption (stored securely)
  signature: String, // Digital signature
  nonce: String, // For replay attack prevention
  
  // Audit trail
  isAudited: {
    type: Boolean,
    default: false
  },
  auditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  auditedAt: Date,
  auditNotes: String,
  
  // Status flags
  isActive: {
    type: Boolean,
    default: true
  },
  isCounted: {
    type: Boolean,
    default: false
  },
  isAnonymized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for performance and uniqueness
voteSchema.index({ electionId: 1, voterId: 1 }, { unique: true }); // One vote per voter per election
voteSchema.index({ electionId: 1, nullifierHash: 1 }, { unique: true }); // Prevent double voting
voteSchema.index({ transactionHash: 1 }, { unique: true });
voteSchema.index({ voteHash: 1 }, { unique: true });
voteSchema.index({ electionId: 1, validationStatus: 1 });
voteSchema.index({ createdAt: 1 });

// Virtual for vote weight (quadratic voting)
voteSchema.virtual('totalVoteWeight').get(function() {
  if (this.voteType === 'quadratic') {
    return this.quadraticAllocations.reduce((total, allocation) => {
      return total + allocation.votes;
    }, 0);
  }
  return 1; // Simple and ranked voting have weight of 1
});

// Method to encrypt vote data
voteSchema.methods.encryptVoteData = function(voteData, encryptionKey) {
  // Implementation would use crypto library
  // For now, return base64 encoded string
  return Buffer.from(JSON.stringify(voteData)).toString('base64');
};

// Method to decrypt vote data (for authorized access only)
voteSchema.methods.decryptVoteData = function(encryptionKey) {
  try {
    return JSON.parse(Buffer.from(this.voteData, 'base64').toString());
  } catch (error) {
    throw new Error('Failed to decrypt vote data');
  }
};

// Method to validate vote structure
voteSchema.methods.validateVoteStructure = function() {
  const errors = [];
  
  switch (this.voteType) {
    case 'simple':
      if (!this.candidateId) {
        errors.push('Simple vote must have a candidate selection');
      }
      break;
      
    case 'ranked':
      if (!this.rankings || this.rankings.length === 0) {
        errors.push('Ranked vote must have at least one ranking');
      }
      
      // Check for duplicate ranks
      const ranks = this.rankings.map(r => r.rank);
      if (new Set(ranks).size !== ranks.length) {
        errors.push('Ranked vote cannot have duplicate rankings');
      }
      break;
      
    case 'quadratic':
      if (!this.quadraticAllocations || this.quadraticAllocations.length === 0) {
        errors.push('Quadratic vote must have at least one allocation');
      }
      
      // Check total credits don't exceed limit
      const totalCredits = this.quadraticAllocations.reduce((sum, alloc) => sum + alloc.credits, 0);
      // This should be checked against election's quadratic credit limit
      break;
  }
  
  return errors;
};

// Method to anonymize vote (remove voter identification)
voteSchema.methods.anonymize = function() {
  this.voterId = null;
  this.voterMetadata.ipAddress = null;
  this.voterMetadata.userAgent = null;
  this.isAnonymized = true;
  return this.save();
};

// Pre-save middleware to generate hashes
voteSchema.pre('save', function(next) {
  if (this.isNew && !this.voteHash) {
    // Generate vote hash if not already set
    this.voteHash = crypto.createHash('sha256')
      .update(this.voteData + this.electionId + this.voterId + Date.now())
      .digest('hex');
    
    // Generate nullifier hash to prevent double voting
    this.nullifierHash = crypto.createHash('sha256')
      .update(this.electionId + this.voterId + 'nullifier')
      .digest('hex');
  }
  next();
});

// Static method to get election statistics
voteSchema.statics.getElectionStats = async function(electionId) {
  return this.aggregate([
    { $match: { electionId: mongoose.Types.ObjectId(electionId), validationStatus: 'validated' } },
    {
      $group: {
        _id: '$electionId',
        totalVotes: { $sum: 1 },
        voteTypes: { $push: '$voteType' },
        departments: { $push: '$voterMetadata.department' },
        years: { $push: '$voterMetadata.year' }
      }
    }
  ]);
};

export default mongoose.model('Vote', voteSchema);