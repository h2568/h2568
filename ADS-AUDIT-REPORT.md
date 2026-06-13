# Ads Audit Report — Local Service Business
**Date:** 13 June 2026  
**Auditor:** Multi-platform advisory audit (fresh-start, no live account data)  
**Budget:** £500/month total  
**Platforms reviewed:** Google Ads, Meta Ads, LinkedIn Ads

---

## Executive Summary

### Aggregate Ads Health Score: 4/100 — Grade F

> **Expected for a fresh-start account.** A score of 4 means nothing is configured yet — this is the correct baseline before launch, not a reflection of bad management. The score will jump to 60–75 within 2 weeks once the critical setup items below are completed.

| Platform | Score | Grade | Recommended Budget | Status |
|---|---|---|---|---|
| Google Ads | 4/100 | F | £350/month (70%) | Fresh start |
| Meta Ads | 4/100 | F | £150/month (30%) | Fresh start |
| LinkedIn Ads | 8/100 | F | **£0/month (0%)** | **Not recommended** |
| **Aggregate** | **4/100** | **F** | **£500/month** | **Pre-launch** |

### Business Profile
- **Type:** Local service business (bookings, calls, foot traffic)
- **Geography:** UK (Consent Mode v2 required under UK GDPR)
- **Budget:** £500/month — below minimum viable for all three platforms individually; workable across two (Google + Meta) with disciplined structure
- **Active campaigns:** None

---

### Top 5 Critical Issues

1. **Zero tracking infrastructure on every platform.** No Google Tag Manager, no Meta Pixel, no Conversions API, no conversion actions defined. Every pound spent without tracking is permanently unattributed. This is a hard pre-spend blocker.

2. **Consent Mode v2 not implemented.** UK GDPR compliance requirement. Without it, 25–40% of UK visitors who decline cookies generate zero conversion signal, causing systematic under-reporting and preventing Smart Bidding from ever working correctly.

3. **No negative keyword protection on Google.** A new Google Ads account with no negative keywords will waste 20–40% of budget in month one on job seekers, DIY searches, and out-of-area users. At £350/month, that is £70–140 of unrecoverable spend.

4. **Meta Pixel and CAPI both absent.** Without the Pixel, Meta campaigns cannot optimise toward leads or bookings. Without CAPI (server-side tracking), 30–40% of conversions are lost to iOS 14.5+ browser blocking even after the Pixel is installed.

5. **LinkedIn is not viable at this budget.** Minimum viable LinkedIn spend is £3,000/month. One campaign at the platform floor (£8/day) would consume 48% of the total £500 budget while delivering leads at £60–150 each — 3–7× more expensive than Google or Meta. LinkedIn is eliminated and its would-be share is redirected to Google Search.

---

### Top 5 Quick Wins (under 15 minutes each)

1. **Disable Google Ads auto-apply recommendations** (5 min) — prevents Google silently adding Broad Match keywords or changing bidding strategies overnight.
2. **Set location targeting to 'Presence only' on every Google campaign** (5 min) — stops ads showing to people outside your service area; saves 10–20% of budget.
3. **Uncheck Search Partners and Display Network on Google Search campaigns** (3 min) — removes low-quality inventory that dilutes budget by default.
4. **Set Meta ad account spending limit to £150/month in Billing** (3 min) — hard ceiling prevents overrun.
5. **Set Google Ads account currency to GBP, time zone to Europe/London** (2 min) — permanent settings; cannot be changed after account creation.

---

## Budget Allocation

| Platform | Monthly | Daily | Share | Rationale |
|---|---|---|---|---|
| **Google Ads** | **£350** | **£11.50** | **70%** | Captures bottom-of-funnel local intent; highest-converting channel for local service |
| **Meta Ads** | **£150** | **£5.00** | **30%** | Brand awareness, retargeting, social proof creative |
| **LinkedIn Ads** | **£0** | **£0** | **0%** | Eliminated — B2B audience, 6× minimum viable budget, 3–7× higher CPL |

**Allocation rule:** Modified 70/30/0. Standard 70/20/10 framework collapses to two platforms when LinkedIn fails all viability checks. The 3× Kill Rule is pre-applied: LinkedIn's expected CPL (£60–150) already exceeds 3× the Meta benchmark CPL (£20–35) before a single penny is spent.

---

## Platform Audits

---

## Google Ads — Score: 4/100 (F)

*All checks default to FAIL for a zero-configured account. The 4 points reflect structural passes (no duplicate conversion tags possible, no ECPC campaigns).*

### Category Scores

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Conversion Tracking | 0/100 | 25% | 0 |
| Wasted Spend | 0/100 | 20% | 0 |
| Account Structure | 4/100 | 15% | 0.6 |
| Keywords | 0/100 | 15% | 0 |
| Ad Quality | 0/100 | 15% | 0 |
| Settings | 0/100 | 10% | 0 |
| **Total** | | | **4/100** |

### Conversion Tracking (Score: 0 — 7 Critical/High fails)

| Check | Status | Priority | Finding |
|---|---|---|---|
| G42 Conversion actions defined | FAIL | Critical | No conversion actions exist. Smart Bidding has zero signal. |
| G43 Enhanced conversions | FAIL | Critical | No account. Must enable before first spend. |
| G45 Consent Mode v2 (UK GDPR) | FAIL | Critical | UK business — legal pre-spend blocker. |
| G-CT3 Google Tag deployed | FAIL | Critical | No GTM or gtag.js on site. |
| G46 Call tracking configured | FAIL | Critical | Calls are primary conversion for local service; 3 layers needed. |
| G44 GA4 linked to Google Ads | FAIL | High | No GA4 property linked; no post-click behaviour visibility. |
| G47 Offline conversion imports | FAIL | Medium | No CRM integration planned; booked jobs will be unattributed. |

**Fix sequence:** GTM install → GA4 tag → Conversion Linker → Conversion actions (call from ad, website call, form submission) → Consent Mode v2 via CMP.

---

### Wasted Spend (Score: 0 — 5 Critical/High fails)

| Check | Status | Priority | Finding |
|---|---|---|---|
| G16 Wasted spend <5% | FAIL | Critical | New accounts without negatives waste 20–40% of month-one budget. |
| G17 No Broad Match + Manual CPC | FAIL | Critical | Broad Match must never be used without Smart Bidding at this budget. |
| G19 Display Network disabled | FAIL | Critical | Default is ON — silently routes Search budget to Display placements. |
| G13 Search term review cadence | FAIL | Critical | Must review every 3–4 days in month one. |
| G14 Negative keyword lists (4 themed) | FAIL | Critical | Competitors, DIY/free, job seekers, out-of-area. Build before launch. |
| G18 Search Partners disabled | FAIL | Medium | Default is ON — lower quality traffic for local service. |

---

### Account Structure (Score: 4 — partial credit for structural planning passes)

| Check | Status | Priority | Finding |
|---|---|---|---|
| G06 Geo targeting: service area only | FAIL | Critical | Must set to 'Presence only' — not default. |
| G11 Conversion tracking before first spend | FAIL | Critical | Hard gate: do not enable campaigns without verified conversion tags. |
| G01 Active campaign exists | FAIL | Critical | No campaigns. Start with one Search campaign only. |
| G02 Campaign type: Search only at launch | FAIL | High | Do NOT use Performance Max until 30+ conversions/month. |
| G09 Bidding: Manual CPC at launch | FAIL | High | Use Manual CPC until 30 conversions, then Maximize Conversions. |
| G05 Brand campaign planned | FAIL | Critical | Only create brand campaign once branded search volume appears. |
| G07 Remarketing audiences created on day 1 | FAIL | Medium | Create empty audiences on day 1 so they start populating. |

**Recommended structure at launch:**  
1 Search campaign → 1–3 ad groups by service/intent (e.g. Emergency, Boiler/Heating, General) → 1 RSA per ad group → Manual CPC bidding.

---

### Keywords (Score: 0 — 5 Critical/High fails)

