import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocationSelectPage from './page';

// 1. MOCK: Next.js 'useRouter'
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LocationSelectPage', () => {
  // Reset the count before every test
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the title and buttons', () => {
    render(<LocationSelectPage />);

    // Check for the main title
    expect(screen.getByText('איפה אתה עובד היום?')).toBeInTheDocument();

    // Check for the specific button text
    expect(screen.getByText('בתוך החנות')).toBeInTheDocument();
    expect(screen.getByText('מחוץ לחנות')).toBeInTheDocument();
  });

  it('navigates to /InStoreDuty when "Inside Store" is clicked', () => {
    render(<LocationSelectPage />);

    // Find the "Inside Store" button by its text
    const insideButton = screen.getByText('בתוך החנות').closest('button');
    
    // Simulate Click
    fireEvent.click(insideButton!);

    // Verify router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/InStoreDuty');
  });

  it('navigates to /OutStoreDuty when "Outside Store" is clicked', () => {
    render(<LocationSelectPage />);

    const outsideButton = screen.getByText('מחוץ לחנות').closest('button');
    
    fireEvent.click(outsideButton!);

    expect(mockPush).toHaveBeenCalledWith('/OutStoreDuty');
  });
});