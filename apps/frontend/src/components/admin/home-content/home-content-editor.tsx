'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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

// Zod schema for form validation
const homeContentSchema = z.object({
  hero: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    subtitle: z.string().min(1, 'Subtitle is required').max(300, 'Subtitle must be less than 300 characters'),
    primaryButtonText: z.string().min(1, 'Primary button text is required'),
    primaryButtonLink: z.string().min(1, 'Primary button link is required'),
    secondaryButtonText: z.string().min(1, 'Secondary button text is required'),
    secondaryButtonLink: z.string().min(1, 'Secondary button link is required'),
    backgroundImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    isActive: z.boolean(),
  }),
  preOrder: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
    buttonText: z.string().min(1, 'Button text is required'),
    buttonLink: z.string().min(1, 'Button link is required'),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
    textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
    isActive: z.boolean(),
  }),
  usp: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().min(1, 'Subtitle is required'),
    isActive: z.boolean(),
    features: z.array(z.object({
      id: z.number(),
      icon: z.string(),
      title: z.string().min(1, 'Feature title is required'),
      description: z.string().min(1, 'Feature description is required'),
      isActive: z.boolean(),
    })),
  }),
  howItWorks: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().min(1, 'Subtitle is required'),
    isActive: z.boolean(),
    steps: z.array(z.object({
      id: z.number(),
      title: z.string().min(1, 'Step title is required'),
      description: z.string().min(1, 'Step description is required'),
      icon: z.string(),
    })),
  }),
  cod: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().min(1, 'Subtitle is required'),
    features: z.array(z.string()),
    isActive: z.boolean(),
  }),
  reviews: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().min(1, 'Subtitle is required'),
    isActive: z.boolean(),
    featuredReviews: z.array(z.object({
      id: z.number(),
      name: z.string().min(1, 'Name is required'),
      rating: z.number().min(1).max(5),
      comment: z.string().min(1, 'Comment is required'),
      product: z.string().min(1, 'Product is required'),
      isActive: z.boolean(),
    })),
  }),
});

