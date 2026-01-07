/**
 * @file EmptyState.test.tsx
 * @description Tests for the EmptyState component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '@/components/EmptyState';
import { PlusCircle } from 'lucide-react';
import '@testing-library/jest-dom';

describe('EmptyState Component', () => {
  const defaultProps = {
    icon: PlusCircle,
    title: 'No items found',
    description: 'Try adding a new item to get started.',
  };

  it('renders title and description', () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adding a new item to get started.')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const onAction = jest.fn();
    render(
      <EmptyState 
        {...defaultProps} 
        actionLabel="Add Item" 
        onAction={onAction} 
      />
    );
    
    const button = screen.getByRole('button', { name: /add item/i });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders ActionComponent if provided', () => {
    const ActionComponent = <div data-testid="custom-action">Custom Action</div>;
    render(
      <EmptyState 
        {...defaultProps} 
        ActionComponent={ActionComponent} 
      />
    );
    
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('does not render button if onAction is missing', () => {
    render(
      <EmptyState 
        {...defaultProps} 
        actionLabel="Add Item" 
      />
    );
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
