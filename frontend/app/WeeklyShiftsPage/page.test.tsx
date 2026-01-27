import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminSchedulePage from './page';

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
      const m = options?.method || 'GET';
      if (u.includes('/users')) return Promise.resolve({ ok: true, json: async () => mockUsers });
      if (u.includes('/admin/schedule') && m === 'GET') return Promise.resolve({ ok: true, json: async () => mockShifts });
      if (u.includes('/admin/schedule') && m === 'POST') return Promise.resolve({ ok: true, json: async () => ({}) });
      if (u.includes('/admin/schedule/') && m === 'DELETE') return Promise.resolve({ ok: true });
      return Promise.reject(new Error('Unknown'));
    }) as jest.Mock;
  });

  test('renders page and loads data', async () => {
    render(<AdminSchedulePage />);
    
    // Wait for the loading state to disappear
    await waitFor(() => expect(screen.queryByText('טוען נתונים...')).not.toBeInTheDocument());

    // Check table content
    // Use 'getAllByText' because 'ראשון' appears in the dropdown AND the table
    // We check that at least one instance exists in the document
    const dayElements = screen.getAllByText('ראשון');
    expect(dayElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Yossi Cohen')).toBeInTheDocument();
  });

  test('successfully adds a new shift', async () => {
    render(<AdminSchedulePage />);
    await waitFor(() => expect(screen.queryByText('טוען נתונים...')).not.toBeInTheDocument());

    // FIX: Select dropdowns by index because the labels aren't strictly associated via ID
    const dropdowns = screen.getAllByRole('combobox');
    const userSelect = dropdowns[0]; 
    const daySelect = dropdowns[1];

    fireEvent.change(userSelect, { target: { value: '2' } });
    fireEvent.change(daySelect, { target: { value: 'שני' } });

    // FIX: Select Time Inputs manually (they are just <input type="time">)
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

    const deleteBtn = screen.getByTitle('מחק משמרת');
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(screen.getByText('?האם אתה בטוח שברצונך למחוק משמרת זו')).toBeInTheDocument());
    fireEvent.click(screen.getByText('כן, מחק'));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/admin/schedule/101'),
            expect.objectContaining({ method: 'DELETE' })
        );
    });
  });
});