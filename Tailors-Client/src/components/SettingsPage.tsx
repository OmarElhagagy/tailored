import React, { useState } from 'react';

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'integrations' | 'billing';

interface SettingsData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  emailPreferences: {
    orderUpdates: boolean;
    productAnnouncements: boolean;
    marketingEmails: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  darkMode: boolean;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [settings, setSettings] = useState<SettingsData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    emailPreferences: {
      orderUpdates: true,
      productAnnouncements: true,
      marketingEmails: false
    },
    privacySettings: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    },
    darkMode: false
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setSuccessMessage('');
    setPasswordError('');
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'twoFactorEnabled') {
      setSettings({
        ...settings,
        twoFactorEnabled: checked
      });
    } else if (name === 'darkMode') {
      setSettings({
        ...settings,
        darkMode: checked
      });
    } else if (name.startsWith('email.')) {
      const emailSetting = name.split('.')[1];
      setSettings({
        ...settings,
        emailPreferences: {
          ...settings.emailPreferences,
          [emailSetting]: checked
        }
      });
    } else if (name.startsWith('privacy.')) {
      const privacySetting = name.split('.')[1];
      setSettings({
        ...settings,
        privacySettings: {
          ...settings.privacySettings,
          [privacySetting]: checked
        }
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('privacy.')) {
      const privacySetting = name.split('.')[1];
      setSettings({
        ...settings,
        privacySettings: {
          ...settings.privacySettings,
          [privacySetting]: value
        }
      });
    } else {
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (settings.newPassword !== settings.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (settings.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setSettings({
        ...settings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('Password updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };
  
  const saveNotificationSettings = () => {
    setSuccessMessage('Notification preferences saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  const savePrivacySettings = () => {
    setSuccessMessage('Privacy settings updated successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>Settings</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3">
            <div className="nav flex-column nav-pills">
              <button 
                className={`nav-link mb-2 ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => handleTabChange('account')}
              >
                Account Settings
              </button>
              <button 
                className={`nav-link mb-2 ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => handleTabChange('notifications')}
              >
                Notifications
              </button>
              <button 
                className={`nav-link mb-2 ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => handleTabChange('privacy')}
              >
                Privacy & Security
              </button>
              <button 
                className={`nav-link mb-2 ${activeTab === 'integrations' ? 'active' : ''}`}
                onClick={() => handleTabChange('integrations')}
              >
                Integrations
              </button>
              <button 
                className={`nav-link mb-2 ${activeTab === 'billing' ? 'active' : ''}`}
                onClick={() => handleTabChange('billing')}
              >
                Billing
              </button>
            </div>
          </div>
          
          <div className="col-md-9">
            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}
            
            {activeTab === 'account' && (
              <>
                <h4 className="mb-3">Account Settings</h4>
                
                <form onSubmit={handlePasswordSubmit}>
                  <h5 className="mt-4 mb-3">Change Password</h5>
                  
                  {passwordError && (
                    <div className="alert alert-danger">
                      {passwordError}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="currentPassword"
                      value={settings.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Current password" 
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="newPassword"
                      value={settings.newPassword}
                      onChange={handleInputChange}
                      placeholder="New password" 
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="confirmPassword"
                      value={settings.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      required 
                    />
                  </div>
                  
                  <div className="mb-4">
                    <button type="submit" className="btn btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>
                
                <h5 className="mt-4 mb-3">Security</h5>
                
                <div className="mb-3">
                  <label className="form-label">Two-Factor Authentication</label>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox"
                      name="twoFactorEnabled"
                      checked={settings.twoFactorEnabled}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label">
                      Enable two-factor authentication
                    </label>
                  </div>
                  {settings.twoFactorEnabled && (
                    <small className="text-muted d-block mt-2">
                      Two-factor authentication adds an extra layer of security to your account.
                      You will need to enter a code from your phone in addition to your password when logging in.
                    </small>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Theme Preference</label>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox"
                      name="darkMode"
                      checked={settings.darkMode}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label">
                      Dark Mode
                    </label>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'notifications' && (
              <>
                <h4 className="mb-3">Notification Preferences</h4>
                
                <div className="mb-3">
                  <label className="form-label">Email Notifications</label>
                  
                  <div className="form-check mb-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox"
                      name="email.orderUpdates"
                      checked={settings.emailPreferences.orderUpdates}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label">
                      Order updates
                    </label>
                  </div>
                  
                  <div className="form-check mb-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox"
                      name="email.productAnnouncements"
                      checked={settings.emailPreferences.productAnnouncements}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label">
                      Product announcements
                    </label>
                  </div>
                  
                  <div className="form-check mb-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox"
                      name="email.marketingEmails"
                      checked={settings.emailPreferences.marketingEmails}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label">
                      Marketing emails
                    </label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={saveNotificationSettings}
                  >
                    Save Notification Settings
                  </button>
                </div>
              </>
            )}
            
            {activeTab === 'privacy' && (
              <>
                <h4 className="mb-3">Privacy Settings</h4>
                
                <div className="mb-3">
                  <label className="form-label">Profile Visibility</label>
                  <select 
                    className="form-select"
                    name="privacy.profileVisibility"
                    value={settings.privacySettings.profileVisibility}
                    onChange={handleInputChange}
                  >
                    <option value="public">Public - Anyone can see your profile</option>
                    <option value="private">Private - Only you can see your profile</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Contact Information</label>
                  
                  <div className="form-check mb-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox"
                      name="privacy.showEmail"
                      checked={settings.privacySettings.showEmail}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label">
                      Show email address on your public profile
                    </label>
                  </div>
                  
                  <div className="form-check mb-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox"
                      name="privacy.showPhone"
                      checked={settings.privacySettings.showPhone}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label">
                      Show phone number on your public profile
                    </label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={savePrivacySettings}
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </>
            )}
            
            {activeTab === 'integrations' && (
              <>
                <h4 className="mb-3">Connected Services</h4>
                
                <div className="card mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-1">Google Calendar</h5>
                      <p className="card-text text-muted mb-0">Not connected</p>
                    </div>
                    <button className="btn btn-outline-primary">Connect</button>
                  </div>
                </div>
                
                <div className="card mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-1">Facebook</h5>
                      <p className="card-text text-muted mb-0">Not connected</p>
                    </div>
                    <button className="btn btn-outline-primary">Connect</button>
                  </div>
                </div>
                
                <div className="card mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-1">Instagram</h5>
                      <p className="card-text text-muted mb-0">Not connected</p>
                    </div>
                    <button className="btn btn-outline-primary">Connect</button>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'billing' && (
              <>
                <h4 className="mb-3">Billing Information</h4>
                
                <div className="alert alert-info">
                  You are currently on the <strong>Free Plan</strong>. Upgrade to access premium features.
                </div>
                
                <div className="row mt-4">
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">Basic Plan</h5>
                        <h6 className="card-subtitle mb-2 text-muted">$0/month</h6>
                        <p className="card-text">For individual tailors just getting started.</p>
                        <ul className="list-group list-group-flush mb-3">
                          <li className="list-group-item">Up to 5 products</li>
                          <li className="list-group-item">Basic analytics</li>
                          <li className="list-group-item">Email support</li>
                        </ul>
                        <button className="btn btn-outline-primary" disabled>Current Plan</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <div className="card h-100 border-primary">
                      <div className="card-body">
                        <h5 className="card-title">Pro Plan</h5>
                        <h6 className="card-subtitle mb-2 text-muted">$29.99/month</h6>
                        <p className="card-text">For professional tailors and small businesses.</p>
                        <ul className="list-group list-group-flush mb-3">
                          <li className="list-group-item">Unlimited products</li>
                          <li className="list-group-item">Advanced analytics</li>
                          <li className="list-group-item">Priority support</li>
                          <li className="list-group-item">Custom branding</li>
                        </ul>
                        <button className="btn btn-primary">Upgrade Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 