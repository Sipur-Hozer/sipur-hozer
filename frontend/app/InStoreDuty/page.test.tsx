import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsideRolesPage from './page';

// 1. MOCK: Next.js Router
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('InsideRolesPage (InStoreDuty)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the initial state correctly', () => {
    render(<InsideRolesPage />);

    // Check titles
    expect(screen.getByText('בחר תפקיד')).toBeInTheDocument();
    
    // Check dropdown exists
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // Check button is initially disabled
    const button = screen.getByRole('button', { name: /אישור והמשך/i });
    expect(button).toBeDisabled();
  });

  it('enables button for standard roles', () => {
    render(<InsideRolesPage />);

    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /אישור והמשך/i });

    // Select "Sorting" (מיון) - a simple role with no extra inputs
    fireEvent.change(select, { target: { value: 'מיון' } });

    // Button should become enabled immediately
    expect(button).toBeEnabled();
  });

  it('shows quantity input when "Internet Orders" is selected', () => {
    render(<InsideRolesPage />);
    const select = screen.getByRole('combobox');

    // Select "Internet Orders"
    fireEvent.change(select, { target: { value: 'טיפול בהזמנות אינטרנט' } });

    // Check if the specific label appears
    expect(screen.getByText('כמות ספרים שנמכרו:')).toBeInTheDocument();
    
    // Check if the number input appears
    const numberInput = screen.getByPlaceholderText('הקלד כמות...');
    expect(numberInput).toBeInTheDocument();
  });

  it('shows both inputs when "Cashier" (קופה) is selected', () => {
    render(<InsideRolesPage />);
    const select = screen.getByRole('combobox');

    // Select "Cashier"
    fireEvent.change(select, { target: { value: 'קופה' } });

    // Check for the first input (Books Quantity)
    expect(screen.getAllByPlaceholderText('הקלד כמות ...').length).toBeGreaterThan(0);

    // Check for the second unique label "Target Commission"
    expect(screen.getByText('האם הייתה עמלת יעד')).toBeInTheDocument();
  });

  it('handles "Other" role logic correctly', () => {
    render(<InsideRolesPage />);
    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /אישור והמשך/i });

    // 1. Select "Other"
    fireEvent.change(select, { target: { value: 'other' } });

    // The custom input should appear
    const customInput = screen.getByPlaceholderText('כתוב כאן...');
    expect(customInput).toBeInTheDocument();

    // Button should STILL be disabled because input is empty
    expect(button).toBeDisabled();

    // 2. Type something in the custom input
    fireEvent.change(customInput, { target: { value: 'My Custom Role' } });

    // Now button should be enabled
    expect(button).toBeEnabled();
  });

  it('navigates to /Browser on confirm', () => {
    render(<InsideRolesPage />);
    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /אישור והמשך/i });

    // Select a valid role
    fireEvent.change(select, { target: { value: 'שירות לקוחות' } });

    // Click confirm
    fireEvent.click(button);

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/Browser');
  });
});