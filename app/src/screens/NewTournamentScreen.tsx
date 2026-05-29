import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { createTournament } from '@/api/client';
import { useClub } from '@/api/hooks';

export function NewTournamentScreen() {
  const navigation = useNavigation<any>();
  const { data: club } = useClub();
  
  const [name, setName] = useState('Torneo de Prueba');
  const [description, setDescription] = useState('Torneo inaugural del club.');
  const [startDate, setStartDate] = useState('2024-06-15');
  const [endDate, setEndDate] = useState('2024-06-16');
  const [price, setPrice] = useState('20');
  const [maxPlayers, setMaxPlayers] = useState('16');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return setError('Por favor, indica el nombre del torneo');
    if (!startDate.trim()) return setError('Por favor, indica la fecha de inicio');
    if (!endDate.trim()) return setError('Por favor, indica la fecha de fin');
    if (!price.toString().trim()) return setError('Por favor, indica el precio');
    if (!maxPlayers.toString().trim()) return setError('Por favor, indica las plazas máximas');
    
    // Validar formato fecha (YYYY-MM-DD) simple
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      setError('Las fechas deben tener el formato YYYY-MM-DD');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await createTournament({
        name,
        description,
        startDate,
        endDate,
        price: parseInt(price, 10),
        maxPlayers: parseInt(maxPlayers, 10),
        clubId: club?.id || 'local', // Usa el club actual
      });
      navigation.goBack();
    } catch (e: any) {
      setError(e.message || 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Crear Torneo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Nombre del Torneo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Torneo de Primavera"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Detalles del torneo..."
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Inicio (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2024-06-01"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Fin (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2024-06-02"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Precio (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="20"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Plazas Máximas</Text>
            <TextInput
              style={styles.input}
              placeholder="16"
              keyboardType="numeric"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
            />
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Creando...' : 'Crear Torneo'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, paddingTop: spacing.xl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.separator },
  backBtn: { padding: 4 },
  title: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text },
  content: { padding: spacing.base },
  error: { color: '#EF4444', fontFamily: fonts.bodyBold, marginBottom: spacing.md, textAlign: 'center' },
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.separator, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontFamily: fonts.body, fontSize: fontSize.base },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: colors.textOnDark, fontFamily: fonts.bodyBold, fontSize: fontSize.base },
});
