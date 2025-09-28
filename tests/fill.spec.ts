import { fillElement, fillTextElement, fillSelectElement, fillCheckboxElement } from '../src/content/fill';

describe('Fill', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('fillTextElement', () => {
    it('should fill text input and dispatch events', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      container.appendChild(input);

      const inputSpy = jest.fn();
      const changeSpy = jest.fn();
      const focusSpy = jest.fn();
      const blurSpy = jest.fn();

      input.addEventListener('input', inputSpy);
      input.addEventListener('change', changeSpy);
      input.addEventListener('focus', focusSpy);
      input.addEventListener('blur', blurSpy);

      fillTextElement(input, 'test value');

      expect(input.value).toBe('test value');
      expect(inputSpy).toHaveBeenCalled();
      expect(changeSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
    });

    it('should not fill disabled elements', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.disabled = true;
      container.appendChild(input);

      fillTextElement(input, 'test value');

      expect(input.value).toBe('');
    });

    it('should not fill readonly elements', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.readOnly = true;
      container.appendChild(input);

      fillTextElement(input, 'test value');

      expect(input.value).toBe('');
    });
  });

  describe('fillSelectElement', () => {
    it('should select option by value', () => {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      option1.value = 'option1';
      option1.textContent = 'Option 1';
      const option2 = document.createElement('option');
      option2.value = 'option2';
      option2.textContent = 'Option 2';
      
      select.appendChild(option1);
      select.appendChild(option2);
      container.appendChild(select);

      const changeSpy = jest.fn();
      select.addEventListener('change', changeSpy);

      fillSelectElement(select, 'option2');

      expect(select.value).toBe('option2');
      expect(changeSpy).toHaveBeenCalled();
    });

    it('should select option by text content', () => {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      option1.value = 'val1';
      option1.textContent = 'Option 1';
      const option2 = document.createElement('option');
      option2.value = 'val2';
      option2.textContent = 'Option 2';
      
      select.appendChild(option1);
      select.appendChild(option2);
      container.appendChild(select);

      fillSelectElement(select, 'Option 1');

      expect(select.value).toBe('val1');
    });

    it('should not fill disabled select', () => {
      const select = document.createElement('select');
      select.disabled = true;
      container.appendChild(select);

      fillSelectElement(select, 'test');

      expect(select.value).toBe('');
    });
  });

  describe('fillCheckboxElement', () => {
    it('should check checkbox for true value', () => {
      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      container.appendChild(checkbox);

      const changeSpy = jest.fn();
      checkbox.addEventListener('change', changeSpy);

      fillCheckboxElement(checkbox, 'true');

      expect(checkbox.checked).toBe(true);
      expect(changeSpy).toHaveBeenCalled();
    });

    it('should uncheck checkbox for false value', () => {
      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.checked = true;
      container.appendChild(checkbox);

      fillCheckboxElement(checkbox, 'false');

      expect(checkbox.checked).toBe(false);
    });

    it('should check checkbox for yes value', () => {
      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      container.appendChild(checkbox);

      fillCheckboxElement(checkbox, 'yes');

      expect(checkbox.checked).toBe(true);
    });
  });

  describe('fillElement', () => {
    it('should fill text input', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      container.appendChild(input);

      fillElement(input, 'test value');

      expect(input.value).toBe('test value');
    });

    it('should fill select element', () => {
      const select = document.createElement('select');
      const option = document.createElement('option');
      option.value = 'test';
      option.textContent = 'Test Option';
      select.appendChild(option);
      container.appendChild(select);

      fillElement(select, 'test');

      expect(select.value).toBe('test');
    });

    it('should fill checkbox element', () => {
      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      container.appendChild(checkbox);

      fillElement(checkbox, 'true');

      expect(checkbox.checked).toBe(true);
    });

    it('should not fill disabled elements', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.disabled = true;
      container.appendChild(input);

      fillElement(input, 'test value');

      expect(input.value).toBe('');
    });
  });
});
