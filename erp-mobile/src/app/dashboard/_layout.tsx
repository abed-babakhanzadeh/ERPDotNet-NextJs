import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'لیست کالاها', headerTitleAlign: 'center' }} />
      <Stack.Screen name="product/[id]" options={{ title: 'جزئیات محصول', headerTitleAlign: 'center' }} />
    </Stack>
  );
}