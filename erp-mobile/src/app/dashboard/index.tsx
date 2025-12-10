// مسیر فایل: src/app/dashboard/index.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { productsService } from '../../modules/base-info/products.service';
import { authService } from '../../modules/auth/auth.service';

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // درخواست به متد Search
      const data = await productsService.getAll();
      // در PaginatedResult معمولا لیست در items یا data است. لاگ بگیرید تا مطمئن شوید
      console.log('API Response:', data);
      setProducts(data.items || data.data || []); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      
      {/* دکمه مدیریت BOM اضافه شده در اینجا */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
        <TouchableOpacity 
          style={{backgroundColor: '#10b981', padding: 12, borderRadius: 8, flex: 1, alignItems: 'center'}}
          onPress={() => router.push('/dashboard/boms')}
        >
          <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16}}>مدیریت فرمول‌ها (BOM)</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/dashboard/product/${item.id}`)}
            >
              <Text style={styles.title}>{item.name || item.title}</Text>
              <Text style={styles.code}>کد: {item.code}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={{color:'white', textAlign:'center', fontWeight: 'bold'}}>خروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#334155', textAlign: 'right' },
  code: { color: '#64748b', marginTop: 5, textAlign: 'right' },
  logout: { marginTop: 20, backgroundColor: '#ef4444', padding: 15, borderRadius: 8 }
});