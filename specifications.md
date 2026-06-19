# EMMYOR: Project Specification – Internship 2026
## PROJECT 1: E-Commerce Platform — Backend Development
**Aligned with Cahier des Charges Backend v1.0 — June 2026**

* [cite_start]**Assigned To:** Josué KEITA + Khalid EL HOUSNI [cite: 5]
* [cite_start]**Duration:** 4 weeks — June 2026 [cite: 6]
* [cite_start]**Frontend Status:** Already built — Next.js 14, TypeScript, Tailwind CSS, ShadCN UI [cite: 7]
* [cite_start]**Mission:** Implement the full backend to make the platform fully operational [cite: 8]
* [cite_start]**Priority #1:** WhatsApp Order feature — must be delivered first [cite: 9]

---

## 1. Project Overview
[cite_start]EMMYOR is a Moroccan agricultural e-commerce platform connecting local farmers to national and international markets[cite: 11]. [cite_start]The platform is fully bilingual (French/Arabic) and supports three distinct user journeys: end consumers (B2C), farmers/cooperatives, and businesses (B2B)[cite: 12].

[cite_start]The frontend is fully designed and functional on the rendering side[cite: 13]. [cite_start]Your job as backend developers is to wire everything up: database, API routes, authentication, orders, traceability, donations, and the admin panel[cite: 14].

### 1.1 Existing Frontend Stack
* [cite_start]**Framework:** Next.js (App Router) 14+ (React SSR/SSG framework) [cite: 16]
* [cite_start]**Language:** TypeScript 5+ [cite: 16]
* [cite_start]**Styling:** Tailwind CSS 3+ & ShadCN UI [cite: 16]
* [cite_start]**Internationalization:** next-intl (i18n EN/AR) [cite: 16]
* [cite_start]**Local Dev Database:** SQLite (better-sqlite3) [cite: 16]
* [cite_start]**Security Helper:** bcryptjs (Password hashing) [cite: 16]

### 1.2 Recommended Backend Stack
* [cite_start]**Runtime:** Node.js (Next.js API Routes) *(Alternatives: Bun, Express)* [cite: 18]
* [cite_start]**Database:** PostgreSQL for production *(Alternatives: MySQL, SQLite for dev)* [cite: 18]
* [cite_start]**ORM:** Prisma or Drizzle ORM *(Alternative: Sequelize)* [cite: 18]
* [cite_start]**Auth:** NextAuth.js v5 *(Alternatives: Clerk, Auth0)* [cite: 18]
* [cite_start]**File Storage:** Cloudinary or AWS S3 *(Alternative: Vercel Blob)* [cite: 18]
* [cite_start]**Payment API:** CMI / Stripe *(Alternative: PayPal)* [cite: 18]
* [cite_start]**Email Service:** Resend or SendGrid *(Alternative: Nodemailer)* [cite: 18]
* [cite_start]**Deployment:** Vercel or Railway *(Alternative: VPS Ubuntu + PM2)* [cite: 18]

---

## 2. Database Architecture

### 2.1 Existing Tables (To Migrate SQLite → PostgreSQL)
[cite_start]The initial schema is defined in `db/migrations/001_create_tables.sql`[cite: 21]. Migrate this SQLite schema to PostgreSQL and extend it with the fields below:
* [cite_start]**users:** id, email, password(hash), full_name, phone_number, city, role, is_active [cite: 22]
* [cite_start]**customers:** id, user_id (FK) [cite: 22]
* [cite_start]**farmers:** id, user_id, farm_location, experience, certifications (JSON) [cite: 22]
* [cite_start]**cooperatives:** id, user_id, members, location, certifications [cite: 22]
* [cite_start]**companies:** id, user_id, company_name, industry, size [cite: 22]
* [cite_start]**individual_producers:** id, user_id, brand_name [cite: 22]
* **retailers:** id, user_id, store_name, location [cite: 22]
* [cite_start]**commercial:** id, user_id, department, employee_id [cite: 22]
* [cite_start]**products:** id, name, description, price, unit, origin, packaging, image, farmer_id, producer_id [cite: 22]
* **cart_items:** id, customer_id, product_id, quantity [cite: 22]
* **orders:** id, user_id, status (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED), total [cite: 22]
* [cite_start]**order_items:** id, order_id, product_id, quantity, price [cite: 22]
* **wishlist:** customer_id, product_id (composite PK) [cite: 22]