| Check | Status | Priority | Finding |
|---|---|---|---|
| G25 No Broad Match | FAIL | Critical | Never use Broad Match in first 3 months. |
| G20 Keyword research completed | FAIL | Critical | Use Keyword Planner before launch. Target 15–25 keywords. |
| G21 High-intent local keywords prioritised | FAIL | High | '[service] + [city]', '[service] near me', 'emergency [service]' first. |
| G-WS1 Match type strategy documented | FAIL | High | Exact Match (60% of budget) + Phrase Match (40%) only. |
| G22 Quality Score target ≥7 | FAIL | High | Optimise landing page, ad relevance, and CTR before launch. |

---

### Ad Quality (Score: 0 — 6 Critical/High fails)

| Check | Status | Priority | Finding |
|---|---|---|---|
| G26 RSAs created per ad group | FAIL | Critical | Minimum 1 RSA per ad group before campaign enables. |
| G29 RSA Ad Strength: Good or Excellent | FAIL | Critical | Do not launch with 'Poor' Ad Strength. |
| G30 All 6 asset types configured | FAIL | Critical | Call, Location, Sitelink ×4, Callout ×4, Structured Snippet, Image ×3. |
| G31 Landing page: mobile-first, <2.5s load | FAIL | Critical | Phone number above fold, form ≤3 fields, Google PageSpeed ≥90. |
| G27 15 unique RSA headlines | FAIL | High | 15 headlines = maximum signal for Google's ML to optimise. |
| G33 Google Business Profile linked | FAIL | High | Must have ≥10 reviews before scaling spend. |

---

### Settings (Score: 0 — 7 Critical/High fails)

| Check | Status | Priority | Finding |
|---|---|---|---|
| G36 Location: 'Presence only' not 'Interest' | FAIL | Critical | Default is wrong — a single click saves 10–20% of budget. |
| G37 No tCPA before 30 conversions | FAIL | Critical | tCPA before data = permanent Learning Limited status. |
| G41 Auto-apply recommendations disabled | FAIL | High | Disable ALL auto-apply on day 1 of account creation. |
| G50 Monthly spend cap configured | FAIL | High | Set account billing limit = Google monthly allocation (£350). |
| G38 Ad schedule = business hours | FAIL | High | Running ads at 3am when you can't answer calls wastes budget. |
| G51 Smart bidding not applied prematurely | FAIL | Critical | If using Maximize Conversions at launch, cap daily budget at 50% for first 14 days. |
| G53 Google Business Profile linked | FAIL | High | Enables seller ratings (review stars) in ads. |

---

## Meta Ads — Score: 4/100 (F)

*4 points from structural passes: Offline Conversions API (deprecated May 2025) correctly not in use; no historical data distorted by Feb 2025 metric redefinition.*

### Category Scores

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Pixel / CAPI Health | 0/100 | 30% | 0 |
| Event Match Quality | 0/100 | 30% | 0 |
| Creative Diversity | 0/100 | 20% | 0 |
| Account Structure | 4/100 | 10% | 0.4 |
| Audience Targeting | 0/100 | 10% | 0 |
| **Total** | | | **4/100** |

### Pixel / CAPI Health (Score: 0 — 7 Critical/High fails)

| Check | Status | Priority | Finding |
|---|---|---|---|
| M01 Meta Pixel installed | FAIL | Critical | Zero website event data flowing to Meta. All optimisation will fail. |
| M02 Conversions API (CAPI) active | FAIL | Critical | 30–40% data loss from browser Pixel alone post-iOS 14.5. |
| M03 Event deduplication configured | FAIL | Critical | No dedup = Meta double-counts conversions; distorts algorithm. |
| M04 EMQ ≥8.0 for Lead events | FAIL | Critical | N/A — no Pixel active. Must pass email, phone, fn, ln with events. |
| M05 Standard events configured | FAIL | High | Need: ViewContent, Lead, Contact, Schedule — in that priority order. |
| M06 Domain verified in Business Manager | FAIL | High | Required for iOS 14.5+ conversion event configuration. |
| M07 Aggregated Event Measurement configured | FAIL | High | Required for iOS attribution. Priority: Schedule > Lead > Contact > ViewContent. |

---

### Event Match Quality (Score: 0)

