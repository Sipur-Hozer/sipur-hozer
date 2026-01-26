import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminSchedulePage from './page';
import { API_BASE_URL } from '../config'; // CORRECTED PATH

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock Data
const mockUsers = [{ ID: 1, fullName: 'Yossi Cohen', phone: '0501111111' }, { ID: 2, fullName: 'Dana Levy', phone: '0502222222' }];
const mockShifts = [{ ID: 101, userId: 1, day: 'ראשון', startHour: '08:00', endHour: '16:00' }];

describe('AdminSchedulePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn((url, options) => {
      const u = url.toString();
      const method = options?.method || 'GET';

      if (u === `${API_BASE_URL}/users` && method === 'GET') {
        return Promise.resolve({ ok: true, json: async () => mockUsers });
      }

      if (u === `${API_BASE_URL}/admin/schedule` && method === 'GET') {
        return Promise.resolve({ ok: true, json: async () => mockShifts });
      }

      if (u === `${API_BASE_URL}/admin/schedule` && method === 'POST') {
        return Promise.resolve({ ok: true, json: async () => ({ message: 'Created' }) });
      }

      if (u.startsWith(`${API_BASE_URL}/admin/schedule/`) && method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }

      console.log(`[TEST MOCK FAIL] Unhandled Request: ${method} ${u}`);
      return Promise.reject(new Error(`Unknown API Call: ${method} ${u}`));
    }) as jest.Mock;
  });

  test('renders page and loads data', async () => {
    render(<AdminSchedulePage />);
    await waitFor(() => expect(screen.queryByText('טוען נתונים...')).not.toBeInTheDocument());
    expect(screen.getByText('Yossi Cohen')).toBeInTheDocument();
  });

  test('successfully adds a new shift', async () => {
    render(<AdminSchedulePage />);
    await waitFor(() => expect(screen.queryByText('טוען נתונים...')).not.toBeInTheDocument());

    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: '2' } });
    fireEvent.change(dropdowns[1], { target: { value: 'שני' } });

    // eslint-disable-next-line testing-library/no-node-access
    const container = screen.getByText('הוספת משמרת חדשה').closest('div');
    // eslint-disable-next-line testing-library/no-node-access
    const timeInputs = container?.querySelectorAll('input[type="time"]');
    
    if (timeInputs && timeInputs.length >= 2) {
        fireEvent.change(timeInputs[0], { target: { value: '09:00' } });
        fireEvent.change(timeInputs[1], { target: { value: '17:00' } });
    }

    fireEvent.click(screen.getByText('שבץ משמרת'));

    await waitFor(() => {
      expect(screen.getByText('המשמרת שובצה בהצלחה')).toBeInTheDocument();
    });
  });

  test('successfully deletes a shift', async () => {
    render(<AdminSchedulePage />);
    await waitFor(() => expect(screen.queryByText('טוען נתונים...')).not.toBeInTheDocument());
    expect(await screen.findByText('Yossi Cohen')).toBeInTheDocument(); 

    const deleteBtn = screen.getByTitle('מחק משמרת');
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(screen.getByText('?האם אתה בטוח שברצונך למחוק משמרת זו')).toBeInTheDocument());
    fireEvent.click(screen.getByText('כן, מחק'));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            `${API_BASE_URL}/admin/schedule/101`,
            expect.objectContaining({ method: 'DELETE' })
        );
    });
  });
});