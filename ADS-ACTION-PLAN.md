# Ads Action Plan — Local Service Business
**Date:** 13 June 2026 | **Budget:** £500/month | **Platforms:** Google Ads + Meta Ads (LinkedIn eliminated)

---

## CRITICAL — Complete BEFORE spending any money

These are hard blockers. Running ads without these = guaranteed wasted spend.

### Week 0: Pre-Launch Checklist

| # | Action | Platform | Time | Why it's blocking |
|---|---|---|---|---|
| 1 | Install Google Tag Manager on every page (head + body snippets) | All | 30 min | Foundation for all tracking |
| 2 | Implement Consent Mode v2 via a UK GDPR-compliant CMP (Cookiebot, Usercentrics, or Consentmanager) configured through GTM | Google / Meta | 45 min | Legal requirement; without it 25–40% of conversions are invisible to both platforms |
| 3 | Create Meta Business Portfolio at business.facebook.com — add ad account, Facebook Page, Instagram account | Meta | 15 min | No ads can run without Business Manager |
| 4 | Set Meta ad account currency to **GBP** and time zone to **Europe/London** — permanent, cannot be changed | Meta | 2 min | Irreversible setting; wrong currency = permanently broken billing |
| 5 | Install Meta Pixel via Events Manager + native CMS plugin (or GTM) | Meta | 15 min | Zero Meta campaign optimisation without this |
| 6 | Set up Conversions API (CAPI) via partner integration (Stape.io, WordPress plugin, Shopify native) | Meta | 15 min | 30–40% data loss from browser Pixel alone post-iOS 14.5 |
| 7 | Verify business domain in Meta Business Manager → Brand Safety → Domains | Meta | 10 min | Required for iOS 14.5+ AEM; without it, iOS conversions are unattributed |
| 8 | Configure Aggregated Event Measurement in Events Manager with priority: Schedule → Lead → Contact → ViewContent | Meta | 10 min | Controls how Meta attributes iOS conversions |
| 9 | Deploy Google Ads conversion linker tag and GA4 configuration tag via GTM | Google | 20 min | GA4 must be live before conversion actions are created |
| 10 | Create 3 Google Ads conversion actions: (a) Call from ad, (b) Website call (dynamic number), (c) Form/booking submission on thank-you page | Google | 20 min | Campaigns are unkillable without this — blind spend |
| 11 | Link GA4 property to Google Ads account | Google | 5 min | Enables audience building and post-click behaviour data |
| 12 | Build 4 shared negative keyword lists (Competitors / DIY+Free / Job seekers / Out-of-area) and apply to all campaigns | Google | 30 min | New accounts waste 20–40% on irrelevant queries in month 1 without this |
| 13 | Set account spending limit in Meta Billing: £150/month hard ceiling | Meta | 3 min | Prevents budget overrun |
| 14 | Set monthly spend limit in Google Ads billing: £350/month | Google | 5 min | Prevents 2× overdelivery from accumulating |
| 15 | Disable ALL auto-apply recommendations in Google Ads → Recommendations → Auto-apply | Google | 5 min | Prevents Google silently adding Broad Match keywords or changing bidding strategies |

---

## HIGH PRIORITY — Complete in the first 7 days after launch

### Google Ads Setup

| # | Action | Time |
|---|---|---|
| 16 | Create 1 Search campaign only. Do NOT create Performance Max. | 30 min |
| 17 | At campaign creation: uncheck **Display Network** and **Search Partners** in Networks | 3 min |
| 18 | Set location targeting to **Presence: People in or regularly in your targeted locations** — NOT the default | 2 min |
| 19 | Set bidding to **Manual CPC** — do not use Target CPA, Maximize Conversions, or Enhanced CPC at launch | 5 min |
| 20 | Set daily budget to £11.50 (£350 ÷ 30.4) — not £350/30 | 2 min |
| 21 | Create 1–3 ad groups by service intent (e.g. Emergency / Core Service / General). Do not create one large ad group. | 20 min |
| 22 | Use **Exact Match** and **Phrase Match** only — zero Broad Match in the first 3 months | 15 min |
| 23 | Research 15–25 keywords using Keyword Planner before selecting any | 30 min |
| 24 | Write 1 RSA per ad group: 15 unique headlines (keyword, USP, social proof, CTA, service specifics), 4 descriptions. Target 'Good' or 'Excellent' Ad Strength before saving. | 45 min |
| 25 | Create all 6 asset types at account level: Call (business hours only), Location (link Google Business Profile), 4 Sitelinks, 4 Callouts, Structured Snippet (Services), 3 Image assets | 25 min |
| 26 | Set ad schedule to business hours (± 1 hour buffer) | 5 min |
| 27 | Set language targeting to **English only** | 2 min |
| 28 | Create 3 remarketing audience lists (All visitors 30d / Service page visitors 30d / Non-converters 14d) on day 1 — add to campaign as Observation +20% bid adjustment | 15 min |

### Meta Ads Setup

