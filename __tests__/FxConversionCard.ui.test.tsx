/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FxConversionCard from '../src/components/FxConversionCard';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ rate: 87.9536, timestamp: new Date().toISOString() }),
  })
) as jest.Mock;

describe('FxConversionCard UI Test', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders table with providers as rows and updates savings on rate change', async () => {
    render(<FxConversionCard />);
    
    await waitFor(() => {
      expect(screen.getByText('Karbon (zero-markup)')).toBeInTheDocument();
    });

    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    
    const rateInputs = screen.getAllByLabelText(/offered rate/i);
    const bankRateInput = rateInputs.find(input => {
        const row = input.closest('tr');
        return row && row.textContent?.includes('Bank');
    });
    
    if (!bankRateInput) {
        throw new Error("Could not find Bank's rate input");
    }

    expect(bankRateInput).toHaveValue('85.1718');
    
    await waitFor(() => {
        const savingsCells = screen.getAllByText(/₹2,781.80/);
        expect(savingsCells.length).toBeGreaterThan(0);
    });

    fireEvent.change(bankRateInput, { target: { value: '86.00' } });

    await waitFor(() => {
      const updatedSavingsCell = screen.getByText(/₹1,953.60/);
      expect(updatedSavingsCell).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('syncs USD input and clamps values', async () => {
    render(<FxConversionCard />);

    const usdInput = screen.getByLabelText('USD amount to convert');
    
    fireEvent.change(usdInput, { target: { value: '50,000' } });
    await waitFor(() => {
        expect(usdInput).toHaveValue('50,000');
    });
    
    await waitFor(async () => {
      const amountCells = await screen.findAllByText('$50,000');
      expect(amountCells.length).toBeGreaterThan(0);
    });

    fireEvent.change(usdInput, { target: { value: '50' } });
    fireEvent.blur(usdInput);
    await waitFor(() => {
      expect(usdInput).toHaveValue('100');
      expect(screen.getByText('Minimum is $100')).toBeInTheDocument();
    });
    
    fireEvent.change(usdInput, { target: { value: '120,000' } });
    await waitFor(() => {
      expect(usdInput).toHaveValue('100,000');
    });
    fireEvent.blur(usdInput);
     await waitFor(() => {
      expect(screen.getByText('Maximum is $100,000')).toBeInTheDocument();
    });
  });

  it('validates rate inputs and shows error messages', async () => {
    render(<FxConversionCard />);
    
     const rateInputs = screen.getAllByLabelText(/offered rate/i);
     const bankRateInput = rateInputs.find(input => {
        const row = input.closest('tr');
        return row && row.textContent?.includes('Bank');
    });
    
    if (!bankRateInput) throw new Error("Bank rate input not found");

    fireEvent.change(bankRateInput, { target: { value: '' } });
    fireEvent.blur(bankRateInput);
    await waitFor(() => {
      expect(screen.getByText('A valid rate is required.')).toBeInTheDocument();
    });

    fireEvent.change(bankRateInput, { target: { value: '85.5' } });
    fireEvent.blur(bankRateInput);
    await waitFor(() => {
      expect(screen.queryByText('A valid rate is required.')).not.toBeInTheDocument();
    });
  });
});
