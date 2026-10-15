import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { getColors } from 'syzygy-ui-rn';

import { AppModule } from '../di/AppModule';
import { LoginScreen } from '../features/auth/presentation/LoginScreen';
import { HomeScreen } from '../features/home/presentation/HomeScreen';

const c = getColors('light');

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

type AuthState = 'checking' | 'authenticated' | 'unauthenticated';

/**
 * Root navigator. Decides the initial route by checking for a persisted
 * session via the auth use case, then renders the appropriate stack.
 */
function AppNavigator(): React.JSX.Element {
  const [authState, setAuthState] = useState<AuthState>('checking');

  useEffect(() => {
    let isMounted = true;

    AppModule.authUseCase
      .isAuthenticated()
      .then(isAuthenticated => {
        if (isMounted) {
          setAuthState(isAuthenticated ? 'authenticated' : 'unauthenticated');
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthState('unauthenticated');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setAuthState('authenticated');
  }, []);

  const handleLogout = useCallback(() => {
    setAuthState('unauthenticated');
  }, []);

  if (authState === 'checking') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState === 'authenticated' ? (
          <Stack.Screen name="Home">
            {() => <HomeScreen onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.background,
  },
});

export default AppNavigator;
