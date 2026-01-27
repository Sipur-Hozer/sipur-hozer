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

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();
window.alert = jest.fn();

describe('ManagerPage', () => {
  beforeEach(() => {
    // IMPORTANT: Restore all mocks to original state before each test
    jest.restoreAllMocks();
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

  // --- DOWNLOAD TESTS (New Strategy) ---

  test('handles "Export Shifts" successfully', async () => {
    // 1. Mock the API Response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-excel-data'], { type: 'application/xlsx' }),
    });

    // 2. Spy on the 'click' method of ALL anchor elements.
    // We provide an empty implementation to prevent JSDOM from trying to actually navigate/download.
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<ManagerPage />);
    
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות'));

    await waitFor(() => {
      // Use API_BASE_URL variable here
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/export-shifts`, 
        expect.objectContaining({ method: 'GET' })
      );
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  test('handles "Export Users" successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-user-data']),
    });

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<ManagerPage />);
    
    fireEvent.click(screen.getByText('דוח סיכום משתמשים'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/export-users`, 
        expect.anything()
      );
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  test('shows alert on download failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    
    render(<ManagerPage />);
    fireEvent.click(screen.getByText('הנפקת קובץ משמרות'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('שגיאה'));
    });
  });
});