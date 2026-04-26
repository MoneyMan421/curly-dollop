/* ── CardSnap Builder — Client JS ── */

const form       = document.getElementById('cardForm');
const createBtn  = document.getElementById('createBtn');
const preview    = document.getElementById('livePreview');
const prevAvatar = document.getElementById('prevAvatar');
const prevName   = document.getElementById('prevName');
const prevTitle  = document.getElementById('prevTitle');
const prevBio    = document.getElementById('prevBio');
const prevLinks  = document.getElementById('prevLinks');

// ── Live Preview ─────────────────────────────────────────────────────────────
function updatePreview() {
  const name    = document.getElementById('name').value.trim();
  const title   = document.getElementById('title').value.trim();
  const company = document.getElementById('company').value.trim();
  const bio     = document.getElementById('bio').value.trim();
  const email   = document.getElementById('email').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const website = document.getElementById('website').value.trim();
  const theme   = document.querySelector('input[name="theme"]:checked').value;

  // Avatar initials
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  prevAvatar.textContent = initials;

  prevName.textContent  = name  || 'Your Name';
  prevTitle.textContent = [title, company].filter(Boolean).join(' · ') || 'Job Title · Company';
  prevBio.textContent   = bio;

  const links = [];
  if (email)   links.push(`<span>✉️ ${email}</span>`);
  if (phone)   links.push(`<span>📞 ${phone}</span>`);
  if (website) links.push(`<span>🌐 ${website.replace(/^https?:\/\//, '')}</span>`);
  prevLinks.innerHTML = links.join('');

  // Theme
  preview.className = `preview-card theme-${theme}`;
}

// Attach input listeners
['name','title','company','bio','email','phone','website','linkedin','twitter'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePreview);
});
document.querySelectorAll('input[name="theme"]').forEach(el => {
  el.addEventListener('change', updatePreview);
});

updatePreview(); // initial render

// ── Form Submit ───────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name:       document.getElementById('name').value.trim(),
    title:      document.getElementById('title').value.trim(),
    company:    document.getElementById('company').value.trim(),
    bio:        document.getElementById('bio').value.trim(),
    email:      document.getElementById('email').value.trim(),
    phone:      document.getElementById('phone').value.trim(),
    website:    document.getElementById('website').value.trim(),
    linkedin:   document.getElementById('linkedin').value.trim(),
    twitter:    document.getElementById('twitter').value.trim(),
    theme:      document.querySelector('input[name="theme"]:checked').value,
  };

  createBtn.textContent = 'Creating…';
  createBtn.disabled    = true;

  try {
    const res  = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');

    const cardUrl = `${location.origin}/c/${data.id}`;
    showSuccess(cardUrl);
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    createBtn.textContent = '⚡ Create My Card';
    createBtn.disabled    = false;
  }
});

// ── Success Modal ─────────────────────────────────────────────────────────────
function showSuccess(url) {
  const modal   = document.getElementById('successModal');
  const input   = document.getElementById('shareLinkInput');
  const viewBtn = document.getElementById('viewCardLink');

  input.value  = url;
  viewBtn.href = url;
  modal.classList.remove('hidden');
}

document.getElementById('copyBtn').addEventListener('click', () => {
  const input = document.getElementById('shareLinkInput');
  input.select();
  navigator.clipboard.writeText(input.value).catch(() => document.execCommand('copy'));
  document.getElementById('copyBtn').textContent = 'Copied!';
  setTimeout(() => { document.getElementById('copyBtn').textContent = 'Copy'; }, 2000);
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('successModal').classList.add('hidden');
  form.reset();
  updatePreview();
});
