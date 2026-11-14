import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function PageLayout({
  children,
  title,
  description,
  withSidebar = false,
  actionButton = null,
  breadcrumbs = null
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Optional Sidebar */}
        {withSidebar && <Sidebar />}

        {/* Content Area */}
        <main className={`flex-1 ${withSidebar ? 'p-4 sm:p-6 lg:p-8' : 'w-full'}`}>
          <div className={`${withSidebar ? 'max-w-6xl mx-auto' : 'w-full'}`}>
            
            {/* Standard Header (if title is provided) */}
            {(title || breadcrumbs || actionButton) && (
              <div className="mb-8 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                {actionButton && <div>{actionButton}</div>}
              </div>
            )}

            {/* Page Body */}
            {children}
          </div>
        </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