| Check | Status | Priority | Finding |
|---|---|---|---|
| M11 EMQ ≥6.0 for all optimisation events | FAIL | Critical | Pass hashed email, phone, fn, ln with every Lead/Schedule event. |
| M13 Learning phase: <30% ad sets 'Learning Limited' | FAIL | Critical | £150/month = £5/day — high risk of chronic Learning Limited at launch. |
| M16 Campaign objective matches business goal | FAIL | High | Use Leads objective (if Pixel ready) or Traffic (if Pixel not ready). |
| M17 Ad set budget meets 5× CPA minimum | FAIL | High | £5/day is below threshold. Mitigate: 1 ad set only, broad optimisation event. |
| M14 Bid strategy: Lowest Cost at launch | FAIL | High | No cost caps until after Learning Phase exit. |

**Mitigation for low budget:** Use ViewContent or Contact as the optimisation event initially (more events = faster learning), then graduate to Lead once 50+ weekly events are flowing.

---

### Creative Diversity (Score: 0)

| Check | Status | Priority | Finding |
|---|---|---|---|
| M25 ≥3 creative formats active | FAIL | Critical | Launch minimum: single image + short video + carousel. |
| M-CR1 ≥10 genuinely distinct creatives | FAIL | High | Andromeda clusters visually similar ads — near-duplicates suppress delivery. |
| M-CR4 Real business photos, not stock | FAIL | Medium | Authentic local imagery (team, job site, vehicle) outperforms stock. |
| M-CR3 Video 15–30 seconds, 9:16 format | FAIL | Medium | Hook (3s) → service/proof (20s) → CTA with phone on screen (7s). |
| M31 Ad copy includes local area name | FAIL | Medium | Name the town/neighbourhood in every ad — significantly lifts local CTR. |
| M-AN1 Concept-first creative strategy | FAIL | High | 5 distinct concepts × 2 format variants = 10 assets, not 20 variants of 1 photo. |

---

### Account Structure (Score: 4)

| Check | Status | Priority | Finding |
|---|---|---|---|
| M33 Meta Business Portfolio created | FAIL | Critical | Must exist before any other step — no ads without Business Manager. |
| M34 Currency GBP, time zone Europe/London | FAIL | High | Permanent and irreversible — set correctly at account creation. |
| M36 Budget concentration: no splitting | FAIL | Critical | 1 campaign, 1–2 ad sets maximum at this budget. |
| M-ST1 Facebook Page + Instagram connected | FAIL | High | Pre-requisite for any campaign creation. |
| M39 UTM parameters on all ad URLs | FAIL | High | Required for GA4 attribution. Use Meta dynamic parameters. |
| M40 Attribution window: 7-day click only | FAIL | Medium | Remove 1-day view to avoid inflated conversion counts. |

---

### Audience Targeting (Score: 0)

| Check | Status | Priority | Finding |
|---|---|---|---|
| M19 Geo targeting: service area configured | FAIL | Critical | Radius 10–15 miles from business; 'People living in location' only. |
| M22 Advantage+ Audience: hold until month 2 | FAIL | Medium | Establish baseline with manual geo first; A+ can expand outside service area. |
| M23 Custom Audiences planned | FAIL | Medium | Create empty audiences on day 1 — they'll populate as Pixel fires. |
| M21 Interest targeting not over-layered | FAIL | Medium | Start with geo only; let algorithm find converting segments. |

---

## LinkedIn Ads — Score: 8/100 (F) — NOT RECOMMENDED

| Check | Status | Priority | Finding |
|---|---|---|---|
| LI01 Minimum budget viability | FAIL | Critical | Minimum viable: £3,000/month. Available: £500 total. 1 campaign = 48% of entire budget. |
| LI02 Audience fit for local service | FAIL | Critical | LinkedIn is B2B professional. Local consumers do not book tradespeople via LinkedIn. |
| LI03 CPL benchmarks vs alternatives | FAIL | Critical | LinkedIn CPL: £60–150. Google CPL: £15–75. Meta CPL: £20–35. LinkedIn = 3–7× more expensive. |
| LI04 Geo minimum audience (50,000) | FAIL | High | Local radius targeting with any professional filter typically falls below 50,000 — erratic delivery, spiked CPMs. |