### 2.2 New Tables to Create
* [cite_start]**product_tracking:** id, product_id, sku, qr_code_url, batch_number, created_at [cite: 24]
* [cite_start]**tracking_timeline:** id, product_id, stage, date, details, type (reception/processing/packaging) [cite: 24]
* **donations:** id, donor_id, farmer_id, amount, currency, payment_status, message, created_at [cite: 24]
* [cite_start]**donation_campaigns:** id, farmer_id, title, target_amount, current_amount, status, deadline [cite: 24]
* [cite_start]**b2b_consultations:** id, company_name, contact_name, email, phone, service_type, message, status, created_at [cite: 24]
* [cite_start]**farmer_registrations:** id, user_id, farm_name, location, products (JSON), certifications, status (PENDING/APPROVED/REJECTED) [cite: 24]
* [cite_start]**whatsapp_settings:** id, phone_number, is_active, message_template, updated_at, updated_by [cite: 24]
* [cite_start]**whatsapp_orders:** id, order_id, whatsapp_number, message_sent, sent_at, status (SENT/CONFIRMED/CANCELLED) [cite: 24]
* **product_reviews:** id, product_id, customer_id, rating (1-5), comment, created_at [cite: 24]
* [cite_start]**farm_media:** id, farmer_id, media_type (image/video), url, caption, created_at [cite: 24]
* [cite_start]**settings:** key, value, description, updated_at [cite: 24]

---

## 3. User Roles & Permissions

### 3.1 Roles
* **CUSTOMER:** End consumer. Access to shop, cart, orders, wishlist, tracking, donations[cite: 27].
* **FARMER:** Individual farmer. [cite_start]Access to farmer dashboard, product listings, offers, shipments[cite: 27].
* **COOPERATIVE:** Agricultural cooperative. [cite_start]Same as FARMER + member management[cite: 27].
* **COMPANY:** B2B company. Access to B2B consultation, bulk orders, analytics dashboards[cite: 27].
* **INDIVIDUAL_PRODUCER:** Processor/producer. [cite_start]Access to finished product management, packaging, listings[cite: 27].
* **RETAILER:** Distributor/Reseller. Access to bulk orders, B2B catalog[cite: 27].
* **COMMERCIAL:** Internal EMMYOR employee. [cite_start]Access to offer management, support, moderation[cite: 27].
* **ADMIN:** System administrator. [cite_start]Full system access + admin panel[cite: 27].

### 3.2 Access Matrix
* **Browse Shop:** CUSTOMER, FARMER, COMPANY, COMMERCIAL, ADMIN [cite: 29]
* [cite_start]**Add to Cart / WhatsApp Order:** CUSTOMER, ADMIN [cite: 29]
* [cite_start]**List Raw Materials / Accept Offers:** FARMER [cite: 29]
* **Make B2B Request / Donation:** COMPANY, CUSTOMER (Donations only) [cite: 29]
* [cite_start]**Manage Catalog / Moderation:** FARMER, COMMERCIAL, ADMIN [cite: 29]
* [cite_start]**Configure Settings / Full Admin:** ADMIN [cite: 29]

---

## 4. Module 1 — Authentication (CRITICAL)
* **Multi-role Registration:** Automatically populates extended tables (e.g., Customers, Farmers) based on selected role during signup[cite: 34].
* [cite_start]**Validation:** Apply backend Zod schemas to match existing frontend input forms[cite: 35].
* [cite_start]**Social Auth:** Set up Google, Facebook, and Apple via NextAuth.js OAuth[cite: 36, 42].
* **Sessions:** Database adapters via Prisma with an access token (15 min) and refresh token (7 days)[cite: 38, 42].
* [cite_start]**Route Protection:** Complete `middleware.ts` to explicitly block unauthorized access to `/dashboard` and `/admin` routes[cite: 39, 42].
* [cite_start]**Security & GDPR:** Collect tracking consents on signup[cite: 40]. [cite_start]Rate-limit to a maximum of 5 login attempts per IP per 15 minutes[cite: 42].

---

## 5. Module 2 — Shop & Product Catalog (CRITICAL)
* [cite_start]**Categories (DB-driven):** Raw Nuts, Roasted Nuts, Nut Butters (Amlou), Oils (Argan, Olive), Herbs, Spices, Honey, and Bulk Orders[cite: 46, 47, 48, 49, 50, 51, 52, 53].
* **Required Product Fields:** name (EN/AR), description (EN/AR), price (MAD), unit, origin (Moroccan region), image (Cloudinary/S3 URL), category, sku, stock, and is_active[cite: 55].
* **Endpoints:**
  * `GET /api/products` (Paginated, filtered, and sorted) [cite: 57]
  * [cite_start]`GET /api/products/:id` (Details + associated farmer) [cite: 57]
  * [cite_start]`GET /api/products/search?q=` (Full-text search on name & description) [cite: 57, 59]
  * `POST/PUT /api/products` (FARMER or ADMIN authorized) [cite: 57]
  * [cite_start]`DELETE /api/products/:id` (ADMIN only) [cite: 57]
