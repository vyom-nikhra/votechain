import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { electionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Breadcrumbs from '../common/Breadcrumbs';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaUsers, 
  FaVoteYea,
  FaTrash,
  FaSave
} from 'react-icons/fa';

const CreateElection = () => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    electionType: 'simple',
    category: 'general',
    registrationStartDate: '',
    registrationEndDate: '',
    votingStartDate: '',
    votingEndDate: '',
    candidates: [
      { name: '', description: '', manifesto: '' }, 
      { name: '', description: '', manifesto: '' }
    ],
    eligibleDepartments: []
  });

  const createElectionMutation = useMutation({
    mutationFn: electionsAPI.create,
    onSuccess: () => {
      toast.success('Election created successfully!');
      queryClient.invalidateQueries(['elections']);
      // Reset form
      setFormData({
        title: '',
        description: '',
        electionType: 'simple',
        category: 'general',
        registrationStartDate: '',
        registrationEndDate: '',
        votingStartDate: '',
        votingEndDate: '',
        candidates: [
          { name: '', description: '', manifesto: '' }, 
          { name: '', description: '', manifesto: '' }
        ],
        eligibleDepartments: []
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create election');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    const validCandidates = formData.candidates.filter(c => c.name?.trim() && c.description?.trim());
    if (validCandidates.length < 2) {
      toast.error('At least 2 candidates with names and descriptions are required');
      return;
    }
    
    const submitData = {
      ...formData,
      candidates: validCandidates,
      registrationStartTime: formData.registrationStartDate,
      registrationEndTime: formData.registrationEndDate,
      votingStartTime: formData.votingStartDate,
      votingEndTime: formData.votingEndDate
    };
    
    console.log('CreateElection submitData:', JSON.stringify(submitData, null, 2));
    console.log('Candidates being sent:', submitData.candidates);
    
    createElectionMutation.mutate(submitData);
  };

  const addCandidate = () => {
    setFormData(prev => ({
      ...prev,
      candidates: [...prev.candidates, { name: '', description: '', manifesto: '' }]
    }));
  };

  const removeCandidate = (index) => {
    if (formData.candidates.length > 2) {
      setFormData(prev => ({
        ...prev,
        candidates: prev.candidates.filter((_, i) => i !== index)
      }));
    }
  };

  const updateCandidate = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      candidates: prev.candidates.map((candidate, i) => 
        i === index ? { ...candidate, [field]: value } : candidate
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs customItems={[{ label: 'Create Election' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
              <FaPlus className="text-3xl text-primary" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Election
            </span>
          </h1>
          <p className="text-base-content/70 text-lg ml-16">
            Set up a new election for the community
          </p>
        </div>

        {/* Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Election Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Enter election title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Category</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="student_council">Student Council</option>
                    <option value="department">Department</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Enter election description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {/* Dates */}
              <div className="divider">
                <FaCalendarAlt className="text-primary" />
                Election Timeline
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Registration Start</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={formData.registrationStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationStartDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Registration End</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={formData.registrationEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationEndDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Voting Start</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={formData.votingStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, votingStartDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Voting End</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={formData.votingEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, votingEndDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Candidates */}
              <div className="divider">
                <FaUsers className="text-primary" />
                Candidates
              </div>

              <div className="space-y-4">
                {formData.candidates.map((candidate, index) => (
                  <div key={index} className="card bg-base-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Candidate {index + 1}</h4>
                      {formData.candidates.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => removeCandidate(index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Name *</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          placeholder={`Enter candidate ${index + 1} name`}
                          value={candidate.name || ''}
                          onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Description *</span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered"
                          placeholder={`Brief description of candidate ${index + 1}`}
                          value={candidate.description || ''}
                          onChange={(e) => updateCandidate(index, 'description', e.target.value)}
                          rows="2"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Manifesto</span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered"
                          placeholder={`Campaign manifesto for candidate ${index + 1}`}
                          value={candidate.manifesto || ''}
                          onChange={(e) => updateCandidate(index, 'manifesto', e.target.value)}
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="btn btn-outline btn-sm gap-2"
                  onClick={addCandidate}
                >
                  <FaPlus />
                  Add Candidate
                </button>
              </div>

              {/* Submit */}
              <div className="divider"></div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className={`btn btn-primary gap-2 ${createElectionMutation.isPending ? 'loading' : ''}`}
                  disabled={createElectionMutation.isPending}
                >
                  {!createElectionMutation.isPending && <FaSave />}
                  {createElectionMutation.isPending ? 'Creating...' : 'Create Election'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateElection;