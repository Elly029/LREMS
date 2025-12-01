import React from 'react';

export const SkipNavLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only fixed top-2 left-2 z-50 bg-white text-gray-900 border border-gray-200 rounded px-3 py-1 shadow-sm"
  >
    Skip to content
  </a>
);

export default SkipNavLink;

