const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const r = await p.user.create({
      data: {
        id: 'test-' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        name: 'Test User',
        image: ''
      }
    });
    console.log('created', JSON.stringify(r));
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
})();
