import { sanitizeRateOfferedInput } from '../src/lib/inputSanitizers';

describe('sanitizeRateOfferedInput', () => {
  it('should allow valid rate inputs', () => {
    expect(sanitizeRateOfferedInput('85.1718')).toBe('85.1718');
  });

  it('should trim integer part to 3 digits', () => {
    expect(sanitizeRateOfferedInput('1234.567')).toBe('123.4567');
  });

  it('should trim decimal part to 4 digits', () => {
    expect(sanitizeRateOfferedInput('85.12345')).toBe('85.1234');
  });

  it('should remove non-numeric characters', () => {
    expect(sanitizeRateOfferedInput('abc85.1x2')).toBe('85.12');
  });
  
  it('should handle multiple dots', () => {
    expect(sanitizeRateOfferedInput('85.1.2')).toBe('85.12');
  });

  it('should handle empty string', () => {
    expect(sanitizeRateOfferedInput('')).toBe('');
  });
  
  it('should allow integer only', () => {
    expect(sanitizeRateOfferedInput('123')).toBe('123');
  });
  
  it('should allow dot at the end', () => {
    expect(sanitizeRateOfferedInput('123.')).toBe('123.');
  });
});
