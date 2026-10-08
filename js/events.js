// Events page: list, filter by type, register / cancel registration.

let activeType = 'All';

function seatsTaken(event) {
  // Seed number + every local account registered to this event
  const localRegistrations = Auth.users().filter(u => u.events.includes(event.id)).length;
  return Math.min(event.registered + localRegistrations, event.seats);
}

function eventCard(event) {
  const user = Auth.current();
  const today = new Date().toISOString().slice(0, 10);
  const isPast = event.date < today;
  const isRegistered = Boolean(user && user.events.includes(event.id));
  const taken = seatsTaken(event);
  const left = event.seats - taken;
  const date = new Date(event.date);

  let action;
  if (isPast) action = '<span class="text-gray-500 font-semibold">Event ended</span>';
  else if (isRegistered) action = `<button type="button" data-cancel="${event.id}" class="btn-outline !py-1 text-sm">Registered ✓ · Cancel</button>`;
  else if (left <= 0) action = '<span class="text-red-400 font-semibold">Sold out</span>';
  else action = `<button type="button" data-register="${event.id}" class="btn-primary !py-1 text-sm">Register</button>`;

  return `
    <article id="${event.id}" class="card flex flex-col sm:flex-row gap-6 scroll-mt-28 ${isPast ? 'opacity-60' : ''}">
      <div class="flex sm:flex-col items-center justify-center gap-2 sm:gap-0 shrink-0 sm:w-20 py-3 rounded-xl bg-purple2 text-center">
        <span class="text-3xl font-bold">${date.getDate()}</span>
        <span class="uppercase text-sm text-lightPink2">${date.toLocaleDateString('en-GB', { month: 'short' })}</span>
        <span class="text-xs text-gray-300">${date.getFullYear()}</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="chip">${escapeHtml(event.type)}</span>
          <span class="text-sm text-gray-400">${event.time} · ${escapeHtml(event.location)}</span>
        </div>
        <h3 class="mt-2 text-xl font-bold">${escapeHtml(event.title)}</h3>
        <p class="mt-1 text-sm text-violet-300">Hosted by ${escapeHtml(event.host)}</p>
        <p class="mt-3 text-gray-300">${escapeHtml(event.description)}</p>
        <div class="mt-4">
          <div class="h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full bg-violet-500" style="width:${Math.round(taken / event.seats * 100)}%"></div>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span class="text-sm text-gray-400">${isPast ? `${taken} attended` : `${left} of ${event.seats} seats left`}</span>
            ${action}
          </div>
        </div>
      </div>
    </article>`;
}

function renderEvents() {
  const today = new Date().toISOString().slice(0, 10);
  const list = EVENTS.filter(e => activeType === 'All' || e.type === activeType);
  const upcoming = list.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = list.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById('upcoming-list').innerHTML = upcoming.length
    ? upcoming.map(eventCard).join('')
    : '<p class="empty-state">No upcoming events of this type. Check back soon!</p>';
  document.getElementById('past-section').classList.toggle('hidden', past.length === 0);
  document.getElementById('past-list').innerHTML = past.map(eventCard).join('');
}

function renderTabs() {
  const types = ['All', ...new Set(EVENTS.map(e => e.type))];
  document.getElementById('event-tabs').innerHTML = types
    .map(t => `<button type="button" class="chip-toggle ${t === activeType ? 'selected' : ''}" data-type="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderTabs();
  renderEvents();

  document.getElementById('event-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-type]');
    if (!tab) return;
    activeType = tab.dataset.type;
    renderTabs();
    renderEvents();
  });

  document.addEventListener('click', e => {
    const register = e.target.closest('[data-register]');
    const cancel = e.target.closest('[data-cancel]');
    if (register) {
      if (!Auth.requireLogin('Sign in to register for events.')) return;
      const event = EVENTS.find(ev => ev.id === register.dataset.register);
      Auth.update(u => u.events.push(event.id));
      showToast(`You're registered for "${event.title}". See you there!`);
      renderEvents();
    }
    if (cancel) {
      if (!confirm('Cancel your registration for this event?')) return;
      Auth.update(u => { u.events = u.events.filter(id => id !== cancel.dataset.cancel); });
      showToast('Registration cancelled.', 'info');
      renderEvents();
    }
  });

  // Coming from a link like Events.html#e3: scroll to that event
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      target.classList.add('ring-2', 'ring-violet-400');
    }
  }
});
