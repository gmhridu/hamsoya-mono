'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Save,
  RotateCcw,
  Store,
  Mail,
  Bell,
  Shield,
  Database,
  Globe,
} from 'lucide-react';

// Mock system settings
const mockSettings = {
  business: {
    storeName: 'Hamsoya',
    tagline: 'Pure Natural Products for Healthy Living',
    description: 'Premium quality honey, dates, nuts, and organic products sourced directly from trusted farms.',
    contactEmail: 'info@hamsoya.com',
    supportEmail: 'support@hamsoya.com',
    phone: '+880 1234567890',
    address: 'Dhaka, Bangladesh',
    website: 'https://hamsoya.com',
    logo: '/logo.png',
    favicon: '/favicon.ico',
  },
  delivery: {
    estimatedDays: 3,
    freeShippingThreshold: 1000,
    shippingCost: 100,
    codAvailable: true,
    deliveryAreas: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'],
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true,
    customerRegistration: true,
    lowStockThreshold: 10,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
  },
  system: {
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    backupFrequency: 'daily',
    timezone: 'Asia/Dhaka',
    language: 'en',
  },
};

export function SystemSettings() {
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // TODO: Implement save API call
    console.log('Saving system settings:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(mockSettings);
    setHasChanges(false);
  };

  const updateSetting = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Business Information */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input
                    id="store-name"
                    value={settings.business.storeName}
                    onChange={(e) => updateSetting('business', 'storeName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.business.tagline}
                    onChange={(e) => updateSetting('business', 'tagline', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.business.description}
                  onChange={(e) => updateSetting('business', 'description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.business.contactEmail}
                    onChange={(e) => updateSetting('business', 'contactEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.business.supportEmail}
                    onChange={(e) => updateSetting('business', 'supportEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.business.phone}
                    onChange={(e) => updateSetting('business', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    value={settings.business.website}
                    onChange={(e) => updateSetting('business', 'website', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={settings.business.address}
                  onChange={(e) => updateSetting('business', 'address', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="estimated-days">Estimated Delivery (Days)</Label>
                  <Input
                    id="estimated-days"
                    type="number"
                    value={settings.delivery.estimatedDays}
                    onChange={(e) => updateSetting('delivery', 'estimatedDays', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="shipping-cost">Shipping Cost (৳)</Label>
                  <Input
                    id="shipping-cost"
                    type="number"
                    value={settings.delivery.shippingCost}
                    onChange={(e) => updateSetting('delivery', 'shippingCost', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="free-shipping">Free Shipping Threshold (৳)</Label>
                  <Input
                    id="free-shipping"
                    type="number"
                    value={settings.delivery.freeShippingThreshold}
                    onChange={(e) => updateSetting('delivery', 'freeShippingThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="cod-available"
                  checked={settings.delivery.codAvailable}
                  onCheckedChange={(checked) => updateSetting('delivery', 'codAvailable', checked)}
                />
                <Label htmlFor="cod-available">Cash on Delivery Available</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
                  </div>
                  <Switch
                    checked={settings.notifications.orderNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'orderNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts when products are low in stock</p>
                  </div>
                  <Switch
                    checked={settings.notifications.stockAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'stockAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer Registration</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new customers register</p>
                  </div>
                  <Switch
                    checked={settings.notifications.customerRegistration}
                    onCheckedChange={(checked) => updateSetting('notifications', 'customerRegistration', checked)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                <Input
                  id="low-stock-threshold"
                  type="number"
                  value={settings.notifications.lowStockThreshold}
                  onChange={(e) => updateSetting('notifications', 'lowStockThreshold', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Security settings will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                System settings will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