| # | Action | Time |
|---|---|---|
| 29 | Connect Facebook Page and Instagram account to the ad account in Business Manager | 10 min |
| 30 | Add payment method; confirm spending limit is set to £150/month | 5 min |
| 31 | Design booking/enquiry forms to capture: first name, last name, email, phone — pass all four with Lead and Schedule events for EMQ ≥8.0 | 15 min |
| 32 | Verify Pixel firing: use Meta Pixel Helper Chrome extension and Events Manager Test Events tab before launching any campaign | 10 min |
| 33 | Create 1 campaign only (Leads objective if Pixel ready; Traffic if not). Structure: 1 campaign → 1 ad set → 3–5 ads | 20 min |
| 34 | Set ad set geo targeting: radius 10–15 miles from business address; 'People living in this location' only | 5 min |
| 35 | Enable **Advantage+ Placements** (automatic) — do not restrict placements manually | 3 min |
| 36 | Set bid strategy to **Lowest Cost** (no cost cap) — no cost caps until Learning Phase exit | 3 min |
| 37 | Set attribution window to **7-day click only** — remove 1-day view | 2 min |
| 38 | Add UTM parameters to all ad URLs: `utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` | 5 min |
| 39 | Set optimisation event to **Contact** or **ViewContent** initially (higher volume than Lead) — graduate to Lead once 50+ weekly events flow | 3 min |

### Creative Production (Both Platforms)

| # | Action | Time |
|---|---|---|
| 40 | Take 3 genuine business photos on a smartphone: team in uniform / branded clothing, completed job with quality visible, vehicle or premises with branding. Shoot in good natural light. | 15 min |
| 41 | Record 1 video: 15–30 seconds, vertical (9:16). Hook (0–3s: problem statement), service/proof (3–20s: job being done or happy customer), CTA with phone on screen (20–30s). Also crop to 1:1 for Feed. | 15 min |
| 42 | Produce 3 Meta ad creative concepts from the above assets: (a) single image with local town name in headline, (b) 15–30s video, (c) carousel of 3–5 services or before/after cards | 30 min |
| 43 | Upload 3 image assets to Google Ads at account level: job quality, team/technician, branded vehicle | 10 min |
| 44 | Verify landing page: phone number above fold, form ≤3 fields, loads in <2.5s on mobile (test at PageSpeed Insights), H1 contains target keyword, includes trust signals (reviews, accreditations) | 20 min |

---

## MEDIUM PRIORITY — Complete within 30 days of launch

| # | Action | Platform | Time |
|---|---|---|---|
| 45 | Review search terms report every 3–4 days in month 1 — add irrelevant queries to shared negative lists | Google | 15 min/week |
| 46 | Review Google Ads recommendations weekly — manually assess each; accept only those aligned with strategy | Google | 10 min/week |
| 47 | After 30 days: review Devices report. Apply +30% mobile bid adjustment if mobile CPL is ≤ desktop CPL. Apply −100% tablet if no tablet conversions. | Google | 10 min |
| 48 | After 30 days: check Meta ad frequency in 7-day window. If frequency >3.0, refresh creative or reduce budget temporarily. Prepare second wave of creative assets by week 4. | Meta | 10 min/week |
| 49 | After 30 days: check search impression share. If Lost IS (Budget) >30% on Google, increase budget or tighten geo. If Lost IS (Rank) >30%, increase bids or improve Quality Scores. | Google | 10 min |
| 50 | Build 10 genuinely distinct creative concepts for Meta (different visual, message angle, format) — do not produce 20 variants of 1 photo | Meta | 2–3 hours |
| 51 | Link Google Business Profile to Google Ads account — enables seller ratings (review stars) in ads | Google | 5 min |
| 52 | Set up Google Ads billing alerts at 50%, 75%, and 90% of monthly budget | Google | 5 min |
| 53 | Once Pixel has 100+ events: create 30-day website Custom Audience in Meta and test small retargeting ad set at £2–3/day | Meta | 15 min |
| 54 | If 15+ Google conversions in 30-day window: switch from Manual CPC to Maximize Conversions | Google | 5 min |

---

## LOW PRIORITY — Backlog (Month 3+)

| # | Action | Platform |
|---|---|---|
| 55 | Set up Offline Conversion Import via GCLID once a CRM or job management tool (Jobber, Tradify, ServiceM8) is in use | Google |
| 56 | Assign conversion values to conversion types (booked call = average job value × close rate) — enables future tROAS bidding | Google |
| 57 | Once Custom Audience hits 100+ matched Meta users: create 1% Lookalike restricted to service area | Meta |
| 58 | Evaluate adding Price assets for fixed-price services (e.g. 'Boiler Service from £89') | Google |
| 59 | If budget reaches £800+/month: switch Meta to Leads objective with Cost Cap bidding | Meta |
| 60 | At month 6+: evaluate Demand Gen (YouTube/Gmail/Discover) at £20+/day for brand awareness and remarketing | Google |
| 61 | Only when total budget reaches £3,000/month AND business serves commercial clients: pilot LinkedIn at 10% allocation (£300/month) with strict £90 CPL kill rule | LinkedIn |

---

## Scaling Triggers

| Trigger | Action |
|---|---|
| 15 Google conversions in 30 days | Switch to Maximize Conversions bidding |
| 30 Google conversions in 30 days | Increase Google budget 20% (£350 → £420). Evaluate tCPA target. |
| 50 Meta events/week | Switch Meta optimisation event from Contact/ViewContent to Lead |
| Meta CPL ≤ Google CPL | Increase Meta to 35% of total budget; reduce Google proportionally |
| Total budget reaches £800/month | Apply 70/20/10: Google £560 / Meta £200 / Test £40 |
