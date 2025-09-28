import { FieldProposal } from '../types';

export interface PanelCallbacks {
  onConfirm: (updatedProposals: FieldProposal[]) => void;
  onCancel: () => void;
}

/**
 * Create and inject the confirmation side panel
 */
export function createConfirmationPanel(
  proposals: FieldProposal[],
  callbacks: PanelCallbacks
): HTMLElement {
  // Remove existing panel if it exists
  const existingPanel = document.getElementById('apply-anywhere-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  const panel = document.createElement('div');
  panel.id = 'apply-anywhere-panel';
  
  // Inline styles to avoid CSS conflicts
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: 80vh;
    background: white;
    border: 2px solid #007bff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;

  panel.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e0e0e0; background: #f8f9fa;">
      <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">
        Apply Anywhere - Confirm Fields
      </h3>
      <p style="margin: 0; color: #666; font-size: 12px;">
        Review and edit the values that will be filled:
      </p>
    </div>
    <div id="proposals-container" style="padding: 16px;">
      ${proposals.map((proposal, index) => createProposalRow(proposal, index)).join('')}
    </div>
    <div style="padding: 16px; border-top: 1px solid #e0e0e0; background: #f8f9fa; display: flex; gap: 8px; justify-content: flex-end;">
      <button id="cancel-btn" style="
        padding: 8px 16px;
        border: 1px solid #ccc;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      ">Cancel</button>
      <button id="confirm-btn" style="
        padding: 8px 16px;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      ">Confirm & Fill</button>
    </div>
  `;

  // Add event listeners
  const cancelBtn = panel.querySelector('#cancel-btn') as HTMLButtonElement;
  const confirmBtn = panel.querySelector('#confirm-btn') as HTMLButtonElement;

  cancelBtn.addEventListener('click', () => {
    panel.remove();
    callbacks.onCancel();
  });

  confirmBtn.addEventListener('click', () => {
    const updatedProposals = getUpdatedProposals(panel);
    panel.remove();
    callbacks.onConfirm(updatedProposals);
  });

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeBtn.addEventListener('click', () => {
    panel.remove();
    callbacks.onCancel();
  });
  panel.querySelector('div')?.appendChild(closeBtn);

  document.body.appendChild(panel);
  return panel;
}

/**
 * Create a single proposal row in the panel
 */
function createProposalRow(proposal: FieldProposal, index: number): string {
  const inputId = `proposal-${index}`;
  const isDisabled = !proposal.editable;
  
  return `
    <div style="margin-bottom: 12px; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; background: ${isDisabled ? '#f5f5f5' : 'white'};">
      <label for="${inputId}" style="display: block; margin-bottom: 4px; font-weight: 500; color: #333;">
        ${proposal.label}
        ${isDisabled ? ' (read-only)' : ''}
      </label>
      <input 
        type="text" 
        id="${inputId}" 
        value="${escapeHtml(proposal.proposedValue)}"
        ${isDisabled ? 'disabled' : ''}
        data-original-value="${escapeHtml(proposal.proposedValue)}"
        style="
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 3px;
          font-size: 13px;
          background: ${isDisabled ? '#f5f5f5' : 'white'};
        "
      />
      <div style="font-size: 11px; color: #666; margin-top: 2px;">
        Key: ${proposal.key}
      </div>
    </div>
  `;
}

/**
 * Get updated proposals from the panel inputs
 */
function getUpdatedProposals(panel: HTMLElement): FieldProposal[] {
  const proposals: FieldProposal[] = [];
  const inputs = panel.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>;
  
  inputs.forEach((input, index) => {
    const originalValue = input.getAttribute('data-original-value') || '';
    const currentValue = input.value;
    
    // Find the original proposal by index
    const proposalContainer = input.closest('div');
    if (proposalContainer) {
      const keyElement = proposalContainer.querySelector('div:last-child');
      const key = keyElement?.textContent?.replace('Key: ', '') || '';
      
      proposals.push({
        element: input as any, // This will be replaced by the actual element
        key,
        label: input.previousElementSibling?.textContent?.replace(' (read-only)', '') || '',
        proposedValue: currentValue,
        editable: !input.disabled
      });
    }
  });
  
  return proposals;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show a simple notification
 */
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
    color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
    border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
    border-radius: 4px;
    z-index: 10001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
