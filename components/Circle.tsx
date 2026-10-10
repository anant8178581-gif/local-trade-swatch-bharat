
import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  HandHelping, 
  MapPin, 
  Search, 
  Plus, 
  ShieldCheck, 
  Zap, 
  Hammer,
  Trophy,
  ArrowRight,
  X,
  Target
} from 'lucide-react';
import { Worker } from '../types';

const NEARBY_WORKERS: Partial<Worker>[] = [
  { id: 'w1', name: 'Arjun D.', photoUrl: 'https://images.unsplash.com/photo-1540560485458-3473b307985c?w=100', verified: true },
  { id: 'w2', name: 'Meera J.', photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100', verified: true },
  { id: 'w3', name: 'Sameer S.', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', verified: true },
  { id: 'w4', name: 'Ishaan K.', photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100', verified: false },
  { id: 'w5', name: 'Zoya K.', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', verified: true },
];

const FEEDS = [
  {
    id: 'f1',
    author: 'Arjun D.',
    type: 'help',
    text: 'Need a second person for a heavy AC installation in Bandra East. Payout: ₹300 for 1 hour.',
    time: '5m ago',
    responses: 2,
    location: 'Bandra'
  },
  {
    id: 'f2',
    author: 'Ishaan K.',
    type: 'tip',
    text: 'Avoid the main road near Dadar station, heavy traffic. Hard to find parking for tool kits today!',
    time: '20m ago',
    responses: 12,
    location: 'Dadar'
  }
];

const TRADE_CIRCLES = [
  { id: 'c1', name: 'Dharavi Electricians Guild', members: 124, active: 12, rating: 4.9, icon: <Zap size={20} /> },
  { id: 'c2', name: 'Bandra Plumbing Masters', members: 86, active: 5, rating: 4.7, icon: <Target size={20} /> },
  { id: 'c3', name: 'Mumbai Carpentry Collective', members: 210, active: 18, rating: 4.8, icon: <Hammer size={20} /> },
];

const Circle: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'circles'>('feed');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState("");

  const handleCreateCircle = () => {
    if(!newCircleName.trim()) return;
    alert(`Successfully created the trade circle: ${newCircleName}!`);
    setShowCreateModal(false);
    setNewCircleName("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 animate-in fade-in duration-500 relative">
      {/* Tabs */}
      <div className="bg-white px-6 pt-4 border-b sticky top-0 z-20">
        <div className="flex gap-8 border-b border-transparent">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
          >
            Live Feed
          </button>
          <button 
            onClick={() => setActiveTab('circles')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'circles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
          >
            Trade Circles
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="flex-1 overflow-y-auto">
          {/* Search & Stats */}
          <div className="p-4 bg-white border-b">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search community tips..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-blue-50 p-3 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Active Nearby</p>
                <p className="text-xl font-black text-blue-900">42 Workers</p>
              </div>
              <div className="flex-1 bg-green-50 p-3 rounded-2xl border border-green-100">
                <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Help Requests</p>
                <p className="text-xl font-black text-green-900">8 Open</p>
              </div>
            </div>
          </div>

          {/* Online Now */}
          <div className="p-4 bg-white border-b">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap size={14} className="text-yellow-500 fill-yellow-500" /> Online Now
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {NEARBY_WORKERS.map(worker => (
                <div key={worker.id} className="flex flex-col items-center gap-1 min-w-[64px]">
                  <div className="relative">
                    <img src={worker.photoUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt={worker.name} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 text-center">{worker.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Content */}
          <div className="p-4 space-y-4">
            {FEEDS.map(post => (
              <div key={post.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${post.author}`} alt={post.author} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1">{post.author}</h4>
                      <p className="text-[10px] text-gray-400 font-medium">{post.time} • {post.location}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${post.type === 'help' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {post.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.text}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <button className="flex items-center gap-1.5 text-gray-400 text-xs font-bold"><MessageSquare size={14} /> {post.responses} Responses</button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-md shadow-blue-100">
                    <HandHelping size={14} /> Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="bg-gradient-to-br from-[#2D4356] to-[#1a2a38] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <Trophy className="text-orange-400 mb-4" size={32} />
               <h3 className="text-xl font-black uppercase tracking-tight">Trade Guilds</h3>
               <p className="text-xs text-blue-100 font-medium mt-2">Join a specialized circle to get higher priority jobs, share bulk inventory, and build local reputation.</p>
               <button 
                onClick={() => setShowCreateModal(true)}
                className="mt-6 bg-white text-[#2D4356] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all"
               >
                 <Plus size={16} /> Create My Circle
               </button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Recommended Circles</h4>
            {TRADE_CIRCLES.map(circle => (
              <div key={circle.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    {circle.icon}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-gray-900 tracking-tight">{circle.name}</h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{circle.members} Members</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">{circle.active} Online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Joined ${circle.name}!`)}
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all group-hover:bg-blue-50 group-hover:text-blue-600"
                >
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post to Circle FAB (Feed only) */}
      {activeTab === 'feed' && (
        <button className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all z-30">
          <Plus size={16} /> Post Tip
        </button>
      )}

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 animate-in zoom-in duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase">New Circle</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Circle Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bandra AC Pros" 
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-black"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-gray-500 font-medium italic">Creating a circle makes you the 'Lead Pro'. You'll manage verification requests within the guild.</p>
              <button 
                onClick={handleCreateCircle}
                className="w-full py-5 bg-[#2D4356] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Launch Circle <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Circle;
