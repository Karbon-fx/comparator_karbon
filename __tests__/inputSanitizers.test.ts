import { sanitizeRateOfferedInput, sanitizeUsdDisplay } from '../src/lib/inputSanitizers';

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


describe('sanitizeUsdDisplay', () => {
    it('should format numbers with commas and return numeric value', () => {
        expect(sanitizeUsdDisplay('1000')).toEqual({ display: '1,000', numeric: 1000 });
        expect(sanitizeUsdDisplay('123456')).toEqual({ display: '123,456', numeric: 123456 });
    });

    it('should handle strings with commas', () => {
        expect(sanitizeUsdDisplay('1,234')).toEqual({ display: '1,234', numeric: 1234 });
    });

    it('should handle non-numeric characters', () => {
        expect(sanitizeUsdDisplay('abc123xyz')).toEqual({ display: '123', numeric: 123 });
    });

    it('should handle empty and invalid strings', () => {
        expect(sanitizeUsdDisplay('')).toEqual({ display: '', numeric: 0 });
        expect(sanitizeUsdDisplay('abc')).toEqual({ display: '', numeric: 0 });
    });
});
