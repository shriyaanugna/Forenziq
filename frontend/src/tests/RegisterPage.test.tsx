import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signUp: vi.fn(),
    },
  },
}));

describe('RegisterPage Signup Flow', () => {
  it('renders signup form controls and requirements', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Create your FORENZIQ account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Agent Alex Vance/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/investigator@agency.gov/i)).toBeInTheDocument();
  });

  it('validates password matching before submitting', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Agent Alex Vance/i), { target: { value: 'Agent Vance' } });
    fireEvent.change(screen.getByPlaceholderText(/investigator@agency.gov/i), { target: { value: 'test@agency.gov' } });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'SecurePass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'DifferentPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Investigator Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('handles existing account registration error gracefully', async () => {
    (supabase.auth.signUp as any).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered', status: 400 },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Agent Alex Vance/i), { target: { value: 'Existing Agent' } });
    fireEvent.change(screen.getByPlaceholderText(/investigator@agency.gov/i), { target: { value: 'existing@agency.gov' } });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'SecurePass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'SecurePass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Investigator Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/An investigator account with this email address already exists/i)).toBeInTheDocument();
    });
  });
});
