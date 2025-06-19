import React, { useState } from 'react';
import { Bell, Menu, ChevronDown, User, Settings, LogOut, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeUserDropdown = () => {
    setIsUserDropdownOpen(false);
  };

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
          
          <div className="relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
              onClick={toggleUserDropdown}
            >
              <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">NL</span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Nguyễn Thị Lan</div>
                <div className="text-xs text-gray-500">Kế toán trưởng</div>
              </div>
              <ChevronDown 
                size={14} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isUserDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={closeUserDropdown}
                />
                
                {/* Dropdown Content */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">NL</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Nguyễn Thị Lan</div>
                        <div className="text-sm text-gray-500">nguyenlan@company.com</div>
                        <div className="text-xs text-gray-400">Kế toán trưởng</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={16} className="mr-3 text-gray-400" />
                      Thông tin cá nhân
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings size={16} className="mr-3 text-gray-400" />
                      Cài đặt tài khoản
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <HelpCircle size={16} className="mr-3 text-gray-400" />
                      Trợ giúp & Hỗ trợ
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Logout */}
                  <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={16} className="mr-3" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}