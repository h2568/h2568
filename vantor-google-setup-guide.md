# Google Analytics & Search Console Setup Guide
### For Harry Gagen / Vantor Crew Ltd
### vantorltd.com

---

# GUIDE 1: Set Up Google Analytics 4

**What this does:** Lets you see how many people visit your website, where they come from, and what they look at.

**What you need:** A Google account (Gmail is fine). If you don't have one, go to accounts.google.com and create one first.

**Time needed:** About 10 minutes.

---

## Step 1 — Go to Google Analytics

1. Open your browser and go to: **analytics.google.com**
2. If prompted, sign in with your Google/Gmail account.
3. You'll land on a welcome screen. Click the blue **"Start measuring"** button.

> **If you see an existing Analytics dashboard instead of a welcome screen:** Click the cog icon (Settings) in the bottom-left corner, then click **"Create Account"** at the top of the page.

---

## Step 2 — Create an Account

You'll see a form titled **"Account setup"**.

1. In the **Account name** field, type: **Vantor Crew Ltd**
2. Leave all the tick boxes below as they are (they are all ticked by default — that's fine).
3. Click **Next**.

---

## Step 3 — Create a Property

You'll now see **"Property setup"**.

1. In the **Property name** field, type: **Vantor Crew Ltd**
2. Click the **Reporting time zone** dropdown. Select **United Kingdom**.
3. Click the **Currency** dropdown. Select **British Pound (£)**.
4. Click **Next**.

---

## Step 4 — Describe Your Business

You'll see a screen called **"Describe your business"**.

1. Under **Industry category**, click the dropdown and select: **Professional services**
2. Under **Business size**, select: **Small** (1–10 employees, or whichever is closest to you)
3. Click **Next**.

---

## Step 5 — Choose Your Goals

You'll see a screen asking **"What are your main goals?"**

1. You can tick **"Examine user behaviour"** or **"Generate leads"** — either is fine, or tick both.
2. Click **Create**.

---

## Step 6 — Accept the Terms

A pop-up will appear with Google's Terms of Service.

1. Make sure the country selected is **United Kingdom**.
2. Tick the box to accept.
3. Click **I Accept**.

---

## Step 7 — Set Up a Web Data Stream

After accepting, you'll be asked **"Choose a platform"**.

1. Click **Web** (the first option, with a computer icon).
2. You'll see a form:
   - **Website URL:** Type **vantorltd.com** (leave the dropdown on **https://**)
   - **Stream name:** Type **Vantor Crew Ltd Website**
3. Leave "Enhanced measurement" switched on (it's on by default — that's good).
4. Click **Create stream**.

---

## Step 8 — Find and Copy Your Measurement ID

After clicking "Create stream", you'll see a screen called **"Web stream details"**.

1. Look at the top-right area of this screen. You'll see a box labelled **"MEASUREMENT ID"**.
2. It will look like this: **G-XXXXXXXXXX** (the X's will be letters and numbers).
3. Click the copy icon next to it (two overlapping squares), or highlight the ID and copy it manually.
4. Paste it somewhere safe — a text message to yourself, a note on your phone, or an email — so you can share it.

> **Important:** Do NOT click "Add to website" or copy any code snippets. Your developer will add the tracking code once you share the Measurement ID. You just need the G-XXXXXXXXXX number.

---

## If Something Goes Wrong

- **"I can't find the Measurement ID screen":** Go to **analytics.google.com**, click the Settings cog (bottom left), click **Data Streams** under your property, then click on the stream called "Vantor Crew Ltd Website". The Measurement ID will be on that screen.
- **"I accidentally installed the snippet":** Don't worry — let your developer know and they can sort it out.
- **"I'm logged into the wrong Google account":** Click your profile photo in the top-right and switch to the right account.

---

**DONE! Share the G-XXXXXXXXXX Measurement ID with your developer and they'll do the rest.**

---
---

# GUIDE 2: Set Up Google Search Console and Verify Your Website

**What this does:** Tells Google your website exists and is yours. Lets you see how your site appears in search results and check for any problems.

**What you need:**
- The same Google account you used for Analytics.
- George's help to add one line of text to your domain's DNS settings (explained in Step 6 below).

**Time needed:** 5 minutes for you, then a short wait for George, then 1 minute to finish.

---

## Step 1 — Go to Google Search Console

1. Open your browser and go to: **search.google.com/search-console**
2. Sign in with the same Google account you used for Analytics.

---

## Step 2 — Add Your Property

1. On the left side, you'll see a dropdown near the top. Click it, then click **"+ Add property"**.
   - If it's your first time, you may see a welcome screen — click **"Start now"** or **"Add property"** directly.
2. A box will appear asking you to choose a property type. You'll see two options:
   - **Domain** (on the left)
   - **URL prefix** (on the right)
3. Click **Domain** (the left option). This is important — it covers both www.vantorltd.com and vantorltd.com automatically.
4. In the box that appears, type: **vantorltd.com**
5. Click **Continue**.

---

## Step 3 — See the Verification Code

After clicking Continue, Google will show you a screen titled **"Verify domain ownership"**.

1. You'll see a block of text that looks something like this:
   **google-site-verification=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890**
2. Click **Copy** (or highlight and copy it manually).
3. Paste this somewhere temporary — a text message to yourself or a note — because you'll need to send it to George.

> **Do not close this screen.** Leave this tab open in your browser while you message George.

---

## Step 4 — Message George

Send George a message (text, WhatsApp, email — whatever you normally use) along these lines:

---

*Hi George, I need to add a TXT record to the DNS for vantorltd.com. Here are the details:*

- *Record type: TXT*
- *Host/Name: @ (just the @ symbol)*
- *Value: [paste the full google-site-verification=... text here]*
- *TTL: leave as default (or set to 3600 if it asks)*

*This is for Google Search Console verification. Please let me know when it's done!*

---

**What George needs to do in Namecheap cPanel:**
1. Log in to Namecheap cPanel.
2. Go to **Zone Editor** (sometimes listed under "Domains").
3. Find **vantorltd.com** and click **Manage**.
4. Click **Add Record**.
5. Set the record type to **TXT**.
6. In the **Name/Host** field, enter: **@**
7. In the **Value/TXTData** field, paste the full verification text.
8. Click **Save**.

---

## Step 5 — Wait a Few Minutes

DNS changes usually take between 5 and 30 minutes to apply, though sometimes it can take up to a couple of hours.

Once George confirms the record is added, wait about 15 minutes before moving to the next step.

> **If you're in a hurry:** You can try verifying straight after George adds the record — sometimes it works almost immediately.

---

## Step 6 — Verify in Google Search Console

1. Go back to the Google Search Console tab you left open (search.google.com/search-console).
2. On the verification screen, click the **"Verify"** button.
3. If successful, you'll see a green tick and the message **"Ownership verified"**. 

> **If verification fails:** This usually means the DNS record hasn't had time to spread across the internet yet. Wait another 15–20 minutes and click Verify again. If it still fails after an hour, ask George to double-check that the record was saved correctly — the most common mistake is an extra space in the value or the Host being set to something other than @.

---

## Step 7 — What to Do Once Verified

Once you see the "Ownership verified" message and land on your Search Console dashboard, do the following:

### 7a — Request Indexing (Tell Google to Look at Your Site)

1. In the search bar at the very top of the Search Console page, type: **https://vantorltd.com**
2. Press Enter.
3. Google will check if the page is indexed. You'll likely see either "URL is on Google" or "URL is not on Google".
4. If it says **"URL is not on Google"**, click **"Request Indexing"**. This tells Google to visit and list your site in search results. It usually takes a few days.
5. Repeat this for **https://www.vantorltd.com** (with the www).

### 7b — Check the Coverage Report

1. In the left-hand menu, click **Indexing**, then click **Pages**.
2. This shows whether Google has found and indexed your pages. Don't worry if it looks sparse at first — it takes a few days for data to start appearing.

---

## If Something Goes Wrong

- **"Verify button keeps failing":** Ask George to confirm the TXT record is saved. You can also check it yourself at **dnschecker.org** — type vantorltd.com, select TXT, and click Search. If the google-site-verification text appears, the record is live and you just need to try Verify again.
- **"I've lost the verification code":** Go back to Search Console, find your property, go to Settings → Ownership verification. You can see the code there again.
- **"The tab closed and I lost the screen":** Just go back to search.google.com/search-console. Your property will be listed. Click into it, then go to Settings → Ownership verification to find the code again.
- **"George can't access Namecheap cPanel":** If he's having trouble logging in, the Namecheap login is at cpanel.namecheap.com. If there's a bigger access issue, call Namecheap support. Note: do NOT call 123-reg about this — your DNS is managed at Namecheap, not 123-reg. Only call 123-reg (0345 450 2310) if you need to do something with the domain registration itself.

---

**DONE! Once verified, your site is connected to Google Search Console. Your developer can now check in to help you monitor search performance.**

---

*Guide prepared for Harry Gagen / Vantor Crew Ltd — vantorltd.com*
