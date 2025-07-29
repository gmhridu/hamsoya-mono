import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Search, ShoppingCart, Truck } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Search,
    title: 'Browse Products',
    description:
      'Explore our curated selection of premium organic products and find your favorites.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    step: 2,
    icon: ShoppingCart,
    title: 'Add to Cart',
    description:
      'Select your desired products and quantities, then add them to your shopping cart.',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    step: 3,
    icon: CreditCard,
    title: 'Place Order',
    description:
      'Provide your delivery details and confirm your order with cash on delivery option.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
  {
    step: 4,
    icon: Truck,
    title: 'Receive Fresh',
    description: 'Get your fresh, premium quality products delivered right to your doorstep.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
  },
];

export function PreOrderGuide() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Simple Pre-Order Process
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting your favorite organic products is easy with our streamlined pre-order system.
            Follow these simple steps to place your order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.step} className="relative flex flex-col">
                {/* Step Number - Fixed positioning */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-3 border-background">
                    {step.step}
                  </div>
                </div>

                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group h-full bg-card/50 backdrop-blur-sm relative overflow-visible">
                  <CardContent className="p-0 text-center h-full flex flex-col">
                    {/* Card Content */}
                    <div className="pt-10 pb-6 px-6 flex flex-col h-full">
                      {/* Icon */}
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                      >
                        <Icon className={`h-8 w-8 ${step.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>

                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connector Arrow - Precisely positioned */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-1/2 z-20 items-center">
                    <div className="w-6 h-0.5 bg-gradient-to-r from-primary/50 to-primary/30"></div>
                    <div className="w-0 h-0 border-l-[8px] border-l-primary/50 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center backdrop-blur-sm border border-primary/10">
          <h3 className="text-2xl font-serif font-bold mb-4">Cash on Delivery Available</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            No need for advance payment! Pay conveniently when you receive your order. We accept
            cash payments upon delivery for your peace of mind.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-background/70 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/10 hover:bg-background/90 transition-colors">
              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
              <span className="font-medium">No advance payment required</span>
            </div>
            <div className="flex items-center gap-2 bg-background/70 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/10 hover:bg-background/90 transition-colors">
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
              <span className="font-medium">Free delivery across Bangladesh</span>
            </div>
            <div className="flex items-center gap-2 bg-background/70 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/10 hover:bg-background/90 transition-colors">
              <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
              <span className="font-medium">Quality guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
