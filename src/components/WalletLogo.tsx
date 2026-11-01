import React from 'react';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop, ClipPath, G } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
}

// Wallet + keyhole logo matching the app icon aesthetic.
// ViewBox 64×64, scales to any size.
export function WalletLogo({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Card gradient */}
        <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#7B9FFF" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#4F72FF" stopOpacity="0.25" />
        </LinearGradient>
        {/* Wallet body gradient */}
        <LinearGradient id="walletGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#AABFFF" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#4F72FF" stopOpacity="0.18" />
        </LinearGradient>
        {/* Band gradient */}
        <LinearGradient id="bandGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#000000" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.35" />
        </LinearGradient>
      </Defs>

      {/* Card peeking from top-right behind wallet */}
      <Rect
        x="26" y="9" rx="7" ry="7"
        width="30" height="20"
        fill="url(#cardGrad)"
        stroke={Colors.accentBorder}
        strokeWidth="1"
      />

      {/* Main wallet body */}
      <Rect
        x="8" y="20" rx="9" ry="9"
        width="48" height="35"
        fill="url(#walletGrad)"
        stroke={Colors.accentBorder}
        strokeWidth="1.2"
      />

      {/* Dark band across the middle */}
      <Rect
        x="8" y="32" rx="0" ry="0"
        width="48" height="13"
        fill="url(#bandGrad)"
      />
      {/* Round the band's left/right edges to stay within wallet */}
      <Rect x="8" y="32" width="4" height="13" fill="url(#walletGrad)" />
      <Rect x="52" y="32" width="4" height="13" fill="url(#walletGrad)" />

      {/* Keyhole: circle top + trapezoid stem */}
      <Circle cx="32" cy="36" r="4.5" fill={Colors.accent} />
      <Path
        d="M29.5 39.5 L27.5 46 L36.5 46 L34.5 39.5 Z"
        fill={Colors.accent}
      />

      {/* Accent border highlight on bottom of wallet */}
      <Rect
        x="8" y="52" rx="0" ry="0"
        width="48" height="3"
        fill={Colors.accent}
        opacity="0.15"
      />
    </Svg>
  );
}
