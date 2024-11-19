import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { DashboardProvider } from '../contexts/DashboardContext';
import { staffMenuItems } from '../contexts/MenuItems';
import StaffPreReview from './StaffPreReview';
import StaffDoubleBlind from './StaffDoubleBlind';
import StaffAccepted from './StaffAccepted';
import StaffPublished from './StaffPublished';
import StaffRejected from './StaffRejected';
import StaffReviewersInfo from './StaffReviewersInfo';
import StaffEditorsInfo from './StaffEditorsInfo';
import StaffLayouting from './StaffLayouting';
import StaffFinalProofreading from './StaffFinalProofreading';
import DashboardContent from './DashboardContent';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import logoImage from '../assets/logo.png';

const StaffDashboard: React.FC = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    'pre-review': false,
    'accepted': false
  });
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'pre-review-upload':
      case 'pre-review-records':
        return <StaffPreReview activeSubTab={activeTab} />;
      case 'double-blind':
        return <StaffDoubleBlind />;
      case 'layouting':
        return <StaffLayouting />;
      case 'final-proofreading':
        return <StaffFinalProofreading />;
      case 'published':
        return <StaffPublished />;
      case 'rejected':
        return <StaffRejected />;
      case 'reviewers-info':
        return <StaffReviewersInfo />;
      case 'editors-info':
        return <StaffEditorsInfo />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div 
          className={`bg-[#000765] text-white w-64 fixed h-full transition-all duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col`}
        >
          {/* Fixed header part of sidebar */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={logoImage} 
                alt="MJST Logo" 
                className="w-16 h-16 object-contain rounded"
              />
            </div>
            <h1 className="text-xl font-bold text-center">MJST Monitoring System</h1>
          </div>

          {/* Scrollable navigation part */}
          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {staffMenuItems.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="px-6 mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h2>
                <div>
                  {section.items.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (item.items) {
                            toggleSubmenu(item.id);
                          } else {
                            setActiveTab(item.id);
                          }
                        }}
                        className={`w-full text-left py-3 px-6 hover:bg-blue-800 transition duration-200 flex items-center justify-between ${
                          activeTab === item.id || (item.items && item.items.some(subItem => subItem.id === activeTab))
                            ? 'bg-blue-800'
                            : ''
                        }`}
                      >
                        <div className="flex items-center">
                          {item.icon && <item.icon size={18} className="mr-3" />}
                          <span>{item.name}</span>
                        </div>
                        {item.items && (
                          expandedMenus[item.id] ? (
                            <ChevronDown size={16} className="transition-transform duration-200" />
                          ) : (
                            <ChevronRight size={16} className="transition-transform duration-200" />
                          )
                        )}
                      </button>
                      {item.items && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedMenus[item.id] ? 'max-h-96' : 'max-h-0'
                          }`}
                        >
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => setActiveTab(subItem.id)}
                              className={`w-full text-left py-2 px-8 hover:bg-blue-800 transition duration-200 flex items-center ${
                                activeTab === subItem.id ? 'bg-blue-800' : ''
                              }`}
                            >
                              {subItem.icon && <subItem.icon size={16} className="mr-3" />}
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* Header */}
          <header className="bg-[#000765] shadow-sm z-10">
            <div className="flex items-center justify-between px-6 py-4">
              <button onClick={toggleSidebar} className="text-white focus:outline-none">
                <Menu size={24} />
              </button>
              <div className="flex items-center">
                <button
                  onClick={handleLogoutClick}
                  className="text-white hover:text-gray-200 flex items-center space-x-2"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              <h3 className="text-gray-700 text-3xl font-medium mb-4">
                {activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              {renderContent()}
            </div>
          </main>
        </div>

        <LogoutConfirmationModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      </div>
    </DashboardProvider>
  );
};

export default StaffDashboard;