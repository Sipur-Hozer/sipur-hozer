import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagerPage from './page';

// --- 1. MOCKS לקונפיגורציה ולספריות חיצוניות ---

// קריטי: Mock לקובץ הקונפיג כדי למנוע שגיאות אימפורט
jest.mock('../config', () => ({
  API_BASE_URL: 'http://mock-api.com',
}));

// Mock ל-Next.js Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock לאייקונים כדי שלא יפריעו לרינדור
jest.mock('lucide-react', () => ({
  UserPlus: () => <div data-testid="icon-user-plus" />,
  CalendarDays: () => <div data-testid="icon-calendar" />,
  Calculator: () => <div data-testid="icon-calculator" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
}));

describe('ManagerPage', () => {
  // משתנה שיחזיק את הקישור שנוצר בזמן הריצה
  let mockLinkSpy: { click: jest.Mock; download?: string; href?: string };

  beforeAll(() => {
    // הגדרת פונקציות URL שלא קיימות בסביבת הטסט
    // אנו מגדירים אותן גם על window וגם גלובלית ליתר ביטחון
    const mockCreateObjectUrl = jest.fn(() => 'mock-blob-url');
    const mockRevokeObjectUrl = jest.fn();

    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectUrl,
        revokeObjectURL: mockRevokeObjectUrl,
      },
      writable: true,
    });
    
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    // --- הטריק המתוקן ל-Download ---
    // במקום ליצור אובייקט סתמי, אנחנו נותנים לדפדפן ליצור אלמנט אמיתי,
    // ורק אז "מתלבשים" עליו עם Spy.
    const originalCreateElement = document.createElement.bind(document);
    
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      // 1. צור את האלמנט האמיתי
      const element = originalCreateElement(tagName);
      
      // 2. אם זה אלמנט 'a', שים מעקב על פונקציית הקליק שלו
      if (tagName === 'a') {
        jest.spyOn(element, 'click');
        // נשמור אותו בצד כדי שנוכל לבדוק אותו בטסט
        mockLinkSpy = element as any; 
      }
      return element;
    });
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

  test('handles "Export Shifts" download successfully', async () => {
    // הכנת תשובה חיובית מהשרת
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-excel'], { type: 'application/xlsx' }),
    });

    render(<ManagerPage />);
    
    // לחיצה
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות'));

    await waitFor(() => {
      // 1. וידוא הקריאה לשרת
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('export-shifts'),
        expect.objectContaining({ method: 'GET' })
      );

      // 2. וידוא שהקוד לחץ על הלינק
      // (בגלל שהשתמשנו באלמנט אמיתי, הבדיקה הזו אמינה עכשיו)
      expect(mockLinkSpy.click).toHaveBeenCalled();
      
      // 3. וידוא שם הקובץ (מכיל את המילה דוח או משמרות)
      expect((mockLinkSpy as any).download).toMatch(/משמרות/);
    });
  });

  test('handles "Users Report" download successfully', async () => {
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
      expect(mockLinkSpy.click).toHaveBeenCalled();
    });
  });

  test('handles Logout successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    render(<ManagerPage />);
    
    // חיפוש הכפתור לפי הטקסט "התנתק"
    const logoutBtn = screen.getByText('התנתק');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      // כאן הכתובת היא קבועה בקוד שלך, אז נבדוק מולה או שנבדוק חלק מהמחרוזת
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('logout'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('shows alert on download failure', async () => {
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