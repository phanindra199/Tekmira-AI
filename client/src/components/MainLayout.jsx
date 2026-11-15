import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Main Application Shell Layout
 * Coordinates top Navbar, responsive Sidebar drawer, content viewport, and Footer.
 */
export default function MainLayout({
  children,
  title,
  description,
  withSidebar = true,
  actionButton = null,
  breadcrumbs = null
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar automatically whenever URL/route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-coral-500 selection:text-white">
      {/* Top Application Header */}
      <Navbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* Center Layout Container */}
      <div className="flex-1 flex w-full relative">
        {/* Responsive Sidebar */}
        {withSidebar && (
          <Sidebar
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Content Viewport */}
        <main className={`flex-1 ${withSidebar ? 'p-4 sm:p-6 lg:p-8' : 'w-full'} min-w-0`}>
          <div className={`${withSidebar ? 'max-w-6xl mx-auto' : 'w-full'}`}>
            
            {/* Unified Header */}
            {(title || breadcrumbs || actionButton) && (
              <div className="mb-6 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {breadcrumbs && (
                    <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                      {breadcrumbs}
                    </div>
                  )}
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                {actionButton && <div className="shrink-0">{actionButton}</div>}
              </div>
            )}

            {/* Page Body */}
            {children}
          </div>
        </main>
      </div>

      {/* Application Footer */}
      <Footer />
    </div>
  );
}
