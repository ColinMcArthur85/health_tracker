/**
 * @file WorkoutList.test.tsx
 * @description Tests for WorkoutList component
 * 
 * BDD Scenarios:
 * - Given an empty workout list, When rendered, Then show empty state message
 * - Given a list of workouts, When rendered, Then display all workout items
 * - Given a workout with full details, When rendered, Then show type, duration, intensity, notes
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock the modal components
jest.mock('@/components/EditWorkoutModal', () => {
  return function MockEditWorkoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
      <div data-testid="edit-modal">
        <button onClick={onClose}>Close Edit</button>
      </div>
    );
  };
});

jest.mock('@/components/DeleteConfirmModal', () => {
  return function MockDeleteConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isDeleting 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void;
    isDeleting: boolean;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-modal">
        <button onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  };
});

import WorkoutList from '@/components/WorkoutList';

describe('WorkoutList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Empty State', () => {
    it('should display empty message when workouts array is empty', () => {
      render(<WorkoutList workouts={[]} />);
      expect(screen.getByText('No workouts yet.')).toBeInTheDocument();
    });

    it('should display empty message when workouts is undefined-like', () => {
      render(<WorkoutList workouts={[]} />);
      expect(screen.getByText('No workouts yet.')).toBeInTheDocument();
    });
  });

  describe('Workout Display', () => {
    const mockWorkouts = [
      {
        id: 'workout-1',
        type: 'Strength Training',
        duration: 45,
        intensity: 'High',
        notes: 'Legs day',
        name: 'Morning Session',
      },
      {
        id: 'workout-2',
        type: 'Cardio',
        duration: 30,
        intensity: 'Moderate',
        notes: null,
        name: null,
      },
    ];

    it('should render all workouts in the list', () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      expect(screen.getByText('Strength Training')).toBeInTheDocument();
      expect(screen.getByText('Cardio')).toBeInTheDocument();
    });

    it('should display workout type and name', () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      expect(screen.getByText('Strength Training')).toBeInTheDocument();
      expect(screen.getByText('• Morning Session')).toBeInTheDocument();
    });

    it('should display duration and intensity', () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      expect(screen.getByText('45 mins • High')).toBeInTheDocument();
      expect(screen.getByText('30 mins • Moderate')).toBeInTheDocument();
    });

    it('should display notes when present', () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      expect(screen.getByText('Legs day')).toBeInTheDocument();
    });

    it('should handle workout with minimal data', () => {
      const minimalWorkout = [{ id: 'minimal-1' }];
      render(<WorkoutList workouts={minimalWorkout} />);
      
      // Should show default "Workout" text when type is missing
      expect(screen.getByText('Workout')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    const mockWorkouts = [
      {
        id: 'workout-1',
        type: 'Yoga',
        duration: 60,
        intensity: 'Low',
      },
    ];

    it('should open edit modal when edit button is clicked', async () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      const editButton = screen.getByTitle('Edit workout');
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      });
    });

    it('should close edit modal when close is triggered', async () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      // Open modal
      fireEvent.click(screen.getByTitle('Edit workout'));
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      
      // Close modal
      fireEvent.click(screen.getByText('Close Edit'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    const mockWorkouts = [
      {
        id: 'workout-1',
        type: 'HIIT',
        duration: 20,
        intensity: 'Very High',
      },
    ];

    it('should open delete confirmation modal when delete button is clicked', async () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      const deleteButton = screen.getByTitle('Delete workout');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      });
    });

    it('should call API and refresh when delete is confirmed', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      
      render(<WorkoutList workouts={mockWorkouts} />);
      
      // Open delete modal
      fireEvent.click(screen.getByTitle('Delete workout'));
      
      // Confirm delete
      fireEvent.click(screen.getByText('Confirm Delete'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/log/workout/workout-1', {
          method: 'DELETE',
        });
      });
      
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should close delete modal when cancel is clicked', async () => {
      render(<WorkoutList workouts={mockWorkouts} />);
      
      // Open modal
      fireEvent.click(screen.getByTitle('Delete workout'));
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      
      // Cancel
      fireEvent.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
      });
    });
  });
});
