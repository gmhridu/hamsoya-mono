'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, Verified } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockReviews } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// Extended mock reviews for carousel
const extendedReviews = [
  ...mockReviews,
  {
    id: '4',
    productId: 'laccha-shemai',
    userName: 'Nasir Ahmed',
    rating: 5,
    comment: 'The laccha shemai is absolutely perfect for making traditional desserts. My family loved it!',
    createdAt: '2024-01-05',
    verified: true,
  },
  {
    id: '5',
    productId: 'mustard-oil',
    userName: 'Salma Khatun',
    rating: 4,
    comment: 'Great quality mustard oil with authentic taste. Perfect for Bengali cooking.',
    createdAt: '2024-01-03',
    verified: true,
  },
  {
    id: '6',
    productId: 'kalo-jira-flowers-honey',
    userName: 'Dr. Rahman',
    rating: 5,
    comment: 'As a doctor, I can confirm this honey has excellent medicinal properties. Highly recommended!',
    createdAt: '2024-01-01',
    verified: true,
  },
];

export function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => 
        (prev + 1) % Math.max(1, extendedReviews.length - itemsPerView + 1)
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [itemsPerView]);

  const nextReview = () => {
    setCurrentIndex((prev) => 
      (prev + 1) % Math.max(1, extendedReviews.length - itemsPerView + 1)
    );
  };

  const prevReview = () => {
    setCurrentIndex((prev) => 
      prev === 0 
        ? Math.max(0, extendedReviews.length - itemsPerView)
        : prev - 1
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real reviews from satisfied customers who trust our quality and service.
          </p>
        </div>

        <div className="relative">
          {/* Reviews Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {extendedReviews.map((review) => (
                <div
                  key={review.id}
                  className={cn(
                    'flex-shrink-0 px-3',
                    itemsPerView === 1 && 'w-full',
                    itemsPerView === 2 && 'w-1/2',
                    itemsPerView === 3 && 'w-1/3'
                  )}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      {/* Quote Icon */}
                      <Quote className="h-8 w-8 text-primary/20 mb-4" />
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-4 w-4',
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        "{review.comment}"
                      </p>
                      
                      {/* Reviewer Info */}
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(review.userName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{review.userName}</h4>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                <Verified className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background shadow-lg"
            onClick={prevReview}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background shadow-lg"
            onClick={nextReview}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.max(1, extendedReviews.length - itemsPerView + 1) }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
