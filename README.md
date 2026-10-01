# Kamando Abby · Food Tracker

A lightweight, offline-first web app for recording daily food-support payments sent to **Kamando Abby**.

## Features

- **Full-month calendar** – every day of the month is visible at a glance
- **Colour-coded amount flags** under each date:
  - 🔴 Red → 0 – 200 KES
  - 🟡 Yellow → 201 – 349 KES
  - 🟢 Green → 350+ KES
- **Monthly progress bar** toward a fixed goal of **KES 10,000**
  - Fills left → right
  - Floating percentage marker shows cumulative progress
- **Notes** – paste M-Pesa / transfer acknowledgement messages under any day
- **Edit & Delete** – click any recorded day to amend or remove the transaction
- **Beautiful PDF export** – one-click printable A4 summary table (no data dump)
  - Summary box with totals & % of goal
  - Clean table with colour dots
  - Matches the supplied print stylesheet

## Files

```
index.html      – Main page
styles.css      – All styling (screen + print)
app.js          – Application logic
README.md       – This file
```

## How to use

1. Download the three files (`index.html`, `styles.css`, `app.js`) into the **same folder**.
2. Open `index.html` in any modern browser (Chrome, Edge, Safari, Firefox).
3. No installation, no server, no internet required after the first load.

### Recording a payment
- Click any day on the calendar.
- Enter the amount (KES) and optionally paste the transfer confirmation message.
- Click **Save**.

### Editing / deleting
- Click a day that already has a flag.
- Change the amount or note, then **Save**, or click **Delete**.

### Exporting a PDF
- Navigate to the desired month.
- Click **Export PDF Summary**.
- In the print dialog choose “Save as PDF”.

## Data storage

All transactions are stored in the browser’s **localStorage** under the key  
`kamando-abby-transactions`.

- Data stays on the device you used.
- Clearing browser data will erase the records.
- To back up: open DevTools → Application → Local Storage and copy the value,  
  or simply keep a copy of the three files together with a browser profile that retains the storage.

## Technical notes

- Pure HTML / CSS / vanilla JavaScript – zero dependencies.
- Works offline.
- Responsive layout for phones and desktops.
- Print styles follow the exact A4 rules you specified.

## Licence

Free for personal use.
