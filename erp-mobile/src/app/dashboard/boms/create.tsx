import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { bomService } from '../../../modules/product-engineering/bom.service';
import { theme } from '../../../core/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CreateBOMScreen() {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [productId, setProductId] = useState(''); // فعلا دستی ID میگیریم تا دراپ داون بسازیم
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !code || !productId) {
      Alert.alert("خطا", "لطفا تمام فیلدها را پر کنید");
      return;
    }

    setLoading(true);
    try {
      await bomService.create({
        title,
        code,
        productId: Number(productId),
        bomDetails: [] // فعلا بدون فرزند می‌سازیم
      });
      Alert.alert("موفقیت", "فرمول جدید با موفقیت ساخته شد", [
        { text: "باشه", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("خطا", "عملیات با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تعریف فرمول ساخت جدید</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>عنوان فرمول</Text>
          <TextInput 
            style={styles.input} 
            placeholder="مثال: بدنه دوچرخه کوهستان"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>کد فرمول</Text>
          <TextInput 
            style={styles.input} 
            placeholder="مثال: BOM-001"
            value={code}
            onChangeText={setCode}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>شناسه محصول (ID)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="شناسه عددی محصول را وارد کنید"
            value={productId}
            onChangeText={setProductId}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>* در نسخه‌های بعدی لیست محصولات نمایش داده می‌شود</Text>
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>ثبت و ایجاد</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', flex: 1, textAlign: 'center' },
  
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, textAlign: 'right', fontSize: 16 },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 5, textAlign: 'right' },
  
  submitBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, ...theme.shadow },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});