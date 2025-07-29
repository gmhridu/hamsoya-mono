import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Leaf, 
  Users, 
  Award, 
  Heart, 
  Truck, 
  Shield,
  Target,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BRAND_NAME, COMPANY_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `About Us - ${BRAND_NAME}`,
  description: 'Learn about Hamsoya\'s mission to provide premium organic food products with authentic taste and quality. Discover our story, values, and commitment to excellence.',
  keywords: 'about hamsoya, organic food company, premium quality, authentic taste, bangladesh organic food',
};

const values = [
  {
    icon: Leaf,
    title: 'Organic & Natural',
    description: 'We source only the finest organic and natural products, ensuring purity and authenticity in every item.',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Our commitment to excellence means every product meets the highest quality standards.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We build lasting relationships through trust and service.',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We believe in honest business practices and transparent communication with our customers.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
];

const stats = [
  { number: '10,000+', label: 'Happy Customers' },
  { number: '50+', label: 'Premium Products' },
  { number: '64', label: 'Districts Covered' },
  { number: '99%', label: 'Customer Satisfaction' },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              About {BRAND_NAME}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Bringing Nature's Best to Your Table
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are passionate about providing premium organic food products that 
              celebrate authentic taste, traditional methods, and natural goodness.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded with a vision to reconnect people with authentic, natural food, 
                  {BRAND_NAME} began as a small initiative to source the finest organic 
                  products directly from trusted farmers across Bangladesh.
                </p>
                <p>
                  Our journey started when we realized how difficult it had become to 
                  find truly pure, unadulterated food products. We set out to bridge 
                  this gap by establishing direct relationships with organic farmers 
                  and traditional producers.
                </p>
                <p>
                  Today, we're proud to serve thousands of families with premium 
                  quality products that not only taste exceptional but also support 
                  sustainable farming practices and local communities.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src="/images/about/our-story.jpg"
                alt="Our Story"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To make premium organic and natural food products accessible to every 
                  household in Bangladesh, while supporting local farmers and preserving 
                  traditional food production methods.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                  <Eye className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become Bangladesh's most trusted brand for organic food products, 
                  creating a sustainable ecosystem that benefits consumers, farmers, 
                  and the environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment 
              to excellence in every aspect of our business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              
              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${value.bgColor} mb-4`}>
                      <Icon className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Numbers that reflect our commitment to quality and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Why Choose {BRAND_NAME}?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We go beyond just selling products - we deliver an experience 
              built on trust, quality, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">100% Organic</h3>
              <p className="text-muted-foreground">
                All our products are certified organic and sourced directly from 
                trusted farmers who follow sustainable practices.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Free Delivery</h3>
              <p className="text-muted-foreground">
                Enjoy free home delivery across Bangladesh with our reliable 
                logistics network and cash on delivery option.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Support</h3>
              <p className="text-muted-foreground">
                Our dedicated customer support team is always ready to help 
                you with any questions or concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of satisfied customers who trust {BRAND_NAME} for 
              their organic food needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">
                  Shop Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact-us">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
