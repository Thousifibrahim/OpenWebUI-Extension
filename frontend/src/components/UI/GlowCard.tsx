import React from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  intensity = 'medium'
}) => {
  const intensityClasses = {
    low: 'shadow-lg',
    medium: 'shadow-xl',
    high: 'shadow-2xl'
  };

  const glowColors = {
    blue: 'shadow-blue-500/25',
    purple: 'shadow-purple-500/25',
    pink: 'shadow-pink-500/25',
    green: 'shadow-green-500/25'
  };

  return (
    <div className={`
      bg-gradient-to-br from-gray-900 to-gray-800 
      border border-gray-700 
      rounded-2xl 
      transition-all duration-300 
      hover:scale-105 
      hover:border-gray-600
      ${intensityClasses[intensity]}
      ${glowColors[glowColor as keyof typeof glowColors]}
      hover:shadow-3xl
      ${className}
    `}>
      <div className="relative p-6 rounded-2xl bg-black/20 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;