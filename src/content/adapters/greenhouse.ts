import { FieldProposal } from '../../types';

/**
 * Greenhouse specific tweaks
 */
export async function greenhouse(proposals: FieldProposal[]): Promise<FieldProposal[]> {
  // Wait for Greenhouse form to load
  await waitForGreenhouseForm();
  
  // Filter out hidden fields
  const visibleProposals = proposals.filter(proposal => {
    const element = proposal.element;
    const formSection = element.closest('.form-section') || element.closest('.field');
    return !formSection || isElementVisible(formSection as HTMLElement);
  });
  
  // Add Greenhouse-specific field mappings
  const enhancedProposals = visibleProposals.map(proposal => {
    // Greenhouse often uses consistent name attributes
    const name = proposal.element.getAttribute('name') || '';
    
    if (name.includes('first_name') || name.includes('firstname')) {
      return { ...proposal, key: 'first_name', label: 'First Name' };
    }
    
    if (name.includes('last_name') || name.includes('lastname')) {
      return { ...proposal, key: 'last_name', label: 'Last Name' };
    }
    
    if (name.includes('email')) {
      return { ...proposal, key: 'email', label: 'Email Address' };
    }
    
    if (name.includes('phone')) {
      return { ...proposal, key: 'phone', label: 'Phone Number' };
    }
    
    // Handle work authorization questions
    if (name.includes('authorization') || name.includes('sponsorship')) {
      return { ...proposal, key: 'work_auth_need_sponsorship', label: 'Work Authorization' };
    }
    
    return proposal;
  });
  
  return enhancedProposals;
}

/**
 * Wait for Greenhouse form to load
 */
async function waitForGreenhouseForm(): Promise<void> {
  return new Promise((resolve) => {
    const checkForm = () => {
      const form = document.querySelector('form') || 
                  document.querySelector('.application-form') ||
                  document.querySelector('.form-section');
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
