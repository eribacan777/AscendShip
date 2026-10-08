// Profile page: account info, edit profile, applications, saved items, events and mentor requests.

if (!Auth.current()) {
  location.replace('Get-Started.html?redirect=Profile.html');
}

function listRow(content, action) {
  return `<div class="card !p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">${content}${action || ''}</div>`;
}

function emptyRow(text, link, linkText) {
  return `<div class="card !p-6 text-center text-gray-400">${text} <a href="${link}" class="text-violet-400 hover:underline">${linkText}</a></div>`;
}

function renderProfile() {
  const user = Auth.current();
  if (!user) return;

  document.getElementById('profile-avatar').textContent = initials(user.name);
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-role').textContent = user.role;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-bio').textContent = user.bio || '';
  document.getElementById('profile-skills').innerHTML = user.skills.length
    ? user.skills.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join('')
    : '<p class="text-sm text-gray-400">No skills yet — add some to get matched!</p>';

  document.getElementById('count-applications').textContent = user.applications.length;
  document.getElementById('count-saved').textContent = user.saved.length;
  document.getElementById('count-events').textContent = user.events.length;
  document.getElementById('count-mentors').textContent = user.mentorRequests.length;

  // Recommended: best matches the user hasn't applied to yet
  const recommended = OPPORTUNITIES
    .filter(o => !hasApplied(user, o.id) && matchScore(o, user) > 0)
    .sort((a, b) => matchScore(b, user) - matchScore(a, user))
    .slice(0, 4);
  document.getElementById('recommended').innerHTML = recommended.length
    ? recommended.map(opportunityCard).join('')
    : '<div class="md:col-span-2 card !p-6 text-center text-gray-400">Add skills to your profile (Edit profile) to get recommendations.</div>';

  // Applications
  document.getElementById('applications').innerHTML = user.applications.length
    ? [...user.applications].reverse().map(a => {
        const o = findOpportunity(a.id);
        if (!o) return '';
        return listRow(`
          <div>
            <p class="font-semibold">${escapeHtml(o.title)}</p>
            <p class="text-sm text-gray-400">${escapeHtml(o.company)} · applied ${formatDate(a.date)}</p>
          </div>`, `
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-300">${escapeHtml(a.status)}</span>
            <a href="${pageFor(o)}?id=${o.id}" class="text-sm text-violet-400 hover:underline">View</a>
            <button type="button" data-withdraw="${o.id}" class="text-sm text-gray-500 hover:text-red-400">Withdraw</button>
          </div>`);
      }).join('')
    : emptyRow('You haven’t applied anywhere yet.', 'Internships.html', 'Browse internships &rarr;');

  // Saved
  const saved = user.saved.map(findOpportunity).filter(Boolean);
  document.getElementById('saved').innerHTML = saved.length
    ? saved.map(opportunityCard).join('')
    : `<div class="md:col-span-2">${emptyRow('Tap the ☆ on any job or internship to save it here.', 'Jobs.html', 'Browse jobs &rarr;')}</div>`;

  // Events
  const events = user.events.map(id => EVENTS.find(e => e.id === id)).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
  document.getElementById('my-events').innerHTML = events.length
    ? events.map(e => listRow(`
        <div>
          <p class="font-semibold">${escapeHtml(e.title)}</p>
          <p class="text-sm text-gray-400">${formatDate(e.date)} · ${e.time} · ${escapeHtml(e.location)}</p>
        </div>`, `<a href="Events.html#${e.id}" class="text-sm text-violet-400 hover:underline">Details</a>`)).join('')
    : emptyRow('No events yet.', 'Events.html', 'See upcoming events &rarr;');

  // Mentor requests
  document.getElementById('my-mentors').innerHTML = user.mentorRequests.length
    ? user.mentorRequests.map(r => {
        const mentor = MENTORS.find(m => m.id === r.mentorId);
        return listRow(`
          <div>
            <p class="font-semibold">${escapeHtml(mentor ? mentor.name : 'Mentor')}</p>
            <p class="text-sm text-gray-400">${formatDate(r.date)} at ${escapeHtml(r.time)} · “${escapeHtml(r.topic)}”</p>
          </div>`, '<span class="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">Pending</span>');
      }).join('')
    : emptyRow('No mentoring sessions yet.', 'Community.html', 'Find a mentor &rarr;');
}

function openEditProfile() {
  const user = Auth.current();
  const selected = new Set(user.skills);
  const body = openModal(`
    <h2 class="text-2xl font-bold">Edit profile</h2>
    <form id="edit-form" class="mt-6 space-y-5" novalidate>
      <div><label class="label" for="edit-name">Full name</label><input id="edit-name" class="input" value="${escapeHtml(user.name)}"></div>
      <div>
        <label class="label" for="edit-role">I am a…</label>
        <select id="edit-role" class="input">
          ${['Student', 'Recent graduate', 'Career switcher', 'Junior professional']
            .map(r => `<option ${r === user.role ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
      <div><label class="label" for="edit-bio">Short bio</label><textarea id="edit-bio" rows="3" maxlength="300" class="input" placeholder="What are you looking for?">${escapeHtml(user.bio || '')}</textarea></div>
      <div>
        <p class="label">Skills</p>
        <div id="edit-skills" class="flex flex-wrap gap-2">
          ${SKILLS.map(s => `<button type="button" class="chip-toggle ${selected.has(s) ? 'selected' : ''}" data-skill="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
        </div>
      </div>
      <button type="submit" class="btn-primary">Save changes</button>
    </form>`);

  body.querySelector('#edit-skills').addEventListener('click', e => {
    const chip = e.target.closest('[data-skill]');
    if (!chip) return;
    chip.classList.toggle('selected');
    if (selected.has(chip.dataset.skill)) selected.delete(chip.dataset.skill);
    else selected.add(chip.dataset.skill);
  });

  body.querySelector('#edit-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = body.querySelector('#edit-name');
    if (name.value.trim().length < 3) {
      setFieldError(name, 'Please enter your full name (min. 3 characters).');
      return;
    }
    Auth.update(u => {
      u.name = name.value.trim();
      u.role = body.querySelector('#edit-role').value;
      u.bio = body.querySelector('#edit-bio').value.trim();
      u.skills = SKILLS.filter(s => selected.has(s));
    });
    closeModal();
    renderProfile();
    renderAuthSlots();
    showToast('Profile updated.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.current()) return;
  renderProfile();

  document.getElementById('edit-profile').addEventListener('click', openEditProfile);

  document.getElementById('delete-account').addEventListener('click', () => {
    if (!confirm('Delete your account and all your data? This cannot be undone.')) return;
    Auth.deleteAccount();
    location.href = 'index.html';
  });

  document.getElementById('applications').addEventListener('click', e => {
    const button = e.target.closest('[data-withdraw]');
    if (!button || !confirm('Withdraw this application?')) return;
    Auth.update(u => { u.applications = u.applications.filter(a => a.id !== button.dataset.withdraw); });
    renderProfile();
    showToast('Application withdrawn.', 'info');
  });

  document.addEventListener('opportunitieschanged', renderProfile);
  document.addEventListener('modalclosed', renderProfile);
});
