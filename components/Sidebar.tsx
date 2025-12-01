import React from 'react';
import { LayoutDashboard, FileText, Settings, Plus, Zap, Workflow } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onUploadClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onUploadClick }) => {
  const navItemClass = (active: boolean) => 
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
      active 
        ? 'bg-orange-50 text-brand-700 font-medium' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col h-full fixed left-0 top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center text-white">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">DocFlow</span>
      </div>

      <div className="px-4 mb-6">
        <button 
          onClick={onUploadClick}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Nuovo Documento</span>
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        <div 
          className={navItemClass(currentView === ViewState.DASHBOARD || currentView === ViewState.DOCUMENT_DETAIL)}
          onClick={() => onNavigate(ViewState.DASHBOARD)}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div 
          className={navItemClass(currentView === ViewState.WORKFLOWS)}
          onClick={() => onNavigate(ViewState.WORKFLOWS)}
        >
          <Workflow size={20} />
          <span>Automazioni</span>
        </div>
        <div className={navItemClass(false)}>
          <FileText size={20} />
          <span>Archivio</span>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div 
          className={navItemClass(currentView === ViewState.SETTINGS)}
          onClick={() => onNavigate(ViewState.SETTINGS)}
        >
          <Settings size={20} />
          <span>Impostazioni</span>
        </div>
      </div>
    </aside>
  );
};