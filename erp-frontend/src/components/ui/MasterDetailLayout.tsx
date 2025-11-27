
import React, { FC, ReactNode } from 'react';
import { LucideProps } from 'lucide-react';

interface MasterDetailLayoutProps {
  title: string;
  icon: FC<LucideProps>;
  actions?: ReactNode;
  children: ReactNode;
}

const MasterDetailLayout: FC<MasterDetailLayoutProps> = ({ title, icon: Icon, actions, children }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-gray-600" />
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MasterDetailLayout;
