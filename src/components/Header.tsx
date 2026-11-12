import React from 'react';
import { RefreshCw, MapPin, Bookmark } from 'lucide-react';

interface HeaderProps {
  activeTab: 'directory' | 'map' | 'calculator' | 'favorites';
  setActiveTab: (tab: 'directory' | 'map' | 'calculator' | 'favorites') => void;
  favoritesCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLocateUser: () => void;
  isLocating: boolean;
  hasUserLocation: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  onRefresh,
  isRefreshing,
  onLocateUser,
  isLocating,
  hasUserLocation,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <span className="font-extrabold text-slate-950 text-base tracking-tighter">SG</span>
          </div>
          <button
            onClick={() => setActiveTab('directory')}
            className="text-left group cursor-pointer"
          >
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              SG Carpark Live
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, concise text with hover underline) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('directory')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            All Carparks
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
              activeTab === 'map'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
              activeTab === 'calculator'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            Rate Estimator
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
            {favoritesCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Locators */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onLocateUser}
            disabled={isLocating}
            title={hasUserLocation ? 'Location detected' : 'Detect my location'}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              hasUserLocation
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-bounce text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">
              {isLocating ? 'Locating...' : hasUserLocation ? 'Near You' : 'Find Near Me'}
            </span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-emerald-500/20 active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 py-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'directory' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          All Carparks
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'map' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Live Map
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Rate Estimator
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'favorites' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Bookmark className="w-3 h-3" />
          <span>Saved ({favoritesCount})</span>
        </button>
      </div>
    </header>
  );
};