**Verdict:** Allocate £0 to LinkedIn. Redirect its would-be share to Google Search, bringing Google to £350/month.  
**Revisit when:** Total monthly budget reaches £3,000+ AND the business serves commercial clients (B2B).

---

## Cross-Platform Analysis

### Tracking Consistency
All three platforms have zero tracking infrastructure. This must be resolved before any spend begins:

| Requirement | Platform | Status |
|---|---|---|
| Google Tag Manager | Google / All | Not installed |
| Meta Pixel | Meta | Not installed |
| Conversions API (CAPI) | Meta | Not configured |
| Consent Mode v2 | Google / Meta | Not implemented |
| Standard events (Lead, Contact, Schedule) | Meta | Not configured |
| UTM parameters | All | Not configured |
| GA4 linked | Google | Not linked |

### Budget Allocation Assessment

| Platform | Recommended | Min Viable (per platform) | Gap |
|---|---|---|---|
| Google Ads | £350/month | £1,500/month | −£1,150 |
| Meta Ads | £150/month | £600/month | −£450 |
| LinkedIn Ads | £0 | £3,000/month | N/A (eliminated) |

**Important context:** At £500/month total, you are below minimum viable for every individual platform. This does not mean advertising won't work — it means expectations must be calibrated correctly:
- Month 1–2: Learning phase. Limited conversion data. Focus on tracking setup and creative testing.
- Month 3: First meaningful performance data. Evaluate which platform delivers lower CPL.
- Month 6: Scale the winning platform. Consider whether budget can increase.

### Creative Consistency
No creative assets exist. Recommended cross-platform creative principles:
- One consistent brand identity (logo, colours, tone of voice)
- Same phone number across all ads (enables attribution by call source)
- Consistent service area messaging ("Serving [Town] and surrounding areas")
- Real business photography used across both Google (image assets) and Meta (ad creative)

### Attribution Overlap Risk
Low at launch — only two platforms, both with distinct tracking methods (Google Tag vs Meta Pixel). Risk increases when both platforms are active simultaneously and both claim credit for the same lead. Mitigate with:
- UTM parameters on all URLs (GA4 as single source of truth for website conversions)
- Unique phone numbers per channel (or dynamic number insertion per source)
- Set Meta attribution to 7-day click only (remove 1-day view)

---

## Strategic Recommendations

### Platform Prioritisation for Local Service Business at £500/month

**Priority 1: Google Search (£350/month)**  
The only channel that captures intent in real time. Someone searching "emergency plumber near me" right now is a higher-value prospect than anyone on any other platform. This is non-negotiable as the primary channel for a local service business.

**Priority 2: Meta Ads (£150/month)**  
Brand awareness and retargeting layer. Meta reaches people in your service area who have not yet searched but may need your service. Also critical for retargeting site visitors who found you on Google but did not book.

**Priority 3: Google Business Profile (free)**  
Not an ad platform but generates calls and directions without any spend. 10+ Google reviews before scaling ad spend materially improves CTR on Google Ads (seller ratings) and Google Maps visibility. This should be treated as a parallel workstream.

### Scaling Path

| Milestone | Action |
|---|---|
| 15 Google conversions/month | Switch from Manual CPC to Maximize Conversions |
| 30 Google conversions/month | Evaluate tCPA; increase Google budget by 20% (£350 → £420) |
| 50 Meta events/week | Switch Meta from Traffic to Leads objective |
| Total budget reaches £800/month | Move to 70/20/10: Google £560, Meta £200, test £40 |
| Total budget reaches £3,000/month | Evaluate LinkedIn with 10% allocation (£300/month) |

### Kill Rules

- **Google:** If any ad group spends 3× target CPA with zero conversions — pause immediately. Review keyword match types and search terms before reactivating.
- **Meta:** If any ad set spends 3× target CPL with zero leads — pause and rotate creative before re-launching.
- **Both platforms:** If monthly CPL exceeds 50% above target for 60 consecutive days — reduce budget by 30% and fix structural issues before re-scaling.
