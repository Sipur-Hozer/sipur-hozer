import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocationSelectPage from './page';

// --- MOCKS ---

// Mock Next.js Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LocationSelectPage (Exit Page)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- RENDERING ---

  test('renders the title and all navigation buttons', () => {
    render(<LocationSelectPage />);

    // Check Title
    expect(screen.getByText('איפה אתה עובד היום?')).toBeInTheDocument();

    // Check Main Options
    expect(screen.getByText('בתוך החנות')).toBeInTheDocument();
    expect(screen.getByText('מחוץ לחנות')).toBeInTheDocument();
    
    // Check Back Button
    expect(screen.getByText('חזרה')).toBeInTheDocument();
  });

  // --- NAVIGATION ---

  test('navigates to /InStoreDuty when clicking "Inside Store"', () => {
    render(<LocationSelectPage />);

    // Click "Inside Store" (בתוך החנות)
    const insideBtn = screen.getByText('בתוך החנות');
    fireEvent.click(insideBtn);

    expect(mockPush).toHaveBeenCalledWith('/InStoreDuty');
  });

  test('navigates to /OutStoreDuty when clicking "Outside Store"', () => {
    render(<LocationSelectPage />);

    // Click "Outside Store" (מחוץ לחנות)
    const outsideBtn = screen.getByText('מחוץ לחנות');
    fireEvent.click(outsideBtn);

    expect(mockPush).toHaveBeenCalledWith('/OutStoreDuty');
  });

  test('navigates to /Browser when clicking Back', () => {
    render(<LocationSelectPage />);

    // Click "Back" (חזרה)
    const backBtn = screen.getByText('חזרה');
    fireEvent.click(backBtn);

    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });
});