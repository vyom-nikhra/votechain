import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { 
  FaUsers, 
  FaVoteYea, 
  FaChartLine, 
  FaUserShield,
  FaPlus,
  FaCrown,
  FaCog,
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

const SimpleAdminPanel = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Loading state while user is being fetched
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-error">
          <FaExclamationTriangle />
          <div>
            <h3 className="font-bold">Access Denied</h3>
            <div className="text-sm">You don't have permission to access the admin panel.</div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'elections', label: 'Elections', icon: FaVoteYea },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'system', label: 'System', icon: FaCog },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <FaUserShield className="text-primary" />
              Admin Panel
            </h1>
            <p className="text-base-content/70 text-lg mt-2">
              Manage users, elections, and system settings
            </p>
          </div>
          <div className="badge badge-primary badge-lg">
            <FaCrown className="mr-1" />
            Administrator
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-primary">
                  <FaUsers className="text-3xl" />
                </div>
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">5</div>
                <div className="stat-desc">1 new this month</div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-success">
                  <FaVoteYea className="text-3xl" />
                </div>
                <div className="stat-title">Total Elections</div>
                <div className="stat-value text-success">3</div>
                <div className="stat-desc">2 active elections</div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-warning">
                  <FaChartLine className="text-3xl" />
                </div>
                <div className="stat-title">Total Votes</div>
                <div className="stat-value text-warning">12</div>
                <div className="stat-desc">Democracy in action</div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-lg">
                <div className="stat-figure text-accent">
                  <FaShieldAlt className="text-3xl" />
                </div>
                <div className="stat-title">Verification Rate</div>
                <div className="stat-value text-accent">95%</div>
                <div className="stat-desc">Email verified users</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Quick Actions</h2>
                  <div className="space-y-3">
                    <button className="btn btn-primary btn-block">
                      <FaPlus className="mr-2" />
                      Create New Election
                    </button>
                    <button className="btn btn-outline btn-block">
                      <FaUsers className="mr-2" />
                      Manage Users
                    </button>
                    <button className="btn btn-outline btn-block">
                      <FaChartLine className="mr-2" />
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">System Status</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <div className="badge badge-success">Online</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Blockchain</span>
                      <div className="badge badge-success">Connected</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Email Service</span>
                      <div className="badge badge-success">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Elections Tab */}
        {activeTab === 'elections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Election Management</h2>
              <button className="btn btn-primary">
                <FaPlus className="mr-2" />
                Create Election
              </button>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Recent Elections</h3>
                <div className="space-y-4">
                  <div className="alert alert-info">
                    <FaVoteYea />
                    <div>
                      <div className="font-bold">Student Council Election 2024</div>
                      <div className="text-sm">Active • 150 votes cast</div>
                    </div>
                    <button className="btn btn-sm">Manage</button>
                  </div>
                  
                  <div className="alert">
                    <FaVoteYea />
                    <div>
                      <div className="font-bold">Campus Budget Proposal</div>
                      <div className="text-sm">Upcoming • Starts tomorrow</div>
                    </div>
                    <button className="btn btn-sm">Manage</button>
                  </div>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-outline">View All Elections</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button className="btn btn-primary">
                <FaPlus className="mr-2" />
                Add User
              </button>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Student ID</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-8">
                                <span className="text-xs">S</span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">System Administrator</div>
                              <div className="text-sm opacity-50">admin@gmail.com</div>
                            </div>
                          </div>
                        </td>
                        <td>ADMIN001</td>
                        <td>Administration</td>
                        <td><span className="badge badge-primary">Admin</span></td>
                        <td>
                          <button className="btn btn-ghost btn-xs">Edit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">General Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Enable Email Notifications</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Require Email Verification</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Auto-archive Completed Elections</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Two-Factor Authentication</span>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Rate Limiting</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Audit Logging</span>
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SimpleAdminPanel;