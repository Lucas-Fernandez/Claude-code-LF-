import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Theme } from '@/theme';
import { useTheme } from '@/context/ThemeContext';
import { Position, PositionInput, POSITION_TYPES, PositionType } from '@/types';

interface PositionFormProps {
  /** When provided, the form starts pre-filled for editing. */
  initial?: Position;
  submitLabel: string;
  onSubmit: (input: PositionInput) => void;
  /** Optional secondary action (e.g. Cancel on the edit modal). */
  onCancel?: () => void;
}

/** Internal string-based form state (TextInput works with strings). */
interface FormState {
  name: string;
  type: PositionType;
  manager: string;
  commitment: string;
  calledCapital: string;
  distributed: string;
  currentNav: string;
  irrGross: string;
  irrNet: string;
  moicGross: string;
  moicNet: string;
  dpi: string;
  netTvpi: string;
  vintageYear: string;
  thesis: string;
  lpacSeat: boolean;
  coInvestOpportunity: boolean;
}

function toFormState(p?: Position): FormState {
  return {
    name: p?.name ?? '',
    type: p?.type ?? 'VC',
    manager: p?.manager ?? '',
    commitment: p ? String(p.commitment) : '',
    calledCapital: p ? String(p.calledCapital) : '',
    distributed: p ? String(p.distributed) : '',
    currentNav: p ? String(p.currentNav) : '',
    // IRR stored as decimal but shown as a percentage for usability.
    irrGross: p ? String(p.irrGross * 100) : '',
    irrNet: p ? String(p.irrNet * 100) : '',
    moicGross: p ? String(p.moicGross) : '',
    moicNet: p ? String(p.moicNet) : '',
    dpi: p ? String(p.dpi) : '',
    netTvpi: p ? String(p.netTvpi) : '',
    vintageYear: p ? String(p.vintageYear) : String(new Date().getFullYear()),
    thesis: p?.thesis ?? '',
    lpacSeat: p?.lpacSeat ?? false,
    coInvestOpportunity: p?.coInvestOpportunity ?? false,
  };
}

const num = (s: string) => {
  const n = parseFloat(s.replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Module-level field component. Defined outside the form (not inline) so it
 * keeps a stable identity across renders — otherwise each keystroke would
 * remount the TextInput and drop keyboard focus.
 */
function Field({
  theme,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: {
  theme: Theme;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            borderRadius: theme.radius.md,
          },
        ]}
      />
    </View>
  );
}

function ToggleRow({
  theme,
  label,
  value,
  onValueChange,
}: {
  theme: Theme;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={[styles.toggleRow, { borderColor: theme.colors.border }]}>
      <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export function PositionForm({ initial, submitLabel, onSubmit, onCancel }: PositionFormProps) {
  const { theme } = useTheme();
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError('Please enter a position name.');
      return;
    }
    if (!form.manager.trim()) {
      setError('Please enter a manager.');
      return;
    }
    setError(null);

    onSubmit({
      name: form.name.trim(),
      type: form.type,
      manager: form.manager.trim(),
      commitment: num(form.commitment),
      calledCapital: num(form.calledCapital),
      distributed: num(form.distributed),
      currentNav: num(form.currentNav),
      irrGross: num(form.irrGross) / 100,
      irrNet: num(form.irrNet) / 100,
      moicGross: num(form.moicGross),
      moicNet: num(form.moicNet),
      dpi: num(form.dpi),
      netTvpi: num(form.netTvpi),
      vintageYear: Math.round(num(form.vintageYear)),
      thesis: form.thesis.trim() || undefined,
      lpacSeat: form.lpacSeat,
      coInvestOpportunity: form.coInvestOpportunity,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field
          theme={theme}
          label="Position Name"
          value={form.name}
          onChangeText={(t) => set('name', t)}
          placeholder="e.g. Era Fund I"
        />

        {/* Asset type picker (horizontal chips) */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type</Text>
          <View style={styles.chips}>
            {POSITION_TYPES.map((t) => {
              const active = form.type === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => set('type', t)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? theme.colors.primaryText : theme.colors.textSecondary,
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Field
          theme={theme}
          label="Manager / GP"
          value={form.manager}
          onChangeText={(t) => set('manager', t)}
          placeholder="e.g. Era Capital"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="Commitment ($)"
              value={form.commitment}
              onChangeText={(t) => set('commitment', t)}
              placeholder="10000000"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="Vintage Year"
              value={form.vintageYear}
              onChangeText={(t) => set('vintageYear', t)}
              placeholder="2024"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="Called Capital ($)"
              value={form.calledCapital}
              onChangeText={(t) => set('calledCapital', t)}
              placeholder="6500000"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="Distributed ($)"
              value={form.distributed}
              onChangeText={(t) => set('distributed', t)}
              placeholder="800000"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Field
          theme={theme}
          label="Current NAV ($)"
          value={form.currentNav}
          onChangeText={(t) => set('currentNav', t)}
          placeholder="12400000"
          keyboardType="decimal-pad"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="IRR Gross (%)"
              value={form.irrGross}
              onChangeText={(t) => set('irrGross', t)}
              placeholder="42"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="IRR Net (%)"
              value={form.irrNet}
              onChangeText={(t) => set('irrNet', t)}
              placeholder="34"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="MOIC Gross (x)"
              value={form.moicGross}
              onChangeText={(t) => set('moicGross', t)}
              placeholder="2.4"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="MOIC Net (x)"
              value={form.moicNet}
              onChangeText={(t) => set('moicNet', t)}
              placeholder="2.03"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="DPI (x)"
              value={form.dpi}
              onChangeText={(t) => set('dpi', t)}
              placeholder="0.12"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.col}>
            <Field
              theme={theme}
              label="Net TVPI (x)"
              value={form.netTvpi}
              onChangeText={(t) => set('netTvpi', t)}
              placeholder="2.03"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Field
          theme={theme}
          label="Thesis / Notes (optional)"
          value={form.thesis}
          onChangeText={(t) => set('thesis', t)}
          placeholder="What's the investment thesis?"
          multiline
        />

        <ToggleRow
          theme={theme}
          label="LPAC Seat"
          value={form.lpacSeat}
          onValueChange={(v) => set('lpacSeat', v)}
        />
        <ToggleRow
          theme={theme}
          label="Co-Invest Opportunity"
          value={form.coInvestOpportunity}
          onValueChange={(v) => set('coInvestOpportunity', v)}
        />

        {error ? (
          <Text style={[styles.error, { color: theme.colors.negative }]}>{error}</Text>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submit,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.md,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>

        {onCancel ? (
          <Pressable onPress={onCancel} style={styles.cancel}>
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </Pressable>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputMultiline: { height: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: { fontSize: 15, fontWeight: '500' },
  error: { fontSize: 14, marginTop: 8, marginBottom: 4, fontWeight: '600' },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 20,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancel: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontSize: 15, fontWeight: '600' },
});
