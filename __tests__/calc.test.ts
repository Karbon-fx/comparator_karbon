import { calculateMarkup, calculateTotalInr, calculateSavings } from '../src/lib/calculations';

describe('FX Savings Calculator - Calculations', () => {

  const usdAmount = 1000;
  const liveRate = 87.9536; // Karbon's rate
  const bankRate = 85.1718;
  const paypalRate = 85.3107;

  describe('calculateMarkup', () => {
    it('should calculate the correct positive markup', () => {
      expect(calculateMarkup(liveRate, bankRate)).toBeCloseTo(2.7818);
      expect(calculateMarkup(liveRate, paypalRate)).toBeCloseTo(2.6429);
    });

    it('should return 0 for invalid (zero or negative) inputs', () => {
      expect(calculateMarkup(0, 85)).toBe(0);
      expect(calculateMarkup(87, 0)).toBe(0);
      expect(calculateMarkup(-87, 85)).toBe(0);
      expect(calculateMarkup(87, -85)).toBe(0);
    });
  });

  describe('calculateTotalInr', () => {
    it('should calculate the correct total INR', () => {
      expect(calculateTotalInr(usdAmount, liveRate)).toBeCloseTo(87953.60);
      expect(calculateTotalInr(usdAmount, bankRate)).toBeCloseTo(85171.80);
    });
    
    it('should return 0 for invalid inputs', () => {
        expect(calculateTotalInr(0, liveRate)).toBe(0);
        expect(calculateTotalInr(1000, 0)).toBe(0);
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

    it('should calculate zero savings when rates are equal', () => {
        expect(calculateSavings(karbonInr, karbonInr)).toBe(0);
    });
  });
});
