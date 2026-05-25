const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEPTS = ['MAWAID', 'AVIT', 'SEHAT', 'FIRE SAFETY', 'FLOW MANAGEMENT', 'KARAMAT', 'SABEEL', 'TRANSPORT', 'SECURITY', 'NAZAFAT', 'TAZYEEN'];

async function seed() {
  console.log('Seeding database...');

  // 1. Create the Agency First
  const email = 'fardeen14122004@gmail';
  const rawPassword = 'fardeen';
  
  // Check if agency already exists
  let agency = await prisma.agency.findUnique({ where: { email } });
  
  if (!agency) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    
    agency = await prisma.agency.create({
      data: {
        agencyName: 'Fardeen Agency',
        contactPerson: 'Fardeen',
        email: email,
        phone: '1234567890',
        password: hashedPassword,
        gstNumber: 'GST123456789',
        address: '123 Seed Street',
        city: 'Seed City',
        state: 'Seed State',
      }
    });
    console.log('Created Agency:', email);
  } else {
    console.log('Agency already exists:', email);
  }

  const agencyId = agency.id;

  // 2. Create Workers attached to this Agency
  const workers = [];
  for (const dept of DEPTS) {
    for (let i = 0; i < 10; i++) {
      workers.push({
        name: dept + ' Worker ' + (i + 1),
        aadharNumber: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
        agencyId: agencyId,
        serviceId: 'srv_' + Math.floor(Math.random() * 10000),
        department: dept,
        role: dept + ' Staff',
        ratePerDay: 300 + Math.floor(Math.random() * 200)
      });
    }
  }

  // Clear existing workers for this agency if any to prevent duplicates on re-run
  await prisma.worker.deleteMany({ where: { agencyId } });

  await prisma.worker.createMany({ data: workers });
  console.log(`Created ${workers.length} workers for Agency ${agency.agencyName}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
