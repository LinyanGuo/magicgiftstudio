const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	// quick DB connectivity check; exit gracefully if not reachable
	try {
		await prisma.$queryRaw`SELECT 1`;
	} catch (err) {
		console.log('prisma/seed.js: database not reachable or not configured. Skipping seeding.');
		return;
	}

	console.log('prisma/seed.js: connected — running seed (no changes by default).');

	// Add your seeding logic below. Example (adapt to your schema):
	// await prisma.user.upsert({
	//   where: { email: 'seed@example.com' },
	//   update: {},
	//   create: { email: 'seed@example.com', name: 'Seed User' },
	// });

	console.log('prisma/seed.js: finished.');
}

main()
	.catch((e) => {
		console.error('prisma/seed.js: error', e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});