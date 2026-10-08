// Shared UI for jobs & internships: cards, details modal, saving and applying.
// Used on the Home, Jobs, Internships and Profile pages.

function findOpportunity(id) {
  return OPPORTUNITIES.find(o => o.id === id);
}

function pageFor(opportunity) {
  return opportunity.type === 'job' ? 'Jobs.html' : 'Internships.html';
}

function hasApplied(user, id) {
  return Boolean(user && user.applications.some(a => a.id === id));
}

function matchBadge(score) {
  if (score === null) return '';
  const color = score >= 75 ? 'bg-green/20 text-green' : score >= 40 ? 'bg-yellow-400/20 text-yellow-300' : 'bg-white/10 text-gray-300';
  return `<span class="px-2 py-1 rounded-full text-xs font-bold ${color}" title="How many of the required skills you have">${score}% match</span>`;
}

function opportunityCard(o) {
  const user = Auth.current();
  const saved = user && user.saved.includes(o.id);
  const applied = hasApplied(user, o.id);
  return `
    <article class="card flex flex-col gap-4 hover:border-violet-400/50 transition-colors">
      <div class="flex items-start gap-4">
        <div class="company-logo">${escapeHtml(o.company[0])}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-lg leading-snug">${escapeHtml(o.title)}</h3>
          <p class="text-sm text-gray-400">${escapeHtml(o.company)} · ${escapeHtml(o.location)}</p>
        </div>
        <button type="button" data-save="${o.id}" class="text-2xl leading-none ${saved ? 'text-violet-400' : 'text-gray-500 hover:text-violet-300'}"
          aria-label="${saved ? 'Remove from saved' : 'Save'}" title="${saved ? 'Remove from saved' : 'Save for later'}">${saved ? '★' : '☆'}</button>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="px-2 py-1 rounded-full bg-white/10">${escapeHtml(o.mode)}</span>
        <span class="px-2 py-1 rounded-full bg-white/10">${escapeHtml(o.duration || o.level)}</span>
        ${matchBadge(matchScore(o, user))}
      </div>
      <div class="flex flex-wrap gap-2">${o.tags.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="mt-auto flex items-center justify-between gap-4 pt-2">
        <span class="text-sm font-semibold text-lightPink2">${escapeHtml(o.pay)}</span>
        <button type="button" data-details="${o.id}" class="${applied ? 'btn-outline' : 'btn-primary'} !px-4 !py-1 text-sm">${applied ? 'Applied ✓' : 'View details'}</button>
      </div>
    </article>`;
}

function openOpportunity(id) {
  const o = findOpportunity(id);
  if (!o) return;
  const user = Auth.current();
  const applied = hasApplied(user, o.id);
  const score = matchScore(o, user);
  const body = openModal(`
    <div class="flex items-start gap-4 pr-8">
      <div class="company-logo">${escapeHtml(o.company[0])}</div>
      <div>
        <p class="text-sm text-violet-300 uppercase tracking-wide">${o.type === 'job' ? 'Job' : 'Internship'}</p>
        <h2 class="text-2xl font-bold">${escapeHtml(o.title)}</h2>
        <p class="text-gray-400">${escapeHtml(o.company)} · ${escapeHtml(o.location)} · ${escapeHtml(o.mode)}</p>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 mt-4">
      <span class="chip">${escapeHtml(o.pay)}</span>
      ${o.duration ? `<span class="chip">${escapeHtml(o.duration)}</span>` : ''}
      <span class="chip">Posted ${formatDate(o.posted)}</span>
      ${matchBadge(score)}
    </div>
    <h3 class="mt-6 font-bold">About the role</h3>
    <p class="mt-2 text-gray-300">${escapeHtml(o.description)}</p>
    <h3 class="mt-6 font-bold">What we are looking for</h3>
    <ul class="mt-2 space-y-1 text-gray-300 list-disc list-inside">${o.requirements.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
    <h3 class="mt-6 font-bold">Skills</h3>
    <div class="flex flex-wrap gap-2 mt-2">${o.tags.map(t => {
      const has = user && user.skills.includes(t);
      return `<span class="chip ${has ? '!bg-green/20 !text-green' : ''}">${has ? '✓ ' : ''}${escapeHtml(t)}</span>`;
    }).join('')}</div>
    <div id="apply-area" class="mt-8 pt-6 border-t border-white/10">
      ${applied
        ? `<p class="text-green font-semibold">✓ You applied on ${formatDate(user.applications.find(a => a.id === o.id).date)}. The company will contact you by email.</p>`
        : `<button type="button" id="apply-start" class="btn-primary w-full sm:w-auto">Apply now</button>`}
    </div>`);

  const startButton = body.querySelector('#apply-start');
  if (startButton) startButton.addEventListener('click', () => showApplyForm(o));
}

