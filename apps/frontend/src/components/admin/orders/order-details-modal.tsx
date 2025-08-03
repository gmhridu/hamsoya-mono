'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

// Mock order items data
const mockOrderItems = [
  {
    id: '1',
    name: 'Premium Honey',
    quantity: 2,
    price: 800,
    image: '/api/placeholder/80/80',
  },
  {
    id: '2',
    name: 'Organic Dates',
    quantity: 1,
    price: 600,
    image: '/api/placeholder/80/80',
  },
  {
    id: '3',
    name: 'Mixed Nuts',
    quantity: 3,
    price: 300,
    image: '/api/placeholder/80/80',
  },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'confirmed':
    case 'processing':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(order.id, newStatus);
    onClose();
  };

  const subtotal = mockOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 100;
  const total = subtotal + shipping;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - {order.id}</span>
            <Badge variant={getStatusVariant(order.status)} className="capitalize">
              {order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {mockOrderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ৳{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>৳{shipping}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Order Info */}
          <div className="space-y-4">
            {/* Customer Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.phone}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Shipping Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{order.shippingAddress}</span>
              </div>
            </div>

            {/* Order Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Order Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Update Status</h3>
              <div className="space-y-3">
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // TODO: Add print functionality
                    window.print();
                  }}
                >
                  Print Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
