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
  Eye,
  RotateCcw,
  Image as ImageIcon,
  Star,
  Quote,
  Zap,
  Heart,
  Shield,
} from 'lucide-react';

// Mock homepage content data
const mockHomeContent = {
  hero: {
    title: 'Pure Natural Products for Healthy Living',
    subtitle: 'Discover premium quality honey, dates, nuts, and organic products sourced directly from trusted farms.',
    primaryButtonText: 'Shop Now',
    primaryButtonLink: '/products',
    secondaryButtonText: 'Learn More',
    secondaryButtonLink: '/about-us',
    backgroundImage: '/api/placeholder/1920/800',
    isActive: true,
  },
  preOrder: {
    title: 'Pre-Order Your Favorites',
    description: 'Get the freshest products delivered to your doorstep. Pre-order now and enjoy special discounts.',
    buttonText: 'Pre-Order Now',
    buttonLink: '/products',
    backgroundColor: '#c79f12',
    textColor: '#ffffff',
    isActive: true,
  },
  usp: {
    title: 'Why Choose Hamsoya?',
    subtitle: 'We are committed to providing the highest quality natural products',
    features: [
      {
        id: 1,
        icon: 'shield',
        title: '100% Natural',
        description: 'All our products are sourced from organic farms with no artificial additives.',
        isActive: true,
      },
      {
        id: 2,
        icon: 'heart',
        title: 'Health Focused',
        description: 'Every product is selected for its health benefits and nutritional value.',
        isActive: true,
      },
      {
        id: 3,
        icon: 'zap',
        title: 'Fast Delivery',
        description: 'Quick and reliable delivery to ensure freshness and quality.',
        isActive: true,
      },
    ],
    isActive: true,
  },
  howItWorks: {
    title: 'How It Works',
    subtitle: 'Simple steps to get your favorite natural products',
    steps: [
      {
        id: 1,
        title: 'Browse Products',
        description: 'Explore our wide range of natural products',
        icon: 'search',
      },
      {
        id: 2,
        title: 'Place Order',
        description: 'Add items to cart and place your order',
        icon: 'cart',
      },
      {
        id: 3,
        title: 'Fast Delivery',
        description: 'Receive fresh products at your doorstep',
        icon: 'truck',
      },
      {
        id: 4,
        title: 'Enjoy Quality',
        description: 'Experience the pure taste of nature',
        icon: 'smile',
      },
    ],
    isActive: true,
  },
  cashOnDelivery: {
    title: 'Cash on Delivery Available',
    description: 'Pay when you receive your order. No advance payment required.',
    buttonText: 'Order Now',
    buttonLink: '/products',
    isActive: true,
  },
  reviews: {
    title: 'What Our Customers Say',
    subtitle: 'Real reviews from satisfied customers',
    featuredReviews: [
      {
        id: 1,
        name: 'Sarah Ahmed',
        rating: 5,
        comment: 'Amazing quality honey! Pure and natural taste.',
        product: 'Premium Honey',
        isActive: true,
      },
      {
        id: 2,
        name: 'Mohammad Rahman',
        rating: 5,
        comment: 'Best dates I have ever tasted. Highly recommended!',
        product: 'Organic Dates',
        isActive: true,
      },
      {
        id: 3,
        name: 'Fatima Khan',
        rating: 4,
        comment: 'Great quality nuts and fast delivery service.',
        product: 'Mixed Nuts',
        isActive: true,
      },
    ],
    isActive: true,
  },
};

