import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usersService } from '../../../modules/user-access/users.service';
import { theme } from '../../../core/theme';

export default function UsersScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await usersService.getAll();
      setItems(Array.isArray(data) ? data : data.items || data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Ionicons name="person-circle-outline" size={36} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.fullName || item.userName || item.username}</Text>
              <Text style={styles.role}>{item.role || item.roleName || '---'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={56} color="#cbd5e1" />
            <Text style={{ color: '#94a3b8', marginTop: 10 }}>کاربری یافت نشد</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 12, gap: 12, ...theme.shadow },
  name: { fontSize: 15, fontWeight: 'bold', textAlign: 'right', color: '#0f172a' },
  role: { color: '#64748b', fontSize: 12, textAlign: 'right' },
  empty: { alignItems: 'center', marginTop: 60 },
});