* [cite_start]**Filters:** Price range sliders (0-50, 51-100, 101-200, 201+ DH), sorting (price, alphabetical, newest), origin region, and certifications (ONSSA, Bio)[cite: 60, 61, 62, 63]. [cite_start]Pagination defaults to 12 items[cite: 64].

---

## 6. Module 3 — Cart & Orders (CRITICAL)
* [cite_start]**Cart Logic:** Persistent DB cart for authenticated users[cite: 68]. [cite_start]`localStorage` fallback for guests that merges seamlessly upon login[cite: 69]. [cite_start]Autocalculates subtotals, shipping zones, and final grand totals[cite: 71].
* **Endpoints:** `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `DELETE /api/cart`[cite: 73].
* [cite_start]**Order Flow:** Checkout triggers a `PENDING` order state and fires an initial email[cite: 76, 78, 79]. [cite_start]Admin status modifications dynamically fire transactional status update emails to customers[cite: 80, 81].
* **Endpoints:** `POST /api/orders` (CUSTOMER), `GET /api/orders`, `PUT /api/orders/:id/status` (COMMERCIAL/ADMIN), `DELETE /api/orders/:id` (Cancel if PENDING)[cite: 83].

---

## 7. Module 4 — WhatsApp Order Feature (TOP PRIORITY)
*This feature is the primary sales driver. [cite_start]It must be fully working end-to-end before any advanced modules[cite: 86, 247].*

* [cite_start]**Approach:** Uses free, non-API `wa.me` links (`https://wa.me/{PHONE_NUMBER}?text={ENCODED_MESSAGE}`)[cite: 95, 106].
* **Flow:**
  1. Customer clicks 'Order via WhatsApp' on product page, cart, checkout, or mobile floating buttons[cite: 89, 103, 105].
  2. Frontend requests `POST /api/whatsapp/order`[cite: 105].
  3. API saves the order record as `WHATSAPP_PENDING` and logs the interaction inside `whatsapp_orders`[cite: 92, 105].
  4. API builds a URL-encoded message containing order items, totals, prices, and customer data using the admin template configuration[cite: 90, 97, 105].
  5. User is redirected to WhatsApp in a new tab[cite: 91, 105].
  6. Admin manually manages processing and flips status to `CONFIRMED` in the dashboard, triggers confirmation email[cite: 93, 105].
* [cite_start]**Endpoints:** `POST /api/whatsapp/order`, `GET /api/whatsapp/settings`, `PUT /api/whatsapp/settings` (ADMIN), `GET /api/whatsapp/orders` (ADMIN/COMMERCIAL)[cite: 101].

---

## 8. Module 5 — Admin Panel (HIGH PRIORITY)
Protected route at `/admin`. [cite_start]Requires `ADMIN` role (`COMMERCIAL` has limited view)[cite: 109].
* **Dashboard Stats:** Revenue tracking, order counts, pending approvals list, and low-stock indicators[cite: 111, 113, 114, 115].
* [cite_start]**Product Engine:** CRUD actions, media ingestion (Cloudinary/S3), and toggle controls for visibility[cite: 117, 118, 121].
* [cite_start]**Order Engine:** List, filter, status adjustment, CSV export, and dedicated WhatsApp logs management[cite: 123, 124, 126, 127].
* **User Control:** Handle role adjustments, profile audits, and toggle active status flags[cite: 129, 131, 132].
* [cite_start]**Key Sections:** Admin WhatsApp configuration panel (Input format validation for international layouts like `+212XXXXXXXXX`, real-time message layout previews, test system)[cite: 143, 145, 146, 147, 149].

---

## 9. Module 6 — Farmer Module (HIGH PRIORITY)
* [cite_start]**Registration Handling:** Validate submissions from `FarmerRegistrationForm`[cite: 165, 166]. [cite_start]Inserts a `PENDING` row in `farmer_registrations`, notifies administration, and sends a receipt email to the farmer[cite: 167, 168, 169].
* **Dashboard (`/dashboard/farmer`):** Real-time monitoring of listings, pending client offers, monthly revenue, and ongoing transport/shipments[cite: 171, 172, 173, 174, 175].
* [cite_start]**Endpoints:** `POST /api/farmers/register`, `GET /api/farmers/:id` (Public bio layout), `POST /api/farmers/listings` (Add raw materials), `PUT /api/farmers/offers/:id` (Accept or deny wholesale buying orders)[cite: 177].

---

