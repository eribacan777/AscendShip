# AscendShip

AscendShip is a career platform for early-career tech talent (students, recent graduates and career switchers). It lists internships and junior jobs, matches them to your skills, and adds a community, mentors and events.

## Features

- **Accounts:** sign up and sign in with form validation. Passwords are stored as SHA-256 hashes.
- **Jobs & Internships:** search, filter by location, work mode and skills, and sort by newest, company or best match.
- **Personalized matching:** a “% match” score based on the skills in your profile.
- **Apply:** application form with validation. You can save items (☆), follow your applications and withdraw them.
- **Events:** filter by type, register or cancel, with live seat counters. Past events and sold-out events are handled.
- **Community:** publish posts, like, comment, delete your own posts, filter by category and request sessions with mentors.
- **Profile:** edit your profile, see recommendations, applications, saved items, events and mentor requests, and delete your account.
- **About Us:** mission, team, partners, FAQ, contact form and privacy policy.
- **Newsletter:** subscribe form in the footer on every page.
- **Responsive:** works on mobile and desktop, with a hamburger menu on small screens.

All data is kept in the browser with `localStorage`. There is no backend, so the site works on any static host, such as GitHub Pages.

## Project structure

```
index.html, Jobs.html, Internships.html, Events.html,
Community.html, About-Us.html, Get-Started.html, Profile.html
css/main.css        compiled Tailwind CSS (generated – do not edit)
src/input.css       Tailwind source + custom component classes
js/data.js          jobs, internships, events, mentors, seed posts
js/app.js           shared: storage, accounts, navbar, modal, toasts, newsletter
js/opportunities.js job/internship cards, details modal, apply & save
js/listings.js      Jobs/Internships filters
js/home.js, events.js, community.js, about.js, auth.js, profile.js   page scripts
```

## Running locally

Open `index.html` in a browser, or use the VS Code “Live Server” extension.

After you change Tailwind classes in the HTML or JS files, rebuild the CSS:

```bash
npm install
npm run build      # or: npm run watch
```
