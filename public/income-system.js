function byId(id) {
  return document.getElementById(id);
}

function clean(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function buildPrompt(data) {
  const lines = [
    'Act as a full online business mentor.',
    '',
    'Your task:',
    '1) Analyze my situation',
    '2) Suggest the best income method for me',
    '3) Create an execution plan I can follow',
    '4) Include: content + audience + clients + monetization',
    '5) Provide a 30-day roadmap (day-by-day or week-by-week)',
    '6) Suggest a scaling strategy after the first 30 days',
    '',
    'Important:',
    '- Helping people is the goal. Keep the plan ethical, sustainable, and client-first.',
    "- Ask me clarifying questions first if anything is missing, then provide a tailored plan.",
    '',
    `My Details: [${data.fullName}]`,
    `Example: ${data.roleExample || 'AI content creator'}`,
    data.timePerWeek ? `Time / Week: ${data.timePerWeek}` : null,
    data.budget ? `Budget: ${data.budget}` : null,
    data.goal30 ? `30-Day Goal: ${data.goal30}` : null,
    data.skills ? `Skills / Assets: ${data.skills}` : null,
    data.constraints ? `Constraints: ${data.constraints}` : null,
    `Who I want to help (goal): ${data.helpGoal}`,
    '',
    'Are you ready to take this seriously?',
  ].filter(Boolean);

  return lines.join('\n');
}

function setTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 560)}px`;
}

function update() {
  const data = {
    fullName: clean(byId('fullName').value, 120) || 'Collin Dunkley',
    roleExample: clean(byId('roleExample').value, 120),
    timePerWeek: clean(byId('timePerWeek').value, 120),
    budget: clean(byId('budget').value, 120),
    goal30: clean(byId('goal30').value, 200),
    skills: clean(byId('skills').value, 900),
    constraints: clean(byId('constraints').value, 500),
    helpGoal: clean(byId('helpGoal').value, 500),
  };

  byId('promptText').value = buildPrompt(data);
  setTextareaHeight(byId('promptText'));
}

function reset() {
  byId('fullName').value = 'Collin Dunkley';
  byId('roleExample').value = 'AI content creator';
  byId('timePerWeek').value = '';
  byId('budget').value = '';
  byId('goal30').value = '';
  byId('skills').value = '';
  byId('constraints').value = '';
  byId('helpGoal').value = '';
  update();
}

async function copyPrompt() {
  const value = byId('promptText').value;
  try {
    await navigator.clipboard.writeText(value);
    const btn = byId('copyPromptBtn');
    const prev = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = prev; }, 1800);
  } catch {
    byId('promptText').focus();
    byId('promptText').select();
    alert('Copy failed. Please press Ctrl/Cmd+C to copy.');
  }
}

['fullName','roleExample','timePerWeek','budget','goal30','skills','constraints','helpGoal'].forEach((id) => {
  byId(id).addEventListener('input', update);
});

byId('copyPromptBtn').addEventListener('click', copyPrompt);
byId('resetPromptBtn').addEventListener('click', reset);

update();
