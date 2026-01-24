import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExistingShiftsPage from './page';

// --- MOCKS ---

// 1. Mock Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Mock Config
jest.mock('../config', () => ({
  API_BASE_URL: 'http://mock-api',
}));

describe('ExistingShiftsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // --- LOADING STATE ---

  test('Shows loading state initially', () => {
    // Return a promise that never resolves immediately to keep it in loading state
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<ExistingShiftsPage />);

    expect(screen.getByText('טוען משמרות...')).toBeInTheDocument();
  });

  // --- SUCCESS STATE (With Shifts) ---

  test('Renders a list of shifts successfully', async () => {
    const mockShifts = [
      { ID: 1, userId: 101, day: 'ראשון', startHour: '08:00', endHour: '16:00' },
      { ID: 2, userId: 101, day: 'שני', startHour: '10:00', endHour: '18:00' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockShifts,
    });

    render(<ExistingShiftsPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('יום ראשון')).toBeInTheDocument();
      expect(screen.getByText('08:00 - 16:00')).toBeInTheDocument();
      
      expect(screen.getByText('יום שני')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 18:00')).toBeInTheDocument();
    });

    // Check Header
    expect(screen.getByText('המשמרות שלי')).toBeInTheDocument();
  });

  // --- EMPTY STATE ---

  test('Shows empty state message when no shifts exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [], // Empty Array
    });

    render(<ExistingShiftsPage />);

    await waitFor(() => {
      expect(screen.getByText('אין משמרות משובצות.')).toBeInTheDocument();
    });
  });

  // --- UNAUTHORIZED (401) ---

  test('Redirects to login page if unauthorized (401)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401, // Unauthorized
      json: async () => ({ error: 'Unauthorized' }),
    });

    render(<ExistingShiftsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/'); // Should redirect to Home/Login
    });
  });

  // --- NAVIGATION ---

  test('Back button navigates to Browser menu', async () => {
    // Mock successful empty fetch just to render the page cleanly
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<ExistingShiftsPage />);

    // Wait for loading to finish
    await waitFor(() => screen.getByText('המשמרות שלי'));

    const backButton = screen.getByText('חזרה לתפריט');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });
});