import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
      }}
    >
      <Navbar onToggleSidebar={toggleSidebar} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
            overflowX: 'hidden',
          }}
          className="main-content-area"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
