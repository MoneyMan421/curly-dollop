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

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API ──────────────────────────────────────────────────────────────────────

// Create a new card
app.post('/api/cards', (req, res) => {
  const { name, title, company, email, phone, website, linkedin, twitter, bio, avatar_url, theme } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required.' });
  }
  const id = uuidv4().slice(0, 8); // short friendly ID
  db.prepare(`
    INSERT INTO cards (id, name, title, company, email, phone, website, linkedin, twitter, bio, avatar_url, theme)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), title, company, email, phone, website, linkedin, twitter, bio, avatar_url, theme || 'light');

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
  const { name, title, company, email, phone, website, linkedin, twitter, bio, avatar_url, theme } = req.body;
  db.prepare(`
    UPDATE cards SET name=?, title=?, company=?, email=?, phone=?, website=?, linkedin=?, twitter=?, bio=?, avatar_url=?, theme=?
    WHERE id=?
  `).run(name, title, company, email, phone, website, linkedin, twitter, bio, avatar_url, theme, req.params.id);
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
