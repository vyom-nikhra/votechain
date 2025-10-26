import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaIdCard,
  FaEnvelope,
  FaGraduationCap,
  FaCalendarAlt,
  FaWallet,
  FaTrophy,
  FaHistory,
  FaShieldAlt
} from 'react-icons/fa';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    year: '',
    bio: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    totalVotes: 0,
    nftBadges: 0,
    joinedDate: '',
    lastLogin: ''
  });

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || ''
      });

      // Mock stats - replace with real API calls
      setStats({
        totalVotes: user.votesCount || 0,
        nftBadges: user.nftBadges || 0,
        joinedDate: new Date(user.createdAt).toLocaleDateString(),
        lastLogin: new Date(user.lastLogin || Date.now()).toLocaleDateString()
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditMode(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setChangePasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    // Reset form to original values
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content">My Profile</h1>
            <p className="text-base-content/70 text-lg mt-2">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <button 
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  className="btn btn-success"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={cancelEdit}
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center mb-6">
                  <div className="avatar placeholder mr-4">
                    <div className="bg-primary text-primary-content rounded-full w-20">
                      <FaUser className="text-3xl" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-base-content/70">{profileData.email}</p>
                    <div className="badge badge-primary mt-2">
                      {user?.role || 'Student'}
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaUser className="text-sm" />
                        First Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input input-bordered ${editMode ? 'focus:input-primary' : 'input-disabled'}`}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaUser className="text-sm" />
                        Last Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input input-bordered ${editMode ? 'focus:input-primary' : 'input-disabled'}`}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        Email
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input input-bordered ${editMode ? 'focus:input-primary' : 'input-disabled'}`}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaIdCard className="text-sm" />
                        Student ID
                      </span>
                    </label>
                    <input
                      type="text"
                      value={user?.studentId || ''}
                      disabled
                      className="input input-bordered input-disabled"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaGraduationCap className="text-sm" />
                        Department
                      </span>
                    </label>
                    <select
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`select select-bordered ${editMode ? 'focus:select-primary' : 'select-disabled'}`}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Arts">Arts</option>
                      <option value="Sciences">Sciences</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaCalendarAlt className="text-sm" />
                        Academic Year
                      </span>
                    </label>
                    <select
                      name="year"
                      value={profileData.year}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`select select-bordered ${editMode ? 'focus:select-primary' : 'select-disabled'}`}
                    >
                      <option value="">Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>

                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text font-medium">Bio</span>
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    rows="3"
                    placeholder="Tell us about yourself..."
                    className={`textarea textarea-bordered ${editMode ? 'focus:textarea-primary' : 'textarea-disabled'}`}
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title flex items-center gap-2">
                  <FaShieldAlt className="text-primary" />
                  Security Settings
                </h3>

                <div className="divider"></div>

                {!changePasswordMode ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Password</h4>
                      <p className="text-base-content/70">Last changed 30 days ago</p>
                    </div>
                    <button 
                      className="btn btn-outline btn-primary"
                      onClick={() => setChangePasswordMode(true)}
                    >
                      <FaLock className="mr-2" />
                      Change Password
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-semibold mb-4">Change Password</h4>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Current Password</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="input input-bordered flex-1"
                        />
                        <button 
                          type="button"
                          className="btn btn-square btn-outline"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">New Password</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="input input-bordered flex-1"
                        />
                        <button 
                          type="button"
                          className="btn btn-square btn-outline"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Confirm New Password</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="input input-bordered flex-1"
                        />
                        <button 
                          type="button"
                          className="btn btn-square btn-outline"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="btn btn-success"
                        onClick={handleChangePassword}
                      >
                        <FaLock className="mr-2" />
                        Update Password
                      </button>
                      <button 
                        className="btn btn-ghost"
                        onClick={() => {
                          setChangePasswordMode(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Activity */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Account Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-warning" />
                      <span>NFT Badges</span>
                    </div>
                    <div className="badge badge-warning">{stats.nftBadges}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaHistory className="text-success" />
                      <span>Total Votes</span>
                    </div>
                    <div className="badge badge-success">{stats.totalVotes}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-info" />
                      <span>Member Since</span>
                    </div>
                    <span className="text-sm">{stats.joinedDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-primary" />
                      <span>Last Login</span>
                    </div>
                    <span className="text-sm">{stats.lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title flex items-center gap-2">
                  <FaWallet className="text-accent" />
                  Blockchain Wallet
                </h3>
                <div className="space-y-4">
                  {user?.walletAddress ? (
                    <div>
                      <p className="text-sm text-base-content/70 mb-2">Connected Wallet:</p>
                      <div className="bg-base-200 p-3 rounded-lg">
                        <code className="text-xs break-all">
                          {user.walletAddress}
                        </code>
                      </div>
                      <div className="badge badge-success mt-2">
                        ✓ Verified
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base-content/70 mb-4">
                        Connect your wallet to participate in blockchain voting
                      </p>
                      <button className="btn btn-accent btn-block">
                        <FaWallet className="mr-2" />
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="btn btn-outline btn-block">
                    <FaHistory className="mr-2" />
                    View Vote History
                  </button>
                  <button className="btn btn-outline btn-block">
                    <FaTrophy className="mr-2" />
                    My NFT Collection
                  </button>
                  <button className="btn btn-outline btn-block">
                    <FaShieldAlt className="mr-2" />
                    Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;