import React from 'react';
import { render, screen } from '@testing-library/react';

// Standard mock for next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => {
    return <a href={href} className={className}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

import { StatCard, MiniStatCard, OverviewCard } from '@/components/StatCards';
import { Activity } from 'lucide-react';
import '@testing-library/jest-dom';

describe('StatCard Components', () => {
  describe('MiniStatCard', () => {
    it('renders label and value', () => {
      render(
        <MiniStatCard 
          icon={<Activity data-testid="icon" />} 
          label="Sleep" 
          value="8h" 
        />
      );
      expect(screen.getByText('Sleep')).toBeInTheDocument();
      expect(screen.getByText('8h')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('StatCard', () => {
    it('renders label and value with large text', () => {
      render(
        <StatCard 
          icon={<Activity data-testid="icon" />} 
          label="Total Photos" 
          value={42} 
        />
      );
      expect(screen.getByText('Total Photos')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('OverviewCard', () => {
    const defaultProps = {
      title: 'Body Health',
      description: 'Track your physical progress',
      icon: <Activity />,
      gradient: 'from-blue-500 to-blue-600',
      href: '/body',
      metrics: [
        { label: 'Weight', value: '180 lbs' },
        { label: 'Workouts', value: '15' }
      ]
    };

    it('renders title, description and metrics', () => {
      const CustomLink = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
        <a href={href} className={className}>{children}</a>
      );
      render(<OverviewCard {...defaultProps} LinkComponent={CustomLink} />);
      
      expect(screen.getByText('Body Health')).toBeInTheDocument();
      expect(screen.getByText('Track your physical progress')).toBeInTheDocument();
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('180 lbs')).toBeInTheDocument();
      expect(screen.getByText('Workouts')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('links to the correct href', () => {
      const CustomLink = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
        <a href={href} className={className}>{children}</a>
      );
      render(<OverviewCard {...defaultProps} LinkComponent={CustomLink} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/body');
    });
  });
});
