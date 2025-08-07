import { Badge } from '@/components/ui/badge';
import { ViewTransitionLink } from '@/components/ui/view-transition-link';
import { mockCategories } from '@/lib/mock-data';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function CategoryGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of premium organic products, each category
            offering the finest quality and authentic taste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.map(category => (
            <ViewTransitionLink key={category.id} href={`/products?category=${category.id}`} className="group">
              <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="relative h-48 overflow-hidden rounded-xl">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Base gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Hover overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

                  {/* Product Count Badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 bg-primary/90 text-white border-0 shadow-md hover:bg-primary transition-colors duration-300"
                  >
                    {category.productCount} items
                  </Badge>

                  {/* Category Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-semibold mb-1 group-hover:text-accent transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/90 group-hover:text-white mb-3 transition-colors duration-300">
                      {category.description}
                    </p>

                    <div className="flex items-center text-sm font-medium group-hover:text-accent transition-all duration-300">
                      <span>Shop Now</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </ViewTransitionLink>
          ))}
        </div>

        {/* Featured Category Highlight */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/15 border border-primary/20 rounded-full shadow-sm hover:bg-primary/20 transition-colors duration-300">
            <span className="text-sm font-medium text-primary">
              ✨ All products are 100% organic and naturally sourced
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
