import React from 'react';
import { sounds } from '../lib/sound';

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'teal' | 'mint' | 'green' | 'purple' | 'coral' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  soundType?: 'tap' | 'correct' | 'wrong' | 'win' | 'none';
}

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'teal',
  size = 'md',
  fullWidth = false,
  soundType = 'tap',
  onClick,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (soundType === 'tap') sounds.playTap();
    else if (soundType === 'correct') sounds.playCorrect();
    else if (soundType === 'wrong') sounds.playWrong();
    else if (soundType === 'win') sounds.playWin();

    if (onClick) {
      onClick(e);
    }
  };

  const variantClass = {
    teal: 'btn-teal',
    mint: 'btn-mint',
    green: 'btn-green',
    purple: 'btn-purple',
    coral: 'btn-coral',
    white: 'btn-white',
  }[variant] || 'btn-teal';

  const sizeClass = {
    sm: 'text-xs py-1.5 px-3 min-h-[38px] rounded-xl',
    md: 'text-sm py-2.5 px-5 min-h-[46px] rounded-2xl',
    lg: 'text-base py-3.5 px-6 min-h-[54px] rounded-2xl font-black',
    icon: 'p-2.5 min-w-[44px] min-h-[44px] rounded-2xl',
  }[size];

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      className={`btn-3d ${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
};
