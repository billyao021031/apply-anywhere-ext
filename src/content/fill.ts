/**
 * Safely fill form elements with values and dispatch appropriate events
 */

/**
 * Fill a text input or textarea
 */
export function fillTextElement(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void {
  if (element.disabled || element.readOnly) return;
  
  // Set the value
  element.value = value;
  
  // Dispatch input event
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  
  // Dispatch change event
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  
  // Dispatch focus and blur events to trigger any validation
  element.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
}

/**
 * Fill a select element
 */
export function fillSelectElement(
  element: HTMLSelectElement,
  value: string
): void {
  if (element.disabled) return;
  
  // Try to find exact value match first
  const exactMatch = Array.from(element.options).find(option => option.value === value);
  if (exactMatch) {
    element.value = value;
  } else {
    // Try to find text match
    const textMatch = Array.from(element.options).find(option => 
      option.text.toLowerCase().includes(value.toLowerCase())
    );
    if (textMatch) {
      element.value = textMatch.value;
    } else {
      // Set the value directly if no match found
      element.value = value;
    }
  }
  
  // Dispatch change event
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
}

/**
 * Fill a checkbox element
 */
export function fillCheckboxElement(
  element: HTMLInputElement,
  value: string
): void {
  if (element.disabled) return;
  
  const shouldCheck = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
  element.checked = shouldCheck;
  
  // Dispatch change event
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
}

/**
 * Fill a radio button element
 */
export function fillRadioElement(
  element: HTMLInputElement,
  value: string
): void {
  if (element.disabled) return;
  
  const shouldCheck = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
  if (shouldCheck) {
    element.checked = true;
    
    // Dispatch change event
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  }
}

/**
 * Fill any form element with the appropriate method
 */
export function fillElement(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string
): void {
  if (element.disabled) return;
  
  try {
    if (element.tagName === 'SELECT') {
      fillSelectElement(element as HTMLSelectElement, value);
    } else if (element.type === 'checkbox') {
      fillCheckboxElement(element as HTMLInputElement, value);
    } else if (element.type === 'radio') {
      fillRadioElement(element as HTMLInputElement, value);
    } else {
      fillTextElement(element as HTMLInputElement | HTMLTextAreaElement, value);
    }
  } catch (error) {
    console.warn('Failed to fill element:', element, error);
  }
}

/**
 * Fill multiple elements from field proposals
 */
export function fillElements(proposals: Array<{ element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement; proposedValue: string }>): void {
  proposals.forEach(({ element, proposedValue }) => {
    fillElement(element, proposedValue);
  });
}
