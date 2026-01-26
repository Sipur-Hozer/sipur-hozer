import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagerPage from './page';

// --- 1. MOCKS (זיופים) ---

// זיוף קובץ הקונפיגורציה
jest.mock('../config', () => ({
  API_BASE_URL: 'http://mock-api.com',
}));

// זיוף ה-Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// זיוף האייקונים (למניעת שגיאות רינדור)
jest.mock('lucide-react', () => ({
  UserPlus: () => <div data-testid="icon-user-plus" />,
  CalendarDays: () => <div data-testid="icon-calendar" />,
  Calculator: () => <div data-testid="icon-calculator" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
}));

describe('ManagerPage', () => {
  const mockCreateObjectURL = jest.fn(() => 'mock-url');
  const mockRevokeObjectURL = jest.fn();

  beforeAll(() => {
    // הגדרת פונקציות גלובליות שלא קיימות בטסטים
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // --- הבדיקות ---

  test('renders dashboard options correctly', () => {
    render(<ManagerPage />);
    expect(screen.getByText('אופציות')).toBeInTheDocument();
    expect(screen.getByText('יצירת משתמשים')).toBeInTheDocument();
  });

  test('navigates to AddUserPage', () => {
    render(<ManagerPage />);
    fireEvent.click(screen.getByText('יצירת משתמשים'));
    expect(mockPush).toHaveBeenCalledWith('/AddUserPage');
  });

  test('handles "Export Shifts" download request', async () => {
    // הכנת תשובה חיובית מהשרת
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-excel'], { type: 'application/xlsx' }),
    });

    render(<ManagerPage />);
    
    // לחיצה על הכפתור
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות'));

    await waitFor(() => {
      // בדיקה שהבקשה נשלחה לשרת לכתובת הנכונה
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('export-shifts'),
        expect.objectContaining({ method: 'GET' })
      );

      // בדיקה שהקוד המיר את התשובה ל-URL (סימן שההורדה "התחילה")
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  test('handles "Users Report" download request', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-users'], { type: 'application/xlsx' }),
    });

    render(<ManagerPage />);
    
    fireEvent.click(screen.getByText('דוח סיכום משתמשים'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('export-users'),
        expect.anything()
      );
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  test('handles Logout successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    render(<ManagerPage />);
    
    // חיפוש כפתור ההתנתקות
    const logoutBtn = screen.getByText('התנתק');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('logout'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('shows alert on download failure', async () => {
    // סימולציה של שגיאה בשרת
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Fail' }),
      status: 500,
    });

    render(<ManagerPage />);
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });
});