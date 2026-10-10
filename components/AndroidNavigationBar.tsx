import React from 'react';
import { ChevronLeft, Circle, Square, RotateCcw, Home as HomeIcon } from 'lucide-react';

interface AndroidNavigationBarProps {
  navMode: 'gesture' | 'buttons';
  onBack: () => void;
  onHome: () => void;
  onOverview: () => void;
  onToggleNavMode: () => void;
}

const AndroidNavigationBar: React.FC<AndroidNavigationBarProps> = ({
  navMode,
  onBack,
  onHome,
  onOverview,
  onToggleNavMode
}) => {
  return (
    <div className="bg-gray-950 text-gray-300 py-1.5 px-6 flex justify-around items-center select-none border-t border-gray-800 relative z-30">
      {navMode === 'gesture' ? (
        <div className="w-full flex justify-between items-center px-4 py-1">
          <button 
            onClick={onBack}
            className="p-1 hover:text-white text-gray-400 active:scale-90 transition-all"
            title="Back"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Center gesture handle pill */}
          <div 
            onClick={onHome}
            className="w-32 h-1.5 bg-gray-400 hover:bg-white rounded-full cursor-pointer transition-colors active:scale-95 shadow-sm"
            title="Swipe / Click for Home"
          />

          <button 
            onClick={onOverview}
            className="p-1 hover:text-white text-gray-400 active:scale-90 transition-all text-[10px] font-bold tracking-tighter uppercase"
            title="App Overview"
          >
            <Square size={16} />
          </button>
        </div>
      ) : (
        <div className="w-full flex justify-around items-center py-1">
          {/* Triangle / Back */}
          <button 
            onClick={onBack}
            className="p-2 hover:text-white text-gray-400 active:scale-90 transition-all flex items-center justify-center"
            title="Back"
          >
            <div className="w-0 h-0 border-y-[7px] border-y-transparent border-r-[12px] border-r-gray-300 hover:border-r-white" />
          </button>

          {/* Circle / Home */}
          <button 
            onClick={onHome}
            className="p-2 hover:text-white text-gray-400 active:scale-90 transition-all flex items-center justify-center"
            title="Home"
          >
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-white" />
          </button>

          {/* Square / Multitask Overview */}
          <button 
            onClick={onOverview}
            className="p-2 hover:text-white text-gray-400 active:scale-90 transition-all flex items-center justify-center"
            title="Recent Apps"
          >
            <div className="w-3.5 h-3.5 border-2 border-gray-300 hover:border-white rounded-sm" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AndroidNavigationBar;
