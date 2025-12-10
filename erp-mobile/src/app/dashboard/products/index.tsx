import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productsService } from '../../../modules/base-info/products.service';
import { theme } from '../../../core/theme';

export default function ProductsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { load(); }, []);

  const load = async (searchTerm = keyword) => {
    try {
      if (!refreshing) setLoading(true);
      const res = await productsService.getAll(1, 30, searchTerm);
      const data = res.items || res.data || res;
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const id = item.id || item.Id;
    const name = item.name || item.Name || item.title || '---';
    const code = item.code || item.Code || '---';
    const imageUrl = item.imageUrl || item.ImageUrl || item.image || item.ImagePath;

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/dashboard/products/${id}`)}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="image-outline" size={20} color="#94a3b8" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.code}>کد: {code}</Text>
        </View>
        <Ionicons name="chevron-back" size={18} color="#94a3b8" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBtn} onPress={() => load(keyword)}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder="جستجو در نام یا کد"
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={() => load(keyword)}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(''); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={56} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', marginTop: 10 }}>موردی یافت نشد</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/dashboard/products/create')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { flexDirection: 'row-reverse', backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', gap: 12, ...theme.shadow },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#e2e8f0' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: 'bold', textAlign: 'right', color: '#0f172a' },
  code: { color: '#64748b', fontSize: 12, textAlign: 'right' },
  searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, height: 50, textAlign: 'right', borderWidth: 1, borderColor: '#e2e8f0' },
  searchBtn: { width: 50, height: 50, backgroundColor: theme.colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 60 },
  fab: { position: 'absolute', bottom: 24, left: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.success, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});

