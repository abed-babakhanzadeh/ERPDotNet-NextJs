import { ReactNode } from "react";

interface Props {
  title: string;
  icon?: any;
  actions?: ReactNode; // دکمه‌های بالای صفحه (مثل جدید، حذف، چاپ)
  children: ReactNode; // محتوای صفحه (فرم + جدول)
}

export default function MasterDetailLayout({
  title,
  icon: Icon,
  actions,
  children,
}: Props) {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Bar: Title & Actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Icon size={24} />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
