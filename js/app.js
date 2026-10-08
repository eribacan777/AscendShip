// Shared logic loaded on every page: storage, accounts, helpers, navbar, modal, toasts, newsletter.

// ---------- Storage (localStorage wrapper) ----------
const Store = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem('ascendship_' + key);
      return value === null ? fallback : JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('ascendship_' + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  },
  remove(key) {
    try { localStorage.removeItem('ascendship_' + key); } catch (e) { /* ignore */ }
  }
};

// ---------- Accounts ----------
const Auth = {
  users() {
    return Store.get('users', []);
  },

  saveUsers(users) {
    Store.set('users', users);
  },

  current() {
    const email = Store.get('session', null);
    if (!email) return null;
    return this.users().find(u => u.email === email) || null;
  },

  // Passwords are never stored in plain text: we keep a SHA-256 hash.
  async hash(password) {
    if (window.crypto && crypto.subtle) {
      const bytes = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for browsers without SubtleCrypto
    let h = 5381;
    for (let i = 0; i < password.length; i++) h = ((h << 5) + h + password.charCodeAt(i)) | 0;
    return 'x' + (h >>> 0).toString(16);
  },

  async register({ name, email, password, role, skills }) {
    email = email.trim().toLowerCase();
    const users = this.users();
    if (users.some(u => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const user = {
      name: name.trim(), email, role, skills: skills || [], bio: '',
      passwordHash: await this.hash(password),
      saved: [], applications: [], events: [], mentorRequests: [],
      createdAt: new Date().toISOString()
    };
    users.push(user);
    this.saveUsers(users);
    Store.set('session', email);
    return user;
  },

  async login(email, password) {
    email = email.trim().toLowerCase();
    const user = this.users().find(u => u.email === email);
    if (!user || user.passwordHash !== await this.hash(password)) {
      throw new Error('Incorrect email or password.');
    }
    Store.set('session', email);
    return user;
  },

  logout() {
    Store.remove('session');
  },

  // Saves changes to the signed-in user (pass a function that edits the user object).
  update(changeFn) {
    const users = this.users();
    const user = users.find(u => u.email === Store.get('session', null));
    if (!user) return null;
    changeFn(user);
    this.saveUsers(users);
    return user;
  },

  deleteAccount() {
    const email = Store.get('session', null);
    this.saveUsers(this.users().filter(u => u.email !== email));
    this.logout();
  },

  // Sends visitors to the sign-in page and brings them back afterwards.
  requireLogin(message) {
    if (this.current()) return true;
    const back = location.pathname.split('/').pop() + location.search;
    showToast(message || 'Please sign in first.', 'info');
    setTimeout(() => {
      location.href = 'Get-Started.html?redirect=' + encodeURIComponent(back);
    }, 900);
    return false;
  }
};

// ---------- Helpers ----------
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(isoDate, options) {
  return new Date(isoDate).toLocaleDateString('en-GB', options || { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + ' min ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + (days === 1 ? ' day ago' : ' days ago');
  return formatDate(isoDate);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Percentage of an opportunity's required skills that the user has.
function matchScore(opportunity, user) {
  if (!user || !user.skills || user.skills.length === 0) return null;
  const hits = opportunity.tags.filter(tag => user.skills.includes(tag)).length;
  return Math.round((hits / opportunity.tags.length) * 100);
}

// Shows an error message under a form field (or clears it when message is empty).
function setFieldError(input, message) {
  let error = input.parentElement.querySelector('.field-error');
  if (!error) {
    error = document.createElement('p');
    error.className = 'field-error';
    input.parentElement.appendChild(error);
  }
  error.textContent = message || '';
  input.classList.toggle('input-invalid', Boolean(message));
}

// ---------- Toast notifications ----------
function showToast(message, type) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 left-6 sm:left-auto z-[100] flex flex-col gap-3 items-end';
    document.body.appendChild(container);
  }
  const colors = { success: 'border-green', error: 'border-red-500', info: 'border-violet-400' };
  const toast = document.createElement('div');
  toast.className = 'toast border-l-4 ' + (colors[type] || colors.success);
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ---------- Modal ----------
function openModal(html) {
  let modal = document.getElementById('modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'fixed inset-0 z-[80] hidden items-center justify-center bg-black/75 p-4';
    modal.innerHTML = `
      <div class="card relative w-full max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <button type="button" data-close-modal class="absolute top-4 right-4 text-2xl leading-none text-gray-400 hover:text-white" aria-label="Close">&times;</button>
        <div id="modal-body"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('[data-close-modal]')) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  }
  document.getElementById('modal-body').innerHTML = html;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('overflow-hidden');
  return document.getElementById('modal-body');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  document.dispatchEvent(new Event('modalclosed'));
}

// ---------- Navbar ----------
function renderAuthSlots() {
  const user = Auth.current();
  document.querySelectorAll('[data-auth-slot]').forEach(slot => {
    if (user) {
      slot.innerHTML = `
        <a href="Profile.html" class="flex items-center gap-2 hover:text-violet-400" title="My profile">
          <span class="avatar w-9 h-9 text-sm">${escapeHtml(initials(user.name))}</span>
          <span class="font-medium">${escapeHtml(user.name.split(' ')[0])}</span>
        </a>
        <button type="button" data-logout class="btn-outline !px-4 !py-1 text-sm">Log out</button>`;
    } else {
      slot.innerHTML = `<a href="Get-Started.html" class="btn-primary">Get Started</a>`;
    }
  });
  document.querySelectorAll('[data-logout]').forEach(button => {
    button.addEventListener('click', () => {
      Auth.logout();
      location.href = 'index.html';
    });
  });
}

function initNavbar() {
  // Highlight the link of the current page
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  // Mobile menu toggle
  const menuButton = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      menuButton.setAttribute('aria-expanded', open);
    });
  }

  renderAuthSlots();

  // Elements meant only for visitors without an account (e.g. "Join" buttons)
  if (Auth.current()) document.querySelectorAll('[data-guest-only]').forEach(el => el.remove());
}

// ---------- Newsletter (footer) ----------
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const email = input.value.trim().toLowerCase();
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }
    const subscribers = Store.get('newsletter', []);
    if (subscribers.includes(email)) {
      showToast('You are already subscribed. Thank you!', 'info');
    } else {
      subscribers.push(email);
      Store.set('newsletter', subscribers);
      showToast('Subscribed! You will receive our weekly opportunities digest.');
    }
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNewsletter();
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
