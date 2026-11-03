# Emma's 1st Birthday · RSVP 🎀

A responsive RSVP page for Emma's 1st birthday on **Saturday, November 28, 2026**.
RSVPs are saved to Google Sheets.

- ⛪ **Church:** Shrine of St. Therese of the Child Jesus at 7:30 AM
- 🎈 **Reception:** Villamor Air Base Golf Clubhouse at 10:00 AM

## Files
| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Pink watercolor theme, works on phone, tablet and desktop |
| `script.js` | Countdown + sends RSVPs to Google Sheets |
| `bunny.js` | The 3D dancing bunny ballerina (Three.js) |
| `apps-script.gs` | Code to paste into Google Sheets (not used by the website itself) |
| `images/` | Optimized backgrounds and photos |

## 1. Connect Google Sheets
1. Create a new Google Sheet (e.g. "Emma RSVP").
2. Go to **Extensions → Apps Script**, delete the sample code, and paste in everything from `apps-script.gs`.
   - Optional: put your email in `NOTIFY_EMAIL` to get an email for every RSVP.
3. Click **Deploy → New deployment**, click the gear icon, and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, allow the permissions Google asks for, and copy the **Web app URL** (it ends in `/exec`).
5. Open `script.js` and paste that URL into the first line:
   ```js
   const SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
   ```
A tab called **RSVP** with column headers is created automatically when the first response comes in.

> If you change `apps-script.gs` later, go to **Deploy → Manage deployments → Edit → Version: New version** so the change goes live without changing the URL.

## 2. Put it on GitHub Pages
```bash
git init
git add .
git commit -m "Emma's 1st birthday RSVP"
git branch -M main
git remote add origin https://github.com/<your-username>/emma-rsvp.git
git push -u origin main
```
Then on GitHub, go to **Settings → Pages → Build and deployment**, set **Source** to *Deploy from a branch*, set **Branch** to `main` and `/ (root)`, and click **Save**.

After about a minute your site will be live at `https://<your-username>.github.io/emma-rsvp/`.

## 3. Messenger / Facebook link preview
1. In `index.html`, replace both `YOUR-SITE-URL` with your site address **ending in `/`**,
   e.g. `https://username.github.io/emma-rsvp/` (so the image becomes `https://username.github.io/emma-rsvp/images/share.jpg`).
2. Push to GitHub and wait a minute.
3. Go to https://developers.facebook.com/tools/debug/, paste your site link, and click **Debug**, then **Scrape Again**.
   This refreshes the preview Messenger shows.

## Test it locally
Run `python -m http.server` in this folder and go to http://localhost:8000.
(Double-clicking `index.html` works too, but the 3D bunny only shows when served, as on GitHub Pages.)

## Change details
- RSVP deadline: `index.html`, look for "Please respond by"
- Max guests: `index.html`, edit the `<select id="guests">` options
- Footer signature: `index.html`, look for "With love"
