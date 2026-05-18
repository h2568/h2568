# Hugo Data Export Guide — 70/20/10 + 3x Kill Rule Review & Google Ads Audit

---

# PART A — BUDGET REVIEW: Data Pull Guide (Google + Meta + LinkedIn)

## Step 0 — Set Your Benchmarks First

| Metric | Your number |
|---|---|
| Target CPA (cost per acquisition) | £____ |
| Target ROAS | ____x |
| Customer LTV (gross margin × avg lifetime) | £____ |
| Max allowable CAC (usually LTV ÷ 3) | £____ |
| 3x Kill threshold = Target CPA × 3 | £____ |

**Review window:** Last 30 days default. Use **last 90 days** for B2B/LinkedIn or low-volume campaigns.
**Comparison window:** Previous 30 (or 90) days for trend.
**Attribution:** Pick one and stick to it (e.g., 7-day click for Meta, data-driven for Google). Note it on the sheet.

---

## Master Spreadsheet Schema

Every row = one campaign (or ad set for finer granularity).

| Column | Source | Notes |
|---|---|---|
| Platform | manual | Google / Meta / LinkedIn |
| Campaign name | export | |
| Campaign type | export | Search, PMax, ASC, Prospecting, Retargeting, etc. |
| Funnel stage | manual | TOF / MOF / BOF |
| Current bucket | manual | Core (70) / Emerging (20) / Experimental (10) |
| Status | export | Active / Paused |
| Spend (current window) | export | |
| Impressions | export | |
| Clicks | export | |
| CTR | export | |
| CPC | export | |
| Conversions | export | |
| Conversion value / revenue | export | |
| CPA | calc | Spend ÷ Conversions |
| ROAS | calc | Revenue ÷ Spend |
| Spend (prior window) | export | |
| CPA (prior window) | export | |
| ROAS (prior window) | export | |
| Trend | calc | Improving / Flat / Declining |
| Days since last conversion | export | Critical for 3x Kill |
| Spend since last conversion | calc | The 3x Kill primary trigger |
| Frequency (Meta/LinkedIn) | export | Creative fatigue signal |
| Impression share (Google) | export | Headroom signal for Scale |
| Notes | manual | Creative refresh date, LP changes, etc. |

---

## Google Ads Export

**Where:** Google Ads UI → Campaigns → set date range → Columns → Modify columns.

**Columns to enable:**
- Campaign, Campaign type, Status, Budget
- Impressions, Clicks, CTR, Avg. CPC, Cost
- Conversions, Cost/conv., Conv. value, Conv. value/cost (ROAS)
- Search impr. share, Search lost IS (budget), Search lost IS (rank)
- For PMax: New customers if configured

**Trend data:** Re-run for previous period (toggle "Compare" → previous period).

**Also pull separately:**
- Search Terms report (Reports → Predefined → Search terms)
- Asset Group report for PMax campaigns

**Export:** Top right download → CSV or Google Sheets.

---

## Meta Ads Export

**Where:** Ads Manager → Campaigns tab → date range top right.

**Pull at Campaign AND Ad set level (two exports).**

**Columns — use "Performance and Clicks" preset, then add:**
- Amount spent, Impressions, Reach, **Frequency**
- Link clicks, CTR (link), CPC (link)
- Results (conversion event), Cost per result
- **Purchases, Purchase ROAS, Purchase conversion value**
- Attribution setting (confirm 7-day click / 1-day view)

**Frequency flag:** Anything > 3.0 on prospecting with declining CTR = Fix (creative fatigue), not Pause.

**Days since last conversion:**
- Reports → create custom report → Breakdown by Day → Spend + Purchases → export
- In spreadsheet: find MAX(date where conversions > 0) and SUM(spend) after that date

**Export:** Reports → Export table data → CSV.

---

## LinkedIn Ads Export

**Where:** Campaign Manager → Campaigns tab → date range.

**Use 90-day window minimum. Apply 3x Kill at campaign group level unless >50 conversions.**

**Columns — Performance + Conversions + Engagement:**
- Campaign name, Campaign group, Objective, Status, Bid type
- Total spent, Impressions, Clicks, CTR, Avg. CPC, Avg. CPM
- **Frequency**
- Conversions, Cost per conversion, Conversion rate
- **Leads, Cost per lead** (if using Lead Gen Forms)

**Trend data:** Export current 90 days, then prior 90 days separately. Stitch in spreadsheet.

**Pipeline note:** LinkedIn's in-platform CPA is rarely the real number. Pull MQL → SQL → Closed Won from your CRM. Add "True CPA (CRM)" column for LinkedIn rows.

**Export:** Top right Export → CSV.

---

## Bucket Classification (Manual — Do Before Sending)

- **Core (70%):** Running >90 days, hits CPA/ROAS target consistently. Branded search, top retargeting, proven prospecting.
- **Emerging (20%):** Running 30–90 days, hitting target inconsistently or recently graduated. New audiences, new ad formats showing signal.
- **Experimental (10%):** <30 days old, new channel/audience/creative test.

