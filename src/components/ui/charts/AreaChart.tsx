'use client';
import React from 'react';
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AreaChartProps {
  data: Record<string, string | number>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (v: number) => string;
  className?: string;
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export function AreaChart({ data, index, categories, colors = DEFAULT_COLORS, valueFormatter, className }: AreaChartProps) {
  const fmt = valueFormatter ?? ((v: number) => String(v));
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <ReAreaChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
          <defs>
            {categories.map((cat, i) => (
              <linearGradient key={cat} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} stopOpacity={0.15} />
                <stop offset="95%" stopColor={colors[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={index} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={76} />
          <Tooltip formatter={(v) => fmt(Number(v))} />
          <Legend />
          {categories.map((cat, i) => (
            <Area
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={colors[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              strokeWidth={2}
              fill={`url(#color-${i})`}
            />
          ))}
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
