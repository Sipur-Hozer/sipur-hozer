import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPage from './page';

describe('AdminPage (Manager)', () => {

  it('renders the manager page container', () => {
    render(<AdminPage />);
    
    // Check if the main container exists (we can find it by the unique role or text inside)
    // Since it's a generic div, we can check for the text content first.
    expect(screen.getByText('משתמש מנהל')).toBeInTheDocument();
  });

  it('displays the correct background colors', () => {
    const { container } = render(<AdminPage />);

    // 1. Verify the main page background (BG_CREAM = #F3F6EB)
    // We look for the first div which is the main container
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveStyle('background-color: #F3F6EB');
  });

  it('renders the manager badge with correct style', () => {
    render(<AdminPage />);

    const badge = screen.getByText('משתמש מנהל');
    
    // Check if the badge exists
    expect(badge).toBeInTheDocument();

    // Verify the badge color (BRAND_GREEN = #446F41)
    expect(badge).toHaveStyle('background-color: #446F41');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-white');
  });
});