## 10. Module 7 — QR Code Traceability (HIGH PRIORITY)
* [cite_start]**Concept:** QR labels on packaging lead users to a storytelling page: `https://emmyor.com/track/{SKU}`[cite: 181, 182, 192].
* **Tracking Page Metrics:** Displays farmer details, video assets, donation modules, and a detailed production lifecycle timeline (Reception → Processing → Packaging)[cite: 184, 185, 187, 189].
* [cite_start]**Generation Engine:** Built utilizing the `qrcode` library[cite: 191]. [cite_start]Saves URLs into `product_tracking` table and generates clear downloads for manufacturing[cite: 193, 194].
* [cite_start]**Endpoints:** `GET /api/track/:sku`, `POST /api/track/:sku/scan` (Analytics logging), `POST/PUT /api/admin/track/timeline`[cite: 196].

---

## 11. Module 8 — Donation System (MEDIUM PRIORITY)
* **Features:** Supports direct funding of a targeted farmer or pool distributions[cite: 200]. Displays visible contribution trackers and community metric blocks[cite: 203, 204].
* [cite_start]**Integrations:** Processes transactions via local CMI setups or international Stripe layers[cite: 205].
* [cite_start]**Endpoints:** `POST /api/donations`, `GET /api/donations/stats`, `POST /api/donations/webhook` (Verifies asynchronous updates)[cite: 208].

---

## 12. Module 9 — B2B Module (MEDIUM PRIORITY)
* **Offerings:** Packaging custom layouts, ONSSA certification processing, automation pipelines, and machinery procurement[cite: 212].
* [cite_start]**Lead Ingestion:** Handles corporate requests via `b2b_consultations`, pipes alerts to internal teams, and generates confirmations[cite: 215, 216, 217, 218].

---

## 13. Module 10 — Internationalisation (i18n) (HIGH PRIORITY)
* **Architecture:** Uses `next-intl` dynamically structured inside `/[locale]/` segments[cite: 224].
* [cite_start]**Backend Rules:** Content fields use explicit localized text layouts (`name_en`, `name_ar`) for performance stability[cite: 227, 231].
* [cite_start]**Pipes:** API functions intercepting `?locale=ar` context params return corresponding language packages[cite: 228]. [cite_start]Automated email structures track user locale context variables[cite: 229].

---

## 14. Transactional Emails (10 Actions Required)
* [cite_start]**User Registration:** Welcome + verification link[cite: 234].
* **Email Verification:** Token layout (24h expiration)[cite: 234].
* [cite_start]**Password Reset:** Token link (1h expiration)[cite: 234].
* [cite_start]**Order Confirmation:** Items breakdown list + timeline tracking[cite: 234].
* **Order Status Change:** Dynamic status update alerts[cite: 234].
* [cite_start]**WhatsApp Order Received:** Notification to administrators with details[cite: 234].
* [cite_start]**Donation Confirmed:** Receipt summary to donor and notification to the farmer[cite: 234].
* **Farmer Registration:** Review notification sent to the admin team[cite: 234].
* [cite_start]**Farmer Approved:** Dashboard guide sent to the farmer[cite: 234].
* [cite_start]**B2B Consultation Received:** Lead distribution notice sent to B2B team[cite: 234].

---

## 15. Global Security Layers (CRITICAL)
* **Inputs:** Re-evaluate and parse incoming data frames with Zod schemas on the backend[cite: 237].
* [cite_start]**SQL Injection:** Strict ORM abstractions via Prisma/Drizzle (No unchecked raw queries)[cite: 237].
* [cite_start]**Permissions Check:** Always crosscheck operational user role contexts directly within endpoint headers; never rely solely on client-side route defenses[cite: 237].
* **Rate Limits:** Defend authentication boundaries, payment endpoints, and WhatsApp channels against abuse[cite: 237].
* [cite_start]**Headers:** Explicitly verify `next.config.mjs` maps secure layers (X-Frame-Options, HSTS)[cite: 237].

---

## 16. Required Environment Variables
Ensure `.env.local` includes:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=random_32_char_string
NEXTAUTH_URL=[https://emmyor.com](https://emmyor.com)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
FACEBOOK_CLIENT_ID=numeric_id
FACEBOOK_CLIENT_SECRET=hex_string
CLOUDINARY_URL=cloudinary://api_key:secret@cloud_name
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@emmyor.com
STRIPE_SECRET_KEY=sk_live_...
WHATSAPP_DEFAULT_NUMBER=+212XXXXXXXXX

## 17. Neon informations
Connect app manually
Copy and paste production branch's connection details into the app's .env file

postgresql://neondb_owner:npg_hbJAxGz4FHK0@ep-steep-brook-atf2b1nv.c-9.us-east-1.aws.neon.tech/emmyor_website?sslmode=require
      
Connexion parameters:
 Host:
ep-steep-brook-atf2b1nv.c-9.us-east-1.aws.neon.tech
Database:
emmyor_website
Role:
neondb_owner
Password:
npg_hbJAxGz4FHK0
Pooler host:
ep-steep-brook-atf2b1nv-pooler.c-9.us-east-1.aws.neon.tech
