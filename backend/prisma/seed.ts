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

  // Create sample customers
  console.log('👥 Creating sample customers...');
  const customer1Password = await bcrypt.hash('customer123', 12);
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@example.com',
      password: customer1Password,
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

  const customer2Password = await bcrypt.hash('customer123', 12);
  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      password: customer2Password,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+1234567891',
      bio: 'Business owner seeking vendors',
      location: 'Los Angeles, CA',
      customerProfile: {
        create: {
          preferredCategories: ['Marketing', 'Consulting'],
          budgetRange: '$500-$2000',
        },
      },
    },
  });

  console.log(`✅ Sample customers created: ${customer1.email}, ${customer2.email}`);

  // Create sample vendors
  console.log('🛠️ Creating sample vendors...');
  const vendor1Password = await bcrypt.hash('vendor123', 12);
  const vendor1 = await prisma.user.create({
    data: {
      email: 'vendor1@example.com',
      password: vendor1Password,
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

  const vendor2Password = await bcrypt.hash('vendor123', 12);
  const vendor2 = await prisma.user.create({
    data: {
      email: 'vendor2@example.com',
      password: vendor2Password,
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'VENDOR',
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+1234567893',
      bio: 'Creative designer specializing in branding',
      location: 'Chicago, IL',
      vendorProfile: {
        create: {
          companyName: 'Creative Design Studio',
          businessType: 'Design',
          experience: 3,
          skills: ['UI/UX Design', 'Branding', 'Illustration', 'Figma'],
          portfolio: ['https://design1.com', 'https://design2.com'],
          verified: true,
        },
      },
    },
  });

  console.log(`✅ Sample vendors created: ${vendor1.email}, ${vendor2.email}`);

  // Create sample services
  console.log('🛍️ Creating sample services...');
  const service1 = await prisma.service.create({
    data: {
      title: 'Full-Stack Web Development',
      description: 'Complete web application development using modern technologies',
      code: 'WEB-DEV-001',
      category: 'Web Development',
      subcategory: 'Full-Stack',
      tags: ['React', 'Node.js', 'MongoDB', 'AWS'],
      images: ['https://example.com/web-dev-1.jpg'],
      basePrice: 5000,
      priceType: 'FIXED',
      status: 'ACTIVE',
      vendorId: vendor1.id,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      title: 'Brand Identity Design',
      description: 'Complete brand identity including logo, colors, and guidelines',
      code: 'BRAND-001',
      category: 'Design',
      subcategory: 'Branding',
      tags: ['Logo Design', 'Brand Identity', 'Visual Design'],
      images: ['https://example.com/brand-1.jpg'],
      basePrice: 1500,
      priceType: 'FIXED',
      status: 'ACTIVE',
      vendorId: vendor2.id,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      title: 'UI/UX Design Consultation',
      description: 'Professional consultation for improving user experience',
      code: 'UX-CONSULT-001',
      category: 'Design',
      subcategory: 'UI/UX',
      tags: ['User Research', 'Wireframing', 'Prototyping'],
      images: ['https://example.com/ux-1.jpg'],
      basePrice: 150,
      priceType: 'HOURLY',
      status: 'ACTIVE',
      vendorId: vendor2.id,
    },
  });

  console.log(`✅ Sample services created: ${service1.title}, ${service2.title}, ${service3.title}`);

  // Create sample jobs
  console.log('💼 Creating sample jobs...');
  const job1 = await prisma.job.create({
    data: {
      title: 'E-commerce Website Development',
      description: 'Need a modern e-commerce website with payment integration',
      requirements: ['Responsive design', 'Payment gateway', 'Admin panel', 'SEO optimized'],
      category: 'Web Development',
      subcategory: 'E-commerce',
      tags: ['E-commerce', 'React', 'Payment Integration'],
      budget: 8000,
      budgetType: 'FIXED',
      location: 'Remote',
      isRemote: true,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'OPEN',
      priority: 'HIGH',
      customerId: customer1.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Company Logo and Branding',
      description: 'Looking for a professional logo design and brand guidelines',
      requirements: ['Modern logo design', 'Brand guidelines', 'Multiple formats', 'Color palette'],
      category: 'Design',
      subcategory: 'Branding',
      tags: ['Logo Design', 'Branding', 'Visual Identity'],
      budget: 2000,
      budgetType: 'FIXED',
      location: 'New York, NY',
      isRemote: false,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'OPEN',
      priority: 'MEDIUM',
      customerId: customer2.id,
    },
  });

  console.log(`✅ Sample jobs created: ${job1.title}, ${job2.title}`);

  // Create sample bids
  console.log('💰 Creating sample bids...');
  const bid1 = await prisma.bid.create({
    data: {
      amount: 7500,
      description: 'I can deliver this in 4 weeks with modern tech stack',
      timeline: '4 weeks',
      milestones: {
        week1: 'Design and planning',
        week2: 'Frontend development',
        week3: 'Backend development',
        week4: 'Testing and deployment'
      },
      status: 'PENDING',
      jobId: job1.id,
      vendorId: vendor1.id,
    },
  });

  const bid2 = await prisma.bid.create({
    data: {
      amount: 1800,
      description: 'Professional branding package with 3 logo concepts',
      timeline: '2 weeks',
      milestones: {
        week1: 'Research and concepts',
        week2: 'Refinement and delivery'
      },
      status: 'PENDING',
      jobId: job2.id,
      vendorId: vendor2.id,
    },
  });

  console.log(`✅ Sample bids created: ${bid1.amount}, ${bid2.amount}`);

  // Create sample reviews
  console.log('⭐ Creating sample reviews...');
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Excellent work! Very professional and delivered on time.',
      isPublic: true,
      reviewerId: customer1.id,
      serviceId: service1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Great design work, very creative and responsive.',
      isPublic: true,
      reviewerId: customer2.id,
      serviceId: service2.id,
    },
  });

  console.log('✅ Sample reviews created');

  // Create sample support ticket
  console.log('🎫 Creating sample support ticket...');
  await prisma.supportTicket.create({
    data: {
      title: 'Payment Issue',
      description: 'Having trouble with payment processing',
      category: 'BILLING',
      priority: 'MEDIUM',
      status: 'OPEN',
      userId: customer1.id,
    },
  });

  console.log('✅ Sample support ticket created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👑 Admin users: 1`);
  console.log(`   👥 Customer users: 2`);
  console.log(`   🛠️ Vendor users: 2`);
  console.log(`   🛍️ Services: 3`);
  console.log(`   💼 Jobs: 2`);
  console.log(`   💰 Bids: 2`);
  console.log(`   ⭐ Reviews: 2`);
  console.log(`   🎫 Support tickets: 1`);
  console.log('\n🔑 Default credentials:');
  console.log(`   Admin: admin@bojj.com / admin123`);
  console.log(`   Customer: customer1@example.com / customer123`);
  console.log(`   Vendor: vendor1@example.com / vendor123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
