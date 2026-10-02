import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Frontend App Smoke Test', () => {
  it('renders application brand name FORENZIQ', () => {
    render(<App />);
    expect(screen.getByText('FORENZIQ')).toBeInTheDocument();
  });
});
