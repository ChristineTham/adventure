/** @vitest-environment happy-dom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationImage } from '../../components/LocationImage';
import React from 'react';

describe('LocationImage', () => {
  it('renders an image when locationId is provided', () => {
    render(<LocationImage locationId="LOC_START" />);
    const img = screen.getByRole('img', { name: /Location image for LOC_START/i });
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/adventure/locations/LOC_START.jpg');
  });

  it('renders a fallback or null when no locationId is provided', () => {
    const { container } = render(<LocationImage locationId="" />);
    expect(container.firstChild).toBeNull();
  });
});
