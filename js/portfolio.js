// Portfolio page: full CRUD on the signed-in user's projects.
// Create = add a project, Read = list of projects, Update = edit a project, Delete = remove it.
// Projects are stored on the user object (user.projects) and can be attached to job applications.

if (!Auth.current()) {
  location.replace('Get-Started.html?redirect=Portfolio.html');
}

let editingId = null;             // id of the project being edited (null = adding a new one)
const selectedTechs = new Set();  // technologies chosen in the form

function userProjects() {
  const user = Auth.current();
  return (user && user.projects) || [];
}

// How many applications this project was attached to
function timesAttached(user, projectId) {
  return user.applications.filter(a => (a.projects || []).includes(projectId)).length;
}

// ---------- Read ----------
function renderProjects() {
  const user = Auth.current();
  const projects = userProjects();
  document.getElementById('projects-count').textContent = `(${projects.length})`;

  document.getElementById('projects-list').innerHTML = projects.length
    ? [...projects].reverse().map(p => {
        const attached = timesAttached(user, p.id);
        return `
          <article class="card flex flex-col ${p.id === editingId ? 'ring-2 ring-violet-400' : ''}">
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-xl font-bold break-words">${escapeHtml(p.title)}</h3>
              <span class="chip shrink-0">${escapeHtml(p.type)}</span>
            </div>
            ${p.date ? `<p class="mt-1 text-sm text-gray-400">Finished ${formatDate(p.date + '-01', { month: 'long', year: 'numeric' })}</p>` : ''}
            <p class="mt-3 text-gray-300 break-words">${escapeHtml(p.description)}</p>
            <div class="mt-3 flex flex-wrap gap-2">${p.techs.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>
            ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener" class="mt-3 text-sm text-violet-400 hover:underline break-all">${escapeHtml(p.link)}</a>` : ''}
            <div class="mt-auto pt-4 flex flex-wrap items-center gap-3">
              <button type="button" data-edit="${p.id}" class="btn-outline !px-4 !py-1 text-sm">Edit</button>
              <button type="button" data-delete="${p.id}" class="btn-danger !px-4 !py-1 text-sm">Delete</button>
              ${attached ? `<span class="ml-auto text-xs text-gray-500">Attached to ${attached} application${attached === 1 ? '' : 's'}</span>` : ''}
            </div>
          </article>`;
      }).join('')
    : `<div class="md:col-span-2 card text-center text-gray-400">
         <p class="text-lg">Your portfolio is empty.</p>
         <p class="mt-1">Add a project — school assignments and personal projects count too!</p>
       </div>`;
}

// ---------- Form (Create and Update) ----------
function renderTechChips() {
  // The user's own skills first, then the rest of the known skills
  const user = Auth.current();
  const techs = [...new Set([...user.skills, ...SKILLS])];
  document.getElementById('project-techs').innerHTML = techs
    .map(t => `<button type="button" class="chip-toggle ${selectedTechs.has(t) ? 'selected' : ''}" data-tech="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');
}

function resetForm() {
  editingId = null;
  selectedTechs.clear();
  document.getElementById('project-form').reset();
  ['project-title', 'project-description', 'project-link'].forEach(id => setFieldError(document.getElementById(id), ''));
  document.getElementById('project-techs-error').textContent = '';
  document.getElementById('form-title').textContent = 'Add a project';
  document.getElementById('form-submit').textContent = 'Add project';
  document.getElementById('form-cancel').classList.add('hidden');
  renderTechChips();
  renderProjects();
}

function startEditing(project) {
  resetForm();
  editingId = project.id;
  document.getElementById('project-title').value = project.title;
  document.getElementById('project-description').value = project.description;
  document.getElementById('project-type').value = project.type;
  document.getElementById('project-date').value = project.date || '';
  document.getElementById('project-link').value = project.link || '';
  project.techs.forEach(t => selectedTechs.add(t));
  document.getElementById('form-title').textContent = 'Edit project';
  document.getElementById('form-submit').textContent = 'Save changes';
  document.getElementById('form-cancel').classList.remove('hidden');
  renderTechChips();
  renderProjects();
  document.getElementById('project-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function readAndValidate() {
  const title = document.getElementById('project-title');
  const description = document.getElementById('project-description');
  const link = document.getElementById('project-link');
  const data = {
    title: title.value.trim(),
    description: description.value.trim(),
    type: document.getElementById('project-type').value,
    date: document.getElementById('project-date').value,
    link: link.value.trim(),
    techs: [...selectedTechs]
  };

  const errors = {
    title: data.title.length >= 3 ? '' : 'Please enter a title (min. 3 characters).',
    description: data.description.length >= 20 ? '' : 'Please describe the project (min. 20 characters).',
    link: !data.link || /^https?:\/\/\S+\.\S+/.test(data.link) ? '' : 'The link must start with http:// or https://',
    techs: data.techs.length ? '' : 'Choose at least one technology.'
  };
  setFieldError(title, errors.title);
  setFieldError(description, errors.description);
  setFieldError(link, errors.link);
  document.getElementById('project-techs-error').textContent = errors.techs;

  return Object.values(errors).some(Boolean) ? null : data;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.current()) return;
  renderTechChips();
  renderProjects();

  document.getElementById('project-techs').addEventListener('click', e => {
    const chip = e.target.closest('[data-tech]');
    if (!chip) return;
    chip.classList.toggle('selected');
    if (selectedTechs.has(chip.dataset.tech)) selectedTechs.delete(chip.dataset.tech);
    else selectedTechs.add(chip.dataset.tech);
  });

  document.getElementById('project-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = readAndValidate();
    if (!data) return;

    if (editingId) {
      // Update: change the fields of the existing project
      Auth.update(u => {
        const project = u.projects.find(p => p.id === editingId);
        Object.assign(project, data, { updatedAt: new Date().toISOString() });
      });
      showToast('Project updated.');
    } else {
      // Create: add the new project to the list
      Auth.update(u => {
        u.projects = u.projects || [];
        u.projects.push({ id: 'pr' + Date.now(), ...data, createdAt: new Date().toISOString() });
      });
      showToast('Project added to your portfolio.');
    }
    resetForm();
  });

  document.getElementById('form-cancel').addEventListener('click', resetForm);

  document.getElementById('projects-list').addEventListener('click', e => {
    const editButton = e.target.closest('[data-edit]');
    const deleteButton = e.target.closest('[data-delete]');
    if (editButton) startEditing(userProjects().find(p => p.id === editButton.dataset.edit));

    // Delete: keep every project except the removed one
    if (deleteButton && confirm('Delete this project from your portfolio?')) {
      const id = deleteButton.dataset.delete;
      Auth.update(u => { u.projects = u.projects.filter(p => p.id !== id); });
      if (editingId === id) resetForm();
      else renderProjects();
      showToast('Project deleted.', 'info');
    }
  });
});
