import React from 'react';
import { Bell, Menu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 h-[50px] flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Trang chủ</span>
              <span>/</span>
              <span>Quản lý dữ liệu cơ bản</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Dashboard Tổng Quan</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              1
            </span>
          </button>
          
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">NL</span>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">Nguyễn Thị Lan</div>
              <div className="text-xs text-gray-500">Kế toán trưởng</div>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}