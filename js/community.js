// Community page: discussion posts (create, like, comment, delete) and mentor session requests.

let activeCategory = 'All';
const openComments = new Set();

function loadPosts() {
  let posts = Store.get('posts', null);
  if (!posts) {
    posts = SEED_POSTS;
    Store.set('posts', posts);
  }
  return posts;
}

function savePosts(posts) {
  Store.set('posts', posts);
}

function postCard(post) {
  const user = Auth.current();
  const liked = Boolean(user && post.likedBy.includes(user.email));
  const isMine = Boolean(user && post.authorEmail === user.email);
  const showComments = openComments.has(post.id);
  return `
    <article class="card" data-post="${post.id}">
      <div class="flex items-center gap-3">
        <span class="avatar w-10 h-10 text-sm">${escapeHtml(initials(post.author))}</span>
        <div class="flex-1 min-w-0">
          <p class="font-semibold">${escapeHtml(post.author)}</p>
          <p class="text-xs text-gray-400">${timeAgo(post.date)}</p>
        </div>
        <span class="chip">${escapeHtml(post.category)}</span>
      </div>
      <h3 class="mt-4 text-xl font-bold">${escapeHtml(post.title)}</h3>
      <p class="mt-2 text-gray-300 whitespace-pre-line break-words">${escapeHtml(post.body)}</p>
      <div class="mt-4 flex items-center gap-6 text-sm">
        <button type="button" data-like class="flex items-center gap-1 ${liked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-300'}" aria-pressed="${liked}">
          ${liked ? '♥' : '♡'} <span>${post.likes}</span>
        </button>
        <button type="button" data-toggle-comments class="text-gray-400 hover:text-white">💬 ${post.comments.length} comment${post.comments.length === 1 ? '' : 's'}</button>
        ${isMine ? '<button type="button" data-delete class="ml-auto text-gray-500 hover:text-red-400">Delete</button>' : ''}
      </div>
      <div class="${showComments ? '' : 'hidden'} mt-4 pt-4 border-t border-white/10 space-y-4">
        ${post.comments.map(c => `
          <div class="flex gap-3">
            <span class="avatar w-8 h-8 text-xs">${escapeHtml(initials(c.author))}</span>
            <div class="flex-1 min-w-0 rounded-xl bg-black/30 px-4 py-2">
              <p class="text-sm font-semibold">${escapeHtml(c.author)} <span class="font-normal text-gray-500">· ${timeAgo(c.date)}</span></p>
              <p class="text-sm text-gray-300 break-words">${escapeHtml(c.body)}</p>
            </div>
          </div>`).join('')}
        <form data-comment-form class="flex gap-2">
          <input class="input" maxlength="500" placeholder="${user ? 'Write a comment…' : 'Sign in to comment'}" aria-label="Comment">
          <button type="submit" class="btn-primary !px-4">Send</button>
        </form>
      </div>
    </article>`;
}

function renderPosts() {
  let posts = loadPosts().filter(p => activeCategory === 'All' || p.category === activeCategory);
  const sort = document.getElementById('post-sort').value;
  posts.sort(sort === 'top' ? (a, b) => b.likes - a.likes : (a, b) => b.date.localeCompare(a.date));
  document.getElementById('posts').innerHTML = posts.length
    ? posts.map(postCard).join('')
    : '<p class="empty-state">No posts in this category yet. Be the first!</p>';
}

function renderCategoryTabs() {
  const categories = ['All', 'Career advice', 'Learning', 'Projects', 'Interviews', 'Off-topic'];
  document.getElementById('category-tabs').innerHTML = categories
    .map(c => `<button type="button" class="chip-toggle ${c === activeCategory ? 'selected' : ''}" data-category="${c}">${c}</button>`)
    .join('');
}

function updatePost(id, changeFn) {
  const posts = loadPosts();
  const post = posts.find(p => p.id === id);
  if (post) changeFn(post, posts);
  savePosts(posts);
  renderPosts();
}

function renderMentors() {
  document.getElementById('mentors').innerHTML = MENTORS.map(m => `
    <div class="flex gap-3">
      <span class="avatar w-11 h-11">${escapeHtml(initials(m.name))}</span>
      <div class="flex-1 min-w-0">
        <p class="font-semibold">${escapeHtml(m.name)}</p>
        <p class="text-xs text-gray-400">${escapeHtml(m.role)} · ${m.years} yrs</p>
        <div class="mt-1 flex flex-wrap gap-1">${m.skills.map(s => `<span class="chip !text-[10px] !px-2">${escapeHtml(s)}</span>`).join('')}</div>
        <button type="button" data-mentor="${m.id}" class="mt-2 text-sm text-violet-400 hover:underline">Request a session &rarr;</button>
      </div>
    </div>`).join('');
}

