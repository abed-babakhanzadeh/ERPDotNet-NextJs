// مسیر: src/app/dashboard/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../core/theme';

export default function DashboardLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          drawerActiveTintColor: theme.colors.primary,
          drawerLabelStyle: { marginLeft: -20, fontWeight: 'bold' },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'پیشخوان',
            title: 'پیشخوان مدیریت',
            drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="products" // باید پوشه products داشته باشید
          options={{
            drawerLabel: 'مدیریت کالاها',
            title: 'لیست کالاها',
            drawerIcon: ({ color }) => <Ionicons name="cube-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="boms" // باید پوشه boms داشته باشید
          options={{
            drawerLabel: 'فرمول‌های ساخت (BOM)',
            title: 'مدیریت BOM',
            drawerIcon: ({ color }) => <Ionicons name="git-network-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="units" // پوشه units را خواهیم ساخت
          options={{
            drawerLabel: 'واحدها',
            title: 'مدیریت واحدها',
            drawerIcon: ({ color }) => <Ionicons name="scale-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="users" // پوشه users را خواهیم ساخت
          options={{
            drawerLabel: 'کاربران',
            title: 'مدیریت کاربران',
            drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}