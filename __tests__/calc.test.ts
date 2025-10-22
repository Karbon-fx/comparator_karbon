
import { calculateMarkupPerUsd, calculateTotalMarkup, calculateTotalInr, calculateSavings, toNumberSafe, formatRate, formatAsINR } from '../src/lib/utils';


describe('FX Savings Calculator - Calculations', () => {

  const usdAmount = 1000;
  const liveRate = 87.9536; // Karbon's rate
  const bankRate = 85.1718;
  const paypalRate = 85.3107;

  describe('toNumberSafe', () => {
    it('should convert valid inputs to numbers', () => {
        expect(toNumberSafe('123.45')).toBe(123.45);
        expect(toNumberSafe(123)).toBe(123);
    });
    it('should return NaN for invalid inputs', () => {
        expect(toNumberSafe(undefined)).toBeNaN();
        expect(toNumberSafe(null)).toBeNaN();
        expect(toNumberSafe('')).toBeNaN();
        expect(toNumberSafe('abc')).toBeNaN();
    });
  });

  describe('formatRate', () => {
      it('should format numbers to 4 decimal places', () => {
          expect(formatRate(85.1718123)).toBe('85.1718');
      });
      it('should return — for invalid inputs', () => {
          expect(formatRate(NaN)).toBe('—');
          expect(formatRate(undefined)).toBe('—');
      });
  });

    describe('formatAsINR', () => {
      it('should format numbers as INR currency', () => {
          expect(formatAsINR(123456.78)).toBe('₹1,23,456.78');
      });
      it('should return — for invalid inputs', () => {
          expect(formatAsINR(NaN)).toBe('—');
          expect(formatAsINR(undefined)).toBe('—');
      });
  });

  describe('calculateMarkupPerUsd', () => {
    it('should calculate the correct positive markup per USD', () => {
      expect(calculateMarkupPerUsd(liveRate, bankRate)).toBeCloseTo(2.7818);
      expect(calculateMarkupPerUsd(liveRate, paypalRate)).toBeCloseTo(2.6429);
    });

    it('should return NaN for invalid inputs', () => {
      expect(calculateMarkupPerUsd(NaN, 85)).toBeNaN();
      expect(calculateMarkupPerUsd(87, NaN)).toBeNaN();
      expect(calculateMarkupPerUsd(0, 85)).toBeNaN();
    });
  });
  
  describe('calculateTotalMarkup', () => {
    it('should calculate the correct total markup for the transaction', () => {
        const markup = calculateMarkupPerUsd(liveRate, bankRate);
        expect(calculateTotalMarkup(markup, usdAmount)).toBeCloseTo(2781.80);
    });
  });

  describe('calculateTotalInr', () => {
    it('should calculate the correct total INR', () => {
      expect(calculateTotalInr(usdAmount, liveRate)).toBeCloseTo(87953.60);
      expect(calculateTotalInr(usdAmount, bankRate)).toBeCloseTo(85171.80);
    });
    
    it('should return NaN for invalid inputs', () => {
        expect(calculateTotalInr(NaN, liveRate)).toBeNaN();
        expect(calculateTotalInr(1000, NaN)).toBeNaN();
    });
  });

  describe('calculateSavings', () => {
    const karbonInr = calculateTotalInr(usdAmount, liveRate);
    const bankInr = calculateTotalInr(usdAmount, bankRate);
    const paypalInr = calculateTotalInr(usdAmount, paypalRate);

    it('should calculate the correct savings vs bank and paypal', () => {
      expect(calculateSavings(karbonInr, bankInr)).toBeCloseTo(2781.80);
      expect(calculateSavings(karbonInr, paypalInr)).toBeCloseTo(2642.90);
    });

    it('should return NaN for invalid inputs', () => {
        expect(calculateSavings(NaN, karbonInr)).toBeNaN();
        expect(calculateSavings(karbonInr, NaN)).toBeNaN();
    });
  });
});
