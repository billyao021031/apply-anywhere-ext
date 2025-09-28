import { FieldProposal } from '../../types';

/**
 * Workday specific tweaks
 */
export async function workday(proposals: FieldProposal[]): Promise<FieldProposal[]> {
  // Wait for Workday dynamic content to load
  await waitForWorkdayContent();
  
  // Filter out hidden fields and focus on visible sections
  const visibleProposals = proposals.filter(proposal => {
    const element = proposal.element;
    const section = element.closest('[data-automation-id]') || 
                   element.closest('.css-1') || 
                   element.closest('.css-2');
    return !section || isElementVisible(section as HTMLElement);
  });
  
  // Add Workday-specific field mappings
  const enhancedProposals = visibleProposals.map(proposal => {
    const name = proposal.element.getAttribute('name') || '';
    const id = proposal.element.getAttribute('id') || '';
    const automationId = proposal.element.getAttribute('data-automation-id') || '';
    
    // Workday often uses data-automation-id attributes
    if (automationId.includes('firstName') || name.includes('firstName')) {
      return { ...proposal, key: 'first_name', label: 'First Name' };
    }
    
    if (automationId.includes('lastName') || name.includes('lastName')) {
      return { ...proposal, key: 'last_name', label: 'Last Name' };
    }
    
    if (automationId.includes('email') || name.includes('email')) {
      return { ...proposal, key: 'email', label: 'Email Address' };
    }
    
    if (automationId.includes('phone') || name.includes('phone')) {
      return { ...proposal, key: 'phone', label: 'Phone Number' };
    }
    
    // Handle work authorization
    if (automationId.includes('authorization') || automationId.includes('sponsorship') ||
        name.includes('authorization') || name.includes('sponsorship')) {
      return { ...proposal, key: 'work_auth_need_sponsorship', label: 'Work Authorization' };
    }
    
    return proposal;
  });
  
  return enhancedProposals;
}

/**
 * Wait for Workday dynamic content to load using MutationObserver
 */
async function waitForWorkdayContent(): Promise<void> {
  return new Promise((resolve) => {
    let timeoutId: number;
    let observer: MutationObserver;
    
    const checkContent = () => {
      // Look for Workday-specific elements
      const workdayElements = document.querySelectorAll('[data-automation-id], .css-1, .css-2');
      if (workdayElements.length > 0) {
        cleanup();
        resolve();
      }
    };
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
    
    // Set up MutationObserver to watch for dynamic content
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          checkContent();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Initial check
    checkContent();
    
    // Timeout after 5 seconds
    timeoutId = setTimeout(() => {
      cleanup();
      resolve();
    }, 5000);
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
