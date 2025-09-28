import { Profile, CanonicalMap, FieldProposal } from '../types';
import { findVisibleFormElements } from './dom';
import { createFieldProposals } from './matcher';
import { createConfirmationPanel, showNotification } from './panel';
import { fillElements } from './fill';
import { detectSite, applySiteTweaks, getSiteDelay } from './adapters';
import { loadEncryptedProfile } from './crypto';

// Default profile fallback
const DEFAULT_PROFILE: Profile = {
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
};

/**
 * Convert profile to canonical map for matching
 */
function profileToCanonicalMap(profile: Profile): CanonicalMap {
  return {
    first_name: profile.personal.firstName,
    last_name: profile.personal.lastName,
    email: profile.personal.email,
    phone: profile.personal.phone,
    work_auth_need_sponsorship: profile.workAuth.needsSponsorship ? 'No' : 'Yes',
    work_auth_authorized: profile.workAuth.authorizedToWork ? 'Yes' : 'No',
    eeo_gender: profile.voluntary.gender,
    eeo_race: profile.voluntary.race,
    eeo_veteran: profile.voluntary.veteran ? 'Yes' : 'No',
    eeo_disability: profile.voluntary.disability ? 'Yes' : 'No'
  };
}

/**
 * Main orchestrator function
 */
async function main(): Promise<void> {
  try {
    console.log('Apply Anywhere: Starting content script');
    
    // Load encrypted profile
    let profile: Profile = DEFAULT_PROFILE;
    try {
      // Try to load from storage
      const storedProfile = await chrome.storage.local.get(['encryptedProfile', 'currentProfile']);
      if (storedProfile.currentProfile) {
        // Use decrypted profile if available
        profile = storedProfile.currentProfile;
        console.log('Apply Anywhere: Loaded profile from storage');
      } else if (storedProfile.encryptedProfile) {
        // Profile exists but needs decryption
        showNotification('Please open the extension popup to set up your profile first', 'info');
        return;
      } else {
        showNotification('Please set up your profile in the extension popup first', 'info');
        return;
      }
    } catch (error) {
      console.log('Apply Anywhere: No profile found, using default');
      showNotification('Please set up your profile in the extension popup first', 'info');
      return;
    }
    
    // Detect the site type
    const siteType = detectSite();
    console.log('Apply Anywhere: Detected site type:', siteType);
    
    // Wait for dynamic content to load
    const delay = getSiteDelay(siteType);
    console.log('Apply Anywhere: Waiting', delay, 'ms for content to load');
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Find visible form elements
    const elements = findVisibleFormElements();
    console.log('Apply Anywhere: Found', elements.length, 'visible form elements');
    
    if (elements.length === 0) {
      console.log('Apply Anywhere: No form elements found, skipping');
      return;
    }
    
    // Convert profile to canonical map
    const canonicalMap = profileToCanonicalMap(profile);
    
    // Create field proposals
    let proposals = createFieldProposals(elements, canonicalMap);
    console.log('Apply Anywhere: Created', proposals.length, 'field proposals');
    
    if (proposals.length === 0) {
      console.log('Apply Anywhere: No matching fields found, skipping');
      return;
    }
    
    // Apply site-specific tweaks
    proposals = await applySiteTweaks(siteType, proposals);
    console.log('Apply Anywhere: Applied site tweaks,', proposals.length, 'proposals remaining');
    
    // Show confirmation panel
    const panel = createConfirmationPanel(proposals, {
      onConfirm: (updatedProposals) => {
        console.log('Apply Anywhere: User confirmed, filling', updatedProposals.length, 'fields');
        
        // Map updated proposals back to elements
        const fillData = updatedProposals.map(proposal => ({
          element: proposal.element,
          proposedValue: proposal.proposedValue
        }));
        
        // Fill the fields
        fillElements(fillData);
        
        showNotification(`Successfully filled ${fillData.length} fields`, 'success');
      },
      onCancel: () => {
        console.log('Apply Anywhere: User cancelled');
        showNotification('Autofill cancelled', 'info');
      }
    });
    
    console.log('Apply Anywhere: Panel created and displayed');
    
  } catch (error) {
    console.error('Apply Anywhere: Error in content script:', error);
    showNotification('Error occurred while analyzing form', 'error');
  }
}

// Run the main function when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// Also run on navigation for SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('Apply Anywhere: Page navigation detected, re-running');
    setTimeout(main, 1000); // Small delay for SPA navigation
  }
}).observe(document, { subtree: true, childList: true });
