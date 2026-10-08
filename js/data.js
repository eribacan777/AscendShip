// Static content for the site: jobs, internships, events, mentors and seed community posts.
// Companies are fictional — this is a demo dataset.

const SKILLS = [
  'HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Node.js', 'Python', 'Java',
  'C#', '.NET', 'SQL', 'Git', 'Docker', 'AWS', 'Linux', 'Figma', 'Machine Learning',
  'Cybersecurity', 'Testing', 'Kotlin', 'Swift', 'Tailwind'
];

const OPPORTUNITIES = [
  // ---------- Jobs ----------
  {
    id: 'j1', type: 'job', title: 'Junior Frontend Developer', company: 'NovaByte',
    location: 'Bucharest', mode: 'Hybrid', level: 'Junior', pay: '5,500 – 7,000 RON / month',
    tags: ['JavaScript', 'React', 'HTML/CSS', 'Git'], posted: '2026-10-02',
    description: 'Join our product team building a modern banking dashboard used by over 200,000 customers. You will turn Figma designs into accessible, responsive React components and learn from senior engineers through weekly code reviews.',
    requirements: ['Solid knowledge of HTML, CSS and JavaScript', 'At least one React project (personal or academic)', 'Comfortable with Git and pull requests', 'Good English communication']
  },
  {
    id: 'j2', type: 'job', title: 'Junior Backend Developer (.NET)', company: 'CodeHarbor',
    location: 'Cluj-Napoca', mode: 'On-site', level: 'Junior', pay: '6,000 – 7,500 RON / month',
    tags: ['C#', '.NET', 'SQL', 'Git'], posted: '2026-09-28',
    description: 'Build REST APIs and background services for a logistics platform. You will work in a small team with a dedicated mentor for your first six months.',
    requirements: ['Basic C# and object-oriented programming', 'Understanding of relational databases and SQL', 'Curiosity about how systems work under the hood']
  },
  {
    id: 'j3', type: 'job', title: 'QA Automation Engineer – Entry Level', company: 'Quantix',
    location: 'Iași', mode: 'Hybrid', level: 'Entry level', pay: '4,800 – 6,200 RON / month',
    tags: ['Testing', 'JavaScript', 'Git'], posted: '2026-10-05',
    description: 'Help us ship reliable software by writing automated end-to-end tests with Playwright. No previous QA job required — we provide a 4-week onboarding program.',
    requirements: ['Basic programming in any language', 'Attention to detail', 'Interest in software quality']
  },
  {
    id: 'j4', type: 'job', title: 'Junior Data Analyst', company: 'DataMinds',
    location: 'Remote', mode: 'Remote', level: 'Junior', pay: '5,000 – 6,500 RON / month',
    tags: ['Python', 'SQL', 'Machine Learning'], posted: '2026-09-30',
    description: 'Turn raw data into dashboards and insights for e-commerce clients. You will use Python, SQL and Power BI every day.',
    requirements: ['SQL queries with joins and aggregations', 'Python basics (pandas is a plus)', 'Analytical thinking']
  },
  {
    id: 'j5', type: 'job', title: 'Cloud Support Associate', company: 'CloudNest',
    location: 'Timișoara', mode: 'Hybrid', level: 'Entry level', pay: '5,200 – 6,800 RON / month',
    tags: ['Linux', 'AWS', 'Docker'], posted: '2026-09-25',
    description: 'Support customers running workloads in the cloud. Troubleshoot Linux servers, containers and networking issues, and grow towards a DevOps role.',
    requirements: ['Linux command line basics', 'Understanding of networking fundamentals', 'AWS certification is a plus, not a must']
  },
  {
    id: 'j6', type: 'job', title: 'Junior Mobile Developer (Android)', company: 'BrightApps',
    location: 'Brașov', mode: 'On-site', level: 'Junior', pay: '5,500 – 7,200 RON / month',
    tags: ['Kotlin', 'Java', 'Git'], posted: '2026-10-01',
    description: 'Develop features for fitness and health apps with more than 1M downloads. You will work with Kotlin, Jetpack Compose and a friendly design team.',
    requirements: ['Kotlin or Java fundamentals', 'At least one Android app on GitHub', 'Willingness to learn Jetpack Compose']
  },
  {
    id: 'j7', type: 'job', title: 'Junior Security Analyst (SOC)', company: 'SecureLayer',
    location: 'Bucharest', mode: 'On-site', level: 'Junior', pay: '6,000 – 8,000 RON / month',
    tags: ['Cybersecurity', 'Linux', 'Python'], posted: '2026-09-20',
    description: 'Monitor security alerts, investigate incidents and help protect our clients. Full training and certification budget included.',
    requirements: ['Networking and operating system fundamentals', 'Interest in security (CTFs are a plus)', 'Availability for a shift schedule']
  },
  {
    id: 'j8', type: 'job', title: 'Full-Stack Developer – Graduate Program', company: 'GreenStack',
    location: 'Remote', mode: 'Remote', level: 'Entry level', pay: '6,500 – 8,000 RON / month',
    tags: ['TypeScript', 'React', 'Node.js', 'SQL'], posted: '2026-10-06',
    description: 'A 12-month graduate program where you rotate through frontend, backend and DevOps teams building software for renewable energy companies.',
    requirements: ['Graduated in the last 2 years or graduating this year', 'JavaScript/TypeScript experience', 'Team player']
  },
  {
    id: 'j9', type: 'job', title: 'Junior UI/UX Designer', company: 'PixelForge',
    location: 'Cluj-Napoca', mode: 'Hybrid', level: 'Junior', pay: '4,500 – 6,000 RON / month',
    tags: ['Figma', 'HTML/CSS'], posted: '2026-09-27',
    description: 'Design clean interfaces for web and mobile products. You will run user interviews, build prototypes in Figma and collaborate closely with developers.',
    requirements: ['A portfolio with at least 3 projects', 'Figma proficiency', 'Basic understanding of HTML and CSS']
  },
  {
    id: 'j10', type: 'job', title: 'Junior Python Developer', company: 'Orbitly',
    location: 'Iași', mode: 'Remote', level: 'Junior', pay: '5,500 – 7,000 RON / month',
    tags: ['Python', 'SQL', 'Docker', 'Git'], posted: '2026-10-03',
    description: 'Build APIs with FastAPI and data pipelines for a satellite imagery startup.',
    requirements: ['Python fundamentals', 'Basic SQL', 'Interest in APIs and data']
  },

  // ---------- Internships ----------
  {
    id: 'i1', type: 'internship', title: 'Frontend Development Intern', company: 'NovaByte',
    location: 'Bucharest', mode: 'Hybrid', level: 'Internship', pay: '2,500 RON / month', duration: '3 months',
    tags: ['HTML/CSS', 'JavaScript', 'Tailwind'], posted: '2026-10-04',
    description: 'A paid summer-style internship running all year round. Build real features in our design system and present your work at the end of the program.',
    requirements: ['Student in Computer Science or a related field', 'HTML, CSS and JavaScript basics', '20 hours/week availability']
  },
  {
    id: 'i2', type: 'internship', title: 'Software Engineering Intern (Java)', company: 'CodeHarbor',
    location: 'Cluj-Napoca', mode: 'On-site', level: 'Internship', pay: '3,000 RON / month', duration: '6 months',
    tags: ['Java', 'SQL', 'Git'], posted: '2026-09-29',
    description: 'Work on backend services in Java and Spring Boot alongside a dedicated mentor. Top interns receive a full-time offer.',
    requirements: ['Java and OOP fundamentals', 'Data structures and algorithms basics', 'Student in 2nd year or above']
  },
  {
    id: 'i3', type: 'internship', title: 'Machine Learning Intern', company: 'DataMinds',
    location: 'Remote', mode: 'Remote', level: 'Internship', pay: '2,800 RON / month', duration: '4 months',
    tags: ['Python', 'Machine Learning', 'SQL'], posted: '2026-10-01',
    description: 'Experiment with recommendation models for online shops. You will clean data, train models and measure their impact.',
    requirements: ['Python and basic statistics', 'Familiarity with scikit-learn or PyTorch', 'Curiosity and patience with messy data']
  },
  {
    id: 'i4', type: 'internship', title: 'DevOps Intern', company: 'CloudNest',
    location: 'Timișoara', mode: 'Hybrid', level: 'Internship', pay: '2,500 RON / month', duration: '3 months',
    tags: ['Linux', 'Docker', 'AWS', 'Git'], posted: '2026-09-26',
    description: 'Automate deployments, write CI/CD pipelines and learn infrastructure as code with Terraform.',
    requirements: ['Linux basics', 'Any scripting language', 'Interest in automation']
  },
  {
    id: 'i5', type: 'internship', title: 'Cybersecurity Intern', company: 'SecureLayer',
    location: 'Bucharest', mode: 'On-site', level: 'Internship', pay: '2,700 RON / month', duration: '3 months',
    tags: ['Cybersecurity', 'Linux', 'Python'], posted: '2026-10-05',
    description: 'Shadow our penetration testing team, analyze vulnerabilities in a lab environment and write security reports.',
    requirements: ['Networking basics (TCP/IP, HTTP)', 'Interest in ethical hacking', 'Student or recent graduate']
  },
  {
    id: 'i6', type: 'internship', title: 'iOS Development Intern', company: 'BrightApps',
    location: 'Brașov', mode: 'Hybrid', level: 'Internship', pay: '2,400 RON / month', duration: '3 months',
    tags: ['Swift', 'Git'], posted: '2026-09-22',
    description: 'Build SwiftUI screens for our wellness apps and learn how to publish on the App Store.',
    requirements: ['Swift basics or strong programming fundamentals', 'Access to a Mac is a plus (we can provide one)']
  },
  {
    id: 'i7', type: 'internship', title: 'QA Testing Intern', company: 'Quantix',
    location: 'Iași', mode: 'On-site', level: 'Internship', pay: '2,000 RON / month', duration: '2 months',
    tags: ['Testing'], posted: '2026-10-06',
    description: 'Learn manual and automated testing on real projects. A great first step into IT — no prior experience required.',
    requirements: ['Logical thinking', 'Good English', 'No prior experience needed']
  },
  {
    id: 'i8', type: 'internship', title: 'Full-Stack Web Intern', company: 'GreenStack',
    location: 'Remote', mode: 'Remote', level: 'Internship', pay: '2,600 RON / month', duration: '4 months',
    tags: ['React', 'Node.js', 'TypeScript'], posted: '2026-09-30',
    description: 'Ship features end-to-end in a TypeScript monorepo: React frontend, Node.js API and PostgreSQL.',
    requirements: ['JavaScript fundamentals', 'A personal web project', 'Part-time availability (min. 20h/week)']
  },
  {
    id: 'i9', type: 'internship', title: 'UI Design Intern', company: 'PixelForge',
    location: 'Cluj-Napoca', mode: 'Hybrid', level: 'Internship', pay: '2,000 RON / month', duration: '3 months',
    tags: ['Figma'], posted: '2026-09-24',
    description: 'Create wireframes, icons and prototypes for client projects under the guidance of a senior designer.',
    requirements: ['Figma basics', 'An eye for detail and typography', 'Portfolio (school projects count)']
  },
  {
    id: 'i10', type: 'internship', title: '.NET Developer Intern', company: 'Orbitly',
    location: 'Remote', mode: 'Remote', level: 'Internship', pay: '2,500 RON / month', duration: '6 months',
    tags: ['C#', '.NET', 'SQL'], posted: '2026-10-07',
    description: 'Build internal tools with ASP.NET Core and Blazor while learning clean architecture practices.',
    requirements: ['C# basics', 'Understanding of OOP', 'Student or career switcher']
  }
];

