/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FxCalculatorCard from '../src/components/FxCalculatorCard';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ rate: 87.9536, timestamp: new Date().toISOString(), conversion_rates: { INR: 87.9536 } }),
  })
) as jest.Mock;

describe('FxCalculatorCard with Table', () => {
  it('renders table and updates savings on rate change', async () => {
    render(<FxCalculatorCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Karbon (zero-markup)')).toBeInTheDocument();
    });

    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    
    // Find the input for Bank's rate
    const rateInputs = screen.getAllByRole('textbox');
    const bankRateInput = rateInputs.find(input => (input as HTMLInputElement).value === '85.1718');
    
    if (!bankRateInput) {
        throw new Error("Could not find bank rate input");
    }

    // Check initial savings for Bank
    await waitFor(() => {
        const savingsCells = screen.getAllByText(/₹2,781.80/);
        expect(savingsCells.length).toBeGreaterThan(0);
    });

    // Change the bank rate
    fireEvent.change(bankRateInput, { target: { value: '86.00' } });

    // Check if the savings value updates
    await waitFor(() => {
      const updatedSavingsCell = screen.getByText(/₹1,953.60/);
      expect(updatedSavingsCell).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
