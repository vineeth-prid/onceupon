# Once Upon a Tym — Feature Roadmap & Implementation Plan

> Derived from comparing the reference HTML prototype against the current React + NestJS project.
> **Rule**: Keep the existing black-and-white minimal theme (Instrument Serif + Inter fonts, #000/#FFF/#6F6F6F palette). Adapt HTML features to match the current design language — do NOT copy the HTML's dark/gold/cream theme.

---

## Status Legend

- `DONE` — Already implemented in the current codebase
- `PARTIAL` — Some parts exist, needs expansion
- `NEW` — Not yet started, needs full implementation

---

## 1. PAGES & ROUTING

| # | Page/Route | HTML Section | Current Status | Notes |
|---|-----------|-------------|---------------|-------|
| 1 | Landing / Home (`/`) | `pg-home` | `PARTIAL` | Current has hero + video bg. Missing: ticker strip, "About" section on home, "How It Works" 4-step grid, occasions grid with tabs, book-open scroll animation, horizontal card slider, concept/step reveal section, testimonials carousel, CTA banner |
| 2 | Templates (`/templates`) | `pg-templates` | `PARTIAL` | Current `CreatePage` has template selection inline. HTML has a dedicated templates page with hero, filter chips (All/Children/Love/Life), sort dropdown, 9 template cards with cover art, pricing, and "Use Template" CTA |
| 3 | Create Wizard (`/create`) | `pg-wizard` | `PARTIAL` | Current has 1-step flow (select template → go to personalize). HTML has a 7-step wizard: (1) Occasion, (2) Theme/Template, (3) Character details, (4) Book format (size/cover), (5) Story details (names, dedication, language, occasion), (6) Photo upload (multi-photo up to 20), (7) Generating screen |
| 4 | Preview (`/preview/:id`) | `pg-preview` | `PARTIAL` | Current has flipbook. Missing: breadcrumb, page regeneration button, zoom, share preview, thumbnail strip, sidebar with pricing/order CTA, regeneration counter (5 free), "Edit book details" link |
| 5 | Auth — Login/Register (`/login`) | `pg-login` | `NEW` | Google SSO, email/password login, register with password strength, forgot password, "Continue as guest" option |
| 6 | Checkout (`/checkout/:id`) | `pg-checkout` | `NEW` | Format selection (eBook only vs Print+eBook), delivery speed (Standard/Express/Priority), shipping address form, add-ons (gift packaging, certificate, bookmarks), promo code input, payment method (Card/Apple Pay/Google Pay), order summary sidebar |
| 7 | Order Confirmation (`/confirmation/:id`) | `pg-confirmation` | `NEW` | Success animation, order details card, production/delivery status stepper, share & earn referral CTA, action buttons (track/create another/view account) |
| 8 | Order Tracking (`/tracking/:id`) | `pg-tracking` | `NEW` | Breadcrumb, ETA cards, production timeline with 5 stages (Placed → Generating → Printing → Dispatched → Delivered), carrier & tracking number section |
| 9 | User Profile (`/profile`) | `pg-profile` | `NEW` | Sidebar with avatar + nav. Tabs: My Books (grid of saved/drafted/completed), Orders (history list with statuses), Personal Details (edit form), Notifications (toggle preferences), Saved Addresses (manage delivery addresses) |
| 10 | FAQ (`/faq`) | `pg-faq` | `PARTIAL` | Current has basic FAQ accordion in `FAQ.tsx` on landing page. HTML has dedicated page with hero, category filter tabs (All/Creation/Print/Delivery/Payments), grouped accordion sections, "Still have questions?" CTA |
| 11 | About (`/about`) | `pg-about` | `NEW` | Hero, "Our Story" section with text + image collage, stats counter (50K+ books, 30+ occasions, 4.9 rating, 40+ countries), "Our Mission" cards, team grid |
| 12 | Contact (`/contact`) | `pg-contact` | `NEW` | Hero, contact info cards (email/chat/phone), response time box, contact form with topic chips (Book Creation/Order/Printing/Payments/Other), success message |
| 13 | Admin Panel (`/admin`) | `pg-admin` | `NEW` | Full admin dashboard (see Section 6 below) |

---

## 2. LANDING PAGE ENHANCEMENTS (Home — `/`)

Current landing page has: video background hero, basic CTA, categories/templates inline.

### New sections to add (in order, top to bottom):

| # | Section | Description | Priority |
|---|---------|------------|----------|
| 2.1 | **Enhanced Hero** | Stats counters (50K+ books, 30+ occasions, 4.9 rating), floating notification badges ("Just Generated: Emma's First Year"), dual CTA ("Start Your Book" + "Explore Occasions") | HIGH |
| 2.2 | **Ticker Strip** | Horizontal auto-scrolling marquee below hero with occasion keywords (Birthdays, Weddings, Baby's First Year, etc.), pauses on hover | MEDIUM |
| 2.3 | **About Preview Section** | 2-column grid: Left = heading + paragraph + feature list with icons (AI-Powered, Custom Illustrations, Premium Print). Right = book collage with floating badges | HIGH |
| 2.4 | **How It Works** | 4-step grid: (1) Choose Occasion, (2) Personalise, (3) AI Creates, (4) Delivered. Each step has icon, title, description. Hover reveals background color | HIGH |
| 2.5 | **Occasions Grid** | Tab-filtered grid (All/Children/Love/Life/Milestone). Card for each occasion type with emoji icon, name, template count. Click → templates page | MEDIUM |
| 2.6 | **Book Open Animation** | Scroll-triggered 3D book that opens from closed cover to spread view using CSS transforms + scroll progress. Shows sample pages inside | LOW |
| 2.7 | **Horizontal Card Slider** | Scroll-driven horizontal slider showing featured templates. Cards with cover image, tag, title, description, CTA | MEDIUM |
| 2.8 | **Concept/Process Section** | Left: accordion-style step list with auto-advance + progress bars. Right: animated panel that changes gradient/icon per step | LOW |
| 2.9 | **Testimonials Carousel** | Auto-scrolling testimonial cards with avatar, name, rating stars, quote text, book occasion tag | MEDIUM |
| 2.10 | **CTA Banner** | Full-width split section: Left = heading + CTA buttons. Right = decorative collage. "Ready to create something beautiful?" | HIGH |

---

## 3. NAVIGATION & LAYOUT

### Current
- Simple header with logo + nav links on landing page only
- No persistent nav across inner pages
- Footer exists with basic links

### Changes needed

| # | Feature | Description | Priority |
|---|---------|------------|----------|
| 3.1 | **Global Sticky Nav** | Persistent across all pages. Links: Templates, Create, About, FAQ, Contact. Shrinks on scroll with blur backdrop. "Create Book" primary CTA button | HIGH |
| 3.2 | **Auth Buttons in Nav** | "Sign In" button (when logged out) or avatar circle (when logged in) in nav. Avatar click → profile page | HIGH |
| 3.3 | **Mobile Menu** | Hamburger toggle → full-screen overlay menu with large nav links | HIGH |
| 3.4 | **Breadcrumbs** | On inner pages (Templates, Preview, Checkout, Tracking, FAQ, About, Contact) showing Home / ... / Current | MEDIUM |
| 3.5 | **Enhanced Footer** | 4-column grid: Brand description, Product links (Templates, Create, How It Works), Occasions (Children's, Wedding, Pregnancy, Life), Support (FAQ, Contact, Privacy, Terms). Bottom bar with copyright | PARTIAL → enhance |

---

## 4. USER-FACING FEATURES (NEW)

### 4.1 Authentication System
**Priority: HIGH**

| Feature | Details |
|---------|---------|
| Email/Password Auth | Register with first/last name, email, password. Password strength indicator (weak/fair/good/strong with color bar) |
| Google SSO | "Continue with Google" button with OAuth 2.0 flow |
| Forgot Password | Email-based reset link flow |
| Auth Guard | Redirect to login if unauthenticated user tries to create a book. Show toast: "Please sign in to create your book" |
| Guest Mode | Optional "Continue as guest" link on login page for browsing |
| Terms Agreement | Checkbox for Terms of Service + Privacy Policy on register |

**Backend**: New `auth` module with JWT tokens, bcrypt password hashing, Google OAuth strategy, password reset tokens.
**Database**: New `User` table (id, firstName, lastName, email, passwordHash, authProvider, avatarUrl, isVerified, createdAt). Link Order to User via `userId` FK.

### 4.2 Multi-Step Creation Wizard
**Priority: HIGH**

Current: Select template → Personalize (name, age, gender, photo, style) → Generate
HTML Wizard (7 steps):

| Step | Content | What's New vs Current |
|------|---------|----------------------|
| 1. Occasion | Select occasion type (Birthday, Baby's First Year, Wedding, Graduation, New Home, Anniversary, etc.) | `NEW` — currently jumps to template |
| 2. Theme/Template | Browse templates filtered by selected occasion. Grid of styled template cards | `PARTIAL` — exists but not as wizard step |
| 3. Character | Name, age, gender + character details. Multi-character support for couple/family books | `PARTIAL` — exists in PersonalizePage |
| 4. Book Format | Choose size/cover: Classic Square (21x21cm, 24pp, soft), Premium Square (25x25cm, 32pp, hard), Grand Portrait (21x28cm, 40pp, hard). Show pricing | `NEW` |
| 5. Story Details | Names in book, date/year, personal dedication, special details textarea, language select (English/Hindi/Arabic/French/etc.), occasion select | `NEW` |
| 6. Photo Upload | Upload 1-20 photos. Drag-and-drop zone, thumbnail previews, tip box about photo quality | `PARTIAL` — currently single photo |
| 7. Generating | Progress animation with 5 steps: Analyzing photos → Generating illustrations → Writing story → Designing layouts → Quality check | `PARTIAL` — exists as ProgressPage |

**Progress Bar**: Step indicator at top of wizard showing current/done/upcoming steps with connecting lines.
**Save & Continue**: "Save & continue later" button on every step → saves draft to user profile.

### 4.3 Enhanced Preview Page
**Priority: HIGH**

| Feature | Details |
|---------|---------|
| Page Regeneration | "Regenerate page" button per page. Counter: "3 of 5 regenerations remaining" with progress bar | `NEW` |
| Thumbnail Strip | Horizontal scrollable page thumbnails below reader for quick navigation | `NEW` |
| Zoom Mode | Click to zoom into current page spread | `NEW` |
| Share Preview | Generate shareable link for the book preview | `NEW` |
| Order Sidebar | Right sidebar: book title, "Ready to print" tag, price breakdown (creation + printing + delivery + add-ons), "Order This Book" CTA, secure checkout badge | `NEW` |
| Edit Link | "Edit book details" button → go back to wizard | `NEW` |

### 4.4 Checkout & Payment
**Priority: HIGH**

| Feature | Details |
|---------|---------|
| Format Selection | eBook Only (₹1,499) vs Print + eBook (₹4,499 — "MOST POPULAR" badge) | `NEW` |
| Delivery Speed | Standard 7-10 days / Express 3-5 days / Priority 1-2 days. Radio card selection | `NEW` |
| Shipping Address | Full address form (name, address lines, city, postcode, country dropdown, phone) | `NEW` |
| Add-ons | Toggle options: Gift Packaging (₹499), Certificate of Memory (₹249), Bookmark Set (₹149) | `NEW` |
| Promo Code | Input + "Apply" button. Validate codes (MEMORY10 = 10% off). Show success/error inline | `NEW` |
| Payment Methods | Card (number, expiry, CVV, name), Apple Pay, Google Pay — radio card selection | `NEW` |
| Order Summary | Sticky sidebar: book preview card, line-item pricing, total, format badge, trust badges | `NEW` |
| Dynamic Total | Recalculate total as format/delivery/add-ons/promo change | `NEW` |

**Backend**: Razorpay or Stripe integration. Payment webhook handler. Order status update on payment success.

### 4.5 Order Confirmation & Tracking
**Priority: MEDIUM**

| Feature | Details |
|---------|---------|
| Confirmation Page | Success animation (🎉), order number, book details card, estimated delivery date, production status stepper (5 stages) | `NEW` |
| Referral/Share | "Share & Earn $10" CTA + copy link | `NEW` |
| Tracking Page | Breadcrumb, ETA card, full production timeline (Order Placed → Generating → Printing → Dispatched → Delivered) with timestamps, carrier info, tracking number | `NEW` |

### 4.6 User Profile / Dashboard
**Priority: MEDIUM**

| Tab | Features |
|-----|---------|
| My Books | Grid of book cards (cover gradient, icon, title, metadata, status tag: Draft/Ordered/Delivered). "Create new book" card with dashed border + icon | `NEW` |
| Orders | List of orders with cover, title, order number, date, status badge (Generating/Printing/Dispatched/Delivered), price. Click → tracking | `NEW` |
| Personal Details | Edit first/last name, email, phone, password | `NEW` |
| Notifications | Toggle switches for: book complete, order dispatched, order delivered, draft reminder, promotions | `NEW` |
| Saved Addresses | List of addresses with default indicator. Add/edit/delete. "Set as default" | `NEW` |

---

## 5. DEDICATED PAGES (NEW)

### 5.1 Templates Page (`/templates`)
**Priority: HIGH**

- Page hero with title "Find Your Perfect Story" + subtitle
- Filter chips: All Occasions, Children, Love & Family, Life Milestones
- Sort dropdown: Most Popular, Newest, Price Low-High
- Template card grid (responsive: 3 cols → 2 → 1):
  - Cover with gradient background + emoji + title
  - Metadata: occasion tag, description text
  - Footer: price ("From ₹3,999") + "Use Template" button
- Templates from HTML: Baby's First Year, Wedding Story, Pregnancy Journey, New Home, Our Love Story, Travel Memories, Growing Up, Graduation, Family Bonds

### 5.2 FAQ Page (`/faq`)
**Priority: MEDIUM**

- Page hero
- Category filter tabs: All Topics, Book Creation, Printing, Delivery, Payments
- Grouped accordion sections:
  - **Book Creation** (4 FAQs): types of books, how AI personalizes, generation time, editing after generation
  - **Printing & Quality** (3 FAQs): formats/sizes, print quality, gift packaging
  - **Delivery** (3 FAQs): delivery times, international shipping, order tracking
  - **Payments & Refunds** (3 FAQs): payment methods, refund policy, promo codes
- "Still have questions?" CTA → Contact page

### 5.3 About Page (`/about`)
**Priority: LOW**

- Page hero: "We believe every story deserves a home"
- Our Story section: 2-column with narrative text + book collage
- Stats counter section: 50K+ Books, 30+ Occasions, 4.9★ Rating, 40+ Countries (animated counting on scroll)
- Our Mission: 3 cards (Memories That Last, Beauty in Every Page, Stories for Everyone)
- Our Team: 4-person grid with avatar, name, role, bio

### 5.4 Contact Page (`/contact`)
**Priority: MEDIUM**

- Page hero: "We'd love to hear from you"
- 2-column layout:
  - Left: heading, description, contact cards (Email, Live Chat, Phone), response time box
  - Right: Contact form with first/last name, email, order number (optional), topic chips, message textarea, submit button, success state

---

## 6. ADMIN PANEL (`/admin`)

**Priority: MEDIUM-HIGH**

### 6.1 Admin Layout
- Sidebar navigation (sticky, dark background) with sections:
  - **Dashboard**: Dashboard
  - **Commerce**: Orders (OMS), Pricing & Costs, Coupons
  - **Users**: Users, Books
  - **Integrations**: API Management, Payments, Notifications
  - **Settings**: Site Settings, Audit Logs
- Main area with header (page title, "Live" badge, admin avatar)
- Tab-based content switching

### 6.2 Dashboard Tab
- **Stats Grid** (6 cards): Total Orders, Revenue (MTD), Registered Users, Books Generated, Avg Rating, Conversion Rate — each with delta vs. last month
- **Recent Orders Table**: Order ID, Customer, Format, Status badge, Amount, View action
- **Quick Actions**: Generate Coupon, Send Notification, Manage Users, Update Pricing, Check API Status, View Payments

### 6.3 Orders (OMS) Tab
- Filter bar: search input, status dropdown (All/Generating/Printing/Dispatched/Delivered/Refunded), format filter, date picker
- Export CSV button
- Orders table: Order ID, Date, Customer, Book Title, Format, Delivery type, Status badge, Total, Actions (View/Refund/Resend/Track)
- Pagination

### 6.4 Pricing & Costs Tab
- **Product Pricing** form: AI creation fee, eBook price, print prices per format (Classic/Premium/Grand), gift packaging
- **Shipping & Tax** form: Standard/Express/Priority delivery prices, free shipping threshold, tax rate, default currency (INR/USD/GBP/EUR/AED/OMR)

### 6.5 Coupons Tab
- **Create Coupon** form: code, discount type (% or fixed), value, max uses, expiry date, min order amount. Auto-generate code button
- **Active Coupons** table: Code, Type, Value, Used count, Max uses, Expiry, Status (Active/Expired), Actions (Edit/Pause/Clone)

### 6.6 Users Tab
- Filter bar: search, auth method (Google/Email/Apple), status (Active/Suspended)
- Export CSV
- Users table: ID, Name, Email, Auth method, Books count, Orders count, Total spent, Joined date, Status, Actions (View/Suspend/Verify/Delete)
- Pagination

### 6.7 Books Tab
- Filter bar: search, occasion filter, style filter
- Books table: Book ID, Title, Occasion, Style, User, Generated date, Pages, Status, Actions (Preview)

### 6.8 API Management Tab
- API integration cards (2x2 grid):
  - **AI Generation**: Status dot, API key (masked), model selector, monthly budget cap, stats (API calls/cost/latency MTD)
  - **Payment Gateway**: Status, publishable/secret keys, mode (Live/Sandbox), stats (volume/decline rate/uptime)
  - **Print Partner**: Status, API key, store ID, mode
  - **Email & SMS**: Status, SendGrid API key, from email, Twilio token

### 6.9 Payments Tab
- **Stats Grid** (4 cards): Captured, Pending, Refunded, Failed amounts
- **Transaction History** table: Txn ID, Date, Customer, Order, Method (Visa/Google Pay etc.), Amount, Status (Captured/Failed), Actions (Refund/Details)

### 6.10 Notifications Tab
- **Send Notification** form: audience selector (All/Draft users/Recent purchasers/Specific user), channel checkboxes (Email/Push/SMS), subject, message textarea
- **Automated Triggers**: toggle list for: book complete, order confirmation, sent to print, dispatched, delivered, eBook download, abandoned draft reminder, post-delivery review request

### 6.11 Site Settings Tab
- **Site Settings**: site name, support email, max photos per book, max page regenerations, maintenance mode toggle
- **Google OAuth Config**: client ID, client secret, redirect URI, Apple client ID
- **Admin Access**: admin email, 2FA toggle, session timeout

### 6.12 Audit Logs Tab
- Filter: search, action type (Auth/Orders/Settings/API), date picker
- Export button
- Logs table: Timestamp, Admin, Action (LOGIN/UPDATE/CREATE/REFUND), Resource, IP, Result

---

## 7. DATABASE SCHEMA CHANGES

### New Tables Needed

```
User
├── id (UUID)
├── firstName, lastName
├── email (unique)
├── passwordHash (nullable — null for SSO users)
├── authProvider (enum: EMAIL, GOOGLE, APPLE)
├── googleId (nullable)
├── avatarUrl (nullable)
├── isVerified (boolean, default false)
├── role (enum: USER, ADMIN)
├── createdAt, updatedAt

Address
├── id (UUID)
├── userId (FK → User)
├── label (e.g. "Home", "Office")
├── firstName, lastName
├── addressLine1, addressLine2
├── city, state, postalCode, country
├── phone
├── isDefault (boolean)
├── createdAt

Coupon
├── id (UUID)
├── code (unique)
├── discountType (enum: PERCENTAGE, FIXED)
├── discountValue (Decimal)
├── maxUses (nullable = unlimited)
├── usedCount (default 0)
├── minOrderAmount (nullable)
├── expiresAt (nullable)
├── isActive (boolean)
├── createdAt

Payment
├── id (UUID)
├── orderId (FK → Order)
├── provider (enum: RAZORPAY, STRIPE)
├── externalId (payment gateway ID)
├── method (string: "visa_4242", "google_pay", etc.)
├── amount (Decimal)
├── currency (string)
├── status (enum: PENDING, CAPTURED, FAILED, REFUNDED)
├── createdAt

NotificationPreference
├── id (UUID)
├── userId (FK → User)
├── bookComplete (boolean)
├── orderDispatched (boolean)
├── orderDelivered (boolean)
├── draftReminder (boolean)
├── promotions (boolean)

AuditLog
├── id (UUID)
├── adminId (FK → User)
├── action (string: LOGIN, UPDATE, CREATE, REFUND, DELETE)
├── resource (string)
├── ipAddress (string)
├── result (enum: SUCCESS, FAILURE)
├── createdAt

SiteConfig
├── key (string, primary)
├── value (string)
├── updatedAt
```

### Modify Existing Tables

```
Order (add fields)
├── userId (FK → User, nullable for legacy)
├── bookFormat (enum: CLASSIC_SQUARE, PREMIUM_SQUARE, GRAND_PORTRAIT)
├── deliverySpeed (enum: STANDARD, EXPRESS, PRIORITY)
├── couponId (FK → Coupon, nullable)
├── discountAmount (Decimal, nullable)
├── addOns (JSON: {giftPackaging: bool, certificate: bool, bookmarks: bool})
├── dedication (text, nullable)
├── language (string, default "English")
├── occasion (string)
├── isDraft (boolean, default false)
├── wizardStep (int, nullable — for save & continue)
```

---

## 8. BACKEND API ENDPOINTS NEEDED

### Auth
- `POST /api/auth/register` — Email registration
- `POST /api/auth/login` — Email login → JWT
- `POST /api/auth/google` — Google OAuth callback
- `POST /api/auth/forgot-password` — Send reset email
- `POST /api/auth/reset-password` — Reset with token
- `GET /api/auth/me` — Current user profile

### Users
- `GET /api/users/me` — Profile
- `PATCH /api/users/me` — Update profile
- `GET /api/users/me/books` — My books (drafts + completed)
- `GET /api/users/me/orders` — Order history

### Addresses
- `GET /api/addresses` — List saved addresses
- `POST /api/addresses` — Add address
- `PATCH /api/addresses/:id` — Update
- `DELETE /api/addresses/:id` — Delete

### Checkout & Payment
- `POST /api/orders/:id/checkout` — Initialize payment (create Razorpay/Stripe session)
- `POST /api/webhooks/payment` — Payment webhook handler
- `POST /api/orders/:id/apply-coupon` — Validate and apply coupon

### Admin
- `GET /api/admin/dashboard` — Stats aggregation
- `GET /api/admin/orders` — Paginated, filtered order list
- `PATCH /api/admin/orders/:id` — Update order status
- `POST /api/admin/orders/:id/refund` — Process refund
- `GET /api/admin/users` — Paginated user list
- `PATCH /api/admin/users/:id` — Suspend/verify user
- `GET /api/admin/books` — Paginated book list
- `CRUD /api/admin/coupons` — Coupon management
- `GET /api/admin/payments` — Transaction history
- `CRUD /api/admin/site-config` — Site settings
- `GET /api/admin/audit-logs` — Audit log list
- `POST /api/admin/notifications/send` — Send notification

### Notifications
- `GET /api/notifications/preferences` — Get user prefs
- `PATCH /api/notifications/preferences` — Update prefs

### Contact
- `POST /api/contact` — Submit contact form

---

## 9. IMPLEMENTATION ORDER (Recommended Phases)

### Phase 1 — Foundation (Auth + Nav + Routing)
1. User table + Auth module (register, login, JWT, Google OAuth)
2. Global persistent nav bar with auth buttons
3. Mobile hamburger menu
4. Route guards (protected routes)
5. Footer enhancement

### Phase 2 — Core Pages
6. Dedicated Templates page (`/templates`) with filters + sort
7. FAQ page with category tabs
8. About page
9. Contact page with form

### Phase 3 — Enhanced Creation Flow
10. Multi-step wizard (7 steps with progress bar)
11. Book format selection (3 formats with pricing)
12. Story details step (dedication, language, occasion)
13. Multi-photo upload (up to 20 photos)
14. Save & continue later (draft persistence)

### Phase 4 — Commerce
15. Enhanced Preview page (regeneration counter, sidebar pricing, thumbnail strip)
16. Checkout page (format, delivery, address, add-ons, promo, payment)
17. Razorpay/Stripe payment integration
18. Order Confirmation page
19. Order Tracking page

### Phase 5 — User Dashboard
20. User Profile page with tabs (My Books, Orders, Details, Notifications, Addresses)
21. Notification preferences
22. Address management

### Phase 6 — Admin Panel
23. Admin layout + sidebar navigation
24. Dashboard tab (stats + recent orders)
25. Orders OMS tab (search, filter, table, pagination)
26. Pricing & Costs tab
27. Coupons tab (CRUD)
28. Users tab
29. Books tab
30. API Management tab
31. Payments tab
32. Notifications tab (send + automated triggers)
33. Site Settings tab
34. Audit Logs tab

### Phase 7 — Landing Page Polish
35. Enhanced hero (stats, floating badges)
36. Ticker strip
37. About preview section
38. How It Works grid
39. Occasions grid with tab filters
40. Testimonials carousel
41. CTA banner
42. Book open scroll animation (if desired)
43. Horizontal card slider (if desired)

---

## 10. TECHNICAL NOTES

### Frontend Architecture
- Each new page → new file in `apps/frontend/src/pages/`
- Shared components (Breadcrumb, StepIndicator, PriceCard, StatusBadge, etc.) in `components/`
- Admin panel → separate route group, possibly lazy-loaded
- Auth state management: React Context or Zustand for user session
- API client: extend `apps/frontend/src/api/` with new modules (auth, users, admin, etc.)

### Backend Architecture
- New NestJS modules: `auth`, `users`, `addresses`, `coupons`, `payments`, `admin`, `contact`, `notifications`, `site-config`, `audit-logs`
- Auth guard decorator for protected endpoints
- Admin role guard for admin endpoints
- Pagination utility (offset/limit or cursor-based)

### Styling Rules (DO NOT CHANGE)
- Keep Instrument Serif for display headings
- Keep Inter for body/UI text
- Keep black (#000) + white (#FFF) + gray (#6F6F6F) palette
- Keep existing card shadows, border-radius patterns
- Keep existing animation patterns (fade-rise, hover scale)
- Adapt new features to match this minimal aesthetic
