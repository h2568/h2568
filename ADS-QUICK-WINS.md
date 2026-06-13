# Quick Wins — Local Service Business Ads Setup
**Date:** 13 June 2026 | Items fixable in under 15 minutes with high or critical impact

Sorted by impact × urgency. Do these first, in order.

---

## Before You Spend a Single Penny (Do These Today)

| # | Action | Platform | Time | Impact |
|---|---|---|---|---|
| 1 | **Set Meta ad account currency to GBP and time zone to Europe/London** when creating the account. This is permanent — cannot be changed after creation. | Meta | 2 min | Critical |
| 2 | **Disable ALL auto-apply recommendations in Google Ads** → Recommendations → Auto-apply → Deselect everything. Prevents Google silently adding Broad Match keywords or changing bidding strategy overnight. | Google | 5 min | Critical |
| 3 | **Set Meta account spending limit to £150/month** in Business Manager → Billing. Hard ceiling — prevents overrun. | Meta | 3 min | Critical |
| 4 | **Set Google Ads monthly spend limit to £350** in account billing settings. | Google | 5 min | Critical |
| 5 | **Change Google location targeting to 'Presence only'** in every campaign (Locations → Location Options → Presence). Default is 'Presence or interest' — shows ads to people outside your service area. Saves 10–20% of budget. | Google | 5 min | Critical |
| 6 | **Uncheck Display Network and Search Partners** when creating any Google Search campaign. Both are enabled by default; both dilute budget with lower-quality traffic. | Google | 3 min | Critical |
| 7 | **Verify Meta business domain** in Business Manager → Brand Safety → Domains (DNS TXT record). Required before any iOS conversion attribution works. | Meta | 10 min | High |
| 8 | **Set Meta attribution window to 7-day click only** (remove 1-day view) in ad set settings before first campaign goes live. | Meta | 2 min | High |
| 9 | **Set Google call asset to show during business hours only**. Call assets showing at 3am when you can't answer waste money and damage brand trust. | Google | 5 min | High |
| 10 | **Add UTM parameters to all Meta ad URLs** using dynamic parameters: `utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`. Do this before the first campaign goes live. | Meta | 5 min | High |

---

## Creative Quick Wins (Free, Same Day)

| # | Action | Platform | Time | Impact |
|---|---|---|---|---|
| 11 | **Take 3 real business photos on a smartphone**: (a) team in uniform, (b) completed job, (c) branded vehicle or premises. Authentic local imagery outperforms stock for local service ads on both platforms. | Both | 15 min | High |
| 12 | **Record a 15–30 second vertical (9:16) video**: 3s hook ("Tired of waiting weeks for a [service]?") + 20s proof (job being done or happy customer) + 7s CTA with phone number on screen. Crop to 1:1 for Feed use. | Meta | 15 min | High |
| 13 | **Name your town in every Meta ad headline**. "Serving [Town] and surrounding areas" or "[Town]'s Trusted [Service]" consistently outperforms generic local copy by a meaningful margin. | Meta | 5 min | High |

---

## Google Ads Setup Quick Wins

| # | Action | Time | Impact |
|---|---|---|---|
| 14 | **Set language targeting to English only** in every campaign. Default includes all languages. | 2 min | Medium |
| 15 | **Set ad schedule to business hours** (± 1 hour buffer) in campaign settings. | 5 min | High |
| 16 | **Set daily budget to £11.50** (£350 ÷ 30.4, not ÷ 30). Google can overspend by 2× on high-traffic days, so the correct formula matters. | 2 min | Medium |
| 17 | **Add 4 Callout assets at account level**: '24/7 Emergency Cover', 'Free No-Obligation Quotes', 'All Work Fully Insured', 'Same-Day Service Available'. Takes 5 minutes; gives Google more real estate in every ad. | 5 min | High |
| 18 | **Add 4 Sitelink assets at account level**: Our Services / About Us & Reviews / Service Areas / Get a Free Quote. | 10 min | High |
| 19 | **Create audience observation lists on day 1** (All website visitors 30d, Service page visitors 30d, Non-converters 14d) — add to campaigns as Observation with +20% bid adjustment. They start empty but will populate. | 10 min | Medium |

---

## Meta Ads Setup Quick Wins

| # | Action | Time | Impact |
|---|---|---|---|
| 20 | **Install Meta Pixel via native CMS plugin** (WordPress: Meta for WordPress plugin; Squarespace/Wix: built-in integrations). Verify immediately with Meta Pixel Helper Chrome extension. | 15 min | Critical |
| 21 | **Configure Aggregated Event Measurement** in Events Manager with priority order: Schedule → Lead → Contact → ViewContent. Takes 10 minutes after domain verification. | 10 min | High |
| 22 | **Enable Advantage+ Placements** on every ad set (automatic placements). Giving Meta access to all placements reduces CPM versus manual restrictions. | 2 min | Medium |
| 23 | **Set optimisation event to Contact or ViewContent** at launch (not Lead). This generates more events per day at lower cost, helping the algorithm exit Learning Phase faster on a constrained budget. Upgrade to Lead once 50+ weekly events are flowing. | 3 min | High |
| 24 | **Create an empty 30-day website Custom Audience** on day 1 so it starts accumulating from the moment the Pixel fires. Won't be usable for retargeting until it hits 100+ users, but starting it on day 1 means it's ready faster. | 5 min | Medium |

---

## Do NOT Do (Common New Advertiser Mistakes)

| Mistake | Why it's expensive |
|---|---|
| Using Broad Match keywords on Google | Broad Match without Smart Bidding data = 30–50% of spend on irrelevant queries |
| Using Target CPA before 30 conversions | Permanent Learning Limited status; the algorithm can't find a CPA signal it doesn't have data for |
| Running multiple campaigns at launch | Fragments spend below meaningful thresholds on every campaign simultaneously |
| Setting interest targeting in Meta AND demographic AND geo together | AND logic creates audiences too small to exit Learning Phase at £5/day |
| Using stock images in Meta ads | Authentic business photography consistently outperforms stock for local services |
| Accepting Google's 'Recommendations' without reviewing them | Many recommendations expand match types or raise budgets beyond your strategy |
| Splitting budget across LinkedIn at this spend level | LinkedIn CPL is 3–7× higher than Google or Meta; minimum viable budget is £3,000/month |
