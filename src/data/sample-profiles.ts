/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleProfile {
  id: string;
  name: string;
  tagline: string;
  candidateName: string;
  targetRole: string;
  targetCompany: string;
  resumeText: string;
  jobDescriptionText: string;
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: 'sde1-mern',
    name: 'SDE-1 (Frontend / MERN)',
    tagline: 'Tier-2 B.Tech CSE Grad aiming for FinTech Startup (Bengaluru)',
    candidateName: 'Aarav Sharma',
    targetRole: 'SDE-1 (Frontend / React)',
    targetCompany: 'RazorPay / Swiggy Scaleup (Bengaluru)',
    resumeText: `AARAV SHARMA
Bengaluru, Karnataka | aarav.sharma@email.com | +91 98765 43210
LinkedIn: linkedin.com/in/aarav-sharma-dev | GitHub: github.com/aaravsharma

EDUCATION
B.Tech in Computer Science and Engineering
R.V. Institute of Technology, Bengaluru (Batch 2021 - 2025)
CGPA: 8.52 / 10.0 (First Class with Distinction)

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript, C++, Python (Basic)
Frontend: React.js (v18), Next.js, Redux Toolkit, Tailwind CSS, HTML5, CSS3
Backend & DB: Node.js, Express.js, MongoDB, RESTful APIs
Tools & Platforms: Git, GitHub, Postman, Vite, Vercel, VS Code

EXPERIENCE / INTERNSHIPS
Frontend Developer Intern | QuickByte Technologies, Bengaluru (Jan 2024 - June 2024)
- Developed responsive merchant dashboard modules using React 18 and Tailwind CSS.
- Integrated 14 REST API endpoints with Redux Toolkit for real-time order tracking.
- Optimized bundle size by 24% using dynamic imports and code splitting in Vite.

PROJECTS
1. CampusPlacement Portal (Full-Stack MERN)
- Built role-based placement management platform for 1,400+ college students and 45 recruiters.
- Implemented JWT authentication, resume PDF uploads with Multer, and email alerts via Nodemailer.
- Live URL: campus-placed.vercel.app | Stack: React, Node.js, Express, MongoDB, Tailwind

2. Algorithmic Trading Simulator
- Created web app visualizing real-time simulated stock price feeds and technical indicators.
- Built interactive candlestick charts using Chart.js with responsive controls.

CODING PROFILES & ACHIEVEMENTS
- LeetCode: Solved 420+ Data Structures & Algorithms problems (Knight badge, max rating 1840).
- GeeksforGeeks: Institute Rank 4 in Campus Coding Contest (Solved 180+ problems).
- Hackathon: Finalist at Bengaluru InnoHacks 2023 out of 160 college teams.`,
    jobDescriptionText: `Role: Software Development Engineer 1 (Frontend)
Location: Bengaluru (Hybrid)
Experience: 0 - 2 years (Freshers with strong project portfolio welcome)

About the Role:
We are looking for an ambitious SDE-1 (Frontend) to build customer-facing web applications that process millions of daily transactions.

Key Responsibilities:
- Build modular, scalable user interfaces using modern React.js and TypeScript.
- Collaborate with backend engineers to integrate REST and GraphQL APIs.
- Write unit tests using Jest / React Testing Library to maintain 85%+ coverage.
- Monitor web vitals, rendering bottlenecks, and optimize client-side bundle performance.
- Participate in code reviews and agile sprint rituals.

Requirements & Qualifications:
- B.Tech/B.E. in Computer Science, IT, or related technical discipline.
- Strong proficiency in modern JavaScript (ES6+), TypeScript, React.js, and CSS/Tailwind.
- Proven understanding of state management (Redux, Zustand, or Context API).
- Experience with Git version control, HTTP networking, and REST APIs.
- Familiarity with Jest / React Testing Library for automated testing.
- Strong problem-solving ability in Data Structures and Algorithms.
- Prior internship experience or high-quality full-stack personal projects is a strong plus.`,
  },
  {
    id: 'data-analyst',
    name: 'Associate Data Analyst',
    tagline: 'B.Sc / BCA fresher targeting E-commerce & Analytics (Hyderabad)',
    candidateName: 'Priya Venkatesh',
    targetRole: 'Junior / Associate Data Analyst',
    targetCompany: 'Flipkart / Zepto Analytics (Hyderabad)',
    resumeText: `PRIYA VENKATESH
Hyderabad, Telangana | priya.v@email.com | +91 91234 56789
LinkedIn: linkedin.com/in/priyavenkatesh-data | Portfolio: priyadata.github.io

EDUCATION
Bachelor of Science in Statistics and Computer Applications
St. Francis College, Hyderabad (Graduated 2024)
Marks: 81.4% (Distinction)

TECHNICAL SKILLS
Data Analytics: Python (Pandas, NumPy, Matplotlib, Seaborn), SQL (PostgreSQL, MySQL), Excel (VLOOKUP, Pivot Tables)
BI Tools: Tableau Desktop, Microsoft Power BI
Database & Concepts: Relational schema design, Window functions, Aggregations, Exploratory Data Analysis (EDA)
Workflow: Jupyter Notebook, Git, Google Colab

PROJECTS
1. E-Commerce Customer Churn & Retention Analysis
- Analyzed transaction dataset of 50,000 Indian retail orders to identify factors leading to cart abandonment.
- Wrote complex SQL queries utilizing window functions (ROW_NUMBER, DENSE_RANK) to segment repeat vs single-time buyers.
- Created interactive Power BI dashboard tracking monthly churn rate and cohort analysis.

2. Indian FMCG Sales Performance Dashboard
- Cleaned and normalized messy regional sales data across 4 metro regions using Python Pandas.
- Visualized gross margins and inventory turnaround using Tableau dashboards.

CERTIFICATIONS
- Google Data Analytics Professional Certificate (Coursera - 2024)
- Advanced SQL for Data Science (HackerRank 5-Star SQL Badge)

CO-CURRICULAR
- Head of Statistics Club: Organized inter-collegiate data visualization contest with 200+ participants.`,
    jobDescriptionText: `Position: Associate Data Analyst
Department: Growth & Marketplace Analytics
Location: Hyderabad, India

Job Summary:
Join our analytics team to translate raw user clickstream and transaction data into actionable business recommendations for Category Managers.

Requirements:
- Bachelor's degree in Statistics, Mathematics, Computer Science, Economics, or related fields.
- 0 to 1 year of experience; open to fresh graduates with strong quantitative fundamentals.
- Strong proficiency in SQL: joins, window functions, CTEs, and query optimization.
- Proficiency in Python or R for exploratory data analysis (Pandas, NumPy).
- Hands-on experience building interactive dashboards in Tableau or Power BI.
- Basic understanding of A/B testing methodologies and statistical hypothesis testing.
- Clear communication skills to explain numbers to business stakeholders.`,
  },
  {
    id: 'java-ase',
    name: 'Associate Software Engineer (Java / IT MNC)',
    tagline: 'B.Tech fresher preparing for TCS Digital / Cognizant GenC / Infosys DSE',
    candidateName: 'Rohan Mukherjee',
    targetRole: 'Associate Software Engineer (ASE)',
    targetCompany: 'TCS Digital / Infosys / Cognizant (Pune)',
    resumeText: `ROHAN MUKHERJEE
Kolkata, West Bengal | rohan.mukherjee@email.com | +91 97480 12345
LinkedIn: linkedin.com/in/rohan-mukherjee-dev

CAREER OBJECTIVE
Enthusiastic Computer Science graduate seeking an Associate Software Engineer role to leverage solid object-oriented programming, Spring Boot, and relational database skills to develop reliable enterprise software.

EDUCATION
B.Tech in Computer Science and Engineering
Heritage Institute of Technology, Kolkata (Batch 2021 - 2025)
CGPA: 8.15 / 10.0

TECHNICAL SKILLS
Programming Languages: Java (Core Java 17, Collections, Streams API), C, SQL
Backend Frameworks: Spring Boot 3, Spring Data JPA, Hibernate, REST APIs
Databases: MySQL, PostgreSQL
Concepts: Object-Oriented Programming (OOPs), Data Structures, Computer Networks, Operating Systems, DBMS
Tools: IntelliJ IDEA, Git, Maven, Postman

ACADEMIC PROJECTS
1. Hospital OPD Appointment Booking System (Java Spring Boot)
- Engineered backend service for managing doctor slots and patient appointments using Spring Boot 3.
- Designed relational database schema in MySQL with JPA/Hibernate entity mappings.
- Secured patient and doctor endpoints using Spring Security and JWT token authentication.

2. Student Attendance and Internal Marks Tracking System
- Developed Java console application using JDBC and MySQL for faculty marks submission.
- Implemented multithreading for batch generation of student report cards.

ACHIEVEMENTS & CERTIFICATIONS
- NPTEL Elite Certification in "Programming in Java" (Score: 84%).
- Solved 280+ problems on LeetCode and GeeksforGeeks in Java.
- Technical coordinator for college annual tech fest 'Daksh 2024'.`,
    jobDescriptionText: `Company: Global IT Consulting & Services
Role: Associate Software Engineer (Digital Stream)
Location: Pune / Chennai / Bengaluru
Eligibility: B.E. / B.Tech / MCA (2025 Batch) with 60%+ throughout 10th, 12th, and Graduation

Job Description:
We are hiring entry-level engineers for our Enterprise Digital Engineering practice. Selected candidates will undergo foundational training and work on cloud-native applications.

Candidate Profile:
- Strong foundation in Core Java (OOPs, Collections, Exception Handling, Multi-threading).
- Exposure to Spring / Spring Boot framework and microservices fundamentals.
- Good knowledge of SQL databases (queries, joins, normalization).
- Knowledge of Software Engineering lifecycle and Agile practices.
- Excellent logical reasoning and analytical skills.
- Willingness to relocate to any of our development centers across India.`,
  },
];
