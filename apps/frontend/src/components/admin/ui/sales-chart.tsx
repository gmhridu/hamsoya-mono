'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Mock data for different time periods
const mockData = {
  daily: [
    { name: 'Mon', sales: 2400, orders: 24 },
    { name: 'Tue', sales: 1398, orders: 18 },
    { name: 'Wed', sales: 9800, orders: 45 },
    { name: 'Thu', sales: 3908, orders: 32 },
    { name: 'Fri', sales: 4800, orders: 38 },
    { name: 'Sat', sales: 3800, orders: 29 },
    { name: 'Sun', sales: 4300, orders: 35 },
  ],
  weekly: [
    { name: 'Week 1', sales: 24000, orders: 240 },
    { name: 'Week 2', sales: 18000, orders: 180 },
    { name: 'Week 3', sales: 32000, orders: 320 },
    { name: 'Week 4', sales: 28000, orders: 280 },
  ],
  monthly: [
    { name: 'Jan', sales: 65000, orders: 650 },
    { name: 'Feb', sales: 59000, orders: 590 },
    { name: 'Mar', sales: 80000, orders: 800 },
    { name: 'Apr', sales: 81000, orders: 810 },
    { name: 'May', sales: 56000, orders: 560 },
    { name: 'Jun', sales: 55000, orders: 550 },
  ],
};

type ChartType = 'area' | 'line' | 'bar';
type TimePeriod = 'daily' | 'weekly' | 'monthly';

interface SalesChartProps {
  title?: string;
  defaultChartType?: ChartType;
  defaultTimePeriod?: TimePeriod;
  height?: number;
}

export function SalesChart({
  title = 'Sales Overview',
  defaultChartType = 'area',
  defaultTimePeriod = 'daily',
  height = 300,
}: SalesChartProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(defaultTimePeriod);

  const data = mockData[timePeriod];

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `৳${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            Sales: ৳{payload[0].value?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorSales)"
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `৳${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            Sales: ৳{payload[0].value?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `৳${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            Sales: ৳{payload[0].value?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Time Period Buttons */}
            <div className="flex rounded-md border">
              {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimePeriod(period)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>

            {/* Chart Type Buttons */}
            <div className="flex rounded-md border">
              {(['area', 'line', 'bar'] as ChartType[]).map((type) => (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
