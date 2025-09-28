import { CanonicalMap, FieldProposal } from '../types';
import { getElementAttributes, getClosestLabelText } from './dom';

// Synonym table for common field variations
const SYNONYMS: Record<string, string[]> = {
  first_name: ['firstname', 'first-name', 'fname', 'given name', 'first', 'givenname'],
  last_name: ['lastname', 'last-name', 'lname', 'surname', 'family name', 'last', 'surname'],
  email: ['email address', 'e-mail', 'emailaddress', 'mail', 'email_addr'],
  phone: ['phone number', 'phonenumber', 'telephone', 'tel', 'mobile', 'cell', 'phone_num'],
  work_auth_need_sponsorship: ['sponsorship', 'visa sponsorship', 'work authorization', 'work auth', 'sponsor', 'visa', 'authorization'],
  work_auth_authorized: ['authorized to work', 'work authorization', 'eligible to work', 'work eligible', 'authorized'],
  eeo_gender: ['gender', 'sex', 'eeo gender', 'demographic gender'],
  eeo_race: ['race', 'ethnicity', 'eeo race', 'demographic race', 'ethnic background'],
  eeo_veteran: ['veteran', 'military', 'veteran status', 'military service'],
  eeo_disability: ['disability', 'disabled', 'disability status', 'accommodation']
};

/**
 * Calculate a score for how well an element matches a canonical key
 */
export function calculateMatchScore(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  canonicalKey: string
): number {
  const attrs = getElementAttributes(element);
  const labelText = getClosestLabelText(element);
  const elementText = `${attrs.name} ${attrs.id} ${attrs.placeholder} ${attrs['aria-label']} ${attrs['data-testid']} ${labelText}`.toLowerCase();
  
  let score = 0;
  
  // Exact match gets highest score
  if (elementText.includes(canonicalKey.toLowerCase())) {
    score += 100;
  }
  
  // Check synonyms
  const synonyms = SYNONYMS[canonicalKey] || [];
  synonyms.forEach(synonym => {
    if (elementText.includes(synonym.toLowerCase())) {
      score += 80;
    }
  });
  
  // Attribute-specific scoring
  if (attrs.name.toLowerCase().includes(canonicalKey.toLowerCase())) {
    score += 50;
  }
  
  if (attrs.id.toLowerCase().includes(canonicalKey.toLowerCase())) {
    score += 40;
  }
  
  if (attrs.placeholder.toLowerCase().includes(canonicalKey.toLowerCase())) {
    score += 30;
  }
  
  if (attrs['aria-label'].toLowerCase().includes(canonicalKey.toLowerCase())) {
    score += 35;
  }
  
  if (labelText.toLowerCase().includes(canonicalKey.toLowerCase())) {
    score += 60;
  }
  
  // Bonus for exact attribute matches
  if (attrs.name === canonicalKey) {
    score += 20;
  }
  
  if (attrs.id === canonicalKey) {
    score += 15;
  }
  
  return score;
}

/**
 * Find the best matching element for a canonical key
 */
export function findBestMatch(
  elements: (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[],
  canonicalKey: string
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  let bestMatch: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;
  let bestScore = 0;
  
  elements.forEach(element => {
    const score = calculateMatchScore(element, canonicalKey);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = element;
    }
  });
  
  // Only return matches with a reasonable score
  return bestScore > 20 ? bestMatch : null;
}

/**
 * Create field proposals by matching elements to canonical keys
 */
export function createFieldProposals(
  elements: (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[],
  canonicalMap: CanonicalMap
): FieldProposal[] {
  const proposals: FieldProposal[] = [];
  const usedElements = new Set<HTMLElement>();
  
  Object.entries(canonicalMap).forEach(([key, value]) => {
    if (!value) return; // Skip empty values
    
    const bestMatch = findBestMatch(elements, key);
    if (bestMatch && !usedElements.has(bestMatch)) {
      const label = getClosestLabelText(bestMatch);
      const isEditable = !bestMatch.disabled && !bestMatch.readOnly;
      
      proposals.push({
        element: bestMatch,
        key,
        label: label || key.replace(/_/g, ' '),
        proposedValue: String(value),
        editable: isEditable
      });
      
      usedElements.add(bestMatch);
    }
  });
  
  return proposals;
}

/**
 * Get the appropriate value for a form element based on its type
 */
export function getProposedValueForElement(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string
): string {
  if (element.type === 'checkbox' || element.type === 'radio') {
    // For boolean values, return 'true' or 'false'
    return value.toLowerCase() === 'true' ? 'true' : 'false';
  }
  
  if (element.tagName === 'SELECT') {
    // For selects, try to find matching option
    const select = element as HTMLSelectElement;
    const options = Array.from(select.options);
    const matchingOption = options.find(option => 
      option.text.toLowerCase().includes(value.toLowerCase()) ||
      option.value.toLowerCase().includes(value.toLowerCase())
    );
    return matchingOption ? matchingOption.value : value;
  }
  
  return value;
}
