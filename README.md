# EBT CARD ·

A lightweight, offline-first web app for recording daily food-support payments sent to **AMK**.

## Features

- **Full-month calendar** – every day of the month is visible at a glance
- **Colour-coded amount flags** under each date (daily maximum **350 KES**):
  - 🔴 Red → 0 KES
  - 🟡 Yellow → 1 – 150 KES
  - 🔵 Blue → 151 – 300 KES
  - 🟢 Green → 301 – 350 KES
- **Automatic spill-over** – if you enter more than 350 KES on a day, the excess is automatically credited to the next consecutive day(s) with the correct flag colours
  - Example: 500 on 01/10 → 01 gets 350 (green), 02 gets 150 (yellow)
  - Example: 1000 on 01/10 → 01: 350 green, 02: 350 green, 03: 300 blue
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

1. Download the four files into the **same folder**.
2. Open `index.html` in any modern browser (Chrome, Edge, Safari, Firefox).
3. No installation, no server, no internet required after the first load.

### Recording a payment
- Click any day on the calendar.
- Enter the amount (KES) and optionally paste the transfer confirmation message.
- Click **Save**.
- If the amount is greater than 350, the app automatically splits it across consecutive days and shows a confirmation of the distribution.

### Editing / deleting
- Click a day that already has a flag.
- Change the amount or note, then **Save**, or click **Delete**.
- Note: editing a day that previously received spill-over will re-distribute from that day forward if the new amount exceeds 350.

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
  or simply keep a copy of the files together with a browser profile that retains the storage.

## Technical notes

- Pure HTML / CSS / vanilla JavaScript – zero dependencies.
- Works offline.
- Responsive layout for phones and desktops.
- Print styles follow the exact A4 rules you specified.
- Daily maximum is hard-coded as 350 KES; monthly goal is 10,000 KES.

## Licence

Free for personal use.
