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
    // Use debounced amount for assertions
    await waitFor(async () => {
      const amountCells = await screen.findAllByText('$50,000');
      expect(amountCells.length).toBeGreaterThan(0);
    });

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

  it('validates rate inputs and shows error messages', async () => {
    render(<FxConversionCard />);
    
    const rateInputs = screen.getAllByRole('textbox', {name: /offered rate/i});
    const bankRateInput = rateInputs.find(input => (input as HTMLInputElement).value === '85.1718');
    
    if (!bankRateInput) throw new Error("Bank rate input not found");

    // Test empty value
    fireEvent.change(bankRateInput, { target: { value: '' } });
    fireEvent.blur(bankRateInput);
    await waitFor(() => {
      expect(screen.getByText('A valid rate is required.')).toBeInTheDocument();
    });

    // Test valid value again to clear error
    fireEvent.change(bankRateInput, { target: { value: '85.5' } });
    fireEvent.blur(bankRateInput);
    await waitFor(() => {
      expect(screen.queryByText('A valid rate is required.')).not.toBeInTheDocument();
    });
  });
});