export function HomeContentEditor() {
  const [content, setContent] = useState(mockHomeContent);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // TODO: Implement save API call
    console.log('Saving homepage content:', content);
    setHasChanges(false);
  };

  const handleReset = () => {
    setContent(mockHomeContent);
    setHasChanges(false);
  };

  const handlePreview = () => {
    // TODO: Open preview in new tab
    window.open('/', '_blank');
  };

  const updateContent = (section: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateFeature = (featureId: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      usp: {
        ...prev.usp,
        features: prev.usp.features.map(feature =>
          feature.id === featureId ? { ...feature, [field]: value } : feature
        ),
      },
    }));
    setHasChanges(true);
  };

  const updateReview = (reviewId: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        featuredReviews: prev.reviews.featuredReviews.map(review =>
          review.id === reviewId ? { ...review, [field]: value } : review
        ),
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
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
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

      {/* Content Editor Tabs */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="preorder">Pre-Order</TabsTrigger>
          <TabsTrigger value="usp">USP Features</TabsTrigger>
          <TabsTrigger value="howitworks">How It Works</TabsTrigger>
          <TabsTrigger value="cod">Cash on Delivery</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Hero Section
                <Switch
                  checked={content.hero.isActive}
                  onCheckedChange={(checked) => updateContent('hero', 'isActive', checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={content.hero.title}
                  onChange={(e) => updateContent('hero', 'title', e.target.value)}
                  placeholder="Enter main title"
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.hero.subtitle}
                  onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                  placeholder="Enter subtitle"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-btn-text">Primary Button Text</Label>
                  <Input
                    id="primary-btn-text"
                    value={content.hero.primaryButtonText}
                    onChange={(e) => updateContent('hero', 'primaryButtonText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primary-btn-link">Primary Button Link</Label>
                  <Input
                    id="primary-btn-link"
                    value={content.hero.primaryButtonLink}
                    onChange={(e) => updateContent('hero', 'primaryButtonLink', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondary-btn-text">Secondary Button Text</Label>
                  <Input
                    id="secondary-btn-text"
                    value={content.hero.secondaryButtonText}
                    onChange={(e) => updateContent('hero', 'secondaryButtonText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondary-btn-link">Secondary Button Link</Label>
                  <Input
                    id="secondary-btn-link"
                    value={content.hero.secondaryButtonLink}
                    onChange={(e) => updateContent('hero', 'secondaryButtonLink', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="hero-bg">Background Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="hero-bg"
                    value={content.hero.backgroundImage}
                    onChange={(e) => updateContent('hero', 'backgroundImage', e.target.value)}
                    placeholder="Enter image URL"
                  />
                  <Button variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pre-Order Section */}
        <TabsContent value="preorder">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pre-Order Section
                <Switch
                  checked={content.preOrder.isActive}
                  onCheckedChange={(checked) => updateContent('preOrder', 'isActive', checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="preorder-title">Title</Label>
                <Input
                  id="preorder-title"
                  value={content.preOrder.title}
                  onChange={(e) => updateContent('preOrder', 'title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="preorder-desc">Description</Label>
                <Textarea
                  id="preorder-desc"
                  value={content.preOrder.description}
                  onChange={(e) => updateContent('preOrder', 'description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preorder-btn-text">Button Text</Label>
                  <Input
                    id="preorder-btn-text"
                    value={content.preOrder.buttonText}
                    onChange={(e) => updateContent('preOrder', 'buttonText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="preorder-btn-link">Button Link</Label>
                  <Input
                    id="preorder-btn-link"
                    value={content.preOrder.buttonLink}
                    onChange={(e) => updateContent('preOrder', 'buttonLink', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preorder-bg-color">Background Color</Label>
                  <Input
                    id="preorder-bg-color"
                    type="color"
                    value={content.preOrder.backgroundColor}
                    onChange={(e) => updateContent('preOrder', 'backgroundColor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="preorder-text-color">Text Color</Label>
                  <Input
                    id="preorder-text-color"
                    type="color"
                    value={content.preOrder.textColor}
                    onChange={(e) => updateContent('preOrder', 'textColor', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USP Features */}
        <TabsContent value="usp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                USP Features
                <Switch
                  checked={content.usp.isActive}
                  onCheckedChange={(checked) => updateContent('usp', 'isActive', checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usp-title">Section Title</Label>
                  <Input
                    id="usp-title"
                    value={content.usp.title}
                    onChange={(e) => updateContent('usp', 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="usp-subtitle">Section Subtitle</Label>
                  <Input
                    id="usp-subtitle"
                    value={content.usp.subtitle}
                    onChange={(e) => updateContent('usp', 'subtitle', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Features</h4>
                {content.usp.features.map((feature) => (
                  <Card key={feature.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Feature {feature.id}</h5>
                      <Switch
                        checked={feature.isActive}
                        onCheckedChange={(checked) => updateFeature(feature.id, 'isActive', checked)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Select
                          value={feature.icon}
                          onValueChange={(value) => updateFeature(feature.id, 'icon', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shield">Shield</SelectItem>
                            <SelectItem value="heart">Heart</SelectItem>
                            <SelectItem value="zap">Zap</SelectItem>
                            <SelectItem value="star">Star</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Description</Label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* How It Works */}
        <TabsContent value="howitworks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                How It Works Section
                <Switch
                  checked={content.howItWorks.isActive}
                  onCheckedChange={(checked) => updateContent('howItWorks', 'isActive', checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                How It Works section editor will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash on Delivery */}
        <TabsContent value="cod">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Cash on Delivery Section
                <Switch
                  checked={content.cashOnDelivery.isActive}
                  onCheckedChange={(checked) => updateContent('cashOnDelivery', 'isActive', checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Cash on Delivery section editor will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Customer Reviews Section
                <Switch
                  checked={content.reviews.isActive}
                  onCheckedChange={(checked) => updateContent('reviews', 'isActive', checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Customer Reviews section editor will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