function openMentorForm(mentor) {
  if (!Auth.requireLogin('Sign in to request a mentoring session.')) return;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const body = openModal(`
    <h2 class="text-2xl font-bold">Session with ${escapeHtml(mentor.name)}</h2>
    <p class="text-gray-400">${escapeHtml(mentor.role)}</p>
    <form id="mentor-form" class="mt-6 space-y-4" novalidate>
      <div class="grid gap-4 sm:grid-cols-2">
        <div><label class="label" for="mentor-date">Preferred date</label><input id="mentor-date" type="date" min="${tomorrow}" class="input"></div>
        <div><label class="label" for="mentor-time">Preferred time</label>
          <select id="mentor-time" class="input"><option>10:00</option><option>13:00</option><option>17:00</option><option>19:00</option></select></div>
      </div>
      <div><label class="label" for="mentor-topic">What would you like to discuss?</label>
        <textarea id="mentor-topic" rows="3" class="input" placeholder="e.g. Review my CV, how to prepare for a React interview…"></textarea></div>
      <button type="submit" class="btn-primary">Send request</button>
    </form>`);

  body.querySelector('#mentor-form').addEventListener('submit', e => {
    e.preventDefault();
    const date = body.querySelector('#mentor-date');
    const topic = body.querySelector('#mentor-topic');
    setFieldError(date, date.value && date.value >= tomorrow ? '' : 'Please choose a date starting tomorrow.');
    setFieldError(topic, topic.value.trim().length >= 10 ? '' : 'Please describe the topic (min. 10 characters).');
    if (!date.value || date.value < tomorrow || topic.value.trim().length < 10) return;

    Auth.update(u => {
      u.mentorRequests.push({
        mentorId: mentor.id, date: date.value, time: body.querySelector('#mentor-time').value,
        topic: topic.value.trim(), createdAt: new Date().toISOString()
      });
    });
    closeModal();
    showToast(`Request sent to ${mentor.name}. You'll get a confirmation by email.`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryTabs();
  renderPosts();
  renderMentors();

  // New post
  document.getElementById('post-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!Auth.requireLogin('Sign in to publish a post.')) return;
    const title = document.getElementById('post-title');
    const body = document.getElementById('post-body');
    setFieldError(title, title.value.trim().length >= 5 ? '' : 'The title needs at least 5 characters.');
    setFieldError(body, body.value.trim().length >= 10 ? '' : 'The message needs at least 10 characters.');
    if (title.value.trim().length < 5 || body.value.trim().length < 10) return;

    const user = Auth.current();
    const posts = loadPosts();
    posts.push({
      id: 'p' + Date.now(), author: user.name, authorEmail: user.email,
      category: document.getElementById('post-category').value, date: new Date().toISOString(),
      title: title.value.trim(), body: body.value.trim(), likes: 0, likedBy: [], comments: []
    });
    savePosts(posts);
    e.target.reset();
    activeCategory = 'All';
    document.getElementById('post-sort').value = 'new';
    renderCategoryTabs();
    renderPosts();
    showToast('Your post is live!');
  });

  document.getElementById('post-sort').addEventListener('change', renderPosts);

  document.getElementById('category-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-category]');
    if (!tab) return;
    activeCategory = tab.dataset.category;
    renderCategoryTabs();
    renderPosts();
  });

  // Likes, comments and delete (event delegation on the feed)
  const feed = document.getElementById('posts');
  feed.addEventListener('click', e => {
    const article = e.target.closest('[data-post]');
    if (!article) return;
    const id = article.dataset.post;

    if (e.target.closest('[data-like]')) {
      if (!Auth.requireLogin('Sign in to like posts.')) return;
      const email = Auth.current().email;
      updatePost(id, post => {
        if (post.likedBy.includes(email)) {
          post.likedBy = post.likedBy.filter(x => x !== email);
          post.likes--;
        } else {
          post.likedBy.push(email);
          post.likes++;
        }
      });
    }
    if (e.target.closest('[data-toggle-comments]')) {
      if (openComments.has(id)) openComments.delete(id); else openComments.add(id);
      renderPosts();
    }
    if (e.target.closest('[data-delete]') && confirm('Delete this post?')) {
      const posts = loadPosts().filter(p => p.id !== id);
      savePosts(posts);
      renderPosts();
      showToast('Post deleted.', 'info');
    }
  });

  feed.addEventListener('submit', e => {
    if (!e.target.matches('[data-comment-form]')) return;
    e.preventDefault();
    if (!Auth.requireLogin('Sign in to comment.')) return;
    const input = e.target.querySelector('input');
    const text = input.value.trim();
    if (text.length < 2) {
      input.focus();
      return;
    }
    const id = e.target.closest('[data-post]').dataset.post;
    updatePost(id, post => {
      post.comments.push({ author: Auth.current().name, body: text, date: new Date().toISOString() });
    });
  });

  document.getElementById('mentors').addEventListener('click', e => {
    const button = e.target.closest('[data-mentor]');
    if (button) openMentorForm(MENTORS.find(m => m.id === button.dataset.mentor));
  });
});
