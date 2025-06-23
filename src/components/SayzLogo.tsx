'use client';

import Image from 'next/image';

interface SayzLogoProps {
  size?: number;
  className?: string;
}

export function SayzLogo({ size = 40, className = '' }: SayzLogoProps) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Image
        src="/logo_t.png"
        alt="Sayz"
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}

export function SayzIcon({ size = 32, className = '' }: SayzLogoProps) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Image
        src="/logo_t.png"
        alt="Sayz"
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
} 