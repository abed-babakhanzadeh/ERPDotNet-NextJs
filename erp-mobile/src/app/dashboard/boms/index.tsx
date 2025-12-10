import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { bomService } from '../../../modules/product-engineering/bom.service';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';

export default function BOMListScreen() {
  const [boms, setBoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // لود اولیه
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (searchTerm = keyword) => {
    try {
      if (!refreshing) setLoading(true);
      // ارسال درخواست با پارامتر جستجو
      const data = await bomService.getAll(1, 50, searchTerm);
      const items = data.items || data.data || [];
      setBoms(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadData(keyword); // فراخوانی با کلمه جدید
  };

  const handleDelete = (id: number, title: string) => {
    Alert.alert("حذف", `آیا "${title}" حذف شود؟`, [
      { text: "خیر", style: "cancel" },
      { text: "بله", style: "destructive", onPress: async () => {
          try {
            await bomService.delete(id);
            loadData();
          } catch(e) { Alert.alert("خطا", "حذف انجام نشد"); }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    // هندل کردن حروف بزرگ و کوچک
    const title = item.Title || item.title || "---";
    const code = item.Code || item.code || "---";
    const version = item.Version || item.version || "1";
    const id = item.Id || item.id;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => router.push(`/dashboard/boms/tree/${id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>v{version}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={16} color={theme.colors.mutedForeground} />
            <Text style={styles.infoText}>{code}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleDelete(id, title)} style={styles.actionBtn}>
            <Text style={[styles.actionText, {color: theme.colors.destructive}]}>حذف</Text>
            <Ionicons name="trash-outline" size={18} color={theme.colors.destructive} />
          </TouchableOpacity>
          
          <View style={styles.verticalLine} />

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={[styles.actionText, {color: theme.colors.primary}]}>مشاهده درخت</Text>
            <Ionicons name="git-network-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar Modern */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
        <TextInput 
          style={styles.input}
          placeholder="جستجو در نام یا کد..."
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 40}} />
      ) : (
        <FlatList
          data={boms}
          keyExtractor={(item) => (item.id || item.Id || Math.random()).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={60} color="#cbd5e1" />
              <Text style={{color: '#94a3b8', marginTop: 10}}>هیچ موردی یافت نشد</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) for Create */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/dashboard/boms/create')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, height: 50, textAlign: 'right', borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14 },
  searchBtn: { width: 50, height: 50, backgroundColor: theme.colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 16, ...theme.shadow, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', flex: 1, textAlign: 'right', marginLeft: 10 },
  badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  
  cardBody: { paddingHorizontal: 16, paddingBottom: 16 },
  infoRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  infoText: { color: '#64748b', fontSize: 14 },
  
  divider: { height: 1, backgroundColor: '#f1f5f9' },
  cardActions: { flexDirection: 'row', height: 45 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '500' },
  verticalLine: { width: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  fab: { position: 'absolute', bottom: 24, left: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.success, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.3, shadowRadius: 3 }
});