type HomeContentFormData = z.infer<typeof homeContentSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HomeContentFormData>({
    resolver: zodResolver(homeContentSchema),
    defaultValues: mockHomeContent,
    mode: 'onChange',
  });

  const { watch, handleSubmit, reset, formState: { isDirty, isValid } } = form;

  const onSubmit = async (data: HomeContentFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement save API call
      console.log('Saving homepage content:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      reset(data); // Reset form with new values to clear dirty state
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(mockHomeContent);
  };

  const handlePreview = () => {
    // TODO: Open preview in new tab
    window.open('/', '_blank');
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Action Bar - Responsive */}
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                {isDirty && (
                  <Badge variant="outline" className="text-orange-600 text-xs sm:text-sm">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="min-h-[44px] justify-center sm:justify-start"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                  <span className="sm:hidden">Preview</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!isDirty}
                  className="min-h-[44px] justify-center sm:justify-start"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty || !isValid || isSubmitting}
                  className="min-h-[44px] justify-center sm:justify-start"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? (
                    <>
                      <span className="hidden sm:inline">Saving...</span>
                      <span className="sm:hidden">Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Editor Tabs - Responsive */}
        <Tabs defaultValue="hero" className="space-y-4 md:space-y-6">
          {/* Mobile: Scrollable tabs, Desktop: Grid layout */}
          <div className="w-full">
            <TabsList className="
              flex w-full overflow-x-auto scrollbar-hide
              sm:grid sm:grid-cols-3 sm:overflow-visible
              lg:grid-cols-6
              p-1 h-auto min-h-[44px]
            ">
              <TabsTrigger
                value="hero"
                className="
                  flex-shrink-0 min-w-[100px] sm:min-w-0
                  px-3 py-2 text-xs sm:text-sm
                  whitespace-nowrap min-h-[40px]
                "
              >
                <span className="hidden sm:inline">Hero Section</span>
                <span className="sm:hidden">Hero</span>
              </TabsTrigger>
              <TabsTrigger
                value="preorder"
                className="
                  flex-shrink-0 min-w-[100px] sm:min-w-0
                  px-3 py-2 text-xs sm:text-sm
                  whitespace-nowrap min-h-[40px]
                "
              >
                <span className="hidden sm:inline">Pre-Order</span>
                <span className="sm:hidden">Pre-Order</span>
              </TabsTrigger>
              <TabsTrigger
                value="usp"
                className="
                  flex-shrink-0 min-w-[100px] sm:min-w-0
                  px-3 py-2 text-xs sm:text-sm
                  whitespace-nowrap min-h-[40px]
                "
              >
                <span className="hidden sm:inline">USP Features</span>
                <span className="sm:hidden">Features</span>
              </TabsTrigger>
              <TabsTrigger
                value="howitworks"
                className="
                  flex-shrink-0 min-w-[100px] sm:min-w-0
                  px-3 py-2 text-xs sm:text-sm
                  whitespace-nowrap min-h-[40px]
                "
              >
                <span className="hidden sm:inline">How It Works</span>
                <span className="sm:hidden">How It Works</span>
              </TabsTrigger>
              <TabsTrigger
                value="cod"
                className="
                  flex-shrink-0 min-w-[100px] sm:min-w-0
                  px-3 py-2 text-xs sm:text-sm
                  whitespace-nowrap min-h-[40px]
                "
              >
                <span className="hidden sm:inline">Cash on Delivery</span>
                <span className="sm:hidden">COD</span>
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="
                  flex-shrink-0 min-w-[100px] sm:min-w-0
                  px-3 py-2 text-xs sm:text-sm
                  whitespace-nowrap min-h-[40px]
                "
              >
                <span className="hidden sm:inline">Reviews</span>
                <span className="sm:hidden">Reviews</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <span className="text-lg sm:text-xl">Hero Section</span>
                  <FormField
                    control={form.control}
                    name="hero.isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="self-start sm:self-center"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <FormField
                  control={form.control}
                  name="hero.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Main Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter main title"
                          className="h-10 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hero.subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Subtitle</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter subtitle"
                          rows={3}
                          className="text-base resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hero.primaryButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Primary Button Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter button text"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hero.primaryButtonLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Primary Button Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter button link"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hero.secondaryButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Secondary Button Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter button text"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hero.secondaryButtonLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Secondary Button Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter button link"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hero.backgroundImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Background Image URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter image URL"
                            className="h-10 text-base"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="min-h-[40px] min-w-[40px] flex-shrink-0"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>
        </TabsContent>

          {/* Pre-Order Section */}
          <TabsContent value="preorder">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <span className="text-lg sm:text-xl">Pre-Order Section</span>
                  <FormField
                    control={form.control}
                    name="preOrder.isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="self-start sm:self-center"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <FormField
                  control={form.control}
                  name="preOrder.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter pre-order section title"
                          className="h-10 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preOrder.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter pre-order section description"
                          rows={3}
                          className="text-base resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preOrder.buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Button Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter button text"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preOrder.buttonLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Button Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter button link"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preOrder.backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Background Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="h-10 w-16 p-1 border rounded"
                              {...field}
                            />
                            <Input
                              placeholder="#c79f12"
                              className="h-10 text-base flex-1"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preOrder.textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Text Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="h-10 w-16 p-1 border rounded"
                              {...field}
                            />
                            <Input
                              placeholder="#ffffff"
                              className="h-10 text-base flex-1"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USP Features */}
          <TabsContent value="usp">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <span className="text-lg sm:text-xl">USP Features</span>
                  <FormField
                    control={form.control}
                    name="usp.isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="self-start sm:self-center"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="usp.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Section Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter section title"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usp.subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Section Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter section subtitle"
                            className="h-10 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="text-center text-muted-foreground py-8">
                  USP Features editor will be implemented in the next phase
                </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* How It Works */}
          <TabsContent value="howitworks">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <span className="text-lg sm:text-xl">How It Works Section</span>
                  <FormField
                    control={form.control}
                    name="howItWorks.isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="self-start sm:self-center"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center text-muted-foreground py-8">
                  How It Works section editor will be implemented in the next phase
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash on Delivery */}
          <TabsContent value="cod">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <span className="text-lg sm:text-xl">Cash on Delivery Section</span>
                  <FormField
                    control={form.control}
                    name="cod.isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="self-start sm:self-center"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center text-muted-foreground py-8">
                  Cash on Delivery section editor will be implemented in the next phase
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <span className="text-lg sm:text-xl">Customer Reviews Section</span>
                  <FormField
                    control={form.control}
                    name="reviews.isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="self-start sm:self-center"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center text-muted-foreground py-8">
                  Customer Reviews section editor will be implemented in the next phase
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
