import React, { useState } from 'react';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  bio: string;
  profileImage: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'John Tailor',
    email: 'john@tailors.com',
    phone: '+1 (555) 123-4567',
    address: '123 Stitch Street, Sewville, NY 10001',
    specialization: 'Men\'s Suits',
    bio: 'Professional tailor with over 10 years of experience specializing in custom suits and alterations.',
    profileImage: 'https://via.placeholder.com/150'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setProfile(formData);
      setIsEditing(false);
      setIsSaving(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const specializations = [
    'Men\'s Suits', 
    'Women\'s Dresses', 
    'Alterations', 
    'Custom Design',
    'Wedding Attire',
    'Casual Wear',
    'Uniforms'
  ];
  
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3>Your Profile</h3>
        {!isEditing && (
          <button className="btn btn-primary" onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </div>
      
      <div className="card-body">
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        
        <div className="row">
          <div className="col-md-4 mb-4 text-center">
            <div className="border p-3 rounded">
              <div className="mb-3">
                <img 
                  src={profile.profileImage} 
                  className="rounded-circle" 
                  alt="Profile" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <h4>{profile.fullName}</h4>
              <p className="text-muted">{profile.specialization}</p>
              
              {!isEditing ? (
                <div className="mt-3">
                  <p className="text-muted mb-1">
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Phone:</strong> {profile.phone}
                  </p>
                </div>
              ) : (
                <button className="btn btn-sm btn-outline-primary mt-2">
                  Change Photo
                </button>
              )}
            </div>
          </div>
          
          <div className="col-md-8">
            {!isEditing ? (
              <div>
                <h5 className="mb-3">Profile Information</h5>
                <p><strong>Address:</strong> {profile.address}</p>
                <p><strong>Specialization:</strong> {profile.specialization}</p>
                
                <h5 className="mt-4 mb-3">Bio</h5>
                <p>{profile.bio}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="fullName"
                    value={formData.fullName} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="email"
                    value={formData.email} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    name="phone"
                    value={formData.phone} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea 
                    className="form-control" 
                    name="address"
                    value={formData.address} 
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Bio</label>
                  <textarea 
                    className="form-control" 
                    name="bio"
                    value={formData.bio} 
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Specialization</label>
                  <select 
                    className="form-select"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  >
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="btn btn-primary me-2"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 