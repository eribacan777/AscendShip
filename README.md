# AscendShip

AscendShip is a career platform for early-career tech talent (students, recent graduates and career switchers). It lists internships and junior jobs, matches them to your skills, and adds a community, mentors and events.

**Live app:** https://eribacan777.github.io/AscendShip/

## Features

- **Accounts:** sign up and sign in with form validation. Passwords are stored as SHA-256 hashes.
- **Jobs & Internships:** search, filter by location, work mode and skills, and sort by newest, company or best match.
- **Personalized matching:** a “% match” score based on the skills in your profile.
- **Apply:** application form with validation. You can save items (☆), follow your applications and withdraw them.
- **Events:** filter by type, register or cancel, with live seat counters. Past events and sold-out events are handled.
- **Community:** publish posts, like, comment, delete your own posts, filter by category and request sessions with mentors.
- **Job Alerts:** full CRUD on saved searches. Create an alert (keywords, type, location, work mode), see the matching jobs and internships, edit it or delete it. Alerts use the skills from your profile automatically.
- **My Skills:** full CRUD on your skills, with level and years of practice. They drive the % match and recommendations. Shows the most requested skills you don't have yet.
- **Portfolio:** full CRUD on your projects (title, description, type, date, link, technologies). Projects can be attached to job applications.
- **Learning Goals:** full CRUD on learning goals (goal, skill, deadline, progress, notes). Status (not started, in progress, completed, overdue) is calculated automatically, and a finished goal can add its skill to My Skills.
- **Profile:** edit your profile, see recommendations, applications, saved items, events and mentor requests, and delete your account.
- **About Us:** mission, team, partners, FAQ, contact form and privacy policy.
- **Newsletter:** subscribe form in the footer on every page.
- **Responsive:** works on mobile and desktop, with a hamburger menu on small screens.

All data is kept in the browser with `localStorage`. There is no backend, so the site works on any static host, such as GitHub Pages.

## Project structure

```
index.html, Jobs.html, Internships.html, Events.html,
Community.html, About-Us.html, Get-Started.html, Profile.html, Alerts.html,
Skills.html, Portfolio.html, Goals.html
css/main.css        compiled Tailwind CSS (generated – do not edit)
src/input.css       Tailwind source + custom component classes
js/data.js          jobs, internships, events, mentors, seed posts
js/app.js           shared: storage, accounts, navbar, modal, toasts, newsletter
js/opportunities.js job/internship cards, details modal, apply & save
js/listings.js      Jobs/Internships filters
js/home.js, events.js, alerts.js, skills.js, portfolio.js, goals.js, community.js, about.js, auth.js, profile.js   page scripts
```

## Running locally

Open `index.html` in a browser, or use the VS Code “Live Server” extension.

After you change Tailwind classes in the HTML or JS files, rebuild the CSS:

```bash
npm install
npm run build      # or: npm run watch
```

After publishing changes, bump the `?v=` number on the CSS and JS links in the HTML pages so browsers load the new files instead of cached ones.
