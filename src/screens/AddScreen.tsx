import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { PositionForm } from '@/components/PositionForm';
import { ScreenContainer } from '@/components/ScreenContainer';
import { usePortfolio } from '@/context/PortfolioContext';
import { RootStackParamList } from '@/navigation/types';
import { PositionInput } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AddScreen() {
  const navigation = useNavigation<Nav>();
  const { addPosition } = usePortfolio();
  // Bumping this key remounts the form, clearing it after a successful add.
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (input: PositionInput) => {
    await addPosition(input);
    setFormKey((k) => k + 1);
    Alert.alert('Position added', `"${input.name}" was added to your portfolio.`, [
      { text: 'View Positions', onPress: () => navigation.navigate('Tabs', { screen: 'Positions' }) },
      { text: 'Add Another', style: 'cancel' },
    ]);
  };

  return (
    <ScreenContainer title="Add Position" subtitle="New private markets commitment">
      <PositionForm key={formKey} submitLabel="Add Position" onSubmit={handleSubmit} />
    </ScreenContainer>
  );
}
