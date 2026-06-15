import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PositionForm } from '@/components/PositionForm';
import { usePortfolio } from '@/context/PortfolioContext';
import { useTheme } from '@/context/ThemeContext';
import { RootStackParamList } from '@/navigation/types';
import { PositionInput } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'EditPosition'>;

/** Modal screen for editing (or deleting) an existing position. */
export function EditPositionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { getPosition, updatePosition, deletePosition } = usePortfolio();

  const position = getPosition(route.params.positionId);

  // Guard: if the position vanished (e.g. deleted elsewhere), close.
  if (!position) {
    return (
      <View style={[styles.missing, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textMuted }}>Position not found.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary, marginTop: 8 }}>Close</Text>
        </Pressable>
      </View>
    );
  }

  const handleSubmit = async (input: PositionInput) => {
    await updatePosition(position.id, input);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Delete position', `Remove "${position.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePosition(position.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>Edit Position</Text>
        <Pressable onPress={handleDelete} hitSlop={10}>
          <Ionicons name="trash-outline" size={22} color={theme.colors.negative} />
        </Pressable>
      </View>

      <PositionForm
        initial={position}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: '700' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
