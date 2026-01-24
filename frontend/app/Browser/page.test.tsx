import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntermediatePage from './page';

// --- MOCKS ---

// 1. Mock Next.js Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Mock Environment Variables (API URL)
process.env.NEXT_PUBLIC_API_URL = 'http://mock-api';

describe('IntermediatePage (Browser)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(); // Reset fetch mock
  });

  // --- RENDERING TESTS ---

  test('renders all 4 main dashboard buttons', () => {
    render(<IntermediatePage />);

    expect(screen.getByText('כניסה')).toBeInTheDocument();
    expect(screen.getByText('יציאה')).toBeInTheDocument();
    expect(screen.getByText('התנתקות')).toBeInTheDocument();
    expect(screen.getByText('המשמרות שלי')).toBeInTheDocument();
  });

  // --- ENTER SHIFT TESTS ---

  test('Enter Shift: Navigates to /EnterPage if NO open shift exists', async () => {
    // Mock API: { hasOpenShift: false }
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ hasOpenShift: false }),
    });

    render(<IntermediatePage />);

    // Click "Enter" (כניסה)
    fireEvent.click(screen.getByText('כניסה'));

    await waitFor(() => {
      // 1. Check API was called
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/check-active-shift'),
        expect.anything()
      );
      // 2. Check Navigation happened
      expect(mockPush).toHaveBeenCalledWith('/EnterPage');
    });
  });

  test('Enter Shift: Shows Modal if shift is ALREADY open', async () => {
    // Mock API: { hasOpenShift: true } -> This prevents opening a new one
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ hasOpenShift: true }),
    });

    render(<IntermediatePage />);

    fireEvent.click(screen.getByText('כניסה'));

    // Wait for Modal Text
    await waitFor(() => {
      expect(screen.getByText('קיימת משמרת פתוחה במערכת. יש לבצע יציאה לפני פתיחת משמרת חדשה')).toBeInTheDocument();
    });

    // Ensure we did NOT navigate
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- EXIT SHIFT TESTS ---

  test('Exit Shift: Navigates to /ExitPage if open shift EXISTS', async () => {
    // Mock API: { hasOpenShift: true } -> Logic allows exit
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ hasOpenShift: true }),
    });

    render(<IntermediatePage />);

    // Click "Exit" (יציאה)
    fireEvent.click(screen.getByText('יציאה'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/ExitPage');
    });
  });

  test('Exit Shift: Shows Modal if NO open shift exists', async () => {
    // Mock API: { hasOpenShift: false } -> Cannot exit a shift that doesn't exist
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ hasOpenShift: false }),
    });

    render(<IntermediatePage />);

    fireEvent.click(screen.getByText('יציאה'));

    await waitFor(() => {
      expect(screen.getByText('לא נמצאה משמרת פעילה. לא ניתן לבצע יציאה')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- MODAL INTERACTION ---

  test('Modal closes when clicking the confirm button', async () => {
    // Trigger a modal first (e.g., Fail Enter Shift)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ hasOpenShift: true }),
    });

    render(<IntermediatePage />);
    fireEvent.click(screen.getByText('כניסה'));

    // Verify Modal is Open
    await waitFor(() => {
      expect(screen.getByText('שימו לב')).toBeInTheDocument();
    });

    // Click "Confirm" (אישור)
    fireEvent.click(screen.getByText('אישור'));

    // Verify Modal is Gone
    await waitFor(() => {
      expect(screen.queryByText('שימו לב')).not.toBeInTheDocument();
    });
  });
});