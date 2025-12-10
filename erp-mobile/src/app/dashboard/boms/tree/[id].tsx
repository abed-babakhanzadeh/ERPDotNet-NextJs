// مسیر فایل: src/app/dashboard/boms/tree/[id].tsx

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { bomService } from '../../../../modules/product-engineering/bom.service';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../../core/theme';

// کامپوننت بازگشتی برای نمایش هر گره
const TreeNode = ({ node, level = 0, isLast = true }: { node: any, level?: number, isLast?: boolean }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // محاسبه استایل برای نمایش خطوط اتصال درختی
  const marginLeft = level * 20;

  return (
    <View style={{ flexDirection: 'column' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        
        {/* دکمه باز/بسته کردن */}
        {hasChildren ? (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginRight: 5, zIndex: 10 }}>
            <Ionicons 
              name={expanded ? "remove-circle-outline" : "add-circle-outline"} 
              size={20} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        ) : (
          <Ionicons name="ellipse-outline" size={12} color="#cbd5e1" style={{ marginRight: 9, marginLeft: 4 }} />
        )}

        {/* کارت محتوا */}
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.nodeCard, { borderColor: level === 0 ? theme.colors.primary : '#e2e8f0' }]}
        >
          <View>
            <Text style={styles.nodeTitle}>{node.Title || node.title || node.productName || '---'}</Text>
            <View style={{flexDirection: 'row', gap: 10, marginTop: 4}}>
              <Text style={styles.nodeSub}>کد: {node.Code || node.code || '---'}</Text>
              {(node.Coefficient || node.coefficient) && (
                <Text style={[styles.nodeSub, {color: '#d97706'}]}>
                  ضریب: {node.Coefficient || node.coefficient}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* نمایش فرزندان (با تورفتگی) */}
      {expanded && hasChildren && (
        <View style={{ borderLeftWidth: 1, borderLeftColor: '#cbd5e1', marginLeft: 9, paddingLeft: 10 }}>
          {node.children.map((child: any, index: number) => (
            <TreeNode 
              key={index} 
              node={child} 
              level={level + 1} 
              isLast={index === node.children.length - 1} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function BOMTreeScreen() {
  const { id } = useLocalSearchParams();
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadTree(Number(id));
  }, [id]);

  const loadTree = async (bomId: number) => {
    try {
      const data = await bomService.getTree(bomId);
      setTreeData(data);
    } catch (e) {
      console.error(e);
      Alert.alert("خطا", "دریافت درخت محصول با مشکل مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  if (!treeData) return <View style={styles.center}><Text>داده‌ای یافت نشد</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>ساختار درختی محصول</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* اسکرول دو جهته برای درخت‌های بزرگ */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ paddingRight: 40 }}>
          <View style={{ padding: 10 }}>
            <TreeNode node={treeData} />
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: 'white' },
  header: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  
  nodeCard: { 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    minWidth: 200, // حداقل عرض برای اینکه متن‌ها له نشوند
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity:0.05
  },
  nodeTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', textAlign: 'left' }, // چپ چین برای خوانایی بهتر در درخت لاتین/فارسی
  nodeSub: { fontSize: 12, color: '#64748b', textAlign: 'left' },
});