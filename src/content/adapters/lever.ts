import { FieldProposal } from '../../types';

/**
 * Lever specific tweaks
 */
export async function lever(proposals: FieldProposal[]): Promise<FieldProposal[]> {
  // Wait for Lever form to load
  await waitForLeverForm();
  
  // Filter out hidden fields
  const visibleProposals = proposals.filter(proposal => {
    const element = proposal.element;
    const formGroup = element.closest('.form-group') || element.closest('.field');
    return !formGroup || isElementVisible(formGroup as HTMLElement);
  });
  
  // Add Lever-specific field mappings
  const enhancedProposals = visibleProposals.map(proposal => {
    const name = proposal.element.getAttribute('name') || '';
    const id = proposal.element.getAttribute('id') || '';
    
    // Lever often uses specific field patterns
    if (name.includes('first_name') || id.includes('first_name')) {
      return { ...proposal, key: 'first_name', label: 'First Name' };
    }
    
    if (name.includes('last_name') || id.includes('last_name')) {
      return { ...proposal, key: 'last_name', label: 'Last Name' };
    }
    
    if (name.includes('email') || id.includes('email')) {
      return { ...proposal, key: 'email', label: 'Email Address' };
    }
    
    if (name.includes('phone') || id.includes('phone')) {
      return { ...proposal, key: 'phone', label: 'Phone Number' };
    }
    
    // Handle work authorization
    if (name.includes('authorization') || name.includes('sponsorship') || 
        id.includes('authorization') || id.includes('sponsorship')) {
      return { ...proposal, key: 'work_auth_need_sponsorship', label: 'Work Authorization' };
    }
    
    return proposal;
  });
  
  return enhancedProposals;
}

/**
 * Wait for Lever form to load
 */
async function waitForLeverForm(): Promise<void> {
  return new Promise((resolve) => {
    const checkForm = () => {
      const form = document.querySelector('form') || 
                  document.querySelector('.application-form') ||
                  document.querySelector('.form-group');
      if (form) {
        resolve();
      } else {
        setTimeout(checkForm, 100);
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkForm, 200);
    
    // Resolve after max 2 seconds even if form not found
    setTimeout(resolve, 2000);
  });
}

/**
 * Check if element is visible (helper function)
 */
function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0
  );
}
