
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts';
import { Zap, TrendingUp } from 'lucide-react';

const INITIAL_DATA = [
  { area: 'Andheri', density: 85 },
  { area: 'Bandra', density: 60 },
  { area: 'Dharavi', density: 95 },
  { area: 'Juhu', density: 40 },
  { area: 'Dadar', density: 75 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isHigh = value > 80;
    return (
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-3 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-900">{value}%</span>
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isHigh ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {isHigh ? 'High Demand' : 'Stable'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const Heatmap: React.FC = () => {
  const [data, setData] = useState(INITIAL_DATA);

  // Simulate real-time data "breathing"
  useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => 
        currentData.map(item => ({
          ...item,
          density: Math.min(100, Math.max(20, item.density + (Math.random() * 6 - 3)))
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
      {/* Decorative background pulse */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl group-hover:bg-orange-50 transition-colors duration-1000" />
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Live Demand Hub
          </h3>
          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">AI-Predicted Zone Activity</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1.5 border border-blue-100">
          <TrendingUp size={12} /> Local Trends
        </div>
      </div>

      <div className="h-48 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="highDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={1}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="normalDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="area" 
              fontSize={10} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontWeight: 700}}
              dy={10}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', radius: 12}} />
            <Bar 
              dataKey="density" 
              radius={[8, 8, 8, 8]} 
              barSize={32}
              animationDuration={1500}
              animationEasing="ease-in-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.density > 80 ? 'url(#highDemand)' : 'url(#normalDemand)'} 
                  className="transition-all duration-1000"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <p className="text-[10px] text-gray-500 font-bold italic">
            Heavy demand in <span className="text-orange-600 font-black">Dharavi</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[8px] font-black text-gray-400 uppercase">Stable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[8px] font-black text-gray-400 uppercase">Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
