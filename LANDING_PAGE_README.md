# Landing Page - E-Presenti

## 📄 File Location

- **Primary**: `src/app/landing/page.tsx` → Accessible at `/landing`
- **Alternative**: `src/app/(landing)/page.tsx` → If using route groups

## 🎨 Design Features

### Color Palette

- **Primary**: Purple (`#9333ea`) - from purple-600
- **Neutrals**: Slate colors - for text and borders
- **Accents**: Blue, Emerald, Orange, Pink, Cyan - for feature icons
- **Backgrounds**: Gradient backgrounds with semi-transparent overlays

### Sections

#### 1. **Navigation Bar**

- Sticky navigation dengan logo dan menu links
- Mobile-responsive hamburger menu
- Login dan Register buttons
- Links ke fitur, cara kerja, dan manfaat sections

#### 2. **Hero Section**

- Large headline dengan gradient text
- Supporting description
- Call-to-action buttons (Register & Login)
- Statistics display (100+ schools, 5000+ teachers, 99.9% uptime)
- Gradient backgrounds dengan blur effects
- Responsive 2-column layout

#### 3. **Features Section**

- 6 feature cards dengan icons
- Grid layout (3 columns on desktop, responsive)
- Hover effects untuk interactivity
- Feature icons dengan color-coded backgrounds

Features included:

- QR Code Dinamis
- Validasi Geolokasi
- Dokumentasi Foto
- Real-Time Tracking
- Analytics & Laporan
- Multi-Role Akses

#### 4. **How It Works Section**

- 4-step process dengan visual steps
- Numbered circles untuk hierarchy
- Connector lines (desktop only)
- Clear descriptions untuk setiap step

#### 5. **Benefits Section**

- 6 benefit points dalam grid
- CheckCircle2 icons untuk visual emphasis
- Benefit items dengan title dan description

#### 6. **CTA (Call-to-Action) Section**

- Purple gradient background
- Large headline dan supporting text
- Primary dan secondary CTA buttons
- Blur effects untuk visual depth

#### 7. **Footer**

- 4-column layout untuk content
- Brand section dengan description
- Links (Produk, Perusahaan, Legal)
- Social media links
- Copyright notice

## 🚀 How to Access

### Production Access

```
http://localhost:3000/landing
```

### Integration

Jika ingin menjadikan landing page sebagai root (`/`), edit `src/app/layout.tsx`:

```typescript
// Remove AuthGuard from global layout atau
// Create separate layout for public routes
```

## 💡 Design Consistency

### Typography

- Headlines: Bold, `font-bold`, sizes: `text-4xl` to `text-3xl`
- Body: Regular, `text-lg` atau `text-base`
- Labels: `text-sm`, `font-medium`

### Spacing

- Section padding: `py-20 md:py-32` (for nice vertical rhythm)
- Gap between elements: `gap-8` for features, `gap-12` for sections
- Padding inside cards: `p-6`

### Colors Used

```
Primary Brand:
- from-purple-600 to-purple-500

Backgrounds:
- bg-white, bg-slate-50, bg-slate-900

Feature Icons:
- purple-600, blue-600, emerald-600
- orange-600, pink-600, cyan-600

Text:
- text-slate-900 (heading)
- text-slate-600 (body)
- text-slate-300 (footer)
```

### Border & Shadow

- Borders: `border border-slate-200` atau `border-slate-200/50`
- Shadows: `hover:shadow-lg` untuk cards
- Blur backgrounds: `blur-3xl` untuk gradient blobs

## 🎯 Component Dependencies

Uses Lucide React icons:

- `QrCode` - Logo dan feature icon
- `MapPin` - Geolocation feature
- `CheckCircle2` - Benefits checkmarks
- `Clock` - Real-time tracking
- `Users` - Multi-role access
- `TrendingUp` - Analytics
- `ArrowRight` - CTA buttons
- `Menu`, `X` - Mobile menu toggle

## 📱 Responsive Design

- **Mobile**: Stacked layout, hamburger menu, single column
- **Tablet**: 2-column grids, adjusted spacing
- **Desktop**: Full 3-column layouts, optimized spacing

Breakpoints used:

- `sm:` - Small devices
- `md:` - Medium devices (tablets)
- `lg:` - Large devices (desktops)

## 🔗 Internal Links

All links point to:

- `/login` - Login page
- `/register` - Register page
- Anchor links (`#features`, `#how-it-works`, `#benefits`)

## ✨ Interactive Elements

- **Hover effects**: Cards, buttons, links
- **Transitions**: Smooth color and shadow transitions
- **Animations**: Pulse animation on status indicator
- **Mobile menu**: Toggle menu on mobile devices

## 🔐 Public Access

Landing page tidak memerlukan authentication. Accessible tanpa login.

---

**Created**: 12 March 2026  
**Framework**: Next.js 16 + React 19  
**Styling**: Tailwind CSS v4  
**Language**: TypeScript
