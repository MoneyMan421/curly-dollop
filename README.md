# ⚡ CardSnap — Digital Business Card SaaS

A dead-simple, highly profitable micro-SaaS that lets anyone create a beautiful digital business card in under 60 seconds and share it via a short link.

---

## 💰 Why It's Profitable

| Tier | Price | What you get |
|------|-------|--------------|
| **Free** | $0/mo | 1 card, basic fields, CardSnap branding |
| **Pro** | $9/mo | Unlimited cards, analytics, remove branding, custom theme |
| **Business** | $29/mo | Team cards, lead capture, CRM export, custom subdomain |

- **Near-zero infrastructure cost** — a tiny SQLite DB and a Node.js server handle thousands of cards.  
- **Viral growth loop** — every shared card carries "Made with CardSnap", driving organic sign-ups.  
- **High retention / low churn** — once a card is embedded in email signatures and QR codes it's very sticky.  
- **Land & expand** — individuals sign up free, upgrade to Pro, then bring in their whole team on Business.

---

## 🚀 Quick Start

```bash
npm install
npm start
# → Open http://localhost:3000
```

---

## 📁 Project Structure

```
server.js           Express API + static file server
cardsnap.db         SQLite database (auto-created on first run)
public/
  index.html        Conversion-focused landing page
  builder.html      Drag-and-drop card builder UI
  card.html         Shareable card view (+ Save to Contacts)
  styles.css        All styles
  app.js            Builder client-side logic
```

---

## 🔌 API

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/cards` | Create a card |
| `GET`  | `/api/cards/:id` | Fetch a card (increments view count) |
| `PUT`  | `/api/cards/:id` | Update a card |
| `DELETE` | `/api/cards/:id` | Delete a card |
| `GET`  | `/api/cards` | List all cards |
| `GET`  | `/c/:id` | Shareable card page |

---

## 🛣️ Roadmap to $10k MRR

1. **Launch** on Product Hunt + indie hacker communities  
2. **Add Stripe** billing for Pro/Business tiers  
3. **NFC tap-to-share** integration  
4. **Custom domain** support for Business tier  
5. **Team dashboard** with aggregate view analytics  
6. **Zapier/CRM integration** for lead capture