function showApplyForm(o) {
  if (!Auth.requireLogin('Sign in or create an account to apply.')) return;
  const user = Auth.current();
  const area = document.getElementById('apply-area');
  area.innerHTML = `
    <form id="apply-form" class="space-y-4" novalidate>
      <h3 class="text-xl font-bold">Apply to ${escapeHtml(o.company)}</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div><label class="label" for="apply-name">Full name</label><input id="apply-name" class="input" value="${escapeHtml(user.name)}"></div>
        <div><label class="label" for="apply-email">Email</label><input id="apply-email" type="email" class="input" value="${escapeHtml(user.email)}"></div>
      </div>
      <div><label class="label" for="apply-cv">Link to your CV or portfolio (GitHub, LinkedIn, Drive…)</label><input id="apply-cv" type="url" class="input" placeholder="https://"></div>
      <div><label class="label" for="apply-letter">Why are you a good fit? <span class="text-gray-400">(min. 30 characters)</span></label><textarea id="apply-letter" rows="4" class="input"></textarea></div>
      <button type="submit" class="btn-primary">Send application</button>
    </form>`;

  area.querySelector('#apply-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = area.querySelector('#apply-name');
    const email = area.querySelector('#apply-email');
    const cv = area.querySelector('#apply-cv');
    const letter = area.querySelector('#apply-letter');

    let ok = true;
    const check = (input, condition, message) => {
      setFieldError(input, condition ? '' : message);
      if (!condition) ok = false;
    };
    check(name, name.value.trim().length >= 3, 'Please enter your full name.');
    check(email, isValidEmail(email.value), 'Please enter a valid email.');
    check(cv, /^https?:\/\/\S+\.\S+/.test(cv.value.trim()), 'Please enter a valid link starting with http:// or https://');
    check(letter, letter.value.trim().length >= 30, 'Please write at least 30 characters.');
    if (!ok) return;

    Auth.update(u => {
      u.applications.push({
        id: o.id, date: new Date().toISOString(), status: 'Submitted',
        name: name.value.trim(), email: email.value.trim(), cv: cv.value.trim(), letter: letter.value.trim()
      });
    });
    area.innerHTML = `<p class="text-green font-semibold">✓ Application sent to ${escapeHtml(o.company)}! You can follow it on your <a href="Profile.html" class="underline">profile</a>.</p>`;
    showToast('Application sent!');
    document.dispatchEvent(new Event('opportunitieschanged'));
  });
}

function toggleSaved(id) {
  if (!Auth.requireLogin('Sign in to save opportunities.')) return;
  let nowSaved;
  Auth.update(u => {
    nowSaved = !u.saved.includes(id);
    u.saved = nowSaved ? [...u.saved, id] : u.saved.filter(x => x !== id);
  });
  showToast(nowSaved ? 'Saved to your profile.' : 'Removed from saved.', 'info');
  document.dispatchEvent(new Event('opportunitieschanged'));
}

// One click handler for every card on the page (event delegation).
document.addEventListener('click', e => {
  const save = e.target.closest('[data-save]');
  if (save) return toggleSaved(save.dataset.save);
  const details = e.target.closest('[data-details]');
  if (details) openOpportunity(details.dataset.details);
});
