import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ header, footer, className = '', children, ...props }) => (
  <div className={`card ${className}`} {...props}>
    {header && <div className="px-5 pt-5 pb-3 border-b border-gray-100">{header}</div>}
    <div className="p-5">
      {children}
    </div>
    {footer && <div className="px-5 pb-5 pt-3 border-t border-gray-100">{footer}</div>}
  </div>
);

export default Card;

