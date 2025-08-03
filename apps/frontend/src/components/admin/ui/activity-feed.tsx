import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ShoppingCart,
  User,
  Package,
  Settings,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'product' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
}

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order Received',
    description: 'Order #ORD-001 placed by John Doe',
    timestamp: '2 minutes ago',
    user: { name: 'John Doe' },
    status: 'success',
  },
  {
    id: '2',
    type: 'user',
    title: 'New User Registration',
    description: 'Jane Smith created a new account',
    timestamp: '15 minutes ago',
    user: { name: 'Jane Smith' },
    status: 'info',
  },
  {
    id: '3',
    type: 'product',
    title: 'Low Stock Alert',
    description: 'Premium Honey is running low (5 items left)',
    timestamp: '1 hour ago',
    status: 'warning',
  },
  {
    id: '4',
    type: 'order',
    title: 'Order Delivered',
    description: 'Order #ORD-002 has been delivered to customer',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    id: '5',
    type: 'system',
    title: 'System Backup Completed',
    description: 'Daily backup completed successfully',
    timestamp: '3 hours ago',
    status: 'success',
  },
  {
    id: '6',
    type: 'user',
    title: 'User Profile Updated',
    description: 'Bob Johnson updated his profile information',
    timestamp: '4 hours ago',
    user: { name: 'Bob Johnson' },
    status: 'info',
  },
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'order':
      return ShoppingCart;
    case 'user':
      return User;
    case 'product':
      return Package;
    case 'system':
      return Settings;
    default:
      return AlertCircle;
  }
};

const getStatusIcon = (status: ActivityItem['status']) => {
  switch (status) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertCircle;
    case 'error':
      return AlertCircle;
    default:
      return AlertCircle;
  }
};

const getStatusColor = (status: ActivityItem['status']) => {
  switch (status) {
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-blue-600';
  }
};

interface ActivityFeedProps {
  title?: string;
  maxItems?: number;
}

export function ActivityFeed({ title = 'Recent Activity', maxItems = 6 }: ActivityFeedProps) {
  const activities = mockActivities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const StatusIcon = getStatusIcon(activity.status);

            return (
              <div key={activity.id} className="flex items-start gap-3">
                {/* Activity Icon */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <StatusIcon
                        className={`h-3 w-3 ${getStatusColor(activity.status)}`}
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {activity.user && (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user.name}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t">
          <button className="text-sm text-primary hover:underline">
            View all activity →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
