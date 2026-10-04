import React from 'react';

interface AdminMetricsProps {
  totalPosts: number;
  draftsCount: number;
  publishedCount: number;
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({
  draftsCount,
  publishedCount,
}) => {
  return (
    <div className="w-full border-b border-[rgba(255,255,255,0.05)] px-6 sm:px-10 py-3 flex items-center justify-between text-xs font-mono text-[#8c9e97] bg-[#091614]">
      {/* Cleansed Top Stats Area: Single ultra-thin metrics bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="text-neutral-200">Published: {publishedCount}</span>
        <span className="text-[#3a4d46]">/</span>
        <span className="text-neutral-200">Drafts: {draftsCount}</span>
        <span className="text-[#3a4d46]">/</span>
        <span className="flex items-center gap-1.5 text-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
          <span>Local Mode: Active</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-2 text-[11px] text-[#556961]">
        <span>Zero Cloud Dependency</span>
        <span>·</span>
        <span>Physical Disk NVRAM</span>
      </div>
    </div>
  );
};
