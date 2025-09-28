import { FieldProposal } from '../../types';

/**
 * LinkedIn Easy Apply specific tweaks
 */
export async function linkedinEasyApply(proposals: FieldProposal[]): Promise<FieldProposal[]> {
  // Wait for LinkedIn modals to render
  await waitForLinkedInModal();
  
  // Filter out hidden steps
  const visibleProposals = proposals.filter(proposal => {
    const element = proposal.element;
    const modal = element.closest('.jobs-easy-apply-modal') || element.closest('[role="dialog"]');
    return modal && isElementVisible(modal as HTMLElement);
  });
  
  // Add LinkedIn-specific field mappings
  const enhancedProposals = visibleProposals.map(proposal => {
    // LinkedIn often uses specific field names
    if (proposal.key === 'first_name' && proposal.element.getAttribute('name')?.includes('firstName')) {
      return { ...proposal, label: 'First Name' };
    }
    
    if (proposal.key === 'last_name' && proposal.element.getAttribute('name')?.includes('lastName')) {
      return { ...proposal, label: 'Last Name' };
    }
    
    if (proposal.key === 'email' && proposal.element.getAttribute('name')?.includes('email')) {
      return { ...proposal, label: 'Email Address' };
    }
    
    return proposal;
  });
  
  return enhancedProposals;
}

/**
 * Wait for LinkedIn Easy Apply modal to appear
 */
async function waitForLinkedInModal(): Promise<void> {
  return new Promise((resolve) => {
    const checkModal = () => {
      const modal = document.querySelector('.jobs-easy-apply-modal') || 
                   document.querySelector('[role="dialog"]');
      if (modal) {
        resolve();
      } else {
        setTimeout(checkModal, 100);
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkModal, 200);
    
    // Resolve after max 3 seconds even if modal not found
    setTimeout(resolve, 3000);
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
