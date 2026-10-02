import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Frontend App Smoke Test', () => {
  it('renders application brand header', () => {
    render(<App />);
    expect(screen.getByText('FORENZIQ')).toBeInTheDocument();
    expect(screen.getByText('Digital Forensics AI')).toBeInTheDocument();
  });
});
