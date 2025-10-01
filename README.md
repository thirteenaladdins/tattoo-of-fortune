# Tattoo of Fortune - SvelteKit Skeleton

A mystery tattoo design platform built with SvelteKit, TailwindCSS, and Motion One animations.

## 🎯 Project Overview

**Tattoo of Fortune** delivers mystery tattoo designs chosen by fate. Users roll to receive a curated, stencil-ready flash design with an integrated Stripe checkout flow.

## 🛠 Tech Stack

- **SvelteKit** - Full-stack framework
- **TailwindCSS** - Utility-first styling
- **@motionone/svelte** - Lightweight animations
- **Stripe Checkout** - Payment processing (MVP)
- **Vercel** - Deployment platform

## 📁 Project Structure

```
tattoo-of-fortune/
├─ .env.example                 # Environment variables template
├─ package.json                 # Dependencies and scripts
├─ svelte.config.js            # SvelteKit configuration
├─ tailwind.config.cjs         # Tailwind configuration
├─ postcss.config.cjs          # PostCSS configuration
├─ static/                     # Static assets served at site root
│  ├─ hero/
│  │  └─ hero-placeholder.jpg  # Background hero image
│  └─ fortunes/
│     ├─ 001.png              # Fortune artwork files
│     ├─ 002.png
│     └─ ...                  # (003-006.png)
└─ src/
   ├─ app.d.ts                # TypeScript declarations
   ├─ routes/
   │  ├─ +layout.svelte       # Global shell layout
   │  ├─ +page.svelte         # Landing page with roll flow
   │  ├─ about/
   │  │  └─ +page.svelte      # About page
   │  └─ faq/
   │     └─ +page.svelte      # FAQ page
   ├─ lib/
   │  ├─ components/
   │  │  ├─ BackgroundArt.svelte    # Full-bleed background
   │  │  ├─ CTAButton.svelte        # Roll button with states
   │  │  ├─ RollingOverlay.svelte   # Loading animation
   │  │  ├─ RevealModal.svelte      # Artwork reveal modal
   │  │  ├─ ScarcityBadge.svelte    # Availability counter
   │  │  └─ Logo.svelte             # Brand logo
   │  ├─ data/
   │  │  ├─ artworks.ts            # Artwork metadata array
   │  │  └─ copy.ts                # Centralized copy
   │  └─ utils/
   │     └─ roll.ts                # Random selection logic
   └─ styles/
      └─ app.css                   # Global styles + Tailwind
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Set environment variables in `.env`:

- `STRIPE_SECRET_KEY` (server) — your Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` (server) — webhook signing secret

Note: `PUBLIC_STRIPE_CHECKOUT_URL` is no longer used with the integrated Checkout flow.

### 3. Add Your Assets

- **Hero Image**: Replace `static/hero/hero-placeholder.jpg` with your background image
- **Fortune Artworks**: Replace `static/fortunes/001.png` through `006.png` with actual tattoo designs
- **Update Metadata**: Edit `src/lib/data/artworks.ts` with your artwork information

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see your site.

### 5. Build & Deploy

```bash
npm run build
npm run preview  # Test production build locally
```

Deploy to Vercel (auto-detects SvelteKit):

```bash
npx vercel
```

## 🎮 User Flow

1. **IDLE** - Landing page with hero background and "Roll" button
2. **ROLLING** - 1.8s overlay with loading animation
3. **REVEALED** - Modal showing selected artwork with Buy/Close options

## 🎨 Customization

### Styling

- Edit `tailwind.config.cjs` for theme customization
- Modify `src/styles/app.css` for global styles
- Update component styles in individual `.svelte` files

### Content

- **Copy**: Edit `src/lib/data/copy.ts` for all text content
- **Artworks**: Update `src/lib/data/artworks.ts` with your designs
- **Images**: Replace files in `static/` directories

### Functionality

- **Rolling Logic**: Modify `src/lib/utils/roll.ts` for selection algorithms
- **Animations**: Add Motion One animations in component files
- **State Management**: Update state flow in `src/routes/+page.svelte`

## 📝 TODO Checklist

### Launch Requirements

- [ ] Add hero image to `static/hero/hero-placeholder.jpg`
- [ ] Add 5-10 fortune artworks to `static/fortunes/`
- [ ] Update `src/lib/data/artworks.ts` with actual artwork data
- [ ] Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env`
- [ ] Test complete flow: roll → reveal → buy link
- [ ] Deploy to Vercel

### Future Enhancements

- [ ] Server-side scarcity tracking
- [ ] User accounts and history
- [ ] Advanced rolling algorithms with weights
- [ ] Social sharing features
- [ ] Mobile app version

## 🔧 Development Notes

- All components include TODO comments for implementation guidance
- State management is handled in the main page component
- Stripe integration is MVP-ready with environment variable
- Animations are scaffolded but need Motion One implementation
- Responsive design considerations are included throughout

## 📄 License

[Add your license information here]

---

**Ready to build your tattoo fortune empire! 🎲✨**
