import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { electionsAPI, votingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FaVoteYea, 
  FaArrowLeft, 
  FaCheck, 
  FaClock, 
  FaUsers, 
  FaCalendarAlt,
  FaShieldAlt,
  FaChartBar,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTrophy,
  FaEye,
  FaLock,
  FaCubes,
  FaLink,
  FaCertificate,
  FaExternalLinkAlt
} from 'react-icons/fa';

const VotingPage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Fetch election details
  const { data: election, isLoading, error } = useQuery({
    queryKey: ['election', electionId],
    queryFn: () => electionsAPI.getById(electionId),
    select: (response) => response.data,
    enabled: !!electionId
  });

  // Check if user has already voted
  const { data: myVotes } = useQuery({
    queryKey: ['my-votes'],
    queryFn: () => votingAPI.getMyVotes(),
    select: (response) => response.data
  });

  // Cast vote mutation
  const castVoteMutation = useMutation({
    mutationFn: votingAPI.castVote,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-votes']);
      queryClient.invalidateQueries(['election', electionId]);
      toast.success('Vote cast successfully! Your vote has been recorded on the blockchain.');
      navigate('/elections');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cast vote');
    }
  });

  const hasVoted = myVotes?.some(vote => vote.electionId === electionId);
  
  const isElectionActive = () => {
    if (!election) return false;
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    return now >= startDate && now <= endDate;
  };

  const getElectionStatus = () => {
    if (!election) return { status: 'loading', message: 'Loading...' };
    
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    if (now < startDate) {
      return { 
        status: 'upcoming', 
        message: `Election starts on ${startDate.toLocaleString()}`,
        color: 'info'
      };
    } else if (now > endDate) {
      return { 
        status: 'ended', 
        message: `Election ended on ${endDate.toLocaleString()}`,
        color: 'neutral'
      };
    } else {
      return { 
        status: 'active', 
        message: `Election ends on ${endDate.toLocaleString()}`,
        color: 'success'
      };
    }
  };

  const canUserVote = () => {
    if (!election || !user) return false;
    
    // Check if election is active
    if (!isElectionActive()) return false;
    
    // Check if user has already voted
    if (hasVoted) return false;
    
    // Check department eligibility
    if (election.department && election.department !== user.department) return false;
    
    // Check year eligibility
    if (election.eligibleYears && election.eligibleYears.length > 0) {
      if (!election.eligibleYears.includes(user.year)) return false;
    }
    
    return true;
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    
    setShowConfirmModal(true);
  };

  const confirmVote = () => {
    setIsVoting(true);
    castVoteMutation.mutate({
      electionId: election._id,
      voteData: {
        candidateId: selectedCandidate._id,
        voteType: 'simple'
      }
    });
  };

  const statusInfo = getElectionStatus();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-base-300 rounded w-1/3"></div>
          <div className="h-32 bg-base-300 rounded"></div>
          <div className="h-64 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-error">
          <FaExclamationTriangle />
          <span>Election not found or failed to load</span>
          <button 
            className="btn btn-sm"
            onClick={() => navigate('/elections')}
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            className="btn btn-ghost btn-circle"
            onClick={() => navigate('/elections')}
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-base-content">{election.title}</h1>
            <div className={`badge badge-${statusInfo.color} mt-2`}>
              {statusInfo.message}
            </div>
          </div>
        </div>

        {/* Election Info Card */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-2xl text-info" />
                <div>
                  <div className="text-sm opacity-70">Duration</div>
                  <div className="font-semibold">
                    {new Date(election.startDate).toLocaleDateString()} - 
                    {new Date(election.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FaUsers className="text-2xl text-success" />
                <div>
                  <div className="text-sm opacity-70">Candidates</div>
                  <div className="font-semibold">{election.candidates?.length || 0}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaChartBar className="text-2xl text-warning" />
                <div>
                  <div className="text-sm opacity-70">Total Votes</div>
                  <div className="font-semibold">{election.totalVotes || 0}</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div>
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-base-content/80">{election.description}</p>
            </div>

            {/* Blockchain Verification */}
            {(election.contractAddress || election.metadata?.blockchainTxHash) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-3">
                  <FaCubes className="text-success" />
                  <h4 className="font-bold text-success">Blockchain Verified Election</h4>
                  <div className="badge badge-success badge-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1"></div>
                    Immutable
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {election.contractAddress && (
                    <div className="flex items-center gap-2">
                      <FaLink className="text-info" />
                      <span className="opacity-70">Smart Contract:</span>
                      <code className="bg-base-200 px-2 py-1 rounded text-xs">
                        {election.contractAddress.substring(0, 8)}...{election.contractAddress.substring(-6)}
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(election.contractAddress)}
                        className="btn btn-ghost btn-xs"
                        title="Copy contract address"
                      >
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  )}
                  
                  {election.metadata?.blockchainTxHash && (
                    <div className="flex items-center gap-2">
                      <FaLock className="text-warning" />
                      <span className="opacity-70">Creation Tx:</span>
                      <code className="bg-base-200 px-2 py-1 rounded text-xs">
                        {election.metadata.blockchainTxHash.substring(0, 8)}...{election.metadata.blockchainTxHash.substring(-6)}
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(election.metadata.blockchainTxHash)}
                        className="btn btn-ghost btn-xs"
                        title="Copy transaction hash"
                      >
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 text-xs opacity-70 flex items-center gap-1">
                  <FaCertificate />
                  <span>Your vote will be cryptographically secured and you'll receive an NFT certificate upon voting</span>
                </div>
              </div>
            )}

            {election.department && (
              <div className="mt-4">
                <span className="badge badge-primary">Department: {election.department}</span>
              </div>
            )}

            {election.eligibleYears && election.eligibleYears.length > 0 && (
              <div className="mt-2">
                <span className="text-sm opacity-70 mr-2">Eligible Years:</span>
                {election.eligibleYears.map(year => (
                  <span key={year} className="badge badge-outline mr-1">Year {year}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Voting Status */}
        {hasVoted ? (
          <div className="alert alert-success mb-8">
            <div className="flex items-center gap-3">
              <FaCheck className="text-2xl" />
              <div className="flex-1">
                <h3 className="font-bold flex items-center gap-2">
                  Vote Recorded! 
                  <FaCubes className="text-sm" />
                </h3>
                <div className="text-sm">
                  Your vote is securely recorded on the blockchain and you've earned an NFT voting certificate.
                </div>
              </div>
              <div className="text-right">
                <div className="badge badge-success gap-1">
                  <FaCertificate />
                  NFT Earned
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-sm btn-outline">
                <FaEye className="mr-2" />
                View Receipt
              </button>
            </div>
          </div>
        ) : !isElectionActive() ? (
          <div className={`alert alert-${statusInfo.color} mb-8`}>
            <FaClock />
            <div>
              <h3 className="font-bold">
                {statusInfo.status === 'upcoming' ? 'Election Not Started' : 'Election Ended'}
              </h3>
              <div className="text-sm">{statusInfo.message}</div>
            </div>
          </div>
        ) : !canUserVote() ? (
          <div className="alert alert-warning mb-8">
            <FaLock />
            <div>
              <h3 className="font-bold">Not Eligible to Vote</h3>
              <div className="text-sm">
                You are not eligible to vote in this election based on department or year restrictions.
              </div>
            </div>
          </div>
        ) : null}

        {/* Candidates */}
        {election.candidates && election.candidates.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <FaTrophy className="text-warning" />
                Candidates
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {election.candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`card border-2 cursor-pointer transition-all ${
                      selectedCandidate?._id === candidate._id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-base-300 hover:border-primary/50'
                    } ${!canUserVote() ? 'cursor-not-allowed opacity-60' : ''}`}
                    onClick={() => canUserVote() && setSelectedCandidate(candidate)}
                  >
                    <div className="card-body p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-12">
                              <span className="text-lg font-bold">
                                {candidate.name?.charAt(0) || candidate.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {candidate.name || candidate}
                            </h3>
                            {candidate.description && (
                              <p className="text-sm text-base-content/70">
                                {candidate.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {selectedCandidate?._id === candidate._id && canUserVote() && (
                          <div className="badge badge-primary">
                            <FaCheck className="mr-1" />
                            Selected
                          </div>
                        )}
                      </div>
                      
                      {candidate.platform && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Platform:</h4>
                          <p className="text-sm">{candidate.platform}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {canUserVote() && (
                <div className="mt-8">
                  <div className="alert alert-info mb-4">
                    <FaInfoCircle />
                    <span>
                      Select a candidate above and click "Cast Vote" to submit your vote to the blockchain. 
                      This action cannot be undone.
                    </span>
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      className="btn btn-primary btn-lg"
                      disabled={!selectedCandidate || isVoting}
                      onClick={handleVote}
                    >
                      {isVoting ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Submitting Vote...
                        </>
                      ) : (
                        <>
                          <FaVoteYea className="mr-2" />
                          Cast Vote
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blockchain Security Info */}
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 mt-8">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <FaShieldAlt className="text-primary" />
              Blockchain Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <FaShieldAlt className="text-3xl text-success mx-auto mb-2" />
                <h4 className="font-semibold">Immutable</h4>
                <p className="text-sm opacity-80">Votes cannot be changed once recorded</p>
              </div>
              <div className="text-center">
                <FaEye className="text-3xl text-info mx-auto mb-2" />
                <h4 className="font-semibold">Transparent</h4>
                <p className="text-sm opacity-80">All votes are publicly verifiable</p>
              </div>
              <div className="text-center">
                <FaLock className="text-3xl text-warning mx-auto mb-2" />
                <h4 className="font-semibold">Anonymous</h4>
                <p className="text-sm opacity-80">Your identity remains private</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Your Vote</h3>
            <div className="py-4">
              <p className="mb-4">
                You are about to cast your vote for:
              </p>
              <div className="alert alert-info">
                <FaVoteYea />
                <div>
                  <div className="font-bold">
                    {selectedCandidate?.name || selectedCandidate}
                  </div>
                  <div className="text-sm">
                    in "{election.title}"
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-base-content/70">
                <FaExclamationTriangle className="inline mr-2 text-warning" />
                This action cannot be undone. Your vote will be permanently recorded on the blockchain.
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-success"
                onClick={confirmVote}
                disabled={castVoteMutation.isLoading}
              >
                {castVoteMutation.isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Confirm Vote
                  </>
                )}
              </button>
              <button 
                className="btn"
                onClick={() => setShowConfirmModal(false)}
                disabled={castVoteMutation.isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;