const EVENTS = [
  {
    id: 'e1', title: 'CV & LinkedIn Workshop for Tech Beginners', type: 'Workshop',
    date: '2026-10-15', time: '18:00', location: 'Online (Zoom)', host: 'Ioana Marin, Tech Recruiter',
    seats: 80, registered: 54,
    description: 'Learn how to write a CV that gets past the first screening, and how to make your LinkedIn profile stand out to recruiters.'
  },
  {
    id: 'e2', title: 'Ask Me Anything: Life as a Junior Developer', type: 'Q&A',
    date: '2026-10-22', time: '19:00', location: 'Online (Discord)', host: 'Andrei Popescu, Frontend Developer at NovaByte',
    seats: 150, registered: 97,
    description: 'An open Q&A session about the first year in a tech job: what to expect, how to learn on the job and how to ask for help.'
  },
  {
    id: 'e3', title: 'AscendShip Networking Night', type: 'Networking',
    date: '2026-10-30', time: '18:30', location: 'Bucharest – Impact Hub', host: 'AscendShip Team',
    seats: 60, registered: 51,
    description: 'Meet recruiters and engineers from 10 partner companies in a relaxed setting. Bring your questions (and your laptop if you want to show a project).'
  },
  {
    id: 'e4', title: 'Build Your First REST API with Node.js', type: 'Workshop',
    date: '2026-11-07', time: '11:00', location: 'Cluj-Napoca – Cluj Hub', host: 'Mihai Rusu, Backend Engineer at GreenStack',
    seats: 40, registered: 22,
    description: 'A hands-on workshop: build, test and deploy a small API with Express. Bring a laptop with Node.js installed.'
  },
  {
    id: 'e5', title: 'Ascend Hackathon 2026', type: 'Hackathon',
    date: '2026-11-21', time: '09:00', location: 'Iași – Palas Campus', host: 'AscendShip & Quantix',
    seats: 120, registered: 88,
    description: '24 hours, teams of up to 4, real challenges from partner companies and prizes for the top 3 teams. Beginners welcome!'
  },
  {
    id: 'e6', title: 'Breaking into Cybersecurity', type: 'Q&A',
    date: '2026-12-03', time: '18:00', location: 'Online (Zoom)', host: 'Elena Dumitru, Security Analyst at SecureLayer',
    seats: 100, registered: 41,
    description: 'Which certifications matter, how to practice legally and what a SOC analyst actually does every day.'
  },
  {
    id: 'e7', title: 'Mock Technical Interviews', type: 'Workshop',
    date: '2026-12-10', time: '17:00', location: 'Online (Google Meet)', host: 'AscendShip Mentors',
    seats: 30, registered: 30,
    description: 'Practice a real technical interview with an experienced engineer and get personalized feedback.'
  },
  {
    id: 'e8', title: 'Intro to Git & GitHub', type: 'Workshop',
    date: '2026-09-20', time: '10:00', location: 'Online (Zoom)', host: 'AscendShip Mentors',
    seats: 100, registered: 100,
    description: 'Version control basics: commits, branches, pull requests and collaborating on open-source projects.'
  }
];

