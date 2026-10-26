// Learning Goals page: full CRUD on the signed-in user's learning goals.
// Create = add a goal, Read = list of goals with status and progress, Update = edit a goal or its progress,
// Delete = remove it. Goals are stored on the user object (user.goals) in localStorage.

if (!Auth.current()) {
  location.replace('Get-Started.html?redirect=Goals.html');
}

let editingId = null;        // id of the goal being edited (null = adding a new one)
let activeFilter = 'All';    // status filter above the list

function today() {
  return new Date().toISOString().slice(0, 10);
}

function userGoals() {
  const user = Auth.current();
  return (user && user.goals) || [];
}

// Status is calculated from the progress and the deadline, it is not stored
function goalStatus(goal) {
  if (goal.progress >= 100) return 'Completed';
  if (goal.deadline < today()) return 'Overdue';
  if (goal.progress === 0) return 'Not started';
  return 'In progress';
}

const STATUS_STYLES = {
  'Completed': 'bg-green/20 text-green',
  'Overdue': 'bg-red-500/20 text-red-400',
  'Not started': 'bg-white/10 text-gray-300',
  'In progress': 'bg-yellow-400/20 text-yellow-300'
};

function daysLeftText(goal) {
  if (goal.progress >= 100) return 'Done';
  const days = Math.round((new Date(goal.deadline) - new Date(today())) / 86400000);
  if (days < 0) return `Overdue by ${-days} day${days === -1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  return `${days} day${days === 1 ? '' : 's'} left`;
}

// ---------- Read ----------
function renderTabs() {
  const goals = userGoals();
  const count = status => goals.filter(g => goalStatus(g) === status).length;
  const tabs = [
    ['All', goals.length],
    ['In progress', count('In progress') + count('Not started')],
    ['Completed', count('Completed')],
    ['Overdue', count('Overdue')]
  ];
  document.getElementById('goal-tabs').innerHTML = tabs
    .map(([name, n]) => `<button type="button" class="chip-toggle ${name === activeFilter ? 'selected' : ''}" data-filter="${name}">${name} (${n})</button>`)
    .join('');
}

function renderGoals() {
  const user = Auth.current();
  const goals = userGoals();
  document.getElementById('goals-count').textContent = `(${goals.length})`;
  renderTabs();

  const visible = goals
    .filter(g => {
      const status = goalStatus(g);
      if (activeFilter === 'All') return true;
      if (activeFilter === 'In progress') return status === 'In progress' || status === 'Not started';
      return status === activeFilter;
    })
    // Unfinished goals first, closest deadline first
    .sort((a, b) => (a.progress >= 100) - (b.progress >= 100) || a.deadline.localeCompare(b.deadline));

  if (visible.length === 0) {
    document.getElementById('goals-list').innerHTML = `
      <div class="card text-center text-gray-400">
        <p class="text-lg">${goals.length ? 'No goals with this status.' : 'You have no learning goals yet.'}</p>
        ${goals.length ? '' : '<p class="mt-1">What do you want to learn next? Add your first goal.</p>'}
      </div>`;
    return;
  }

  document.getElementById('goals-list').innerHTML = visible.map(goal => {
    const status = goalStatus(goal);
    const done = status === 'Completed';
    const skillMissing = done && !user.skills.includes(goal.skill);
    return `
      <article class="card ${goal.id === editingId ? 'ring-2 ring-violet-400' : ''}">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-xl font-bold break-words ${done ? 'line-through text-gray-400' : ''}">${escapeHtml(goal.title)}</h3>
            <p class="mt-1 text-sm text-gray-400">
              <span class="chip">${escapeHtml(goal.skill)}</span>
              <span class="ml-2">Deadline ${formatDate(goal.deadline)} · ${daysLeftText(goal)}</span>
            </p>
          </div>
          <span class="shrink-0 px-3 py-1 rounded-full text-sm font-bold ${STATUS_STYLES[status]}">${status}</span>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <div class="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full ${done ? 'bg-green' : 'bg-violet-500'}" style="width:${goal.progress}%"></div>
          </div>
          <span class="w-12 text-right text-sm font-semibold">${goal.progress}%</span>
        </div>

        ${goal.notes ? `<p class="mt-3 text-sm text-gray-300 whitespace-pre-line break-words">${escapeHtml(goal.notes)}</p>` : ''}

        <div class="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          ${done ? '' : `<button type="button" data-progress="${goal.id}" class="btn-primary !px-4 !py-1 text-sm">+10%</button>
          <button type="button" data-complete="${goal.id}" class="btn-outline !px-4 !py-1 text-sm">Mark as done</button>`}
          ${skillMissing ? `<button type="button" data-add-skill="${goal.id}" class="btn-primary !px-4 !py-1 text-sm">Add “${escapeHtml(goal.skill)}” to My Skills</button>` : ''}
          <button type="button" data-edit="${goal.id}" class="btn-outline !px-4 !py-1 text-sm">Edit</button>
          <button type="button" data-delete="${goal.id}" class="btn-danger !px-4 !py-1 text-sm">Delete</button>
        </div>
      </article>`;
  }).join('');
}

