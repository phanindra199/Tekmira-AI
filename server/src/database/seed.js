import { getPrismaClient, disconnectDatabase } from '../config/database.js';

/**
 * Tekmira AI — Safe Development Database Seed Script
 * Populates benchmark campus job roles and an initial demo student candidate
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
      // Upsert by title + company if needed or create
      const created = await prisma.jobDescription.create({
        data: job
      });
      createdJobs.push(created);
      console.log(`  ✓ Seeded Job: ${job.title} (${job.company})`);
    }

    // 2. Seed Demo Candidate User
    console.log('\n👤 Seeding demo candidate profile...');
    const demoUser = await prisma.user.upsert({
      where: { email: 'alex.morgan@tekmira.ai' },
      update: {},
      create: {
        email: 'alex.morgan@tekmira.ai',
        passwordHash: '$2b$10$demoHashedPasswordPlaceholderForDay6Bcrypt',
        fullName: 'Alex Morgan',
        githubHandle: 'alexmorgan-dev',
        collegeName: 'National Institute of Engineering',
        graduationYr: 2026,
        role: 'STUDENT'
      }
    });
    console.log(`  ✓ Seeded User: ${demoUser.fullName} (${demoUser.email})`);

    // 3. Seed Sample Saved Job and Job Application with Relational Links
    if (createdJobs.length > 0) {
      console.log('\n🔗 Seeding relational job application and bookmark...');
      const targetJob = createdJobs[0];

      await prisma.savedJob.upsert({
        where: {
          userId_jobId: {
            userId: demoUser.id,
            jobId: targetJob.id
          }
        },
        update: {},
        create: {
          userId: demoUser.id,
          jobId: targetJob.id
        }
      });
      console.log(`  ✓ Created SavedJob relationship: ${demoUser.fullName} -> ${targetJob.title}`);

      await prisma.jobApplication.create({
        data: {
          userId: demoUser.id,
          jobId: targetJob.id,
          status: 'APPLIED',
          matchScore: 84.5,
          notes: 'Triangulation verified: 7/8 skills backed by authentic GitHub repository commits.',
          appliedAt: new Date()
        }
      });
      console.log(`  ✓ Created JobApplication relationship with matchScore: 84.5%`);
    }

    console.log('\n✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error executing database seed:', error.message);
  } finally {
    await disconnectDatabase();
  }
}

// Allow direct CLI execution: node src/database/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}

export default seedDatabase;
