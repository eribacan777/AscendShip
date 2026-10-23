// Job Alerts page: full CRUD on the signed-in student's alerts.
// Create = new alert, Read = list of alerts + matching jobs, Update = edit an alert, Delete = remove it.
// Alerts are stored on the user object (user.alerts) in localStorage.
// The skills are not saved in the alert: every alert uses the skills from the user's profile (My Skills page),
// so when the profile skills change, the results of all alerts change too.

if (!Auth.current()) {
  location.replace('Get-Started.html?redirect=Alerts.html');
}

let editingId = null;   // id of the alert being edited (null = creating a new one)

function profileSkills() {
  const user = Auth.current();
  return (user && user.skills) || [];
}

function userAlerts() {
  const user = Auth.current();
  return (user && user.alerts) || [];
}

// Jobs and internships that match an alert's criteria (same rules as the Jobs page filters)
// Skills come from the profile; with no skills in the profile, skills are not used as a filter.
function alertMatches(alert) {
  const keywords = alert.keywords.toLowerCase();
  const skills = profileSkills();
  return OPPORTUNITIES.filter(o => {
    const text = [o.title, o.company, o.location, o.description, ...o.tags].join(' ').toLowerCase();
    return (alert.type === 'all' || o.type === alert.type)
      && (!keywords || text.includes(keywords))
      && (!alert.location || o.location === alert.location)
      && (alert.modes.length === 0 || alert.modes.includes(o.mode))
      && (skills.length === 0 || skills.some(s => o.tags.includes(s)));
  }).sort((a, b) => b.posted.localeCompare(a.posted));
}

function describeAlert(alert) {
  const parts = [
    alert.type === 'all' ? 'Jobs & internships' : alert.type === 'job' ? 'Jobs' : 'Internships',
    alert.location || 'Any location',
    alert.modes.length ? alert.modes.join(' / ') : 'Any work mode'
  ];
  if (alert.keywords) parts.unshift(`“${alert.keywords}”`);
  return parts;
}

// ---------- Read: show all alerts ----------
function renderAlerts() {
  const alerts = userAlerts();
  document.getElementById('alerts-count').textContent = `(${alerts.length})`;

  if (alerts.length === 0) {
    document.getElementById('alerts-list').innerHTML = `
      <div class="card text-center text-gray-400">
        <p class="text-lg">You have no job alerts yet.</p>
        <p class="mt-1">Use the form to create your first one.</p>
      </div>`;
    return;
  }

  const skills = profileSkills();
  const skillsText = skills.length ? `Your skills: ${skills.map(escapeHtml).join(', ')}` : 'No skills in your profile — skills are not used';

  document.getElementById('alerts-list').innerHTML = [...alerts].reverse().map(alert => {
    const matches = alertMatches(alert);
    return `
      <article class="card ${alert.id === editingId ? 'ring-2 ring-violet-400' : ''}">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="text-xl font-bold">${escapeHtml(alert.name)}</h3>
            <p class="mt-1 text-sm text-gray-400">${describeAlert(alert).map(escapeHtml).join(' · ')}</p>
            <p class="mt-1 text-sm text-violet-300">${skillsText}</p>
          </div>
          <span class="shrink-0 px-3 py-1 rounded-full text-sm font-bold ${matches.length ? 'bg-green/20 text-green' : 'bg-white/10 text-gray-400'}">
            ${matches.length} job${matches.length === 1 ? '' : 's'} found
          </span>
        </div>
        ${matches.length ? `
          <ul class="mt-4 space-y-1 text-sm">
            ${matches.slice(0, 3).map(o => `
              <li><button type="button" data-details="${o.id}" class="text-violet-300 hover:underline text-left">${escapeHtml(o.title)}</button>
                <span class="text-gray-500">· ${escapeHtml(o.company)}</span></li>`).join('')}
          </ul>` : ''}
        <div class="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          ${matches.length ? `<button type="button" data-view="${alert.id}" class="btn-primary !px-4 !py-1 text-sm">View all results</button>` : ''}
          <button type="button" data-edit="${alert.id}" class="btn-outline !px-4 !py-1 text-sm">Edit</button>
          <button type="button" data-delete="${alert.id}" class="btn-danger !px-4 !py-1 text-sm">Delete</button>
          <span class="ml-auto text-xs text-gray-500">${alert.updatedAt ? 'Updated' : 'Created'} ${formatDate(alert.updatedAt || alert.createdAt)}</span>
        </div>
      </article>`;
  }).join('');
}

