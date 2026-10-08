// About Us page: partners list and contact form.

document.addEventListener('DOMContentLoaded', () => {
  const companies = [...new Set(OPPORTUNITIES.map(o => o.company))].sort();
  document.getElementById('partners-list').innerHTML = companies.map(c => {
    const openRoles = OPPORTUNITIES.filter(o => o.company === c).length;
    return `
      <div class="card flex flex-col items-center gap-2 !p-4 text-center">
        <div class="company-logo">${escapeHtml(c[0])}</div>
        <p class="font-semibold">${escapeHtml(c)}</p>
        <p class="text-xs text-gray-400">${openRoles} open role${openRoles === 1 ? '' : 's'}</p>
      </div>`;
  }).join('');

  const form = document.getElementById('contact-form');
  const name = document.getElementById('contact-name');
  const email = document.getElementById('contact-email');
  const message = document.getElementById('contact-message');

  // Pre-fill for signed-in users
  const user = Auth.current();
  if (user) {
    name.value = user.name;
    email.value = user.email;
  }

  message.addEventListener('input', () => {
    document.getElementById('contact-count').textContent = message.value.length;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = {
      name: name.value.trim().length >= 3 ? '' : 'Please enter your name.',
      email: isValidEmail(email.value) ? '' : 'Please enter a valid email.',
      message: message.value.trim().length >= 20 ? '' : 'Please write at least 20 characters.'
    };
    setFieldError(name, errors.name);
    setFieldError(email, errors.email);
    setFieldError(message, errors.message);
    if (errors.name || errors.email || errors.message) return;

    const messages = Store.get('messages', []);
    messages.push({
      name: name.value.trim(), email: email.value.trim(),
      subject: document.getElementById('contact-subject').value,
      message: message.value.trim(), date: new Date().toISOString()
    });
    Store.set('messages', messages);
    message.value = '';
    document.getElementById('contact-count').textContent = '0';
    showToast('Thank you! We will reply within 2 business days.');
  });
});