const MENTORS = [
  { id: 'm1', name: 'Andrei Popescu', role: 'Frontend Developer @ NovaByte', skills: ['React', 'JavaScript', 'TypeScript'], years: 5 },
  { id: 'm2', name: 'Elena Dumitru', role: 'Security Analyst @ SecureLayer', skills: ['Cybersecurity', 'Linux'], years: 6 },
  { id: 'm3', name: 'Mihai Rusu', role: 'Backend Engineer @ GreenStack', skills: ['Node.js', 'SQL', 'Docker'], years: 7 },
  { id: 'm4', name: 'Ioana Marin', role: 'Tech Recruiter @ AscendShip', skills: ['CV review', 'Interviews'], years: 8 }
];

const SEED_POSTS = [
  {
    id: 'p1', author: 'Maya Thompson', category: 'Career advice', date: '2026-10-05T10:20:00',
    title: 'How I prepared for my first technical interview',
    body: 'I practiced 2 easy algorithm problems every day for a month and did 3 mock interviews here on AscendShip. The most important thing: explain your thinking out loud, even when you are stuck!',
    likes: 24, likedBy: [], comments: [
      { author: 'Elias Novak', body: 'Mock interviews helped me a lot too. Great tip about thinking out loud.', date: '2026-10-05T12:01:00' }
    ]
  },
  {
    id: 'p2', author: 'Elias Novak', category: 'Learning', date: '2026-10-03T16:45:00',
    title: 'Free resources to learn React in 2026',
    body: 'The official react.dev tutorial is honestly the best place to start. After that, build a small project (a todo app, a weather app) and put it on GitHub. Recruiters love seeing real code.',
    likes: 17, likedBy: [], comments: []
  },
  {
    id: 'p3', author: 'Anika Desai', category: 'Projects', date: '2026-10-01T09:10:00',
    title: 'Looking for teammates for the Ascend Hackathon',
    body: 'I am a designer (Figma) looking for 2 developers for the hackathon in Iași. Frontend and backend both welcome — let me know in the comments!',
    likes: 9, likedBy: [], comments: [
      { author: 'Maya Thompson', body: 'I can do frontend! Sending you a message.', date: '2026-10-01T11:30:00' }
    ]
  }
];
