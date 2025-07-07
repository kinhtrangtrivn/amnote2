import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, ChevronDown, User, Settings, LogOut, HelpCircle, AlertTriangle, Clock, CheckCircle, X, Globe } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  onMenuSelect: (menuId: string) => void;
}

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }
];

const notifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: 'Công nợ quá hạn',
    message: 'Khách hàng ABC có công nợ quá hạn 30 ngày',
    time: '5 phút trước',
    isRead: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Dòng tiền thấp',
    message: 'Tài khoản ngân hàng VCB sắp hết tiền',
    time: '15 phút trước',
    isRead: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Báo cáo mới',
    message: 'Báo cáo tài chính tháng 11 đã sẵn sàng',
    time: '1 giờ trước',
    isRead: true
  },
  {
    id: '4',
    type: 'success',
    title: 'Thanh toán thành công',
    message: 'Hóa đơn #INV-2024-001 đã được thanh toán',
    time: '2 giờ trước',
    isRead: true
  },
  {
    id: '5',
    type: 'warning',
    title: 'Hàng tồn kho thấp',
    message: 'Sản phẩm A1 chỉ còn 5 sản phẩm trong kho',
    time: '3 giờ trước',
    isRead: true
  }
];

export default function Header({ onToggleSidebar, onLogout, onMenuSelect }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsNotificationDropdownOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsUserDropdownOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
    setIsUserDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
  };

  const closeDropdowns = () => {
    setIsUserDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  const selectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
  };

  const handleLogout = () => {
    closeDropdowns();
    navigate('/login');
  };

  const handleProfileClick = () => {
    closeDropdowns();
    navigate('/profile');
  };

  const handleHelpClick = () => {
    closeDropdowns();
    navigate('/help-support');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'warning':
        return <Clock size={16} className="text-amber-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    const opacity = isRead ? 'bg-opacity-30' : 'bg-opacity-50';
    switch (type) {
      case 'error':
        return `bg-red-50 ${opacity} border-red-100`;
      case 'warning':
        return `bg-amber-50 ${opacity} border-amber-100`;
      case 'success':
        return `bg-green-50 ${opacity} border-green-100`;
      default:
        return `bg-blue-50 ${opacity} border-blue-100`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Trang chủ</span>
              <span>/</span>
              <span>Quản lý dữ liệu cơ bản</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Dashboard Tổng Quan</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Dropdown */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleLanguageDropdown}
            >
              <span className="text-lg">{selectedLanguage.flag}</span>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {selectedLanguage.code.toUpperCase()}
              </span>
              <ChevronDown 
                size={14} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isLanguageDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Language Dropdown Menu */}
            {isLanguageDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={closeDropdowns}
                />
                
                {/* Dropdown Content */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Globe size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Chọn ngôn ngữ</span>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => selectLanguage(language)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedLanguage.code === language.code 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="flex-1 text-left">{language.name}</span>
                        {selectedLanguage.code === language.code && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notification Dropdown */}
          <div className="relative">
            <button 
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleNotificationDropdown}
            >
              <Bell size={18} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotificationDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={closeDropdowns}
                />
                
                {/* Dropdown Content */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="py-2">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors border-l-3 ${
                              !notification.isRead ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {notification.time}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Không có thông báo nào</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Đánh dấu tất cả đã đọc
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-700">
                          Xem tất cả
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* User Dropdown */}
          <div className="relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
              onClick={toggleUserDropdown}
            >
              <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">NL</span>
              </div>
              <div className="text-sm hidden sm:block">
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

            {/* User Dropdown Menu */}
            {isUserDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={closeDropdowns}
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
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="mr-3 text-gray-400" />
                      Thông tin cá nhân
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings size={16} className="mr-3 text-gray-400" />
                      Cài đặt tài khoản
                    </button>
                    
                    <button 
                      onClick={handleHelpClick}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle size={16} className="mr-3 text-gray-400" />
                      Trợ giúp & Hỗ trợ
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Logout */}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
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