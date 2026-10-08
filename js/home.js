// Home page: stats, quick search, latest/recommended opportunities and the next event.

function animateCounter(element, target) {
  const duration = 900;
  const start = performance.now();
  const step = now => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = Math.round(target * progress);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderStats() {
  const today = new Date().toISOString().slice(0, 10);
  animateCounter(document.getElementById('stat-jobs'), OPPORTUNITIES.filter(o => o.type === 'job').length);
  animateCounter(document.getElementById('stat-internships'), OPPORTUNITIES.filter(o => o.type === 'internship').length);
  animateCounter(document.getElementById('stat-events'), EVENTS.filter(e => e.date >= today).length);
  animateCounter(document.getElementById('stat-companies'), new Set(OPPORTUNITIES.map(o => o.company)).size);
}

function renderLatest() {
  const user = Auth.current();
  let list;
  if (user && user.skills.length) {
    // Signed in with skills: show the best matches instead of the newest posts
    document.getElementById('latest-title').textContent = 'Recommended for you';
    document.getElementById('latest-subtitle').textContent = 'Based on the skills in your profile.';
    list = [...OPPORTUNITIES].sort((a, b) => matchScore(b, user) - matchScore(a, user) || b.posted.localeCompare(a.posted));
  } else {
    list = [...OPPORTUNITIES].sort((a, b) => b.posted.localeCompare(a.posted));
  }
  document.getElementById('latest-list').innerHTML = list.slice(0, 3).map(opportunityCard).join('');
}

function renderNextEvent() {
  const today = new Date().toISOString().slice(0, 10);
  const next = EVENTS.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const box = document.getElementById('next-event');
  if (!next) {
    box.remove();
    return;
  }
  box.innerHTML = `
    <div>
      <p class="text-sm uppercase tracking-wide text-lightPink2">Next event · ${escapeHtml(next.type)}</p>
      <h2 class="mt-2 text-2xl md:text-3xl font-bold">${escapeHtml(next.title)}</h2>
      <p class="mt-2 text-gray-200">${formatDate(next.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${next.time} · ${escapeHtml(next.location)}</p>
    </div>
    <a href="Events.html#${next.id}" class="btn bg-white text-purple2 hover:bg-lightPink2 shrink-0">Reserve your spot</a>`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('hero-search').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const query = form.q.value.trim();
    location.href = form.type.value + (query ? '?q=' + encodeURIComponent(query) : '');
  });

  renderStats();
  renderLatest();
  renderNextEvent();
  document.addEventListener('opportunitieschanged', renderLatest);
});
