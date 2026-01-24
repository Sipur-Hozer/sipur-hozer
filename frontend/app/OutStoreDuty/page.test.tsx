import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OutsideRolesPage from './page';

// --- MOCKS ---

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../config', () => ({
  API_BASE_URL: 'http://mock-api',
}));

describe('OutsideRolesPage (OutStoreDuty)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // --- RENDERING ---

  test('renders dropdown, disabled camera button, and disabled submit button', () => {
    render(<OutsideRolesPage />);

    expect(screen.getByText('בחר תפקיד (שטח)')).toBeInTheDocument();
    
    // Check Camera Button (Should be disabled)
    const cameraBtn = screen.getByText('הוסף תמונה').closest('button');
    expect(cameraBtn).toBeDisabled();

    // Check Submit Button (Should be disabled initially)
    const submitBtn = screen.getByText('אישור והמשך');
    expect(submitBtn).toBeDisabled();
  });

  // --- INTERACTION ---

  test('Enables submit button when a standard role is selected', () => {
    render(<OutsideRolesPage />);

    // Select "Train Agent" (סוכן רכבת)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'סוכן רכבת' } });

    // Button should enable
    expect(screen.getByText('אישור והמשך')).not.toBeDisabled();
  });

  test('Shows custom input when "Other" is selected', () => {
    render(<OutsideRolesPage />);

    // Select "Other"
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'other' } });

    // Check Input Appears
    const customInput = screen.getByPlaceholderText('כתוב כאן...');
    expect(customInput).toBeInTheDocument();

    // Button should be disabled until typed
    const submitBtn = screen.getByText('אישור והמשך');
    expect(submitBtn).toBeDisabled();

    // Type in custom role
    fireEvent.change(customInput, { target: { value: 'My Custom Job' } });
    expect(submitBtn).not.toBeDisabled();
  });

  // --- SUBMISSION ---

  test('Submits correct data for standard role', async () => {
    // Mock Success
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<OutsideRolesPage />);

    // Select Role
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'יריד' } });
    
    // Click Submit
    fireEvent.click(screen.getByText('אישור והמשך'));

    // Verify API Payload
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-api/end-shift-outside',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            role: 'יריד',
            extra: 'דיווח מהשטח', // Important check for this page
          }),
        })
      );
    });

    // Verify Success Modal
    await waitFor(() => {
      expect(screen.getByText('הדיווח התקבל')).toBeInTheDocument();
    });

    // Close Modal -> Navigate
    fireEvent.click(screen.getByText('מעולה, תודה!'));
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });

  test('Submits correct data for custom role', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<OutsideRolesPage />);

    // Setup Custom Role
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'other' } });
    fireEvent.change(screen.getByPlaceholderText('כתוב כאן...'), { target: { value: 'Super Agent' } });

    fireEvent.click(screen.getByText('אישור והמשך'));

    // Verify Payload uses the custom text
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({
            role: 'Super Agent',
            extra: 'דיווח מהשטח',
          }),
        })
      );
    });
  });

  // --- ERROR HANDLING ---

  test('Shows error modal on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Database Error' }),
    });

    render(<OutsideRolesPage />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'סוכן עמדה' } });
    fireEvent.click(screen.getByText('אישור והמשך'));

    // Check Error Modal
    await waitFor(() => {
      expect(screen.getByText('שגיאה')).toBeInTheDocument();
      expect(screen.getByText('Database Error')).toBeInTheDocument();
    });

    // Close -> No Navigation
    fireEvent.click(screen.getByText('הבנתי, סגור'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- NAVIGATION ---

  test('Back button navigates to Browser', () => {
    render(<OutsideRolesPage />);
    fireEvent.click(screen.getByText('חזרה'));
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });
});