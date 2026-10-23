// My Skills page: full CRUD on the signed-in user's skills.
// Create = add a skill, Read = list of skills, Update = change its name, level or years, Delete = remove it.
// user.skills keeps the skill names (used for the % match everywhere on the site);
// user.skillLevels keeps the details of each skill: { "React": { level: "Intermediate", years: 1 } }.

if (!Auth.current()) {
  location.replace('Get-Started.html?redirect=Skills.html');
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
let editingSkill = null;   // name of the skill being edited (null = adding a new one)

function skillInfo(user, name) {
  return (user.skillLevels && user.skillLevels[name]) || { level: 'Beginner', years: 0 };
}

// How many listings ask for this skill
function demandFor(skill) {
  return OPPORTUNITIES.filter(o => o.tags.includes(skill)).length;
}

// Uses the official spelling when the typed name is a known skill ("react" -> "React")
function normalizeSkill(name) {
  const known = SKILLS.find(s => s.toLowerCase() === name.toLowerCase());
  return known || name;
}

// ---------- Read ----------
function renderSkills() {
  const user = Auth.current();
  document.getElementById('skills-count').textContent = `(${user.skills.length})`;

  document.getElementById('skills-list').innerHTML = user.skills.length
    ? user.skills.map(name => {
        const info = skillInfo(user, name);
        const levelIndex = LEVELS.indexOf(info.level) + 1;
        const demand = demandFor(name);
        return `
          <article class="card ${name === editingSkill ? 'ring-2 ring-violet-400' : ''}">
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-xl font-bold break-words">${escapeHtml(name)}</h3>
              <span class="chip shrink-0">${escapeHtml(info.level)}</span>
            </div>
            <div class="mt-3 flex gap-1" aria-label="Level ${levelIndex} of 3">
              ${LEVELS.map((_, i) => `<span class="h-2 flex-1 rounded-full ${i < levelIndex ? 'bg-violet-500' : 'bg-white/10'}"></span>`).join('')}
            </div>
            <p class="mt-3 text-sm text-gray-400">${info.years} year${info.years === 1 ? '' : 's'} of practice ·
              ${demand ? `asked for in ${demand} listing${demand === 1 ? '' : 's'}` : 'not in our listings yet'}</p>
            <div class="mt-4 flex gap-3">
              <button type="button" data-edit="${escapeHtml(name)}" class="btn-outline !px-4 !py-1 text-sm">Edit</button>
              <button type="button" data-delete="${escapeHtml(name)}" class="btn-danger !px-4 !py-1 text-sm">Delete</button>
            </div>
          </article>`;
      }).join('')
    : `<div class="md:col-span-2 card text-center text-gray-400">
         <p class="text-lg">You haven't added any skills yet.</p>
         <p class="mt-1">Add your first skill to see your % match on every job.</p>
       </div>`;

  // Most requested skills the user doesn't have yet
  const counts = {};
  OPPORTUNITIES.forEach(o => o.tags.forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; }));
  const suggested = Object.keys(counts)
    .filter(skill => !user.skills.includes(skill))
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 6);
  document.getElementById('suggested-skills').innerHTML = suggested.length
    ? suggested.map(s => `<button type="button" class="chip-toggle" data-suggest="${escapeHtml(s)}">+ ${escapeHtml(s)} <span class="text-gray-500">(${counts[s]})</span></button>`).join('')
    : '<p class="text-sm text-gray-400">You already have every skill from our listings. Impressive!</p>';

  document.getElementById('skill-suggestions').innerHTML = SKILLS
    .filter(s => !user.skills.includes(s))
    .map(s => `<option value="${escapeHtml(s)}">`).join('');
}

// ---------- Form (Create and Update) ----------
function resetForm() {
  editingSkill = null;
  document.getElementById('skill-form').reset();
  setFieldError(document.getElementById('skill-name'), '');
  setFieldError(document.getElementById('skill-years'), '');
  document.getElementById('form-title').textContent = 'Add a skill';
  document.getElementById('form-submit').textContent = 'Add skill';
  document.getElementById('form-cancel').classList.add('hidden');
  renderSkills();
}

function startEditing(name) {
  const info = skillInfo(Auth.current(), name);
  resetForm();
  editingSkill = name;
  document.getElementById('skill-name').value = name;
  document.getElementById('skill-level').value = info.level;
  document.getElementById('skill-years').value = info.years;
  document.getElementById('form-title').textContent = `Edit “${name}”`;
  document.getElementById('form-submit').textContent = 'Save changes';
  document.getElementById('form-cancel').classList.remove('hidden');
  renderSkills();
  document.getElementById('skill-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.current()) return;
  renderSkills();

  document.getElementById('skill-form').addEventListener('submit', e => {
    e.preventDefault();
    const nameInput = document.getElementById('skill-name');
    const yearsInput = document.getElementById('skill-years');
    const name = normalizeSkill(nameInput.value.trim());
    const level = document.getElementById('skill-level').value;
    const years = Number(yearsInput.value);
    const user = Auth.current();

    // Validation
    const duplicate = user.skills.some(s => s.toLowerCase() === name.toLowerCase() && s !== editingSkill);
    const nameError = name.length < 1 ? 'Please enter a skill name.'
      : duplicate ? 'You already have this skill. Use Edit to change it.' : '';
    const yearsError = yearsInput.value === '' || Number.isNaN(years) || years < 0 || years > 30
      ? 'Enter a number of years between 0 and 30.' : '';
    setFieldError(nameInput, nameError);
    setFieldError(yearsInput, yearsError);
    if (nameError || yearsError) return;

    Auth.update(u => {
      u.skillLevels = u.skillLevels || {};
      if (editingSkill) {
        // Update: replace the old name (it may have been renamed) and its details
        u.skills = u.skills.map(s => (s === editingSkill ? name : s));
        delete u.skillLevels[editingSkill];
      } else {
        // Create: add the new skill to the list
        u.skills.push(name);
      }
      u.skillLevels[name] = { level, years, updatedAt: new Date().toISOString() };
    });
    showToast(editingSkill ? `“${name}” updated.` : `“${name}” added to your skills.`);
    resetForm();
  });

  document.getElementById('form-cancel').addEventListener('click', resetForm);

  // Edit / Delete buttons on the skill cards
  document.getElementById('skills-list').addEventListener('click', e => {
    const editButton = e.target.closest('[data-edit]');
    const deleteButton = e.target.closest('[data-delete]');
    if (editButton) startEditing(editButton.dataset.edit);

    // Delete: keep every skill except the removed one
    if (deleteButton && confirm(`Remove “${deleteButton.dataset.delete}” from your skills?`)) {
      const name = deleteButton.dataset.delete;
      Auth.update(u => {
        u.skills = u.skills.filter(s => s !== name);
        if (u.skillLevels) delete u.skillLevels[name];
      });
      if (editingSkill === name) resetForm();
      else renderSkills();
      showToast(`“${name}” removed.`, 'info');
    }
  });

  // Clicking a suggested skill fills in the form
  document.getElementById('suggested-skills').addEventListener('click', e => {
    const chip = e.target.closest('[data-suggest]');
    if (!chip) return;
    resetForm();
    document.getElementById('skill-name').value = chip.dataset.suggest;
    document.getElementById('skill-level').focus();
  });
});