---

## Pre-flight Checklist Before Sending

- [ ] Same date range across all three platforms
- [ ] Same attribution rules noted on sheet
- [ ] Target CPA, target ROAS, LTV filled in at top
- [ ] Every row has a bucket tag
- [ ] "Days since last conversion" and "Spend since last conversion" populated
- [ ] LinkedIn rows have CRM-sourced true CPA where possible
- [ ] PMax/ASC campaigns have asset-group/ad-set level detail
- [ ] Trend columns filled (current vs. prior period)
- [ ] Total next-period budget noted at top
- [ ] Non-negotiables flagged (e.g., "brand search untouchable")

---

# PART B — GOOGLE ADS FULL AUDIT: Export Checklist

## Before You Start

- [ ] Log into Google Ads at ads.google.com (read-only access is fine)
- [ ] If MCC, select the specific Customer ID
- [ ] Create folder: `GoogleAds_Audit_[AccountName]_[YYYY-MM-DD]`
- [ ] Note account currency and timezone
- [ ] **Primary date range:** Last 90 days (excluding today)
- [ ] Also pull Last 30 days and Previous 90 days for trend

**Default:** Date = Last 90 days | Format = Excel .xlsx | Include Totals row

---

## 00 — Account Context (text file)

`00_account_context.txt`:
- [ ] Account name and Customer ID
- [ ] Industry / vertical
- [ ] Primary goal: leads / e-commerce / calls / awareness / store visits
- [ ] Monthly budget (approximate)
- [ ] Target CPA and/or ROAS
- [ ] Primary geographies
- [ ] Account age (months/years)
- [ ] Who manages it (in-house / agency / solo)
- [ ] Top 3 competitors
- [ ] Known issues or specific concerns
- [ ] Average order value or lead value

---

## 01 — Account-Level Snapshot

`01_account_overview.xlsx`:
- [ ] Overview dashboard → screenshot all cards
- [ ] Recommendations page → screenshot including Optimization Score (%)
- [ ] Insights page → screenshot
- Save as: `01a_overview.png`, `01b_recommendations.png`, `01c_optimization_score.png`, `01d_insights.png`

---

## 02 — Campaign Performance

`02_campaigns_90d.xlsx` — Columns to enable:
- Campaign, Campaign ID, Campaign status, Campaign type, Campaign subtype
- Bid strategy type, Bid strategy, Budget, Budget type
- Impressions, Clicks, CTR, Avg. CPC, Cost
- Conversions, Cost/conv., Conv. rate, Conv. value, Conv. value/cost (ROAS), All conv., View-through conv.
- Search impr. share, Search lost IS (budget), Search lost IS (rank), Search top IS, Search abs. top IS
- Phone calls, Phone-through rate (if call tracking enabled)
- Filter: All but removed
- [ ] Save column set as "Audit – Campaigns"
- [ ] Also export: `02b_campaigns_30d.xlsx` and `02c_campaigns_prev90d.xlsx`

---

## 03 — Ad Group Performance

`03_adgroups_90d.xlsx`:
- Columns: Campaign, Ad group, Ad group status, Ad group type, Default max CPC/target CPA/target ROAS, Impressions, Clicks, CTR, Avg. CPC, Cost, Conversions, Cost/conv., Conv. rate, Conv. value, ROAS, Search impr. share.
- Filter: All but removed

---

## 04 — Keywords

`04_keywords_90d.xlsx` — Columns:
- Campaign, Ad group, Keyword, Match type, Status, Policy details
- **Quality Score, Exp. CTR, Ad relevance, Landing page experience** (critical)
- Impressions, Clicks, CTR, Avg. CPC, Cost
- Conversions, Cost/conv., Conv. rate, Conv. value, ROAS
- Search impr. share, Search top IS, Search abs. top IS, Search lost IS (rank/budget)
- First page bid, Top of page bid, First position bid
- Filter: All but removed (paused + enabled, not deleted)

`04b_negative_keywords.xlsx`:
- [ ] Negative keywords tab — campaign-level and ad-group-level
- [ ] Also export any shared negative keyword lists (Tools → Shared library → Negative keyword lists)

---

## 05 — Search Terms (the money report — don't skip)

`05_search_terms_90d.xlsx`:
- Columns: Search term, Match type, Added/Excluded status, Campaign, Ad group, Keyword matched, Impressions, Clicks, CTR, Avg. CPC, Cost, Conversions, Cost/conv., Conv. rate, Conv. value
- Download → All rows (not just visible)

---

## 06 — Ads & Creative

