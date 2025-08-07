'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ViewTransitionLink } from '@/components/ui/view-transition-link';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const heroSlides = [
  {
    id: 1,
    title: 'Pure Kalo Jira Flowers Honey',
    subtitle: 'Natural & Organic',
    description:
      'Experience the authentic taste of pure honey collected from Kalo Jira flowers. Rich in antioxidants and natural healing properties.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
    cta: 'Shop Now',
    href: '/products/kalo-jira-flowers-honey',
    badge: 'Best Seller',
  },
  {
    id: 2,
    title: 'Traditional Desi Ghee',
    subtitle: 'Farm Fresh Quality',
    description:
      'Premium clarified butter made from grass-fed cow milk. Perfect for cooking and traditional Ayurvedic remedies.',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop',
    cta: 'Discover',
    href: '/products/pure-ghee',
    badge: 'Premium',
  },
  {
    id: 3,
    title: 'Authentic Bengali Spices',
    subtitle: 'Fresh Ground Daily',
    description:
      'Freshly ground spices with authentic taste and aroma. Perfect for traditional Bengali cuisine.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop',
    cta: 'Explore',
    href: '/products?category=spices',
    badge: 'Fresh',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
      {/* Background Images */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'transition-all duration-1000',
                index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              )}
            >
              {index === currentSlide && (
                <>
                  <Badge variant="secondary" className="mb-4">
                    {slide.badge}
                  </Badge>
                  <h2 className="text-sm font-medium text-primary-foreground/80 mb-2">
                    {slide.subtitle}
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <ViewTransitionLink href={slide.href}>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        {slide.cta}
                      </ViewTransitionLink>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      size="lg"
                      className="bg-white/95 text-gray-900 border-2 border-white hover:bg-white hover:text-black shadow-lg backdrop-blur-sm font-medium transition-all duration-300"
                    >
                      <ViewTransitionLink href="/products">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        View All Products
                      </ViewTransitionLink>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white hover:text-black"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white hover:text-black"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
            )}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
