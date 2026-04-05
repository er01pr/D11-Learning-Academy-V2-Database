import React from 'react';

export const LessonSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
    {/* Video placeholder */}
    <div className="w-full aspect-video bg-fwd-grey rounded-xl" />
    {/* Content card */}
    <div className="bg-white rounded-3xl border border-fwd-grey/50 p-8 space-y-4">
      <div className="h-8 bg-fwd-grey rounded-lg w-3/4" />
      <div className="h-4 bg-fwd-grey/60 rounded w-full" />
      <div className="h-4 bg-fwd-grey/60 rounded w-5/6" />
      <div className="h-4 bg-fwd-grey/60 rounded w-2/3" />
      <div className="pt-6 border-t border-fwd-grey flex gap-4">
        <div className="h-12 bg-fwd-grey rounded-xl w-40" />
        <div className="h-12 bg-fwd-grey rounded-xl w-40" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
    <div className="h-10 bg-fwd-grey rounded-lg w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-fwd-grey h-24" />
      ))}
    </div>
    <div className="bg-white rounded-3xl border border-fwd-grey p-6 space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-14 bg-fwd-grey/40 rounded-xl" />
      ))}
    </div>
  </div>
);

export const SidebarSkeleton: React.FC = () => (
  <div className="p-4 space-y-4 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-fwd-grey rounded w-2/3" />
        {[1, 2, 3].map(j => (
          <div key={j} className="h-10 bg-fwd-grey/40 rounded-xl ml-2" />
        ))}
      </div>
    ))}
  </div>
);
