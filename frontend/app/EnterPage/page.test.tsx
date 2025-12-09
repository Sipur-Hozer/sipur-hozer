import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnterPage from './page';

// 1. MOCK: Next.js 'useRouter'
// Since we are not running in a real browser, we have to fake the router
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack, // Whenever router.back() is called, run our fake function
  }),
}));

describe('EnterPage Component', () => {
  
  // Clean up the fake function before each test so counts start at 0
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('renders the success message correctly', () => {
    render(<EnterPage />);

    // Check if the main heading exists
    expect(screen.getByText('הפעולה בוצעה בהצלחה')).toBeInTheDocument();

    // Check if the instruction text exists
    expect(screen.getByText(/לחץ על "אישור" כדי לחזור לדף הקודם/i)).toBeInTheDocument();
  });

  it('renders the "Confirm" button', () => {
    render(<EnterPage />);
    
    // Check if the button exists
    const button = screen.getByRole('button', { name: /אישור/i });
    expect(button).toBeInTheDocument();
  });

  it('navigates back when the button is clicked', () => {
    render(<EnterPage />);

    // Find the button
    const button = screen.getByRole('button', { name: /אישור/i });

    // Simulate a user click
    fireEvent.click(button);

    // Verify that router.back() was actually called exactly once
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});