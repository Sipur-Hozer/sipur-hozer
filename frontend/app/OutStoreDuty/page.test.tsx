import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OutsideRolesPage from './page';

// 1. MOCK: Next.js Router
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('OutsideRolesPage (OutStoreDuty)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the title and initial elements', () => {
    render(<OutsideRolesPage />);

    expect(screen.getByText('בחר תפקיד (שטח)')).toBeInTheDocument();
    expect(screen.getByText('אנא בחר תפקיד מהרשימה:')).toBeInTheDocument();
    
    // The button should be disabled initially
    const confirmButton = screen.getByRole('button', { name: /אישור והמשך/i });
    expect(confirmButton).toBeDisabled();
  });

  it('enables the button when a standard role is selected', () => {
    render(<OutsideRolesPage />);

    const select = screen.getByRole('combobox');
    const confirmButton = screen.getByRole('button', { name: /אישור והמשך/i });

    // Select "Train Agent" (one of the standard options)
    fireEvent.change(select, { target: { value: 'סוכן רכבת' } });

    // Button should now be enabled
    expect(confirmButton).toBeEnabled();
  });

  it('shows custom input when "Other" is selected', () => {
    render(<OutsideRolesPage />);

    const select = screen.getByRole('combobox');
    
    // Select "Other"
    fireEvent.change(select, { target: { value: 'other' } });

    // The input field should appear
    expect(screen.getByPlaceholderText('כתוב כאן...')).toBeInTheDocument();
  });

  it('keeps button disabled if "Other" is selected but input is empty', () => {
    render(<OutsideRolesPage />);

    const select = screen.getByRole('combobox');
    const confirmButton = screen.getByRole('button', { name: /אישור והמשך/i });

    // Select "Other"
    fireEvent.change(select, { target: { value: 'other' } });

    // Input is visible but empty -> Button should stay disabled
    expect(confirmButton).toBeDisabled();
  });

  it('navigates to /Browser when valid data is confirmed', () => {
    render(<OutsideRolesPage />);

    const select = screen.getByRole('combobox');
    const confirmButton = screen.getByRole('button', { name: /אישור והמשך/i });

    // Select a valid role
    fireEvent.change(select, { target: { value: 'יריד' } });

    // Click confirm
    fireEvent.click(confirmButton);

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });
});