`06_ads_90d.xlsx`:
- Columns: Campaign, Ad group, Ad type, Ad status, Approval status, Policy details, **Ad strength**, Headlines, Descriptions, Final URL, Display path, Impressions, Clicks, CTR, Conversions, Cost, Conv. rate, Cost/conv., ROAS
- Filter: All but removed
- [ ] Screenshots of asset details for top 5 spending campaigns' RSAs → `06b_asset_details_[campaign].png`

---

## 07 — Assets (formerly Extensions)

`07_assets.xlsx` — Download per tab or as one file with tabs:
- [ ] Sitelinks, Callouts, Structured snippets, Call assets, Lead form assets
- [ ] Image assets, Logo/business name, Promotion assets, Price assets, Location assets, App assets
- Columns: Asset, Status, Approval, Level (account/campaign/ad group), Impressions, Clicks, CTR, Cost, Conversions

---

## 08 — Audiences, Demographics, Devices, Locations, Schedule

`08_targeting_90d.xlsx` (one tab per report):
- [ ] **Audiences:** Type, Campaign, Bid adjustment, Impressions, Clicks, Cost, Conversions, ROAS
- [ ] **Demographics:** Age, Gender, Household Income, Parental Status (export each)
- [ ] **Devices:** Device, Bid adjustment, Impressions, Clicks, CTR, Avg. CPC, Cost, Conversions, Conv. rate, ROAS
- [ ] **Locations:** Targeted locations + User locations ("Where users were" → Reports → Predefined → Geographic)
- [ ] **Ad schedule:** Reports → Predefined → Time → Day of week, Hour of day (heatmap data)

---

## 09 — Conversions & Tracking

`09_conversions.xlsx`:
- [ ] Goals → Conversions → Summary: Conversion action, Category, Source, Count, Include in "Conversions", Attribution model, Click/view-through windows, Status, Cost/conv., Value
- [ ] Screenshot Goals → Conversions → Settings (default attribution model, enhanced conversions, Consent Mode status)
- [ ] Screenshot Goals → Conversions → Diagnostics (tag warnings)

---

## 10 — Auction Insights

`10_auction_insights_[campaign].xlsx` (top 5 campaigns by spend):
- Columns: Domain, Impression share, Overlap rate, Outranking share, Position above rate, Top of page rate, Abs. top of page rate

---

## 11 — Change History (don't skip)

`11_change_history_180d.xlsx`:
- Tools → Bulk actions → Change history
- Date range: Last 180 days, all change types selected

---

## 12 — Budgets & Shared Library

`12_budgets_and_shared.xlsx`:
- [ ] Campaigns → Shared budgets (if used)
- [ ] Tools → Shared library → Audience manager (screenshot), Bid strategies, Negative keyword lists, Placement exclusion lists, Business data feeds

---

## 13 — Shopping / Performance Max (skip if not running)

- [ ] `13a_shopping_products.xlsx`: Reports → Predefined → Shopping → Shopping products
- [ ] `13b_pmax_asset_groups.xlsx`: Inside each PMax → Asset groups → screenshot + performance download
- [ ] `13c_pmax_insights_[campaign].png`: PMax → Insights → screenshots of search terms, audience, asset audience insights
- [ ] `13d_mc_diagnostics.png`: Merchant Center → Products → Diagnostics

---

## 14 — Video / Display (skip if not running)

- [ ] Videos tab → performance per video → export
- [ ] `14_placements_90d.xlsx`: Audiences, keywords → Content → Where ads showed (placements) — critical for junk placements

---

## 15 — Billing & Account Settings

- [ ] `15a_billing_summary.png`: Billing → Summary (last 3 months)
- [ ] `15b_account_settings.png`: Admin → Account settings (tracking template, auto-tagging, time zone, currency)
- [ ] `15c_user_access.png`: Admin → Access and security (mask emails if needed)
- [ ] `15d_linked_accounts.png`: Tools → Measurement → Linked accounts (GA4, Search Console, Merchant Center, YouTube)

---

## Final Checklist Before Sending

- [ ] All files named with convention: `01_account_overview_90d.xlsx`
- [ ] All .xlsx files open correctly
- [ ] Screenshots are readable (full-screen, not blurry)
- [ ] `00_account_context.txt` filled out
- [ ] Files zipped: `GoogleAds_Audit_[AccountName]_[Date].zip`
- [ ] Sensitive info masked (emails, full Customer ID)

**Don't skip Search Terms (§05) or Change History (§11) — those two alone surface 40% of findings.**

---

## What Hugo Delivers From This Data

1. Overall Health Score (0–100) with weighted sub-scores across 10 categories
2. Critical issues (money currently being wasted)
3. Quick wins (high-impact, low-effort fixes)
4. Account structure review
5. Wasted spend analysis with £ figure
6. Quality Score deep dive
7. Search term / negative keyword opportunities
8. Bid strategy & budget recommendations
9. Ad copy & asset improvement plan
10. Conversion tracking integrity check
11. Prioritized 30/60/90-day action plan
12. Benchmark comparison vs. your vertical
