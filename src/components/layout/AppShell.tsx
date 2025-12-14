import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { CommandPalette } from './CommandPalette';
import { Onboarding, useOnboarding } from '@/components/onboarding/Onboarding';

export const AppShell: React.FC = () => {
  const { sidebarCollapsed, rightPanelOpen } = useApp();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return (
    <>
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      
      <div className="min-h-screen bg-background flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Right Panel */}
        <RightPanel />

        {/* Command Palette */}
        <CommandPalette />
      </div>
    </>
  );
};
