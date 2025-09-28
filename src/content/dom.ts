import { FieldProposal } from '../types';

/**
 * Find all visible form elements on the page
 */
export function findVisibleFormElements(): (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="password"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    'select',
    'textarea'
  ];

  const elements: (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] = [];
  
  selectors.forEach(selector => {
    const found = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    found.forEach(el => {
      if (isElementVisible(el)) {
        elements.push(el);
      }
    });
  });

  return elements;
}

/**
 * Check if an element is visible to the user
 */
export function isElementVisible(element: HTMLElement): boolean {
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

/**
 * Get the closest label text for a form element
 */
export function getClosestLabelText(element: HTMLElement): string {
  // Check for associated label via 'for' attribute
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      return getTextContent(label);
    }
  }

  // Check for parent label
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') {
      return getTextContent(parent);
    }
    parent = parent.parentElement;
  }

  // Check for nearby text elements
  const nearbyText = findNearbyText(element);
  if (nearbyText) {
    return nearbyText;
  }

  return '';
}

/**
 * Extract text content from an element, cleaning up whitespace
 */
function getTextContent(element: Element): string {
  return element.textContent?.trim().replace(/\s+/g, ' ') || '';
}

/**
 * Find text near the element that might be a label
 */
function findNearbyText(element: HTMLElement): string | null {
  const parent = element.parentElement;
  if (!parent) return null;

  // Look for text in previous siblings
  let sibling = element.previousElementSibling;
  while (sibling) {
    const text = getTextContent(sibling);
    if (text && text.length < 100) { // Reasonable label length
      return text;
    }
    sibling = sibling.previousElementSibling;
  }

  // Look for text in parent's previous siblings
  let parentSibling = parent.previousElementSibling;
  while (parentSibling) {
    const text = getTextContent(parentSibling);
    if (text && text.length < 100) {
      return text;
    }
    parentSibling = parentSibling.previousElementSibling;
  }

  return null;
}

/**
 * Query elements within shadow roots if they exist
 */
export function queryShadowRoots(selector: string): Element[] {
  const elements: Element[] = [];
  
  // Regular query
  elements.push(...document.querySelectorAll(selector));
  
  // Query within shadow roots
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.shadowRoot) {
      elements.push(...el.shadowRoot.querySelectorAll(selector));
    }
  });
  
  return elements;
}

/**
 * Get element attributes that might contain field names
 */
export function getElementAttributes(element: HTMLElement): {
  name: string;
  id: string;
  placeholder: string;
  'aria-label': string;
  'data-testid': string;
  className: string;
} {
  return {
    name: element.getAttribute('name') || '',
    id: element.getAttribute('id') || '',
    placeholder: element.getAttribute('placeholder') || '',
    'aria-label': element.getAttribute('aria-label') || '',
    'data-testid': element.getAttribute('data-testid') || '',
    className: element.className || ''
  };
}
