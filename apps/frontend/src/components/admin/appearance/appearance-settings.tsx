'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Slider } from '@/components/ui/slider';
import {
  Save,
  RotateCcw,
  Palette,
  Type,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
} from 'lucide-react';

// Mock appearance settings
const mockSettings = {
  theme: {
    mode: 'system', // light, dark, system
    primaryColor: '#c79f12',
    accentColor: '#d17327',
    backgroundColor: '#faf5e7',
    cardColor: '#ffffff',
    borderRadius: 10,
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'PT Sans',
    fontSize: 16,
    lineHeight: 1.6,
    fontWeight: 400,
  },
  layout: {
    containerWidth: 1200,
    sidebarWidth: 280,
    headerHeight: 80,
    footerHeight: 120,
  },
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
  },
};

const colorPresets = [
  { name: 'Default Gold', primary: '#c79f12', accent: '#d17327' },
  { name: 'Forest Green', primary: '#22c55e', accent: '#16a34a' },
  { name: 'Ocean Blue', primary: '#3b82f6', accent: '#2563eb' },
  { name: 'Royal Purple', primary: '#8b5cf6', accent: '#7c3aed' },
  { name: 'Sunset Orange', primary: '#f97316', accent: '#ea580c' },
  { name: 'Rose Pink', primary: '#ec4899', accent: '#db2777' },
];

const fontOptions = [
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'Inter', label: 'Inter (Sans-serif)' },
  { value: 'Roboto', label: 'Roboto (Sans-serif)' },
  { value: 'Open Sans', label: 'Open Sans (Sans-serif)' },
  { value: 'Lora', label: 'Lora (Serif)' },
  { value: 'Poppins', label: 'Poppins (Sans-serif)' },
];

export function AppearanceSettings() {
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleSave = () => {
    // TODO: Implement save API call
    console.log('Saving appearance settings:', settings);
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

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        primaryColor: preset.primary,
        accentColor: preset.accent,
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
            <div className="flex items-center gap-4">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Preview:</span>
                <div className="flex rounded-md border">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                    className="rounded-none first:rounded-l-md"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('tablet')}
                    className="rounded-none"
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                    className="rounded-none last:rounded-r-md"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="theme" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="animations">Animations</TabsTrigger>
            </TabsList>

            {/* Theme Settings */}
            <TabsContent value="theme">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Mode */}
                  <div>
                    <Label>Theme Mode</Label>
                    <Select
                      value={settings.theme.mode}
                      onValueChange={(value) => updateSetting('theme', 'mode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Presets */}
                  <div>
                    <Label>Color Presets</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {colorPresets.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          onClick={() => applyColorPreset(preset)}
                          className="justify-start gap-3 h-auto p-3"
                        >
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                          <span className="text-sm">{preset.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="primary-color"
                          type="color"
                          value={settings.theme.primaryColor}
                          onChange={(e) => updateSetting('theme', 'primaryColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.theme.primaryColor}
                          onChange={(e) => updateSetting('theme', 'primaryColor', e.target.value)}
                          placeholder="#c79f12"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="accent-color"
                          type="color"
                          value={settings.theme.accentColor}
                          onChange={(e) => updateSetting('theme', 'accentColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.theme.accentColor}
                          onChange={(e) => updateSetting('theme', 'accentColor', e.target.value)}
                          placeholder="#d17327"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <Label>Border Radius: {settings.theme.borderRadius}px</Label>
                    <Slider
                      value={[settings.theme.borderRadius]}
                      onValueChange={([value]) => updateSetting('theme', 'borderRadius', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Settings */}
            <TabsContent value="typography">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Typography Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Heading Font</Label>
                      <Select
                        value={settings.typography.headingFont}
                        onValueChange={(value) => updateSetting('typography', 'headingFont', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Body Font</Label>
                      <Select
                        value={settings.typography.bodyFont}
                        onValueChange={(value) => updateSetting('typography', 'bodyFont', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Font Size: {settings.typography.fontSize}px</Label>
                    <Slider
                      value={[settings.typography.fontSize]}
                      onValueChange={([value]) => updateSetting('typography', 'fontSize', value)}
                      max={24}
                      min={12}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Line Height: {settings.typography.lineHeight}</Label>
                    <Slider
                      value={[settings.typography.lineHeight]}
                      onValueChange={([value]) => updateSetting('typography', 'lineHeight', value)}
                      max={2}
                      min={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Settings */}
            <TabsContent value="layout">
              <Card>
                <CardHeader>
                  <CardTitle>Layout Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Layout settings will be implemented here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Animation Settings */}
            <TabsContent value="animations">
              <Card>
                <CardHeader>
                  <CardTitle>Animation Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Animation settings will be implemented here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Live preview will be implemented here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
