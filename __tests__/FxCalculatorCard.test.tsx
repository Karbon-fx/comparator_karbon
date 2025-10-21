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

// Mock the useToast hook
jest.mock('../src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('FxCalculatorCard', () => {
  it('renders initial rows and updates savings on rate change', async () => {
    render(<FxCalculatorCard />);
    
    // Wait for the API call to resolve and UI to update
    await waitFor(() => {
      expect(screen.getByText('Karbon (Zero-Markup)')).toBeInTheDocument();
    });

    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    
    const bankRateInput = screen.getAllByPlaceholderText('Exchange Rate')[0];
    
    // Find the row for 'Bank'
    const bankRow = (screen.getByText('Bank').closest('tr') || screen.getByText('Bank').closest('div'));
    
    if (!bankRow) {
      throw new Error("Could not find bank row");
    }

    // Check initial savings for Bank
    await waitFor(() => {
        const initialSavingsCell = bankRow.querySelector('td:last-child');
        expect(initialSavingsCell).toHaveTextContent('₹2,781.80');
    });

    // Change the bank rate
    fireEvent.change(bankRateInput, { target: { value: '86.00' } });

    // Check if the savings value updates
    await waitFor(() => {
      const updatedSavingsCell = bankRow.querySelector('td:last-child');
      expect(updatedSavingsCell).toHaveTextContent('₹1,953.60');
    });
  });
});
