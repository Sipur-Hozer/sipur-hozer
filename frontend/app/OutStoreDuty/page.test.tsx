import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OutsideRolesPage from './page';
import { API_BASE_URL } from '../config'; // CORRECTED PATH

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('OutsideRolesPage (OutStoreDuty)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('renders dropdown, disabled camera button, and disabled submit button', () => {
    render(<OutsideRolesPage />);
    expect(screen.getByText('בחר תפקיד (שטח)')).toBeInTheDocument();
    
    const cameraBtn = screen.getByText('הוסף תמונה').closest('button');
    expect(cameraBtn).toBeDisabled();

    const submitBtn = screen.getByText('אישור והמשך');
    expect(submitBtn).toBeDisabled();
  });

  test('Enables submit button when a standard role is selected', () => {
    render(<OutsideRolesPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'סוכן רכבת' } });
    expect(screen.getByText('אישור והמשך')).not.toBeDisabled();
  });

  test('Shows custom input when "Other" is selected', () => {
    render(<OutsideRolesPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'other' } });
    const customInput = screen.getByPlaceholderText('כתוב כאן...');
    expect(customInput).toBeInTheDocument();
    
    const submitBtn = screen.getByText('אישור והמשך');
    expect(submitBtn).toBeDisabled();

    fireEvent.change(customInput, { target: { value: 'My Custom Job' } });
    expect(submitBtn).not.toBeDisabled();
  });

  test('Submits correct data for standard role', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<OutsideRolesPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'יריד' } });
    fireEvent.click(screen.getByText('אישור והמשך'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/end-shift-outside`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            role: 'יריד',
            extra: 'דיווח מהשטח',
          }),
        })
      );
    });

    expect(await screen.findByText('הדיווח התקבל')).toBeInTheDocument();
    fireEvent.click(screen.getByText('מעולה, תודה!'));
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });

  test('Submits correct data for custom role', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<OutsideRolesPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'other' } });
    fireEvent.change(screen.getByPlaceholderText('כתוב כאן...'), { target: { value: 'Super Agent' } });
    fireEvent.click(screen.getByText('אישור והמשך'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/end-shift-outside`,
        expect.anything()
      );
    });
  });

  test('Shows error modal on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Database Error' }),
    });

    render(<OutsideRolesPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'סוכן עמדה' } });
    fireEvent.click(screen.getByText('אישור והמשך'));

    expect(await screen.findByText('Database Error')).toBeInTheDocument();
    fireEvent.click(screen.getByText('הבנתי, סגור'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('Back button navigates to Browser', () => {
    render(<OutsideRolesPage />);
    fireEvent.click(screen.getByText('חזרה'));
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });
});