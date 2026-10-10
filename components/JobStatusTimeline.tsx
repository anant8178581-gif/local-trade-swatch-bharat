import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  Sparkles, 
  ArrowRight,
  Radio
} from 'lucide-react';
import { Job } from '../types';

export interface JobStatusTimelineProps {
  job: Job;
  isWorker?: boolean;
  onUpdateStatus?: (jobId: string, nextStatus: Job['status'], note?: string) => void;
}

interface TimelineMilestone {
  key: 'pending' | 'assigned' | 'on_site' | 'completed';
  label: string;
  title: string;
  description: string;
  timestamp: string;
  state: 'completed' | 'current' | 'upcoming';
  icon: React.ReactNode;
}

export const JobStatusTimeline: React.FC<JobStatusTimelineProps> = ({
  job,
  isWorker,
  onUpdateStatus
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Normalize status
  const normalizedStatus = job.status === 'on-site' ? 'on_site' : job.status;

  // Milestone order mapping
  const statusLevels: Record<string, number> = {
    'pending': 1,
    'assigned': 2,
    'on_site': 3,
    'completed': 4,
    'incomplete': 2.5,
    'requires_attention': 2.5
  };

  const currentLevel = statusLevels[normalizedStatus] || 1;

  // Generate milestone timeline
  const milestones: TimelineMilestone[] = [
    {
      key: 'pending',
      label: 'Step 1: Broadcast',
      title: 'Gig Posted & Broadcasted',
      description: 'Customer created requirement in Mumbai. Notified nearby certified trades.',
      timestamp: 'Today, 10:15 AM',
      state: currentLevel > 1 ? 'completed' : currentLevel === 1 ? 'current' : 'upcoming',
      icon: <Radio size={14} className={currentLevel >= 1 ? 'text-white' : 'text-slate-400'} />
    },
    {
      key: 'assigned',
      label: 'Step 2: Assignment',
      title: 'Artisan Matched & Route Plotted',
      description: `Matched with certified artisan. Worksite navigation dispatched.`,
      timestamp: currentLevel >= 2 ? 'Today, 10:22 AM' : 'Awaiting worker match',
      state: currentLevel > 2 ? 'completed' : currentLevel === 2 ? 'current' : 'upcoming',
      icon: <UserCheck size={14} className={currentLevel >= 2 ? 'text-white' : 'text-slate-400'} />
    },
    {
      key: 'on_site',
      label: 'Step 3: On-Site Work',
      title: 'Artisan Arrived On-Site',
      description: `Technician at ${job.location.split(',')[0] || 'worksite'}. Tooling and diagnostics underway.`,
      timestamp: currentLevel >= 3 ? 'Today, 10:45 AM' : 'Estimated ~8 mins after dispatch',
      state: currentLevel > 3 ? 'completed' : currentLevel === 3 ? 'current' : 'upcoming',
      icon: <MapPin size={14} className={currentLevel >= 3 ? 'text-white' : 'text-slate-400'} />
    },
    {
      key: 'completed',
      label: 'Step 4: Completion',
      title: 'Work Completed & Verified',
      description: 'Quality inspected under guarantee. Settle payment directly via UPI (0% fee).',
      timestamp: currentLevel >= 4 ? 'Today, 11:30 AM' : 'Final sign-off & digital receipt',
      state: currentLevel === 4 ? 'completed' : 'upcoming',
      icon: <ShieldCheck size={14} className={currentLevel === 4 ? 'text-white' : 'text-slate-400'} />
    }
  ];

  // Current milestone label for summary header
  const activeMilestone = milestones.find(m => m.state === 'current') || milestones[milestones.length - 1];

  return (
    <div className="mb-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
      {/* Header with expand/collapse */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 bg-gradient-to-r from-slate-100 to-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Clock size={12} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Progress Timeline
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                normalizedStatus === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : normalizedStatus === 'on_site'
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : normalizedStatus === 'assigned'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {normalizedStatus === 'on_site' ? 'Step 3: On-Site' : normalizedStatus === 'assigned' ? 'Step 2: Assigned' : normalizedStatus === 'completed' ? 'Step 4: Completed' : 'Step 1: Pending'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate">
              {activeMilestone.title}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors flex-shrink-0"
          aria-label={isExpanded ? "Collapse Timeline" : "Expand Timeline"}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Vertical Timeline Body */}
      {isExpanded && (
        <div className="p-3.5 pt-3 space-y-3">
          {/* Dispute alert node if applicable */}
          {(job.status === 'requires_attention' || job.status === 'incomplete') && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 mb-2">
              <AlertTriangle size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">Attention / Incomplete Review Active</span>
                <span className="text-[11px] text-rose-800 leading-snug">
                  {job.attentionReason || 'Dispute mediation active. Review requested before final completion.'}
                </span>
              </div>
            </div>
          )}

          {/* Vertical Stepper List */}
          <div className="relative pl-1 space-y-4">
            {milestones.map((milestone, idx) => {
              const isLast = idx === milestones.length - 1;
              const isCurrent = milestone.state === 'current';
              const isDone = milestone.state === 'completed';

              return (
                <div key={milestone.key} className="relative flex items-start gap-3 group">
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div 
                      className={`absolute left-[13px] top-[26px] bottom-[-16px] w-[2px] transition-colors ${
                        isDone ? 'bg-emerald-500' : 'bg-slate-200 border-l border-dashed border-slate-300'
                      }`} 
                    />
                  )}

                  {/* Bullet Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                        : 'bg-slate-200 text-slate-400 border border-slate-300'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 size={15} strokeWidth={2.5} />
                      ) : (
                        milestone.icon
                      )}
                    </div>
                  </div>

                  {/* Milestone Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isDone 
                            ? 'text-emerald-700' 
                            : isCurrent 
                            ? 'text-blue-700' 
                            : 'text-slate-400'
                        }`}>
                          {milestone.label}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        {milestone.timestamp}
                      </span>
                    </div>

                    <h5 className={`text-xs font-bold leading-snug mt-0.5 ${
                      isDone || isCurrent ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {milestone.title}
                    </h5>

                    <p className={`text-[11px] leading-relaxed mt-0.5 ${
                      isCurrent ? 'text-slate-700 font-medium' : 'text-slate-500'
                    }`}>
                      {milestone.description}
                    </p>

                    {/* Quick advance button for workers on the current step */}
                    {isWorker && onUpdateStatus && isCurrent && (
                      <div className="pt-2">
                        {milestone.key === 'pending' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(job.id, 'assigned', 'Artisan accepted gig requirement');
                            }}
                            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                          >
                            <span>Accept & Mark Assigned</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                        {milestone.key === 'assigned' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(job.id, 'on_site', 'Artisan reached worksite location');
                            }}
                            className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                          >
                            <MapPin size={12} />
                            <span>Mark as Arrived On-Site</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                        {milestone.key === 'on_site' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(job.id, 'completed', 'Work verified and completed by artisan');
                            }}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                          >
                            <CheckCircle2 size={12} />
                            <span>Mark Work Completed</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobStatusTimeline;
