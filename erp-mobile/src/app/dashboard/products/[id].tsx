import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { productsService } from '../../../modules/base-info/products.service';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadProduct(Number(id));
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      const data = await productsService.getById(productId);
      setProduct(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (!product) return <Text style={{ textAlign: 'center', marginTop: 50 }}>محصول یافت نشد</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>نام محصول:</Text>
        <Text style={styles.value}>{product.name || product.title}</Text>
        <Text style={styles.label}>کد کالا:</Text>
        <Text style={styles.value}>{product.code}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 3 },
  label: { color: 'gray', fontSize: 12, marginTop: 10 },
  value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});

