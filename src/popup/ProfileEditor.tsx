import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { saveEncryptedProfile, loadEncryptedProfile, clearStoredProfile } from '../content/crypto';

export const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    workAuth: {
      needsSponsorship: false,
      authorizedToWork: true,
      visaStatus: ''
    },
    voluntary: {
      gender: '',
      race: '',
      veteran: false,
      disability: false
    },
    documents: {
      resume: '',
      coverLetter: ''
    }
  });

  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Auto-load profile when component mounts
  useEffect(() => {
    loadStoredProfile();
  }, []);

  const loadStoredProfile = async () => {
    try {
      const result = await chrome.storage.local.get(['currentProfile', 'encryptedProfile']);
      if (result.currentProfile) {
        setProfile(result.currentProfile);
        setProfileLoaded(true);
        console.log('Profile loaded automatically');
      } else if (result.encryptedProfile) {
        showMessage('Profile found but needs passphrase to decrypt', 'info');
      }
    } catch (error) {
      console.log('No stored profile found');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileUpload = (field: 'resume' | 'coverLetter', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateProfile('documents', field, base64);
      showMessage(`${field === 'resume' ? 'Resume' : 'Cover Letter'} uploaded successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!passphrase) {
      showMessage('Please enter a passphrase', 'error');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      showMessage('Passphrases do not match', 'error');
      return;
    }

    if (passphrase.length < 4) {
      showMessage('Passphrase must be at least 4 characters', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving profile...', profile);
      await saveEncryptedProfile(profile, passphrase);
      
      // Store decrypted profile for content script to use
      await chrome.storage.local.set({ currentProfile: profile });
      setProfileLoaded(true);
      
      showMessage('Profile saved successfully!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showMessage(`Failed to save profile: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!passphrase) {
      showMessage('Please enter a passphrase', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const loadedProfile = await loadEncryptedProfile(passphrase);
      setProfile(loadedProfile);
      
      // Store decrypted profile for content script to use
      await chrome.storage.local.set({ currentProfile: loadedProfile });
      setProfileLoaded(true);
      
      showMessage('Profile loaded successfully!', 'success');
    } catch (error) {
      showMessage('Failed to load profile. Check your passphrase.', 'error');
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all stored profile data?')) {
      try {
        await clearStoredProfile();
        setProfile({
          personal: { firstName: '', lastName: '', email: '', phone: '' },
          workAuth: { needsSponsorship: false, authorizedToWork: true, visaStatus: '' },
          voluntary: { gender: '', race: '', veteran: false, disability: false },
          documents: { resume: '', coverLetter: '' }
        });
        setPassphrase('');
        setConfirmPassphrase('');
        showMessage('Profile data cleared', 'success');
      } catch (error) {
        showMessage('Failed to clear profile data', 'error');
        console.error('Clear error:', error);
      }
    }
  };

  const updateProfile = (section: keyof Profile, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    margin: '4px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    margin: '4px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white'
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white'
  };

  return (
    <div>
      <div style={{ 
        marginBottom: '15px', 
        padding: '8px', 
        borderRadius: '4px', 
        backgroundColor: profileLoaded ? '#d4edda' : '#f8d7da',
        color: profileLoaded ? '#155724' : '#721c24',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        {profileLoaded ? '✓ Profile Loaded - Ready to fill job applications!' : '⚠ No Profile Loaded - Please set up your profile first'}
      </div>
      
      {message && (
        <div style={{
          padding: '8px',
          margin: '8px 0',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : 
                          message.type === 'error' ? '#f8d7da' : '#d1ecf1',
          color: message.type === 'success' ? '#155724' : 
                 message.type === 'error' ? '#721c24' : '#0c5460',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : 
                              message.type === 'error' ? '#f5c6cb' : '#bee5eb'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Personal Information</h3>
        <input
          type="text"
          placeholder="First Name"
          value={profile.personal.firstName}
          onChange={(e) => updateProfile('personal', 'firstName', e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={profile.personal.lastName}
          onChange={(e) => updateProfile('personal', 'lastName', e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={profile.personal.email}
          onChange={(e) => updateProfile('personal', 'email', e.target.value)}
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={profile.personal.phone}
          onChange={(e) => updateProfile('personal', 'phone', e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Work Authorization</h3>
        <label style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <input
            type="checkbox"
            checked={profile.workAuth.authorizedToWork}
            onChange={(e) => updateProfile('workAuth', 'authorizedToWork', e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Authorized to work in the US
        </label>
        <label style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <input
            type="checkbox"
            checked={profile.workAuth.needsSponsorship}
            onChange={(e) => updateProfile('workAuth', 'needsSponsorship', e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Need visa sponsorship
        </label>
        <input
          type="text"
          placeholder="Visa Status (optional)"
          value={profile.workAuth.visaStatus}
          onChange={(e) => updateProfile('workAuth', 'visaStatus', e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Documents</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Resume</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload('resume', file);
            }}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {profile.documents.resume && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              ✓ Resume uploaded ({Math.round(profile.documents.resume.length / 1024)}KB)
            </div>
          )}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cover Letter (Optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload('coverLetter', file);
            }}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {profile.documents.coverLetter && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              ✓ Cover Letter uploaded ({Math.round(profile.documents.coverLetter.length / 1024)}KB)
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Voluntary Disclosures (Optional)</h3>
        <select
          value={profile.voluntary.gender}
          onChange={(e) => updateProfile('voluntary', 'gender', e.target.value)}
          style={inputStyle}
        >
          <option value="">Prefer not to say</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={profile.voluntary.race}
          onChange={(e) => updateProfile('voluntary', 'race', e.target.value)}
          style={inputStyle}
        >
          <option value="">Prefer not to say</option>
          <option value="American Indian or Alaska Native">American Indian or Alaska Native</option>
          <option value="Asian">Asian</option>
          <option value="Black or African American">Black or African American</option>
          <option value="Hispanic or Latino">Hispanic or Latino</option>
          <option value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</option>
          <option value="White">White</option>
          <option value="Two or more races">Two or more races</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <input
            type="checkbox"
            checked={profile.voluntary.veteran}
            onChange={(e) => updateProfile('voluntary', 'veteran', e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Veteran status
        </label>
        <label style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <input
            type="checkbox"
            checked={profile.voluntary.disability}
            onChange={(e) => updateProfile('voluntary', 'disability', e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Disability status
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Security</h3>
        <input
          type="password"
          placeholder="Passphrase for encryption"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirm passphrase"
          value={confirmPassphrase}
          onChange={(e) => setConfirmPassphrase(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={primaryButtonStyle}
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
        <button
          onClick={handleLoad}
          disabled={isLoading}
          style={secondaryButtonStyle}
        >
          {isLoading ? 'Loading...' : 'Load Profile'}
        </button>
        <button
          onClick={handleClear}
          disabled={isLoading}
          style={dangerButtonStyle}
        >
          Clear Data
        </button>
      </div>
    </div>
  );
};
