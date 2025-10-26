import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { electionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Breadcrumbs from '../common/Breadcrumbs';
import { 
  FaPlus, 
  FaVoteYea, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaChartBar,
  FaFilter,
  FaSearch,
  FaCheck,
  FaTimes,
  FaPause,
  FaPlay,
  FaChartPie
} from 'react-icons/fa';

const ElectionsList = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    electionType: 'simple',
    category: 'general',
    registrationStartTime: '',
    registrationEndTime: '',
    votingStartTime: '',
    votingEndTime: '',
    candidates: [{ name: '', description: '', manifesto: '' }, { name: '', description: '', manifesto: '' }],
    eligibleDepartments: [],
    eligibleYears: []
  });

  // Fetch elections
  const { data: elections, isLoading, error } = useQuery({
    queryKey: ['elections', statusFilter, searchTerm],
    queryFn: () => electionsAPI.getAll({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined,
      limit: 50
    }),
    select: (response) => response.data.elections || [],
  });

  // Create election mutation
  const createElectionMutation = useMutation({
    mutationFn: electionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['elections']);
      setShowCreateModal(false);
      setNewElection({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        candidates: ['', ''],
        department: '',
        eligibleYears: []
      });
      toast.success('Election created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create election');
    }
  });

  // Delete election mutation
  const deleteElectionMutation = useMutation({
    mutationFn: electionsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['elections']);
      setShowDeleteModal(false);
      setSelectedElection(null);
      toast.success('Election deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete election');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewElection(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateChange = (index, value) => {
    const updatedCandidates = [...newElection.candidates];
    updatedCandidates[index] = value;
    setNewElection(prev => ({
      ...prev,
      candidates: updatedCandidates
    }));
  };

  const addCandidate = () => {
    setNewElection(prev => ({
      ...prev,
      candidates: [...prev.candidates, '']
    }));
  };

  const removeCandidate = (index) => {
    if (newElection.candidates.length > 2) {
      const updatedCandidates = newElection.candidates.filter((_, i) => i !== index);
      setNewElection(prev => ({
        ...prev,
        candidates: updatedCandidates
      }));
    }
  };

  const handleYearToggle = (year) => {
    const updatedYears = newElection.eligibleYears.includes(year)
      ? newElection.eligibleYears.filter(y => y !== year)
      : [...newElection.eligibleYears, year];
    
    setNewElection(prev => ({
      ...prev,
      eligibleYears: updatedYears
    }));
  };

  const handleCreateElection = () => {
    // Validation
    if (!newElection.title || !newElection.description || !newElection.votingStartTime || !newElection.votingEndTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newElection.candidates.some(c => !c.name || !c.description)) {
      toast.error('Please provide name and description for all candidates');
      return;
    }

    if (new Date(newElection.votingStartTime) >= new Date(newElection.votingEndTime)) {
      toast.error('Voting end time must be after start time');
      return;
    }

    createElectionMutation.mutate(newElection);
  };

  const getStatusBadge = (election) => {
    const now = new Date();
    const startDate = new Date(election.votingStartTime);
    const endDate = new Date(election.votingEndTime);

    if (now < startDate) {
      return <div className="badge badge-info">Upcoming</div>;
    } else if (now >= startDate && now <= endDate) {
      return <div className="badge badge-success">Active</div>;
    } else {
      return <div className="badge badge-neutral">Ended</div>;
    }
  };

  const filteredElections = elections?.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    let matchesStatus = false;
    switch (statusFilter) {
      case 'active':
        matchesStatus = now >= startDate && now <= endDate;
        break;
      case 'upcoming':
        matchesStatus = now < startDate;
        break;
      case 'ended':
        matchesStatus = now > endDate;
        break;
    }
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs customItems={[{ label: 'Elections' }]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                  <FaVoteYea className="text-2xl text-primary" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Elections
                </span>
              </h1>
              <p className="text-base-content/70 text-lg ml-16">
                Participate in democratic decisions and shape your university
              </p>
            </div>
            {user?.role === 'admin' && (
              <button 
                className="btn btn-primary hover:scale-105 transition-transform"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className="mr-2" />
                Create Election
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="form-control">
            <div className="input-group">
              <span className="bg-base-200">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Search elections..."
                className="input input-bordered flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control">
            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Elections</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-base-content/50" />
            <span className="text-sm text-base-content/70">
              {filteredElections.length} election(s) found
            </span>
          </div>
        </div>

        {/* Elections Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl">
                <div className="card-body animate-pulse">
                  <div className="h-4 bg-base-300 rounded mb-2"></div>
                  <div className="h-16 bg-base-300 rounded mb-4"></div>
                  <div className="h-4 bg-base-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>Failed to load elections. Please try again later.</span>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="text-center py-16">
            <FaVoteYea className="text-6xl text-base-content/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-base-content/70 mb-2">
              No elections found
            </h3>
            <p className="text-base-content/50">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No elections are currently available'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election, index) => {
              const status = getElectionStatus(election);
              const borderColor = status.status === 'active' ? 'border-green-500/20 hover:border-green-400/50 hover:shadow-green-500/20' 
                : status.status === 'upcoming' ? 'border-blue-500/20 hover:border-blue-400/50 hover:shadow-blue-500/20'
                : 'border-gray-700 hover:border-gray-600';
              
              return (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`card bg-base-100 shadow-xl border-[0.5px] ${borderColor} transition-all duration-300 group`}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="card-title text-lg group-hover:text-primary transition-colors">{election.title}</h3>
                      {getStatusBadge(election)}
                    </div>
                  
                  <p className="text-base-content/70 mb-4 line-clamp-3">
                    {election.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-info" />
                      <span>
                        {new Date(election.startDate).toLocaleDateString()} - 
                        {new Date(election.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FaUsers className="text-success" />
                      <span>{election.candidates?.length || 0} candidates</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FaChartBar className="text-warning" />
                      <span>{election.totalVotes || 0} votes cast</span>
                    </div>
                  </div>

                  <div className="card-actions justify-between">
                    <div className="flex gap-1">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate(`/vote/${election._id}`)}
                      >
                        <FaEye className="mr-1" />
                        View
                      </button>
                      
                      {user?.role === 'admin' && (
                        <>
                          <button 
                            className="btn btn-sm btn-outline btn-warning"
                            onClick={() => {/* Navigate to edit */}}
                          >
                            <FaEdit className="mr-1" />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline btn-error"
                            onClick={() => {
                              setSelectedElection(election);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrash className="mr-1" />
                          </button>
                        </>
                      )}
                    </div>

                    {(() => {
                      const now = new Date();
                      const startDate = new Date(election.votingStartTime);
                      const endDate = new Date(election.votingEndTime);
                      
                      if (now >= startDate && now <= endDate) {
                        return (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/vote/${election._id}`)}
                          >
                            <FaVoteYea className="mr-1" />
                            Vote Now
                          </button>
                        );
                      } else if (now > endDate) {
                        return (
                          <button className="btn btn-accent btn-sm">
                            <FaChartPie className="mr-1" />
                            Results
                          </button>
                        );
                      } else {
                        return (
                          <button className="btn btn-info btn-sm" disabled>
                            <FaClock className="mr-1" />
                            Upcoming
                          </button>
                        );
                      }
                    })()}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Create Election Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Create New Election</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Election Title *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newElection.title}
                    onChange={handleInputChange}
                    placeholder="Student Council Election 2024"
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Department</span>
                  </label>
                  <select
                    name="department"
                    value={newElection.department}
                    onChange={handleInputChange}
                    className="select select-bordered"
                  >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Arts">Arts</option>
                    <option value="Sciences">Sciences</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  name="description"
                  value={newElection.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe the purpose and scope of this election..."
                  className="textarea textarea-bordered"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Start Date & Time *</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={newElection.startDate}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">End Date & Time *</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={newElection.endDate}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Eligible Academic Years</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(year => (
                    <label key={year} className="cursor-pointer label">
                      <input
                        type="checkbox"
                        checked={newElection.eligibleYears.includes(year)}
                        onChange={() => handleYearToggle(year)}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text ml-2">Year {year}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Candidates *</span>
                </label>
                <div className="space-y-2">
                  {newElection.candidates.map((candidate, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={candidate}
                        onChange={(e) => handleCandidateChange(index, e.target.value)}
                        placeholder={`Candidate ${index + 1} name`}
                        className="input input-bordered flex-1"
                      />
                      {newElection.candidates.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-error btn-square"
                          onClick={() => removeCandidate(index)}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm mt-2"
                  onClick={addCandidate}
                >
                  <FaPlus className="mr-2" />
                  Add Candidate
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-success"
                onClick={handleCreateElection}
                disabled={createElectionMutation.isLoading}
              >
                {createElectionMutation.isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <FaCheck className="mr-2" />
                )}
                Create Election
              </button>
              <button 
                className="btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedElection && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Election</h3>
            <p className="py-4">
              Are you sure you want to delete "{selectedElection.title}"? 
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-error"
                onClick={() => deleteElectionMutation.mutate(selectedElection._id)}
                disabled={deleteElectionMutation.isLoading}
              >
                {deleteElectionMutation.isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Delete'
                )}
              </button>
              <button 
                className="btn"
                onClick={() => setShowDeleteModal(false)}
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

export default ElectionsList;