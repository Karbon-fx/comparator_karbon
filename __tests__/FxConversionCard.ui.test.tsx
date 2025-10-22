/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FxConversionCard from '../src/components/FxConversionCard';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ rate: 87.9536, timestamp: new Date().toISOString(), conversion_rates: { INR: 87.9536 } }),
  })
) as jest.Mock;

describe('FxConversionCard UI Test', () => {
  it('renders table and updates savings on rate change', async () => {
    render(<FxConversionCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Karbon (zero-markup)')).toBeInTheDocument();
    });

    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    
    // Find the input for Bank's rate
    const rateInputs = screen.getAllByRole('textbox', {name: /offered rate/i});
    const bankRateInput = rateInputs.find(input => (input as HTMLInputElement).value === '85.1718');
    
    if (!bankRateInput) {
        throw new Error("Could not find bank rate input");
    }

    // Check initial savings for Bank
    await waitFor(() => {
        // Savings Karbon is also on the page, so we expect 2
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

  it('syncs USD input and clamps values', async () => {
    render(<FxConversionCard />);

    const usdInput = screen.getByLabelText('USD amount to convert');
    
    // Type a value
    fireEvent.change(usdInput, { target: { value: '50,000' } });
    await waitFor(() => {
        expect(usdInput).toHaveValue('50,000');
    });
    
    // Check if the table reflects the new amount
    const amountCells = await screen.findAllByText('$50,000');
    expect(amountCells.length).toBe(3); // one for each provider

    // Type an out-of-bounds value (low)
    fireEvent.change(usdInput, { target: { value: '50' } });
    fireEvent.blur(usdInput);
    await waitFor(() => {
      expect(usdInput).toHaveValue('100');
      expect(screen.getByText('Minimum is $100')).toBeInTheDocument();
    });
    
    // Type an out-of-bounds value (high)
    fireEvent.change(usdInput, { target: { value: '120,000' } });
    fireEvent.blur(usdInput);
    await waitFor(() => {
      expect(usdInput).toHaveValue('100,000');
      expect(screen.getByText('Maximum is $100,000')).toBeInTheDocument();
    });
  });
});
