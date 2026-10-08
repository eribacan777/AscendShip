// Jobs and Internships pages: search, filters, sorting and results.
// The page says which kind to show with <main data-listing="job"> or "internship".

const listingType = document.querySelector('[data-listing]').dataset.listing;
const items = OPPORTUNITIES.filter(o => o.type === listingType);

const filters = { q: '', location: '', modes: [], skills: [], sort: 'newest' };

function fillFilterOptions() {
  const locations = [...new Set(items.map(o => o.location))].sort();
  document.getElementById('filter-location').innerHTML =
    '<option value="">All locations</option>' + locations.map(l => `<option>${escapeHtml(l)}</option>`).join('');

  const skills = [...new Set(items.flatMap(o => o.tags))].sort();
  document.getElementById('filter-skills').innerHTML = skills
    .map(s => `<button type="button" class="chip-toggle" data-skill="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('');

  if (Auth.current()) {
    document.querySelector('#filter-sort option[value="match"]').disabled = false;
  }
}

function applyFilters() {
  const user = Auth.current();
  const q = filters.q.toLowerCase();
  let results = items.filter(o => {
    const text = [o.title, o.company, o.location, o.description, ...o.tags].join(' ').toLowerCase();
    return (!q || text.includes(q))
      && (!filters.location || o.location === filters.location)
      && (filters.modes.length === 0 || filters.modes.includes(o.mode))
      && (filters.skills.length === 0 || filters.skills.some(s => o.tags.includes(s)));
  });

  if (filters.sort === 'newest') results.sort((a, b) => b.posted.localeCompare(a.posted));
  if (filters.sort === 'company') results.sort((a, b) => a.company.localeCompare(b.company));
  if (filters.sort === 'match' && user) results.sort((a, b) => matchScore(b, user) - matchScore(a, user));

  document.getElementById('results-count').textContent =
    `${results.length} ${listingType === 'job' ? 'job' : 'internship'}${results.length === 1 ? '' : 's'} found`;

  document.getElementById('results').innerHTML = results.length
    ? results.map(opportunityCard).join('')
    : `<div class="empty-state md:col-span-2">
         <p class="text-xl">No results match your filters.</p>
         <button type="button" id="empty-reset" class="btn-outline mt-6">Clear filters</button>
       </div>`;

  const emptyReset = document.getElementById('empty-reset');
  if (emptyReset) emptyReset.addEventListener('click', resetFilters);
}

function resetFilters() {
  Object.assign(filters, { q: '', location: '', modes: [], skills: [], sort: 'newest' });
  document.getElementById('filters-form').reset();
  document.querySelectorAll('[data-skill]').forEach(b => b.classList.remove('selected'));
  applyFilters();
}

document.addEventListener('DOMContentLoaded', () => {
  fillFilterOptions();

  // Pre-fill the search from the URL (e.g. coming from the home page search)
  const params = new URLSearchParams(location.search);
  if (params.get('q')) {
    filters.q = params.get('q');
    document.getElementById('filter-q').value = filters.q;
  }

  const form = document.getElementById('filters-form');
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('input', () => {
    filters.q = form.q.value.trim();
    filters.location = form.location.value;
    filters.sort = form.sort.value;
    filters.modes = [...form.querySelectorAll('input[name="mode"]:checked')].map(c => c.value);
    applyFilters();
  });

  document.getElementById('filter-skills').addEventListener('click', e => {
    const chip = e.target.closest('[data-skill]');
    if (!chip) return;
    chip.classList.toggle('selected');
    const skill = chip.dataset.skill;
    filters.skills = filters.skills.includes(skill) ? filters.skills.filter(s => s !== skill) : [...filters.skills, skill];
    applyFilters();
  });

  document.getElementById('filters-reset').addEventListener('click', resetFilters);
  document.getElementById('filters-toggle').addEventListener('click', () => {
    document.getElementById('filters-form').classList.toggle('hidden');
  });

  document.addEventListener('opportunitieschanged', applyFilters);
  applyFilters();

  // Open a specific opportunity from a link such as Jobs.html?id=j3
  if (params.get('id')) openOpportunity(params.get('id'));
});
