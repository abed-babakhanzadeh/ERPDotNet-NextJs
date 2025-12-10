// مسیر فایل: src/app/index.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// استفاده از کتابخانه امن برای جلوگیری از مشکل صفحه سفید در اندروید
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { router } from 'expo-router';
import { authService } from '../modules/auth/auth.service';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('خطا', 'لطفا نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      await authService.login(username, password);
      router.replace('/dashboard');
    } catch (error) {
      console.log(error);
      Alert.alert('خطا', 'ارتباط با سرور برقرار نشد یا اطلاعات غلط است.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ERP Login</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>نام کاربری:</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: admin"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>رمز عبور:</Text>
          <TextInput
            style={styles.input}
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

       


        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>ورود به سیستم</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#1f2937' },
  inputContainer: { marginBottom: 15 },
  label: { marginBottom: 5, color: '#4b5563', fontWeight: '500' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  btn: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});


