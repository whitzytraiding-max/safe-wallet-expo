import React from 'react';
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from 'react-native-svg';

const DATA = [48, 52, 45, 58, 55, 62, 60, 68, 65, 72, 70, 75, 72, 80, 78, 82, 85, 80, 88, 92];

interface Props {
  width: number;
  height?: number;
  color?: string;
}

export function Sparkline({ width, height = 52, color = '#4F72FF' }: Props) {
  const min = Math.min(...DATA);
  const max = Math.max(...DATA);
  const range = max - min || 1;
  const pad = 4;

  const points = DATA.map((v, i) => {
    const x = pad + (i / (DATA.length - 1)) * (width - pad * 2);
    const y = pad + ((max - v) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Fill path: trace the line then drop to bottom
  const ptArr = DATA.map((v, i) => ({
    x: pad + (i / (DATA.length - 1)) * (width - pad * 2),
    y: pad + ((max - v) / range) * (height - pad * 2),
  }));
  const fillD =
    'M ' + ptArr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ') +
    ` L ${(width - pad).toFixed(1)},${height} L ${pad},${height} Z`;

  return (
    <Svg width={width} height={height} style={{ marginTop: 8 }}>
      <Defs>
        <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={fillD} fill="url(#fillGrad)" />
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
