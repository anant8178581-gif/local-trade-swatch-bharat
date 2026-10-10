
import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 64, showText = false, className = "" }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Main Blue Circular Segments */}
        <path
          d="M170 100C170 138.66 138.66 170 100 170C61.3401 170 30 138.66 30 100C30 61.3401 61.3401 30 100 30"
          stroke="#2D4356"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Central Ashoka Chakra / Tech Gear */}
        <circle cx="100" cy="100" r="22" stroke="#2D4356" strokeWidth="2" />
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="100"
            x2={100 + 22 * Math.cos((i * 15 * Math.PI) / 180)}
            y2={100 + 22 * Math.sin((i * 15 * Math.PI) / 180)}
            stroke="#2D4356"
            strokeWidth="1"
          />
        ))}
        
        {/* Circuit Nodes */}
        <path d="M78 85H65M78 100H60M78 115H65" stroke="#2D4356" strokeWidth="2" strokeLinecap="round" />
        <circle cx="62" cy="85" r="3" fill="#2D4356" />
        <circle cx="57" cy="100" r="3" fill="#2D4356" />
        <circle cx="62" cy="115" r="3" fill="#2D4356" />
        
        <path d="M122 85H135M122 100H140M122 115H135" stroke="#2D4356" strokeWidth="2" strokeLinecap="round" />
        <circle cx="138" cy="85" r="3" fill="#2D4356" />
        <circle cx="143" cy="100" r="3" fill="#2D4356" />
        <circle cx="138" cy="115" r="3" fill="#2D4356" />

        {/* Top Hand Shell */}
        <path
          d="M70 40C85 30 115 30 130 40"
          stroke="#F37021"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <rect x="110" y="25" width="25" height="15" rx="4" fill="#F37021" />
        <circle cx="122" cy="32.5" r="2.5" fill="white" />

        {/* Bottom Hand Shell */}
        <path
          d="M70 160C85 170 115 170 130 160"
          stroke="#F37021"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <rect x="65" y="160" width="25" height="15" rx="4" fill="#F37021" />
        <circle cx="77.5" cy="167.5" r="2.5" fill="white" />
        
        {/* Connection Points */}
        <circle cx="30" cy="100" r="10" fill="#F37021" stroke="white" strokeWidth="3" />
        <circle cx="170" cy="100" r="10" fill="#F37021" stroke="white" strokeWidth="3" />
      </svg>
      {showText && (
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-black tracking-tighter">
            <span className="text-[#2D4356]">Local Trades</span> <span className="text-[#F37021]">India</span>
          </h1>
          <p className="text-[9px] font-bold text-[#2D4356] uppercase tracking-widest mt-1 opacity-80">
            Connecting Verified Workers Directly to People
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
