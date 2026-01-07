/**
 * @file MetricCard.test.tsx
 * @description Tests for the MetricCard component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from '@/components/dashboard/MetricCard';
import { Activity } from 'lucide-react';
import '@testing-library/jest-dom';

describe('MetricCard Component', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Total Weight" value="185 lbs" />);
    
    expect(screen.getByText('Total Weight')).toBeInTheDocument();
    expect(screen.getByText('185 lbs')).toBeInTheDocument();
  });

  it('renders trend value and icon when provided', () => {
    const { rerender } = render(
      <MetricCard 
        title="Calories" 
        value="2500" 
        trend="up" 
        trendValue="+10%" 
      />
    );
    
    expect(screen.getByText('+10%')).toBeInTheDocument();
    // Re-render with down trend
    rerender(
      <MetricCard 
        title="Calories" 
        value="2500" 
        trend="down" 
        trendValue="-5%" 
      />
    );
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    const icon = <Activity data-testid="custom-icon" />;
    render(<MetricCard title="Activity" value="High" icon={icon} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies correct color classes for icons', () => {
    const icon = <Activity />;
    const { container } = render(
      <MetricCard 
        title="Health" 
        value="Good" 
        icon={icon} 
        color="emerald" 
      />
    );
    
    const iconContainer = container.querySelector('.bg-gradient-to-br');
    expect(iconContainer).toHaveClass('from-emerald-500');
    expect(iconContainer).toHaveClass('to-emerald-600');
  });
});
