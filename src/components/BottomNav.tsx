import React from 'react';
import { Map, Compass, Layers, Trophy } from 'lucide-react';
import { sounds } from '../lib/sound';

export type NavTabId = 'grammar' | 'vocab' | 'flashcards' | 'league';

interface BottomNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'grammar' as NavTabId,
      label: 'نقشه گرامر',
      icon: Map,
    },
    {
      id: 'vocab' as NavTabId,
      label: 'نقشه واژگان',
      icon: Compass,
    },
    {
      id: 'flashcards' as NavTabId,
      label: 'فلش‌کارت',
      icon: Layers,
    },
    {
      id: 'league' as NavTabId,
      label: 'لیگ برتر',
      icon: Trophy,
    },
  ];

  const handleTabClick = (tabId: NavTabId) => {
    if (tabId !== activeTab) {
      sounds.playTap();
      onSelectTab(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4EEE9] shadow-[0_-2px_16px_rgba(29,43,51,0.04)] px-3 py-2">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 touch-manipulation min-h-[54px] ${
                isActive
                  ? 'bg-[#1F9A8A] text-white shadow-[0_3px_0_#12746B] -translate-y-0.5'
                  : 'text-[#6B7C85] hover:bg-[#DDF3EC]/50 hover:text-[#1D2B33] active:translate-y-0.5'
              }`}
            >
              <div className={`relative ${isActive ? 'animate-bounce-slight' : ''}`}>
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'stroke-white stroke-[2.2]'
                      : 'stroke-[#6B7C85] stroke-[1.8]'
                  }`}
                />
              </div>

              <span
                className={`text-[11px] font-black tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-[#6B7C85]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
