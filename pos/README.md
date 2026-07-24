# THE DADDYS CAFE POS PRO v3.2

A free, advanced local POS and cafe management system.

## Major features
- 13 working menu categories, fully clickable
- Search and Veg / Non-Veg filtering
- Complete billing cart with quantities
- Takeaway, Dine-in, Direct Delivery, Swiggy, Zomato channels
- Cash, UPI, Card, Online and Mixed payments
- Customer name/phone and order reference
- Discounts, delivery charge and packaging charge
- Save order or print thermal receipt
- Order history, search, filter, reprint and void
- Expense tracking with payment mode
- Advanced reports: gross sales, orders, AOV, expenses, channel mix, payment mix, top items
- Fully editable Menu Manager
  - Add/rename/delete categories
  - Add/edit items
  - Change price and cost
  - Veg/Non-Veg
  - Mark sold out / available
- Basic inventory with low-stock alerts
- Customer database from billing history
- Day closing with expected cash, actual cash and variance
- JSON backup/restore
- CSV order export
- Browser-local storage and offline PWA cache
- Attempts migration from v1 data on same browser

## Run
Simplest:
Open index.html in Chrome or Edge.

Recommended:
1. Open a terminal in this folder.
2. Run:
   python -m http.server 8000
3. Open:
   http://localhost:8000

For full PWA/offline caching, use the recommended local-server method.

## Data safety
All business data is stored in the browser's localStorage.
Export a Full Backup frequently. Clearing browser site data can erase records.

## Receipt printing
Use Chrome/Edge print dialog and select your 58mm or 80mm thermal printer.

## Production limitations
This version is intentionally serverless/free:
- No cloud sync across devices
- No real multi-user staff accounts
- No direct Swiggy/Zomato API order integration
- Inventory is manual, not recipe-linked auto-deduction
- No audited accounting/GST filing engine

These can be added later with a backend/database.


## v3 improvements
- Added the uploaded THE DADDYS CAFE logo to the POS sidebar and printed receipt.
- Reworked the New Order screen so the order/cart panel fits inside a typical laptop screen.
- Cart items now scroll inside the order panel instead of pushing totals/buttons below the screen.
- Totals and action buttons remain visible at the bottom of the order panel.
- Menu items scroll independently, giving more usable space.
- Improved compact behavior for short laptop screens and responsive mobile/tablet layouts.


## v3.1 fix
- Fixed Menu Manager page scrolling on desktop/laptop.
- Main content can now scroll normally on long management pages.
- The item edit panel stays sticky while the category/item list scrolls.

## v3.2 logo fix
- Embedded THE DADDYS CAFE logo directly into the POS HTML.
- Logo no longer depends on a relative image path.
- Works when opening index.html directly as well as through a local web server.
- Logo remains visible in the sidebar and printable receipt.
