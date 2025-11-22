"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export interface Tab {
  id: string; // معمولا همان url است
  title: string;
  url: string;
}

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string;
  addTab: (title: string, url: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  // وقتی URL عوض شد، تب فعال را آپدیت کن
  useEffect(() => {
    setActiveTabId(pathname);
    // اگر این تب در لیست نیست (مثلا دستی آدرس وارد شده)، اضافه‌اش کن (اختیاری)
    // اینجا ساده می‌گیریم و فرض می‌کنیم فقط با کلیک منو اضافه می‌شود
  }, [pathname]);

  const addTab = (title: string, url: string) => {
    // آیا تب قبلا باز شده؟
    const exists = tabs.find((t) => t.id === url);
    if (!exists) {
      setTabs((prev) => [...prev, { id: url, title, url }]);
    }
    // هدایت به آن صفحه
    router.push(url);
    setActiveTabId(url);
  };

  const closeTab = (id: string) => {
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);

    // اگر تبی که بستیم فعال بود، باید بریم به تب قبلی یا داشبورد
    if (id === activeTabId) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        router.push(lastTab.url);
      } else {
        router.push("/"); // برگشت به داشبورد
      }
    }
  };

  const setActiveTab = (id: string) => {
    router.push(id);
  };

  return (
    <TabsContext.Provider
      value={{ tabs, activeTabId, addTab, closeTab, setActiveTab }}
    >
      {children}
    </TabsContext.Provider>
  );
}

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("useTabs must be used within TabsProvider");
  return context;
};
