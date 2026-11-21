import { getPrismaClient, disconnectDatabase } from '../config/database.js';

/**
 * Tekmira AI — Safe Development Database Seed Script
 * Idempotently populates benchmark campus job roles. Students create their own accounts in the app.
 */
export async function seedDatabase() {
  console.log('🌱 Starting Tekmira AI database seed...');
  const prisma = getPrismaClient();

  try {
    // 1. Seed Benchmark Campus Job Roles
    const jobs = [
      {
        title: 'Junior Full-Stack Engineer (Campus 2026)',
        company: 'CloudScale Technologies',
        location: 'Bangalore, India (Hybrid)',
        jobType: 'Full-Time',
        minExperience: 0,
        requiredSkills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Git', 'REST APIs'],
        rawText: `We are looking for an ambitious 2026 Graduate Junior Full-Stack Engineer.
Requirements:
- Hands-on experience building web applications with React and Node.js/Express.
- Solid understanding of relational database modeling and SQL (PostgreSQL preferred).
- Demonstrable GitHub repositories showing clean Git commit hygiene and meaningful code architecture.
- Familiarity with RESTful API design, authentication concepts (JWT), and modern JavaScript (ES6+).`
      },
      {
        title: 'Backend Systems Engineer (Internship)',
        company: 'Nexus Distributed Labs',
        location: 'Remote',
        jobType: 'Internship',
        minExperience: 0,
        requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis', 'Jest', 'Git'],
        rawText: `Backend engineering internship focusing on scalable API services and data pipelines.
Requirements:
- Strong core backend fundamentals: Event Loop, asynchronous I/O, and RESTful conventions.
- Experience with relational schema design, indexing, and SQL JOIN optimization.
- Experience writing automated tests (Jest/Supertest).
- Basic understanding of containerization with Docker.`
      },
      {
        title: 'Frontend UI/UX Engineer',
        company: 'Veloce Digital Systems',
        location: 'Hyderabad, India (On-site)',
        jobType: 'Full-Time',
        minExperience: 0,
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'State Management', 'Web Accessibility'],
        rawText: `Join our design systems and web application development team.
Requirements:
- Deep expertise in React functional components, hooks, and responsive design systems.
- Proficient in Tailwind CSS, modern responsive layouts, and cross-browser consistency.
- Knowledge of client-side routing, Web Vitals, and performance optimization.`
      }
    ];

    console.log(`📋 Seeding ${jobs.length} benchmark job descriptions...`);
    const createdJobs = [];
    for (const job of jobs) {
      // The schema has no composite unique key for title/company, so look up the
      // natural key and update an existing benchmark instead of duplicating it.
      const existing = await prisma.jobDescription.findFirst({
        where: { title: job.title, company: job.company },
        select: { id: true }
      });
      const created = existing
        ? await prisma.jobDescription.update({ where: { id: existing.id }, data: job })
        : await prisma.jobDescription.create({ data: job });
      createdJobs.push(created);
      console.log(`  ✓ Seeded Job: ${job.title} (${job.company})`);
    }
    console.log(`\n✅ Database seed completed: ${createdJobs.length} benchmark roles ready.`);
  } catch (error) {
    console.error('❌ Error executing database seed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

// Allow direct CLI execution: node src/database/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}

export default seedDatabase;
