import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.job.deleteMany();
  await prisma.service.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
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
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      bio: 'System Administrator',
      location: 'System',
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create sample customer
  console.log('👥 Creating sample customer...');
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+1234567890',
      bio: 'Looking for quality services',
      location: 'New York, NY',
      customerProfile: {
        create: {
          preferredCategories: ['Web Development', 'Design'],
          budgetRange: '$1000-$5000',
        },
      },
    },
  });

  console.log(`✅ Sample customer created: ${customer.email}`);

  // Create sample vendor
  console.log('🛠️ Creating sample vendor...');
  const vendorPassword = await bcrypt.hash('vendor123', 12);
  const vendor = await prisma.user.create({
    data: {
      email: 'vendor@example.com',
      password: vendorPassword,
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'VENDOR',
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+1234567892',
      bio: 'Full-stack developer with 5+ years experience',
      location: 'San Francisco, CA',
      vendorProfile: {
        create: {
          companyName: 'Tech Solutions Pro',
          businessType: 'Technology',
          experience: 5,
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          portfolio: ['https://portfolio1.com', 'https://portfolio2.com'],
          verified: true,
        },
      },
    },
  });

  console.log(`✅ Sample vendor created: ${vendor.email}`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👑 Admin users: 1`);
  console.log(`   👥 Customer users: 1`);
  console.log(`   🛠️ Vendor users: 1`);
  console.log('\n🔑 Default credentials:');
  console.log(`   Admin: admin@bojj.com / admin123`);
  console.log(`   Customer: customer@example.com / customer123`);
  console.log(`   Vendor: vendor@example.com / vendor123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
