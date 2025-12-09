import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntermediatePage from './page';

describe('IntermediatePage (Browser Menu)', () => {

  it('renders all three navigation options', () => {
    render(<IntermediatePage />);

    // Check for the "Entrance" text
    expect(screen.getByText('כניסה')).toBeInTheDocument();
    expect(screen.getByText('כניסה למשמרת')).toBeInTheDocument();

    // Check for the "Exit" text
    expect(screen.getByText('יציאה')).toBeInTheDocument();
    expect(screen.getByText('יציאה ממשמרת')).toBeInTheDocument();

    // Check for the "Logout" text
    expect(screen.getByText('התנתקות')).toBeInTheDocument();
  });

  it('contains the correct links', () => {
    render(<IntermediatePage />);

    // FIX: Use /^כניסה/ to match only the link that STARTS with this word.
    // This avoids matching the Logout button ("Return to Entry screen")
    const enterLink = screen.getByRole('link', { name: /^כניסה/ });
    expect(enterLink).toHaveAttribute('href', '/EnterPage');

    const exitLink = screen.getByRole('link', { name: /יציאה/ });
    expect(exitLink).toHaveAttribute('href', '/ExitPage');

    const logoutLink = screen.getByRole('link', { name: /התנתקות/ });
    expect(logoutLink).toHaveAttribute('href', '/');
  });
});