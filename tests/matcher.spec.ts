import { calculateMatchScore, findBestMatch, createFieldProposals } from '../src/content/matcher';
import { CanonicalMap } from '../src/types';

describe('Matcher', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('calculateMatchScore', () => {
    it('should give high score for exact matches', () => {
      const input = document.createElement('input');
      input.setAttribute('name', 'first_name');
      input.setAttribute('id', 'first_name');
      input.setAttribute('placeholder', 'First Name');
      
      const score = calculateMatchScore(input, 'first_name');
      expect(score).toBeGreaterThan(100);
    });

    it('should give medium score for synonym matches', () => {
      const input = document.createElement('input');
      input.setAttribute('name', 'firstname');
      input.setAttribute('placeholder', 'First Name');
      
      const score = calculateMatchScore(input, 'first_name');
      expect(score).toBeGreaterThan(50);
    });

    it('should give low score for no matches', () => {
      const input = document.createElement('input');
      input.setAttribute('name', 'unrelated_field');
      
      const score = calculateMatchScore(input, 'first_name');
      expect(score).toBeLessThan(20);
    });
  });

  describe('findBestMatch', () => {
    it('should return the best matching element', () => {
      const input1 = document.createElement('input');
      input1.setAttribute('name', 'first_name');
      
      const input2 = document.createElement('input');
      input2.setAttribute('name', 'firstname');
      
      const input3 = document.createElement('input');
      input3.setAttribute('name', 'unrelated');
      
      const elements = [input1, input2, input3];
      const bestMatch = findBestMatch(elements, 'first_name');
      
      expect(bestMatch).toBe(input1);
    });

    it('should return null for no good matches', () => {
      const input = document.createElement('input');
      input.setAttribute('name', 'unrelated');
      
      const elements = [input];
      const bestMatch = findBestMatch(elements, 'first_name');
      
      expect(bestMatch).toBeNull();
    });
  });

  describe('createFieldProposals', () => {
    it('should create proposals for matching fields', () => {
      const input1 = document.createElement('input');
      input1.setAttribute('name', 'first_name');
      input1.setAttribute('type', 'text');
      
      const input2 = document.createElement('input');
      input2.setAttribute('name', 'last_name');
      input2.setAttribute('type', 'text');
      
      const input3 = document.createElement('input');
      input3.setAttribute('name', 'unrelated');
      input3.setAttribute('type', 'text');
      
      const elements = [input1, input2, input3];
      const canonicalMap: CanonicalMap = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        work_auth_need_sponsorship: 'No',
        work_auth_authorized: 'Yes'
      };
      
      const proposals = createFieldProposals(elements, canonicalMap);
      
      expect(proposals).toHaveLength(2);
      expect(proposals[0].key).toBe('first_name');
      expect(proposals[0].proposedValue).toBe('John');
      expect(proposals[1].key).toBe('last_name');
      expect(proposals[1].proposedValue).toBe('Doe');
    });

    it('should skip empty values', () => {
      const input = document.createElement('input');
      input.setAttribute('name', 'first_name');
      input.setAttribute('type', 'text');
      
      const elements = [input];
      const canonicalMap: CanonicalMap = {
        first_name: '',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        work_auth_need_sponsorship: 'No',
        work_auth_authorized: 'Yes'
      };
      
      const proposals = createFieldProposals(elements, canonicalMap);
      
      expect(proposals).toHaveLength(0);
    });
  });
});
