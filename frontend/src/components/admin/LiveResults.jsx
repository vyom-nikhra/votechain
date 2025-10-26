import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, electionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Breadcrumbs from '../common/Breadcrumbs';
import { 
  FaEye, 
  FaVoteYea, 
  FaUsers, 
  FaChartLine,
  FaArrowLeft,
  FaTrophy,
  FaClock,
  FaExclamationTriangle,
  FaSyncAlt
} from 'react-icons/fa';

const LiveResults = () => {
  const [selectedElection, setSelectedElection] = useState(null);

  // Fetch all elections
  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ['all-elections'],
    queryFn: () => electionsAPI.getAll(),
    select: (response) => response.data.elections || [],
  });

  // Fetch live results for selected election
  const { data: liveResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['live-results', selectedElection],
    queryFn: () => analyticsAPI.getLiveResults(selectedElection),
    select: (response) => response.data,
    enabled: !!selectedElection,
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  if (selectedElection) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumbs customItems={[
            { label: 'Live Results', href: '/live-results' },
            { label: liveResults?.election?.title || 'Election Details' }
          ]} />

          <div className="space-y-6">
            {/* Back Button */}
            <button 
              className="btn btn-outline gap-2"
              onClick={() => setSelectedElection(null)}
            >
              <FaArrowLeft />
              Back to Elections
            </button>

            {resultsLoading ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="mt-4 text-base-content/60">Loading live results...</p>
                </div>
              </div>
            ) : liveResults ? (
              <>
                {/* Debug Info */}
                {console.log('Live Results Data:', liveResults)}
                {console.log('Results Array:', liveResults.results)}
                {console.log('Results Length:', liveResults.results?.length)}
                {console.log('Data Structure:', JSON.stringify(liveResults, null, 2))}
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="stat bg-base-100 shadow-xl rounded-xl">
                    <div className="stat-figure text-primary">
                      <FaVoteYea className="text-3xl" />
                    </div>
                    <div className="stat-title">Total Votes</div>
                    <div className="stat-value text-primary">{liveResults.summary?.totalVotes || 0}</div>
                  </div>
                  
                  <div className="stat bg-base-100 shadow-xl rounded-xl">
                    <div className="stat-figure text-secondary">
                      <FaUsers className="text-3xl" />
                    </div>
                    <div className="stat-title">Candidates</div>
                    <div className="stat-value text-secondary">{liveResults.summary?.totalCandidates || 0}</div>
                  </div>
                  
                  <div className="stat bg-base-100 shadow-xl rounded-xl">
                    <div className="stat-figure text-accent">
                      <FaChartLine className="text-3xl" />
                    </div>
                    <div className="stat-title">Participation</div>
                    <div className="stat-value text-accent">{liveResults.summary?.totalVotes || 0}</div>
                  </div>
                  
                  <div className="stat bg-base-100 shadow-xl rounded-xl">
                    <div className="stat-figure">
                      <FaClock className="text-3xl text-info" />
                    </div>
                    <div className="stat-title">Status</div>
                    <div className="stat-value text-sm">
                      <span className="badge badge-success">Live</span>
                    </div>
                  </div>
                </div>

                {/* Current Standings */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title flex items-center gap-2">
                      <FaTrophy className="text-primary" />
                      Current Standings - {liveResults.election?.title}
                      <div className="ml-auto">
                        <FaSyncAlt className="text-sm text-base-content/40 animate-spin" />
                      </div>
                    </h3>
                    
                    <div className="space-y-4">
                      {liveResults.results && liveResults.results.length > 0 ? (
                        liveResults.results.map((result, index) => (
                        <div key={result.candidate._id} className="flex items-center gap-4 p-4 bg-base-200 rounded-xl">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-lg">{result.candidate.name}</h4>
                              <div className="text-right">
                                <span className="font-bold text-2xl text-primary">{result.votes}</span>
                                <span className="text-sm text-base-content/60 ml-2">votes</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-base-content/60">{result.candidate.description || 'Candidate'}</span>
                              <span className="font-semibold">{result.percentage}%</span>
                            </div>
                            
                            <div className="w-full bg-base-300 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  index === 0 ? 'bg-yellow-500' : 
                                  index === 1 ? 'bg-gray-400' : 
                                  index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                                }`}
                                style={{ width: `${result.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FaTrophy className="text-4xl text-base-content/30 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold mb-2">No Results Yet</h4>
                          <p className="text-base-content/60">
                            Results will appear here as votes are cast
                          </p>
                          {liveResults.election && (
                            <div className="mt-4 text-sm text-base-content/40">
                              <p>Election Type: {liveResults.election.electionType}</p>
                              <p>Total Votes: {liveResults.summary?.totalVotes}</p>
                              <p>Total Candidates: {liveResults.summary?.totalCandidates}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title flex items-center gap-2">
                      <FaClock className="text-primary" />
                      Recent Voting Activity
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Voter</th>
                            <th>Department</th>
                            <th>Candidate Voted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveResults.recentVotes?.slice(0, 10).map((vote, index) => (
                            <tr key={index}>
                              <td className="text-sm">
                                {new Date(vote.timestamp).toLocaleTimeString()}
                              </td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{vote.voter}</span>
                                  <span className="badge badge-outline badge-xs">{vote.studentId}</span>
                                </div>
                              </td>
                              <td>
                                <span className="badge badge-primary badge-sm">{vote.department}</span>
                              </td>
                              <td className="font-semibold">{vote.candidate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="alert alert-error">
                <FaExclamationTriangle />
                <span>Failed to load live results for this election</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumbs customItems={[{ label: 'Live Results' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
              <FaEye className="text-3xl text-primary" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live Results
            </span>
          </h1>
          <p className="text-base-content/70 text-lg ml-16">
            Monitor ongoing elections in real-time
          </p>
        </div>

        {/* Elections List */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <FaEye className="text-primary" />
              Select Election to Monitor
            </h3>
            <p className="text-base-content/60 mb-4">
              Click on any election to view live results and current standings
            </p>
          </div>
        </div>

        {electionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton h-64 w-full"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections?.map((election) => {
              const now = new Date();
              const startDate = new Date(election.votingStartTime);
              const endDate = new Date(election.votingEndTime);
              
              let status = 'upcoming';
              let statusColor = 'badge-info';
              if (now >= startDate && now <= endDate) {
                status = 'active';
                statusColor = 'badge-success';
              } else if (now > endDate) {
                status = 'completed';
                statusColor = 'badge-neutral';
              }

              return (
                <motion.div
                  key={election._id}
                  className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedElection(election._id)}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="card-title text-lg line-clamp-2">{election.title}</h3>
                      <span className={`badge ${statusColor} badge-sm`}>
                        {status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-base-content/60 line-clamp-2 mb-4">
                      {election.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Type:</span>
                        <span className="capitalize font-medium">{election.electionType}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Category:</span>
                        <span className="capitalize">{election.category?.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Candidates:</span>
                        <span className="font-medium">{election.candidates?.length || 0}</span>
                      </div>
                    </div>

                    <div className="divider my-3"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-base-content/50">
                        {status === 'active' ? 'Ends:' : status === 'upcoming' ? 'Starts:' : 'Ended:'} 
                        {' '}{new Date(status === 'upcoming' ? election.votingStartTime : election.votingEndTime).toLocaleDateString()}
                      </span>
                      
                      <button className="btn btn-primary btn-sm gap-2">
                        <FaEye />
                        Monitor
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!electionsLoading && (!elections || elections.length === 0) && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-12">
              <FaVoteYea className="text-6xl text-base-content/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Elections Found</h3>
              <p className="text-base-content/60">
                No elections are currently available for monitoring
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LiveResults;