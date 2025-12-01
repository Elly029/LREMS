import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-neutral-200 rounded ${className}`} />
);

export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[0,1,2].map((i) => (
      <div key={i} className="card p-5">
        <SkeletonLine className="h-3 w-24 mb-3" />
        <SkeletonLine className="h-8 w-28 mb-2" />
        <SkeletonLine className="h-3 w-20" />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {["Code","Area","Grade","Publisher","Title","Status","Remarks","Actions"].map((h) => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
              <SkeletonLine className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <tr key={idx}>
            {[0,1,2,3,4,5,6].map((i) => (
              <td key={i} className="px-4 py-3">
                <SkeletonLine className="h-4 w-[60%]" />
              </td>
            ))}
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <SkeletonLine className="h-8 w-16" />
                <SkeletonLine className="h-8 w-16" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

