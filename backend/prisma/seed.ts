import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');

  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.job.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared successfully');

  // Create default admin user
  console.log('👑 Creating default admin user...');

  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bojj.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      bio: 'Platform administrator with full system access',
      phone: '+1234567890',
      location: 'System',
      rating: 5.0,
      totalReviews: 0,
      totalEarnings: 0,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Default admin user created successfully!');
  console.log('\n📋 Database Summary:');
  console.log(`👥 Users: 1 (1 Admin)`);
  console.log(`🛠️  Services: 0`);
  console.log(`💼 Jobs: 0`);
  console.log(`💰 Bids: 0`);
  console.log(`⭐ Reviews: 0`);
  console.log(`🎫 Support Tickets: 0`);
  console.log('\n🔑 Default Admin Credentials:');
  console.log('Email: admin@bojj.com');
  console.log('Password: admin123');
  console.log('\n🚀 You can now:');
  console.log('1. Login as admin: POST /api/auth/login');
  console.log('2. Create other users through admin panel');
  console.log('3. Start building your marketplace!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
