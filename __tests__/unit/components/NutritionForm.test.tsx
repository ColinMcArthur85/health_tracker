/**
 * @file NutritionForm.test.tsx
 * @description Tests for NutritionForm component
 * 
 * BDD Scenarios:
 * - Given the form is in "quick" mode, When user submits, Then send meal description
 * - Given the form is in "macros" mode, When user submits, Then send calories and protein
 * - Given the form is submitting, When loading, Then show loading state and disable button
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

import NutritionForm from '@/components/forms/NutritionForm';

describe('NutritionForm Component', () => {
  const defaultProps = {
    date: '2026-01-06',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  describe('Mode Selection', () => {
    it('should default to "quick" mode', () => {
      render(<NutritionForm {...defaultProps} />);
      
      const quickButton = screen.getByRole('button', { name: /quick add/i });
      expect(quickButton).toHaveClass('bg-emerald-600');
    });

    it('should switch to "macros" mode when macros button is clicked', async () => {
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      const macrosButton = screen.getByRole('button', { name: /macros/i });
      await user.click(macrosButton);
      
      expect(macrosButton).toHaveClass('bg-emerald-600');
      expect(screen.getByRole('button', { name: /quick add/i })).toHaveClass('bg-slate-800');
    });

    it('should show text input in quick mode', () => {
      render(<NutritionForm {...defaultProps} />);
      
      expect(screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i)).toBeInTheDocument();
    });

    it('should show calories and protein inputs in macros mode', async () => {
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /macros/i }));
      
      // Use getByRole for number inputs (spinbutton)
      const numberInputs = screen.getAllByRole('spinbutton');
      expect(numberInputs).toHaveLength(2);
      expect(screen.getByText(/calories/i)).toBeInTheDocument();
      expect(screen.getByText(/protein/i)).toBeInTheDocument();
    });
  });

  describe('Quick Mode Submission', () => {
    it('should submit meal description in quick mode', async () => {
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i);
      await user.type(textarea, 'Chicken salad with avocado');
      
      const submitButton = screen.getByRole('button', { name: /save nutrition/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/log/nutrition', {
          method: 'POST',
          body: expect.stringContaining('Chicken salad with avocado'),
        });
      });
    });

    it('should include date and mode in submission', async () => {
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i);
      await user.type(textarea, 'Test meal');
      
      await user.click(screen.getByRole('button', { name: /save nutrition/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/log/nutrition', {
          method: 'POST',
          body: expect.stringContaining('"date":"2026-01-06"'),
        });
      });
    });
  });

  describe('Macros Mode Submission', () => {
    it('should submit calories and protein in macros mode', async () => {
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      // Switch to macros mode
      await user.click(screen.getByRole('button', { name: /macros/i }));
      
      // Fill in macros using spinbutton inputs
      const numberInputs = screen.getAllByRole('spinbutton');
      const caloriesInput = numberInputs[0];
      const proteinInput = numberInputs[1];
      
      await user.type(caloriesInput, '500');
      await user.type(proteinInput, '30');
      
      await user.click(screen.getByRole('button', { name: /save nutrition/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/log/nutrition', {
          method: 'POST',
          body: expect.stringContaining('"mode":"macros"'),
        });
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text while submitting', async () => {
      // Make fetch hang indefinitely for this test
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i);
      await user.type(textarea, 'Test meal');
      
      await user.click(screen.getByRole('button', { name: /save nutrition/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i);
      await user.type(textarea, 'Test meal');
      
      await user.click(screen.getByRole('button', { name: /save nutrition/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
      });
    });
  });

  describe('Success Callback', () => {
    it('should call onClose after successful submission', async () => {
      const user = userEvent.setup();
      const onCloseMock = jest.fn();
      render(<NutritionForm date="2026-01-06" onClose={onCloseMock} />);
      
      const textarea = screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i);
      await user.type(textarea, 'Test meal');
      
      await user.click(screen.getByRole('button', { name: /save nutrition/i }));
      
      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalled();
      });
    });

    it('should refresh the router after successful submission', async () => {
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i);
      await user.type(textarea, 'Test meal');
      
      await user.click(screen.getByRole('button', { name: /save nutrition/i }));
      
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      const user = userEvent.setup();
      render(<NutritionForm {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText(/e\.g\. 2 eggs and toast/i);
      await user.type(textarea, 'Test meal');
      
      await user.click(screen.getByRole('button', { name: /save nutrition/i }));
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });
      
      // Form should recover from error state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save nutrition/i })).not.toBeDisabled();
      });
      
      consoleError.mockRestore();
    });
  });
});
