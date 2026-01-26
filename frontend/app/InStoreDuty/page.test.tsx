import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsideRolesPage from './page';
import { API_BASE_URL } from '../config'; // CORRECTED PATH

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('InsideRolesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('renders and enables button on selection', () => {
    render(<InsideRolesPage />);
    const btn = screen.getByText('אישור והמשך');
    expect(btn).toBeDisabled();
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'מיון' } });
    expect(btn).not.toBeDisabled();
  });

  test('submits correct data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<InsideRolesPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'קופה' } });
    fireEvent.change(screen.getByPlaceholderText('הקלד כמות'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('הקלד כן/לא/סכום'), { target: { value: 'Yes' } });

    fireEvent.click(screen.getByText('אישור והמשך'));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            `${API_BASE_URL}/end-shift-inside`,
            expect.anything()
        );
    });

    expect(await screen.findByText('המשמרת הסתיימה')).toBeInTheDocument();
  });
});