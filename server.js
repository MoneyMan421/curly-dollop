/**
 * CardSnap — Digital Business Card SaaS
 * A simple Express server with SQLite storage.
 *
 * Revenue model:
 *   FREE  – 1 card, basic fields, CardSnap branding
 *   PRO   – $9/mo  — unlimited cards, analytics, remove branding, custom theme
 *   BIZ   – $29/mo — team cards, lead capture, CRM export, priority support
 *
 * Run:  node server.js
 * Open: http://localhost:3000
 */

const express = require('express');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database ────────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'cardsnap.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    title       TEXT,
    company     TEXT,
    email       TEXT,
    phone       TEXT,
    website     TEXT,
    linkedin    TEXT,
    twitter     TEXT,
    bio         TEXT,
    avatar_url  TEXT,
    theme       TEXT DEFAULT 'light',
    views       INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// ── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_PROTO = /^https?:\/\//i;

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim().slice(0, 500) : null;
}

function sanitizeUrl(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  if (!SAFE_PROTO.test(v)) return null; // reject non-http/https URLs (e.g. javascript:)
  try { new URL(v); } catch { return null; }
  return v.slice(0, 2048);
}

function sanitizeEmail(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase().slice(0, 254);
  return EMAIL_RE.test(v) ? v : null;
}

function sanitizePhone(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim().replace(/[^\d+\-.()\s]/g, '').slice(0, 30);
  return v || null;
}

function sanitizeCardInput(body) {
  return {
    name:       sanitizeText(body.name),
    title:      sanitizeText(body.title),
    company:    sanitizeText(body.company),
    bio:        sanitizeText(body.bio),
    email:      sanitizeEmail(body.email),
    phone:      sanitizePhone(body.phone),
    website:    sanitizeUrl(body.website),
    linkedin:   sanitizeUrl(body.linkedin),
    twitter:    sanitizeUrl(body.twitter),
    avatar_url: sanitizeUrl(body.avatar_url),
    theme:      ['light', 'dark', 'brand'].includes(body.theme) ? body.theme : 'light',
  };
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Card creation limit reached, please try again later.' },
});


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/', apiLimiter);

// ── API ──────────────────────────────────────────────────────────────────────

// Create a new card
app.post('/api/cards', createLimiter, (req, res) => {
  const fields = sanitizeCardInput(req.body);
  if (!fields.name) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  const id = uuidv4().slice(0, 8);
  db.prepare(`
    INSERT INTO cards (id, name, title, company, email, phone, website, linkedin, twitter, bio, avatar_url, theme)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, fields.name, fields.title, fields.company, fields.email, fields.phone,
         fields.website, fields.linkedin, fields.twitter, fields.bio, fields.avatar_url, fields.theme);

  res.json({ id });
});

// Get a card by ID (and record a view)
app.get('/api/cards/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  if (!card) return res.status(404).json({ error: 'Card not found.' });
  db.prepare('UPDATE cards SET views = views + 1 WHERE id = ?').run(req.params.id);
  res.json(card);
});

// List all cards (admin / demo purposes)
app.get('/api/cards', (_req, res) => {
  const cards = db.prepare('SELECT id, name, title, company, views, created_at FROM cards ORDER BY created_at DESC').all();
  res.json(cards);
});

// Update a card
app.put('/api/cards/:id', (req, res) => {
  const card = db.prepare('SELECT id FROM cards WHERE id = ?').get(req.params.id);
  if (!card) return res.status(404).json({ error: 'Card not found.' });
  const fields = sanitizeCardInput(req.body);
  if (!fields.name) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  db.prepare(`
    UPDATE cards SET name=?, title=?, company=?, email=?, phone=?, website=?, linkedin=?, twitter=?, bio=?, avatar_url=?, theme=?
    WHERE id=?
  `).run(fields.name, fields.title, fields.company, fields.email, fields.phone,
         fields.website, fields.linkedin, fields.twitter, fields.bio, fields.avatar_url, fields.theme,
         req.params.id);
  res.json({ success: true });
});

// Delete a card
app.delete('/api/cards/:id', (req, res) => {
  db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Serve the card view page for /c/:id
app.get('/c/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'card.html'));
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CardSnap running at http://localhost:${PORT}\n`);
});
