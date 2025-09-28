import { Profile, CanonicalMap, FieldProposal } from '../types';
import { findVisibleFormElements } from './dom';
import { createFieldProposals } from './matcher';
import { createConfirmationPanel, showNotification } from './panel';
import { fillElements } from './fill';
import { detectSite, applySiteTweaks, getSiteDelay } from './adapters';

// Hardcoded profile for initial testing
const TEST_PROFILE: Profile = {
  personal: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  },
  workAuth: {
    needsSponsorship: false,
    authorizedToWork: true,
    visaStatus: 'US Citizen'
  },
  voluntary: {
    gender: 'Prefer not to say',
    race: 'Prefer not to say',
    veteran: false,
    disability: false
  },
  documents: {
    resume: 'resume.pdf',
    coverLetter: 'cover_letter.pdf'
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
    const canonicalMap = profileToCanonicalMap(TEST_PROFILE);
    
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
