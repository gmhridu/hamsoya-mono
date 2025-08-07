import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="text-xl sm:text-2xl font-bold truncate">{value}</div>
        {(description || trend) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            <span className="truncate">{trend?.label || description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
