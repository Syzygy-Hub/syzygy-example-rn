/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SyzygyThemeProvider } from 'syzygy-ui-rn';

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <SyzygyThemeProvider>
        <App />
      </SyzygyThemeProvider>,
    );
  });
});
