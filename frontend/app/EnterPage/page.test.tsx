import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnterPage from './page';

// --- MOCKS ---

// 1. Mock Next.js Router
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

describe('EnterPage (Start Shift)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // --- RENDERING ---

  test('renders the confirmation card and buttons', () => {
    render(<EnterPage />);

    expect(screen.getByText('אישור כניסה')).toBeInTheDocument();
    expect(screen.getByText('אם ברצונך להתחיל משמרת לחץ על אישור')).toBeInTheDocument();
    
    // Main Action Button
    expect(screen.getByRole('button', { name: 'אישור' })).toBeInTheDocument();
    
    // Back Button
    expect(screen.getByText('חזרה')).toBeInTheDocument();
  });

  // --- SUCCESS FLOW ---

  test('Starts shift successfully: API call -> Success Modal -> Redirect', async () => {
    // Mock API Success
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ time: '08:00' }),
    });

    render(<EnterPage />);

    // Click "Confirm"
    const confirmBtn = screen.getByRole('button', { name: 'אישור' });
    fireEvent.click(confirmBtn);

    // 1. Check Loading State
    expect(screen.getByText('מתחבר...')).toBeInTheDocument();

    // 2. Wait for Success Modal
    await waitFor(() => {
      expect(screen.getByText('משמרת החלה')).toBeInTheDocument();
      expect(screen.getByText('משמרת החלה בהצלחה בשעה: 08:00')).toBeInTheDocument();
    });

    // 3. Click Modal Close Button ("מעולה, תודה!")
    const closeBtn = screen.getByText('מעולה, תודה!');
    fireEvent.click(closeBtn);

    // 4. Verify Redirect to Browser
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });

  // --- ERROR FLOW (API) ---

  test('Handles API Error: API Fail -> Error Modal -> No Redirect', async () => {
    // Mock API Failure
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Shift overlap detected' }),
    });

    render(<EnterPage />);

    fireEvent.click(screen.getByRole('button', { name: 'אישור' }));

    // 1. Wait for Error Modal
    await waitFor(() => {
      expect(screen.getByText('שגיאה')).toBeInTheDocument();
      expect(screen.getByText('Shift overlap detected')).toBeInTheDocument();
    });

    // 2. Click Modal Close Button ("הבנתי, סגור")
    const closeBtn = screen.getByText('הבנתי, סגור');
    fireEvent.click(closeBtn);

    // 3. Verify Modal Closed but NO Redirect happened
    await waitFor(() => {
        expect(screen.queryByText('שגיאה')).not.toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- ERROR FLOW (NETWORK) ---

  test('Handles Network Error: Fetch Fail -> Error Modal', async () => {
    // Mock Network Crash
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network Down'));

    render(<EnterPage />);

    fireEvent.click(screen.getByRole('button', { name: 'אישור' }));

    await waitFor(() => {
      expect(screen.getByText('תקלה בתקשורת')).toBeInTheDocument();
      expect(screen.getByText('לא ניתן להתחבר לשרת, אנא בדוק את החיבור שלך')).toBeInTheDocument();
    });
  });

  // --- NAVIGATION ---

  test('Back button navigates to Browser', () => {
    render(<EnterPage />);
    
    fireEvent.click(screen.getByText('חזרה'));
    
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });
});