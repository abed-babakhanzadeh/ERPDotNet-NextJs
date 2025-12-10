import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { productsService } from '../../../modules/base-info/products.service';
import { theme } from '../../../core/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProductCreateScreen() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [supplyTypeId, setSupplyTypeId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !code || !supplyTypeId || !unitId) {
      Alert.alert('خطا', 'تمام فیلدها را پر کنید.');
      return;
    }
    setSubmitting(true);
    try {
      await productsService.create(
        { name, code, supplyTypeId: Number(supplyTypeId), unitId: Number(unitId) },
        imageUri
      );
      Alert.alert('موفق', 'کالا ثبت شد', [{ text: 'باشه', onPress: () => router.back() }]);
    } catch (e) {
      console.error(e);
      Alert.alert('خطا', 'ثبت کالا انجام نشد');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>ایجاد کالای جدید</Text>

      <TextInput placeholder="نام کالا" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="کد کالا" style={styles.input} value={code} onChangeText={setCode} />
      <TextInput
        placeholder="شناسه نوع تامین (مثلا 1)"
        keyboardType="numeric"
        style={styles.input}
        value={supplyTypeId}
        onChangeText={setSupplyTypeId}
      />
      <TextInput
        placeholder="شناسه واحد (مثلا 1)"
        keyboardType="numeric"
        style={styles.input}
        value={unitId}
        onChangeText={setUnitId}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <>
            <Ionicons name="image-outline" size={22} color="#94a3b8" />
            <Text style={{ color: '#64748b', marginTop: 6 }}>انتخاب تصویر</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.submit} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>ثبت کالا</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8fafc', flexGrow: 1 },
  header: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 20, textAlign: 'right' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', textAlign: 'right' },
  imagePicker: { backgroundColor: 'white', borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, height: 160 },
  imagePreview: { width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' },
  submit: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

