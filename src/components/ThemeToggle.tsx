import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

/** Header button that cycles system -> light -> dark theme preference. */
export function ThemeToggle() {
  const { theme, preference, toggleTheme } = useTheme();

  const icon =
    preference === 'system'
      ? 'phone-portrait-outline'
      : preference === 'light'
      ? 'sunny-outline'
      : 'moon-outline';

  return (
    <Pressable
      onPress={toggleTheme}
      hitSlop={10}
      style={[styles.button, { backgroundColor: theme.colors.surfaceAlt }]}
      accessibilityLabel={`Theme: ${preference}. Tap to change.`}
    >
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
