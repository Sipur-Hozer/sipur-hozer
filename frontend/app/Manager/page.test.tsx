import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagerPage from './page';
import { API_BASE_URL } from '../config'; // CORRECTED PATH

// --- MOCKS ---

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Lucide React icons to avoid rendering issues
jest.mock('lucide-react', () => ({
  UserPlus: () => <div data-testid="icon-user-plus" />,
  CalendarDays: () => <div data-testid="icon-calendar" />,
  Calculator: () => <div data-testid="icon-calculator" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
  UserMinus: () => <div data-testid="icon-user-minus" />, // Added purely in case logout uses it
}));

describe('ManagerPage', () => {
  
  // Setup global mocks properly before tests run
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    window.alert = jest.fn();
  });

  beforeEach(() => {
    // Only clear usage data, don't restore implementations aggressively
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('renders the dashboard options', () => {
    render(<ManagerPage />);
    expect(screen.getByText('פאנל ניהול')).toBeInTheDocument();
    expect(screen.getByText('יצירת משתמשים')).toBeInTheDocument();
  });

  test('navigates to AddUserPage', () => {
    render(<ManagerPage />);
    fireEvent.click(screen.getByText('יצירת משתמשים'));
    expect(mockPush).toHaveBeenCalledWith('/AddUserPage');
  });

  // --- DOWNLOAD TESTS (Improved Strategy) ---

  test('handles "Export Shifts" successfully', async () => {
    // 1. Mock Fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-excel-data'], { type: 'application/xlsx' }),
    });

    // 2. Mock document.createElement to catch the link creation
    const mockLink = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') return mockLink as any;
        return document.createElement(tagName); // Default behavior for other tags
    });
    
    // 3. Mock appendChild to avoid DOM errors
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    render(<ManagerPage />);
    
    // 4. Trigger
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות'));

    await waitFor(() => {
      // Verify Fetch
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('export-shifts'),
        expect.objectContaining({ method: 'GET' }) // More strict check
      );
      
      // Verify Link Click - This is the key fix!
      expect(mockLink.click).toHaveBeenCalled();
      
      // Verify URL creation
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    // Cleanup spies for this test
    createElementSpy.mockRestore();
  });

  test('handles "Export Users" successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-user-data']),
    });

    const mockLink = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') return mockLink as any;
        return document.createElement(tagName);
    });
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    render(<ManagerPage />);
    
    fireEvent.click(screen.getByText('דוח סיכום משתמשים'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/export-users`, 
        expect.anything()
      );
      expect(mockLink.click).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
  });

  test('shows alert on download failure', async () => {
    // Mock a failed response
    (global.fetch as jest.Mock).mockResolvedValue({ 
        ok: false,
        json: async () => ({ error: 'Simulated Server Error' }), // Ensure .json() exists for error parsing
        status: 500
    });
    
    render(<ManagerPage />);
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות')); // Or 'דוח סיכום משתמשים' if testing that one

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('שגיאה'));
    });
  });
});