function viewMatches(alert) {
  const matches = alertMatches(alert);
  openModal(`
    <h2 class="text-2xl font-bold pr-8">${escapeHtml(alert.name)}</h2>
    <p class="text-gray-400">${matches.length} opportunit${matches.length === 1 ? 'y' : 'ies'} found for this alert. The % match on each card compares the job with the skills in your profile.</p>
    <div class="grid gap-4 mt-6 md:grid-cols-2">${matches.map(opportunityCard).join('')}</div>`);
}

// ---------- Form (used for both Create and Update) ----------
function fillFormOptions() {
  const locations = [...new Set(OPPORTUNITIES.map(o => o.location))].sort();
  document.getElementById('alert-location').innerHTML =
    '<option value="">Any location</option>' + locations.map(l => `<option>${escapeHtml(l)}</option>`).join('');

  const skills = profileSkills();
  document.getElementById('profile-skills-info').innerHTML = skills.length
    ? skills.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join('')
    : '<p class="text-sm text-yellow-300">You have no skills in your profile yet.</p>';
}

function resetForm() {
  editingId = null;
  document.getElementById('alert-form').reset();
  document.getElementById('form-title').textContent = 'New job alert';
  document.getElementById('form-submit').textContent = 'Create alert';
  document.getElementById('form-cancel').classList.add('hidden');
  document.getElementById('alert-error').textContent = '';
  setFieldError(document.getElementById('alert-name'), '');
  renderAlerts();
}

// Puts an existing alert into the form so it can be edited
function startEditing(alert) {
  resetForm();
  editingId = alert.id;
  document.getElementById('alert-name').value = alert.name;
  document.getElementById('alert-keywords').value = alert.keywords;
  document.getElementById('alert-type').value = alert.type;
  document.getElementById('alert-location').value = alert.location;
  document.querySelectorAll('input[name="alert-mode"]').forEach(box => { box.checked = alert.modes.includes(box.value); });
  document.getElementById('form-title').textContent = 'Edit job alert';
  document.getElementById('form-submit').textContent = 'Save changes';
  document.getElementById('form-cancel').classList.remove('hidden');
  renderAlerts();
  document.getElementById('alert-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function readForm() {
  return {
    name: document.getElementById('alert-name').value.trim(),
    keywords: document.getElementById('alert-keywords').value.trim(),
    type: document.getElementById('alert-type').value,
    location: document.getElementById('alert-location').value,
    modes: [...document.querySelectorAll('input[name="alert-mode"]:checked')].map(box => box.value)
  };
}

function validate(data) {
  const nameInput = document.getElementById('alert-name');
  const error = document.getElementById('alert-error');
  setFieldError(nameInput, data.name.length >= 3 ? '' : 'Please give your alert a name (min. 3 characters).');
  const hasCriteria = data.keywords || data.type !== 'all' || data.location || data.modes.length || profileSkills().length;
  error.textContent = hasCriteria ? '' : 'Choose at least one criterion (keywords, type, location or work mode), or add skills to your profile.';
  return data.name.length >= 3 && hasCriteria;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.current()) return;
  fillFormOptions();
  renderAlerts();

  // Create or Update
  document.getElementById('alert-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = readForm();
    if (!validate(data)) return;

    if (editingId) {
      // Update: change the fields of the existing alert
      Auth.update(u => {
        const alert = u.alerts.find(a => a.id === editingId);
        Object.assign(alert, data, { updatedAt: new Date().toISOString() });
        delete alert.skills;   // alerts made before skills came from the profile
      });
      showToast('Alert updated.');
    } else {
      // Create: add a new alert to the list
      Auth.update(u => {
        u.alerts = u.alerts || [];
        u.alerts.push({ id: 'a' + Date.now(), ...data, createdAt: new Date().toISOString() });
      });
      showToast(`Alert created — ${alertMatches(data).length} opportunities found right now.`);
    }
    resetForm();
  });

  document.getElementById('form-cancel').addEventListener('click', resetForm);

  // Buttons on the alert cards (event delegation)
  document.getElementById('alerts-list').addEventListener('click', e => {
    const viewButton = e.target.closest('[data-view]');
    const editButton = e.target.closest('[data-edit]');
    const deleteButton = e.target.closest('[data-delete]');

    if (viewButton) viewMatches(userAlerts().find(a => a.id === viewButton.dataset.view));
    if (editButton) startEditing(userAlerts().find(a => a.id === editButton.dataset.edit));

    // Delete: keep every alert except the one removed
    if (deleteButton && confirm('Delete this job alert?')) {
      Auth.update(u => { u.alerts = u.alerts.filter(a => a.id !== deleteButton.dataset.delete); });
      if (editingId === deleteButton.dataset.delete) resetForm();
      else renderAlerts();
      showToast('Alert deleted.', 'info');
    }
  });

  // Saving or applying from the matches window refreshes the counts
  document.addEventListener('opportunitieschanged', renderAlerts);
});