// ---------- Form (Create and Update) ----------
function fillSkillOptions() {
  const user = Auth.current();
  const others = SKILLS.filter(s => !user.skills.includes(s));
  document.getElementById('goal-skill').innerHTML =
    '<option value="">Choose a skill</option>' +
    (others.length ? `<optgroup label="New skills to learn">${others.map(s => `<option>${escapeHtml(s)}</option>`).join('')}</optgroup>` : '') +
    (user.skills.length ? `<optgroup label="Improve a skill you have">${user.skills.map(s => `<option>${escapeHtml(s)}</option>`).join('')}</optgroup>` : '');
}

function showProgress() {
  document.getElementById('goal-progress-value').textContent = document.getElementById('goal-progress').value + '%';
}

function resetForm() {
  editingId = null;
  document.getElementById('goal-form').reset();
  ['goal-title', 'goal-skill', 'goal-deadline'].forEach(id => setFieldError(document.getElementById(id), ''));
  document.getElementById('goal-deadline').min = today();
  document.getElementById('form-title').textContent = 'New learning goal';
  document.getElementById('form-submit').textContent = 'Add goal';
  document.getElementById('form-cancel').classList.add('hidden');
  showProgress();
  renderGoals();
}

function startEditing(goal) {
  resetForm();
  editingId = goal.id;
  document.getElementById('goal-title').value = goal.title;
  document.getElementById('goal-skill').value = goal.skill;
  document.getElementById('goal-deadline').value = goal.deadline;
  document.getElementById('goal-progress').value = goal.progress;
  document.getElementById('goal-notes').value = goal.notes || '';
  document.getElementById('form-title').textContent = 'Edit learning goal';
  document.getElementById('form-submit').textContent = 'Save changes';
  document.getElementById('form-cancel').classList.remove('hidden');
  showProgress();
  renderGoals();
  document.getElementById('goal-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function readAndValidate() {
  const title = document.getElementById('goal-title');
  const skill = document.getElementById('goal-skill');
  const deadline = document.getElementById('goal-deadline');
  const existing = editingId && userGoals().find(g => g.id === editingId);

  // A past deadline is only accepted if it is the one the goal already had
  const deadlineOk = deadline.value && (deadline.value >= today() || (existing && deadline.value === existing.deadline));
  const errors = {
    title: title.value.trim().length >= 5 ? '' : 'Describe your goal (min. 5 characters).',
    skill: skill.value ? '' : 'Choose the skill this goal is about.',
    deadline: deadlineOk ? '' : 'Choose a deadline from today on.'
  };
  setFieldError(title, errors.title);
  setFieldError(skill, errors.skill);
  setFieldError(deadline, errors.deadline);
  if (errors.title || errors.skill || errors.deadline) return null;

  return {
    title: title.value.trim(),
    skill: skill.value,
    deadline: deadline.value,
    progress: Number(document.getElementById('goal-progress').value),
    notes: document.getElementById('goal-notes').value.trim()
  };
}

// Saves a change to one goal (used by Edit, +10% and Mark as done)
function updateGoal(id, changes) {
  Auth.update(u => {
    const goal = u.goals.find(g => g.id === id);
    Object.assign(goal, changes, { updatedAt: new Date().toISOString() });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.current()) return;
  fillSkillOptions();
  resetForm();

  document.getElementById('goal-progress').addEventListener('input', showProgress);

  document.getElementById('goal-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = readAndValidate();
    if (!data) return;

    if (editingId) {
      // Update: change the fields of the existing goal
      updateGoal(editingId, data);
      showToast('Goal updated.');
    } else {
      // Create: add the new goal to the list
      Auth.update(u => {
        u.goals = u.goals || [];
        u.goals.push({ id: 'g' + Date.now(), ...data, createdAt: new Date().toISOString() });
      });
      showToast('Goal added. Good luck!');
    }
    resetForm();
  });

  document.getElementById('form-cancel').addEventListener('click', resetForm);

  document.getElementById('goal-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-filter]');
    if (!tab) return;
    activeFilter = tab.dataset.filter;
    renderGoals();
  });

  // Buttons on the goal cards (event delegation)
  document.getElementById('goals-list').addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    const goal = userGoals().find(g => g.id === Object.values(button.dataset)[0]);
    if (!goal) return;

    if (button.dataset.progress) {
      const progress = Math.min(goal.progress + 10, 100);
      updateGoal(goal.id, { progress });
      if (progress === 100) showToast(`Goal completed: “${goal.title}”!`);
    }
    if (button.dataset.complete) {
      updateGoal(goal.id, { progress: 100 });
      showToast(`Goal completed: “${goal.title}”!`);
    }
    if (button.dataset.addSkill) {
      Auth.update(u => {
        if (!u.skills.includes(goal.skill)) u.skills.push(goal.skill);
        u.skillLevels = u.skillLevels || {};
        u.skillLevels[goal.skill] = { level: 'Beginner', years: 0, updatedAt: new Date().toISOString() };
      });
      fillSkillOptions();
      showToast(`“${goal.skill}” added to My Skills.`);
    }
    if (button.dataset.edit) {
      startEditing(goal);
      return;
    }
    // Delete: keep every goal except the removed one
    if (button.dataset.delete) {
      if (!confirm('Delete this learning goal?')) return;
      Auth.update(u => { u.goals = u.goals.filter(g => g.id !== goal.id); });
      showToast('Goal deleted.', 'info');
      if (editingId === goal.id) {
        resetForm();
        return;
      }
    }
    renderGoals();
  });
});
