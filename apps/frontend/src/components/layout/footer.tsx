import { ViewTransitionLink } from '@/components/ui/view-transition-link';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { BRAND_NAME, COMPANY_INFO, NAVIGATION_ITEMS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <ViewTransitionLink href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
              <span className="font-serif text-xl font-bold text-primary">
                {BRAND_NAME}
              </span>
            </ViewTransitionLink>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {COMPANY_INFO.description}
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" asChild>
                <ViewTransitionLink href={COMPANY_INFO.socialMedia.facebook} target="_blank">
                  <Facebook className="h-4 w-4" />
                </ViewTransitionLink>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <ViewTransitionLink href={COMPANY_INFO.socialMedia.instagram} target="_blank">
                  <Instagram className="h-4 w-4" />
                </ViewTransitionLink>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <ViewTransitionLink href={COMPANY_INFO.socialMedia.twitter} target="_blank">
                  <Twitter className="h-4 w-4" />
                </ViewTransitionLink>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <ViewTransitionLink
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </ViewTransitionLink>
              ))}
              <ViewTransitionLink
                href="/privacy"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </ViewTransitionLink>
              <ViewTransitionLink
                href="/terms"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </ViewTransitionLink>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{COMPANY_INFO.address}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{COMPANY_INFO.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{COMPANY_INFO.email}</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Made with ❤️ in Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
