// Get Started page: sign in / sign up forms with validation.

const params = new URLSearchParams(location.search);

// Only allow redirects to pages of this site (e.g. "Jobs.html?id=j1")
function redirectTarget() {
  const target = params.get('redirect') || '';
  return /^[\w-]+\.html([?#].*)?$/.test(target) ? target : 'Profile.html';
}

function showTab(name) {
  document.getElementById('signin-form').classList.toggle('hidden', name !== 'signin');
  document.getElementById('signup-form').classList.toggle('hidden', name !== 'signup');
  document.querySelectorAll('.tab-btn').forEach(button => {
    const active = button.dataset.tab === name;
    button.classList.toggle('bg-purple2', active);
    button.classList.toggle('text-gray-400', !active);
    button.setAttribute('aria-selected', active);
  });
}

function initSignIn() {
  const form = document.getElementById('signin-form');
  const email = document.getElementById('signin-email');
  const password = document.getElementById('signin-password');
  const error = document.getElementById('signin-error');

  document.getElementById('show-password').addEventListener('change', e => {
    password.type = e.target.checked ? 'text' : 'password';
  });

  document.getElementById('forgot-password').addEventListener('click', () => {
    openModal(`
      <h2 class="text-2xl font-bold">Forgot your password?</h2>
      <p class="mt-4 text-gray-300">Password reset by email is not available in this version of AscendShip, because accounts are stored only in this browser.</p>
      <p class="mt-2 text-gray-300">You can create a new account, or write to us using the <a href="About-Us.html#contact" class="text-violet-400 underline">contact form</a>.</p>
      <button type="button" class="btn-primary mt-6" data-close-modal>OK</button>`);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    error.textContent = '';
    setFieldError(email, isValidEmail(email.value) ? '' : 'Please enter a valid email.');
    setFieldError(password, password.value ? '' : 'Please enter your password.');
    if (!isValidEmail(email.value) || !password.value) return;

    try {
      const user = await Auth.login(email.value, password.value);
      showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
      setTimeout(() => { location.href = redirectTarget(); }, 600);
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function initSignUp() {
  const form = document.getElementById('signup-form');
  const fields = {
    name: document.getElementById('signup-name'),
    email: document.getElementById('signup-email'),
    password: document.getElementById('signup-password'),
    confirm: document.getElementById('signup-confirm'),
    role: document.getElementById('signup-role')
  };
  const terms = document.getElementById('signup-terms');
  const error = document.getElementById('signup-error');
  const skillsBox = document.getElementById('signup-skills');
  const selectedSkills = new Set();

  skillsBox.innerHTML = SKILLS.map(s => `<button type="button" class="chip-toggle" data-skill="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('');
  skillsBox.addEventListener('click', e => {
    const chip = e.target.closest('[data-skill]');
    if (!chip) return;
    chip.classList.toggle('selected');
    if (selectedSkills.has(chip.dataset.skill)) selectedSkills.delete(chip.dataset.skill);
    else selectedSkills.add(chip.dataset.skill);
  });

  const rules = {
    name: v => v.trim().length >= 3 ? '' : 'Please enter your full name (min. 3 characters).',
    email: v => isValidEmail(v) ? '' : 'Please enter a valid email address.',
    password: v => v.length >= 8 && /\d/.test(v) ? '' : 'Use at least 8 characters, including a digit.',
    confirm: v => v === fields.password.value && v ? '' : 'Passwords do not match.',
    role: v => v ? '' : 'Please choose an option.'
  };

  // Validate each field when the user leaves it
  Object.entries(fields).forEach(([key, input]) => {
    input.addEventListener('blur', () => setFieldError(input, rules[key](input.value)));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    error.textContent = '';
    let valid = true;
    Object.entries(fields).forEach(([key, input]) => {
      const message = rules[key](input.value);
      setFieldError(input, message);
      if (message) valid = false;
    });
    if (!terms.checked) {
      error.textContent = 'Please accept the privacy policy.';
      valid = false;
    }
    if (!valid) return;

    try {
      const user = await Auth.register({
        name: fields.name.value, email: fields.email.value, password: fields.password.value,
        role: fields.role.value, skills: [...selectedSkills]
      });
      showToast(`Account created. Welcome, ${user.name.split(' ')[0]}!`);
      setTimeout(() => { location.href = redirectTarget(); }, 600);
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.current()) {
    location.replace(redirectTarget());
    return;
  }
  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
  });
  showTab(params.get('mode') === 'signup' ? 'signup' : 'signin');
  initSignIn();
  initSignUp();
});
