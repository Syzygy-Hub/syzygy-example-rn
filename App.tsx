/**
 * SyzygyBase App entry point.
 *
 * Initialises the DI container and wraps the component tree in
 * SyzygyThemeProvider so every component can access the design-system theme.
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SyzygyThemeProvider } from 'syzygy-ui-rn';

import { initDI } from './src/di/AppModule';
import AppNavigator from './src/navigation/AppNavigator';

// Initialise the DI container once before the first render.
initDI();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SyzygyThemeProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </SafeAreaProvider>
    </SyzygyThemeProvider>
  );
}

export default App;
