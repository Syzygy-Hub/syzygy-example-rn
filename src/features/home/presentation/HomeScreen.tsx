import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultTypography, getColors, spacing } from 'syzygy-ui-rn';

import { useLoginViewModel } from '../../auth/presentation/LoginViewModel';

const c = getColors('light');

const typography = {
  headingLarge: defaultTypography.display,
  bodyMedium: defaultTypography.body,
};

const layout = {
  screenHorizontalPadding: 16,
};

export interface HomeScreenProps {
  onLogout?: () => void;
}

/**
 * Minimal authenticated landing screen shown after a successful login.
 * Replace with the real Home feature as the app grows.
 */
export function HomeScreen({ onLogout }: HomeScreenProps): React.JSX.Element {
  const logout = useLoginViewModel(state => state.logout);

  const handleLogout = async () => {
    await logout();
    onLogout?.();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>You&apos;re signed in</Text>
        <Text style={styles.subtitle}>This is the Home screen.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenHorizontalPadding,
    gap: spacing.xxs,
  },
  title: {
    ...typography.headingLarge,
    color: c.textPrimary,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: c.textSecondary,
  },
  logoutButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: c.primary,
  },
  logoutText: {
    ...typography.bodyMedium,
    color: c.textInverse,
  },
});
