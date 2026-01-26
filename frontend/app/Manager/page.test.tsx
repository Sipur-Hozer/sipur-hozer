import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagerPage from './page';

// --- 1. MOCKS (זיופים) ---

// זיוף ה-Router של Next.js
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// זיוף האייקונים (כדי למנוע שגיאות רינדור)
jest.mock('lucide-react', () => ({
  UserPlus: () => <div data-testid="icon-user-plus" />,
  CalendarDays: () => <div data-testid="icon-calendar" />,
  Calculator: () => <div data-testid="icon-calculator" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
}));

// --- 2. SETUP (הגדרות גלובליות) ---

describe('ManagerPage', () => {
  // משתנה שיחזיק את ה"קישור המזויף" שיצרנו
  let mockLink: { href: string; download: string; click: jest.Mock; remove: jest.Mock };

  beforeAll(() => {
    // זיוף פונקציות של הדפדפן שלא קיימות בטסטים
    global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = jest.fn();
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // איפוס ה-Fetch לפני כל טסט
    global.fetch = jest.fn();

    // --- הטריק החשוב: זיוף יצירת אלמנטים ---
    // אנחנו תופסים את הרגע שבו הקוד עושה document.createElement('a')
    // ומחזירים לו אובייקט משלנו שאפשר לבדוק אותו
    mockLink = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return mockLink as any;
      return document.createElement(tagName);
    });
    
    // מניעת שגיאות כשמוסיפים/מסירים מה-body
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
  });

  // --- 3. TESTS (הבדיקות עצמן) ---

  test('renders the page correctly', () => {
    render(<ManagerPage />);
    // בדיקה שהכותרת קיימת
    expect(screen.getByText('אופציות')).toBeInTheDocument();
    // בדיקה שאחד הכפתורים קיים
    expect(screen.getByText('יצירת משתמשים')).toBeInTheDocument();
  });

  test('navigates to AddUserPage when clicking the button', () => {
    render(<ManagerPage />);
    const button = screen.getByText('יצירת משתמשים');
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith('/AddUserPage');
  });

  test('handles "Export Shifts" download successfully', async () => {
    // הכנת התשובה שהשרת יחזיר (הצלחה)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-excel'], { type: 'application/xlsx' }),
    });

    render(<ManagerPage />);
    
    // לחיצה על הכפתור
    const button = screen.getByText('הנפקת קובץ משמרות');
    fireEvent.click(button);

    await waitFor(() => {
      // 1. בדיקה שנשלחה בקשה לכתובת הנכונה
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('export-shifts'),
        expect.anything()
      );
      
      // 2. בדיקה שהקוד יצר את ה-URL לקובץ
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      // 3. בדיקה קריטית: האם הקוד "לחץ" על הקישור המזויף?
      expect(mockLink.click).toHaveBeenCalled();
      
      // 4. בדיקה שהוגדר שם לקובץ
      expect(mockLink.download).toContain('דו"ח_משמרות');
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
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain('סיכום_עובדים');
    });
  });

  test('handles Logout successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    render(<ManagerPage />);
    
    // יש שני כפתורי "חזרה"/"התנתק" עם טקסטים דומים, נחפש ספציפית את ההתנתקות
    // או לפי הטקסט המדויק
    const logoutBtn = screen.getByText('התנתק'); 
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      // בדיקה שנשלחה בקשה ל-logout
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('logout'),
        expect.objectContaining({ method: 'POST' })
      );
      // בדיקה שעברנו לדף הבית
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('shows alert when download fails', async () => {
    // הכנת תשובת שגיאה מהשרת
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server Error' }),
    });

    render(<ManagerPage />);
    
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });
});