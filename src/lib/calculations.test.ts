import { calculateMarkup, calculateTotalInr, calculateSavings } from './calculations';

describe('FX Savings Calculator - Calculations', () => {

  // Test data based on the spec
  const usdAmount = 1000;
  const liveRate = 87.9536; // Also Karbon's rate
  const bankRate = 85.1718;
  const paypalRate = 85.3107;

  describe('calculateMarkup', () => {
    it('should calculate the correct positive markup', () => {
      expect(calculateMarkup(liveRate, bankRate)).toBeCloseTo(2.7818);
      expect(calculateMarkup(liveRate, paypalRate)).toBeCloseTo(2.6429);
    });

    it('should calculate zero markup if rates are equal', () => {
      expect(calculateMarkup(liveRate, liveRate)).toBe(0);
    });

    it('should calculate negative markup if offered rate is better than live rate', () => {
      const betterRate = 88.00;
      expect(calculateMarkup(liveRate, betterRate)).toBeCloseTo(-0.0464);
    });

    it('should return 0 for invalid (zero or negative) inputs', () => {
      expect(calculateMarkup(0, 85)).toBe(0);
      expect(calculateMarkup(87, 0)).toBe(0);
      expect(calculateMarkup(-87, 85)).toBe(0);
    });
  });

  describe('calculateTotalInr', () => {
    it('should calculate the correct total INR for each provider', () => {
      expect(calculateTotalInr(usdAmount, liveRate)).toBeCloseTo(87953.60);
      expect(calculateTotalInr(usdAmount, bankRate)).toBeCloseTo(85171.80);
      expect(calculateTotalInr(usdAmount, paypalRate)).toBeCloseTo(85310.70);
    });

    it('should return 0 for invalid (zero or negative) inputs', () => {
      expect(calculateTotalInr(0, liveRate)).toBe(0);
      expect(calculateTotalInr(1000, 0)).toBe(0);
      expect(calculateTotalInr(-1000, liveRate)).toBe(0);
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

    it('should calculate zero savings when comparing Karbon to itself', () => {
      expect(calculateSavings(karbonInr, karbonInr)).toBe(0);
    });

    it('should calculate negative savings if a provider offers a better rate than Karbon', () => {
      const betterRateInr = calculateTotalInr(usdAmount, 88.00);
      expect(calculateSavings(karbonInr, betterRateInr)).toBeCloseTo(-46.4);
    });
  });
});
