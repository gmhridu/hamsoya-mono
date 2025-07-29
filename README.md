# Hamsoya - Premium Organic Food E-commerce Platform

A modern, professional **Food & Grocery** pre-order platform built with **Next.js 14+ (App Router) + TypeScript**. Hamsoya specializes in premium organic food products with cash-on-delivery ordering system.

**🏗️ Full-Stack Architecture**: Complete monorepo with Next.js frontend and Hono.js backend on Cloudflare's edge network, featuring ultra-fast APIs, secure authentication, and same-domain deployment.

## 🌟 Features

### Core Business Logic
- **Brand:** Hamsoya (Food & Grocery E-commerce)
- **Order System:** Pre-order with Cash on Delivery
- **Key Products:** Ghee, Kalo Jira Flowers Honey, Green Chili Powder, Laccha Shemai
- **User Flow:** Browse → Add to Cart → Login (if needed) → Order Form → Confirmation

### Design System & UI/UX
- **Color Palette:** Gold (#C79F12), Deep Orange (#D17327), Pale Yellow (#FAF5E7)
- **Typography:** Playfair Display (headlines) + PT Sans (body)
- **Modern linear gradient backgrounds**
- **Compact card designs with full hover coverage**
- **Consistent typography hierarchy**
- **Contemporary design with smooth transitions**

### Frontend Features
- ✅ **Server-Side Rendering (SSR)** on all pages
- ✅ **Dark/Light mode** toggle with system preference detection
- ✅ **Responsive design** with mobile-first approach
- ✅ **Cart system** with navbar-triggered Sheet (desktop) / Drawer (mobile)
- ✅ **Bookmark functionality** with persistence
- ✅ **User authentication** with redirect handling
- ✅ **Form validation** with react-hook-form + zod
- ✅ **Loading states** with skeleton components
- ✅ **Smooth animations** with Framer Motion
- ✅ **SEO optimization** with generateMetadata()

### Backend Features
- ✅ **Ultra-Fast APIs** with Hono.js on Cloudflare Workers
- ✅ **Type-Safe tRPC** for end-to-end type safety
- ✅ **JWT Authentication** with secure httpOnly cookies
- ✅ **Email Verification** with OTP system
- ✅ **Rate Limiting** with Redis-based protection
- ✅ **Password Security** with bcrypt hashing
- ✅ **Database Optimization** with indexed queries
- ✅ **Real-time Validation** with Zod schemas
- ✅ **Session Management** with automatic cleanup
- ✅ **Error Handling** with comprehensive logging

## 🛠️ Tech Stack

### Frontend Technologies
- **Next.js 14+** (App Router) with TypeScript
- **Bun** for package management
- **shadcn/ui** for component library
- **Tailwind CSS** for styling
- **Zustand** with persistence for state management
- **tRPC** for type-safe API communication
- **TanStack Query** for data fetching
- **react-hook-form + zod** for form validation
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend Technologies
- **Hono.js** - Ultra-fast web framework for Cloudflare Workers
- **tRPC** - End-to-end type safety with TypeScript
- **Drizzle ORM** - Type-safe database operations
- **Neon PostgreSQL** - Serverless database with connection pooling
- **Upstash Redis** - Serverless Redis for caching and rate limiting
- **JWT** - Secure authentication with access/refresh tokens
- **Zod** - Runtime type validation and schema parsing
- **bcryptjs** - Password hashing and security
- **nodemailer** - Email delivery with SMTP
- **EJS** - Email templating system

### State Management (Zustand)
- Cart state with persistence
- Bookmark functionality with persistence
- User authentication state
- Saved shipping addresses

## 📁 Project Structure

```
src/
├── app/                    # App Router pages (SSR-enabled)
│   ├── page.tsx           # Home page
│   ├── products/          # Product listing & details
│   ├── order/             # Checkout page
│   ├── login/             # Authentication
│   ├── bookmarks/         # Saved products
│   ├── about-us/          # Company information
│   └── contact-us/        # Contact form
├── components/
│   ├── ui/                # shadcn components
│   ├── layout/            # Navbar, Footer, etc.
│   ├── home/              # Hero, CategoryGrid, etc.
│   ├── products/          # ProductCard, ProductGrid, etc.
│   └── cart/              # CartDrawer, CartItems, etc.
├── store/                 # Zustand stores
├── lib/                   # utilities, constants, helpers
├── types/                 # TypeScript definitions
└── hooks/                 # custom hooks
```

## 🚀 Getting Started

### Prerequisites
- **Bun** (latest version)
- **Node.js** 18+ (for compatibility)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hamsoya
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
bun run build

# Start production server
bun start
```

## 📱 Pages Overview

### Public Pages
- **`/`** - Home page with hero slider, categories, featured products
- **`/products`** - Product listing with search/filters
- **`/products/[id]`** - Individual product details
- **`/about-us`** - Company information and values
- **`/contact-us`** - Contact form and information

### User Pages (Authentication Required)
- **`/login`** - Login/Register with redirect handling
- **`/order`** - Checkout with shipping form
- **`/bookmarks`** - Saved products page

## 🎨 Design System

### Colors
```css
--primary: #C79F12;        /* Gold - Primary brand color */
--accent: #D17327;         /* Deep Orange - CTAs and interactive elements */
--background: #FAF5E7;     /* Very pale yellow - Works for both themes */
```

### Typography
- **Headlines:** Playfair Display (modern serif, high-end feel)
- **Body Text:** PT Sans (humanist sans-serif, approachable)

### Components
- Modern card designs with hover effects
- Consistent spacing scales (Tailwind CSS)
- Smooth transitions and animations
- Mobile-responsive layouts

## 🛒 Key Features

### Shopping Experience
- **Product Browsing:** Search, filter, and sort products
- **Cart Management:** Add/remove items, quantity adjustment
- **Bookmarks:** Save favorite products for later
- **Product Details:** Image gallery, reviews, related products

### Order System
- **Pre-order Model:** Cash on delivery only
- **User Authentication:** Required for checkout
- **Address Management:** Save multiple shipping addresses
- **Order Confirmation:** Email and SMS notifications (mock)

### User Experience
- **Responsive Design:** Works on all devices
- **Dark/Light Mode:** System preference detection
- **Loading States:** Skeleton components for better UX
- **Error Handling:** Comprehensive error boundaries
- **SEO Optimized:** Meta tags and structured data

## 🚀 Quick Start

### Prerequisites
- **Bun** (latest version)
- **Node.js** 18+
- **Neon PostgreSQL** database
- **Upstash Redis** database
- **Gmail App Password** for SMTP

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hamsoya.git
   cd hamsoya
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp apps/frontend/.env.example apps/frontend/.env.local
   cp apps/backend/.env.example apps/backend/.env

   # Fill in your actual values
   ```

4. **Database setup**
   ```bash
   cd apps/backend
   bun run db:setup
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend (http://localhost:3000)
   bun run dev:frontend

   # Terminal 2: Backend (http://localhost:8787)
   bun run dev:backend
   ```

### Testing

```bash
# Run API tests
cd apps/backend
bun run test

# Run performance tests
bun run test:performance

# Run all tests
bun run test:all
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deploy

```bash
# Backend to Cloudflare Workers
cd apps/backend
bun run deploy:prod

# Frontend to Cloudflare Pages
# (Configure via Cloudflare dashboard with Git integration)
```

## 🏗️ Architecture

### Monorepo Structure
```
hamsoya/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # Hono.js API on Cloudflare Workers
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

### API Architecture
- **Same-Domain Deployment**: Frontend and backend on `hamsoya.com`
- **Edge Computing**: Cloudflare Workers for global performance
- **Type Safety**: tRPC for end-to-end TypeScript
- **Security**: JWT with httpOnly cookies, rate limiting
- **Scalability**: Serverless architecture with auto-scaling

---

**Built with ❤️ for premium organic food lovers in Bangladesh**
