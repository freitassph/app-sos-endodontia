import React from 'react';

export const BrandMark: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <img src="/assets/sos-endo-mark-64.png" alt="" aria-hidden="true" className={`${className} object-contain`} />
);
