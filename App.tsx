import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortfolioProvider, usePortfolio } from '@/context/PortfolioContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { RootNavigator } from '@/navigation/RootNavigator';

/**
 * Talipot Capital — LP Dashboard
 * Entry point. Wires up the theme + portfolio providers, then renders the
 * navigation tree once persisted data has loaded from AsyncStorage.
 */

function AppShell() {
  const { theme, isDark } = useTheme();
  const { loading } = usePortfolio();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PortfolioProvider>
          <AppShell />
        </PortfolioProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
