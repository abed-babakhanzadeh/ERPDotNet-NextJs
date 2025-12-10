// مسیر: src/app/dashboard/units/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { unitsService } from '../../../modules/base-info/units.service';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';

export default function UnitsScreen() {
  const [units, setUnits] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => { loadUnits(); }, []);

  const loadUnits = async () => {
    try {
      const data = await unitsService.getAll();
      setUnits(data);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    try {
      await unitsService.create(newTitle, newSymbol);
      setModalVisible(false);
      setNewTitle(''); setNewSymbol('');
      loadUnits();
    } catch (e) { Alert.alert("خطا", "ثبت نشد"); }
  };

  const handleDelete = (id: number) => {
    Alert.alert("حذف", "مطمئنید؟", [
      { text: "خیر" },
      { text: "بله", style: 'destructive', onPress: async () => {
          await unitsService.delete(id);
          loadUnits();
        }}
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={units}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.symbol}>{item.symbol}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* مودال ساخت واحد جدید */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>واحد جدید</Text>
            <TextInput placeholder="عنوان واحد (مثلا کیلوگرم)" style={styles.input} value={newTitle} onChangeText={setNewTitle} />
            <TextInput placeholder="نماد (مثلا kg)" style={styles.input} value={newSymbol} onChangeText={setNewSymbol} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text>لغو</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={styles.saveBtn}><Text style={{color:'white'}}>ذخیره</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderRadius: 8, marginBottom: 10, elevation: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  symbol: { color: 'gray', textAlign: 'right' },
  fab: { position: 'absolute', bottom: 20, left: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10, textAlign: 'right' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#ddd', padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: 'center' }
});