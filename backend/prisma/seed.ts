import {
  PrismaClient,
  Role,
  JobStatus,
  BidStatus,
  PaymentStatus,
  PaymentMethod,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  ServiceStatus,
} from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.review.deleteMany();
  await prisma.service.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      clerkId: 'clerk_admin_001',
      email: 'admin@bojj.com',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      bio: 'Platform administrator',
      phone: '+1234567890',
      location: 'New York, NY',
      rating: 5.0,
      totalReviews: 0,
      totalEarnings: 0,
    },
  });

  // Create Customer Users
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: 'clerk_customer_001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.CUSTOMER,
        bio: 'Small business owner looking for quality services',
        phone: '+1234567891',
        location: 'Los Angeles, CA',
        rating: 4.8,
        totalReviews: 5,
        totalEarnings: 0,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'clerk_customer_002',
        email: 'sarah.wilson@example.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        role: Role.CUSTOMER,
        bio: 'Startup founder in need of development services',
        phone: '+1234567892',
        location: 'San Francisco, CA',
        rating: 4.9,
        totalReviews: 3,
        totalEarnings: 0,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'clerk_customer_003',
        email: 'mike.chen@example.com',
        firstName: 'Mike',
        lastName: 'Chen',
        role: Role.CUSTOMER,
        bio: 'Restaurant owner seeking marketing help',
        phone: '+1234567893',
        location: 'Chicago, IL',
        rating: 4.7,
        totalReviews: 2,
        totalEarnings: 0,
      },
    }),
  ]);

  // Create Vendor Users
  const vendors = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: 'clerk_vendor_001',
        email: 'alex.dev@example.com',
        firstName: 'Alex',
        lastName: 'Johnson',
        role: Role.VENDOR,
        bio: 'Full-stack developer with 5+ years of experience',
        phone: '+1234567894',
        location: 'Austin, TX',
        portfolio: [
          'https://example.com/portfolio1.jpg',
          'https://example.com/portfolio2.jpg',
        ],
        experience: 5,
        rating: 4.9,
        totalReviews: 12,
        totalEarnings: 15000,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'clerk_vendor_002',
        email: 'emma.design@example.com',
        firstName: 'Emma',
        lastName: 'Davis',
        role: Role.VENDOR,
        bio: 'UI/UX designer specializing in mobile apps',
        phone: '+1234567895',
        location: 'Seattle, WA',
        portfolio: [
          'https://example.com/design1.jpg',
          'https://example.com/design2.jpg',
        ],
        experience: 3,
        rating: 4.8,
        totalReviews: 8,
        totalEarnings: 8500,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'clerk_vendor_003',
        email: 'david.marketing@example.com',
        firstName: 'David',
        lastName: 'Brown',
        role: Role.VENDOR,
        bio: 'Digital marketing expert with proven track record',
        phone: '+1234567896',
        location: 'Miami, FL',
        portfolio: [
          'https://example.com/marketing1.jpg',
          'https://example.com/marketing2.jpg',
        ],
        experience: 4,
        rating: 4.7,
        totalReviews: 15,
        totalEarnings: 12000,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'clerk_vendor_004',
        email: 'lisa.writer@example.com',
        firstName: 'Lisa',
        lastName: 'Garcia',
        role: Role.VENDOR,
        bio: 'Content writer and copywriter for businesses',
        phone: '+1234567897',
        location: 'Portland, OR',
        portfolio: [
          'https://example.com/writing1.jpg',
          'https://example.com/writing2.jpg',
        ],
        experience: 2,
        rating: 4.6,
        totalReviews: 6,
        totalEarnings: 5000,
      },
    }),
  ]);

  console.log('👥 Created users');

  // Create Services with proper parent-child relationships for categories
  // First, create parent services (categories)
  const webDevCategory = await prisma.service.create({
    data: {
      title: 'Web Development',
      code: 'WEB-DEV',
      description: 'Complete web application development services',
      tags: ['Web Development', 'Full-Stack', 'Frontend', 'Backend'],
      images: ['https://example.com/web-dev-category.jpg'],
      status: ServiceStatus.ACTIVE,
    },
  });

  const designCategory = await prisma.service.create({
    data: {
      title: 'Design',
      code: 'DESIGN',
      description: 'Professional design services for digital and print media',
      tags: ['Design', 'UI/UX', 'Graphic Design', 'Branding'],
      images: ['https://example.com/design-category.jpg'],
      status: ServiceStatus.ACTIVE,
    },
  });

  const marketingCategory = await prisma.service.create({
    data: {
      title: 'Marketing',
      code: 'MARKETING',
      description: 'Digital marketing and promotional services',
      tags: ['Marketing', 'SEO', 'Social Media', 'PPC'],
      images: ['https://example.com/marketing-category.jpg'],
      status: ServiceStatus.ACTIVE,
    },
  });

  const writingCategory = await prisma.service.create({
    data: {
      title: 'Writing',
      code: 'WRITING',
      description: 'Content writing and copywriting services',
      tags: ['Writing', 'Content', 'Copywriting', 'SEO'],
      images: ['https://example.com/writing-category.jpg'],
      status: ServiceStatus.ACTIVE,
    },
  });

  // Create child services (subcategories)
  const services = await Promise.all([
    // Web Development subcategories
    prisma.service.create({
      data: {
        title: 'Full-Stack Development',
        code: 'WEB-DEV-001',
        description:
          'Complete web application development using modern technologies like React, Node.js, and PostgreSQL.',
        tags: ['React', 'Node.js', 'PostgreSQL', 'Full-Stack'],
        images: [
          'https://example.com/web-dev1.jpg',
          'https://example.com/web-dev2.jpg',
        ],
        status: ServiceStatus.ACTIVE,
        parentId: webDevCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Frontend Development',
        code: 'WEB-DEV-002',
        description:
          'Modern frontend development with React, Vue, and Angular.',
        tags: ['React', 'Vue', 'Angular', 'TypeScript'],
        images: ['https://example.com/frontend1.jpg'],
        status: ServiceStatus.ACTIVE,
        parentId: webDevCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Backend Development',
        code: 'WEB-DEV-003',
        description:
          'Robust backend development with Node.js, Python, and databases.',
        tags: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB'],
        images: ['https://example.com/backend1.jpg'],
        status: ServiceStatus.ACTIVE,
        parentId: webDevCategory.id,
      },
    }),

    // Design subcategories
    prisma.service.create({
      data: {
        title: 'UI/UX Design',
        code: 'DESIGN-001',
        description:
          'Professional mobile app design with user experience focus and modern design principles.',
        tags: ['UI/UX', 'Mobile', 'Figma', 'Prototyping'],
        images: [
          'https://example.com/design1.jpg',
          'https://example.com/design2.jpg',
        ],
        status: ServiceStatus.ACTIVE,
        parentId: designCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Graphic Design',
        code: 'DESIGN-002',
        description:
          'Professional graphic design for logos, branding, and marketing materials.',
        tags: [
          'Graphic Design',
          'Logo Design',
          'Branding',
          'Adobe Creative Suite',
        ],
        images: ['https://example.com/graphic1.jpg'],
        status: ServiceStatus.ACTIVE,
        parentId: designCategory.id,
      },
    }),

    // Marketing subcategories
    prisma.service.create({
      data: {
        title: 'Digital Marketing',
        code: 'MARKETING-001',
        description:
          'Comprehensive digital marketing strategy including SEO, social media, and PPC campaigns.',
        tags: ['SEO', 'Social Media', 'PPC', 'Analytics'],
        images: [
          'https://example.com/marketing1.jpg',
          'https://example.com/marketing2.jpg',
        ],
        status: ServiceStatus.ACTIVE,
        parentId: marketingCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'SEO Services',
        code: 'MARKETING-002',
        description:
          "Search engine optimization to improve your website's visibility.",
        tags: ['SEO', 'Keyword Research', 'On-Page SEO', 'Technical SEO'],
        images: ['https://example.com/seo1.jpg'],
        status: ServiceStatus.ACTIVE,
        parentId: marketingCategory.id,
      },
    }),

    // Writing subcategories
    prisma.service.create({
      data: {
        title: 'Content Writing',
        code: 'WRITING-001',
        description:
          'Professional content writing for websites, blogs, and marketing materials.',
        tags: ['Content Writing', 'Copywriting', 'SEO', 'Blog Posts'],
        images: [
          'https://example.com/writing1.jpg',
          'https://example.com/writing2.jpg',
        ],
        status: ServiceStatus.ACTIVE,
        parentId: writingCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Technical Writing',
        code: 'WRITING-002',
        description:
          'Technical documentation and user guides for software and products.',
        tags: ['Technical Writing', 'Documentation', 'User Guides', 'API Docs'],
        images: ['https://example.com/technical1.jpg'],
        status: ServiceStatus.ACTIVE,
        parentId: writingCategory.id,
      },
    }),
  ]);

  console.log('🛠️  Created services with proper hierarchy');

  // Create Jobs with categories that match the service titles
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'E-commerce Website Development',
        description:
          'Need a complete e-commerce website with payment integration, inventory management, and admin dashboard.',
        budget: 5000,
        location: 'Los Angeles, CA',
        images: ['https://example.com/job1.jpg'],
        category: 'Web Development', // Matches parent service title
        subcategory: 'Full-Stack Development', // Matches child service title
        tags: ['E-commerce', 'Payment Integration', 'Admin Dashboard'],
        status: JobStatus.OPEN,
        customerId: customers[0].id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Mobile App Design for Food Delivery',
        description:
          'Looking for a modern, user-friendly design for a food delivery mobile application.',
        budget: 2000,
        location: 'San Francisco, CA',
        images: ['https://example.com/job2.jpg'],
        category: 'Design', // Matches parent service title
        subcategory: 'UI/UX Design', // Matches child service title
        tags: ['Mobile App', 'Food Delivery', 'UI/UX'],
        status: JobStatus.IN_PROGRESS,
        customerId: customers[1].id,
        vendorId: vendors[1].id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Restaurant Marketing Campaign',
        description:
          'Need a comprehensive marketing campaign to increase foot traffic and online orders.',
        budget: 1500,
        location: 'Chicago, IL',
        images: ['https://example.com/job3.jpg'],
        category: 'Marketing', // Matches parent service title
        subcategory: 'Digital Marketing', // Matches child service title
        tags: ['Restaurant', 'Local Marketing', 'Social Media'],
        status: JobStatus.COMPLETED,
        customerId: customers[2].id,
        vendorId: vendors[2].id,
        completedAt: new Date(),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Blog Content Creation',
        description:
          'Need regular blog content for a tech startup website. 10 articles per month.',
        budget: 800,
        location: 'Remote',
        images: [],
        category: 'Writing', // Matches parent service title
        subcategory: 'Content Writing', // Matches child service title
        tags: ['Blog Writing', 'Tech', 'SEO'],
        status: JobStatus.OPEN,
        customerId: customers[0].id,
      },
    }),
  ]);

  console.log('💼 Created jobs');

  // Create Bids
  const bids = await Promise.all([
    prisma.bid.create({
      data: {
        amount: 4800,
        message:
          'I can deliver a high-quality e-commerce website within 4 weeks. I have extensive experience with payment gateways and inventory systems.',
        estimatedDays: 28,
        jobId: jobs[0].id,
        vendorId: vendors[0].id,
        status: BidStatus.PENDING,
      },
    }),
    prisma.bid.create({
      data: {
        amount: 5200,
        message:
          'I specialize in e-commerce development and can provide additional features like advanced analytics and mobile optimization.',
        estimatedDays: 30,
        jobId: jobs[0].id,
        vendorId: vendors[0].id,
        status: BidStatus.PENDING,
      },
    }),
    prisma.bid.create({
      data: {
        amount: 1800,
        message:
          'I can create engaging blog content that ranks well on search engines and drives traffic to your website.',
        estimatedDays: 14,
        jobId: jobs[3].id,
        vendorId: vendors[3].id,
        status: BidStatus.PENDING,
      },
    }),
  ]);

  console.log('💰 Created bids');

  // Create Payments
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        amount: 2000,
        status: PaymentStatus.IN_ESCROW,
        paymentMethod: PaymentMethod.STRIPE,
        transactionId: 'txn_123456789',
        jobId: jobs[1].id,
        customerId: customers[1].id,
        vendorId: vendors[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 1500,
        status: PaymentStatus.RELEASED,
        paymentMethod: PaymentMethod.PAYPAL,
        transactionId: 'txn_987654321',
        jobId: jobs[2].id,
        customerId: customers[2].id,
        vendorId: vendors[2].id,
        releasedAt: new Date(),
      },
    }),
  ]);

  console.log('💳 Created payments');

  // Create Tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Payment Issue - Transaction Failed',
        description:
          'I tried to make a payment but the transaction failed. Can you help me resolve this?',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        category: TicketCategory.BILLING,
        userId: customers[0].id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Feature Request - Mobile App',
        description:
          'Would it be possible to add push notifications to the mobile app?',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.FEEDBACK,
        userId: customers[1].id,
        adminResponse:
          "Thank you for the suggestion! We're working on implementing push notifications in the next update.",
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Account Verification Issue',
        description:
          "I'm having trouble verifying my vendor account. The verification email never arrived.",
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.TECHNICAL,
        userId: vendors[0].id,
        adminResponse:
          "We've resent the verification email. Please check your spam folder as well.",
        resolvedAt: new Date(),
      },
    }),
  ]);

  console.log('🎫 Created tickets');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Seed Data Summary:');
  console.log(
    `- Users: ${1 + customers.length + vendors.length} (1 Admin, ${customers.length} Customers, ${vendors.length} Vendors)`
  );
  console.log(
    `- Services: ${4 + services.length} (4 Categories, ${services.length} Subcategories)`
  );
  console.log(`- Jobs: ${jobs.length}`);
  console.log(`- Bids: ${bids.length}`);
  console.log(`- Payments: ${payments.length}`);
  console.log(`- Tickets: ${tickets.length}`);

  console.log('\n🔑 Test Credentials:');
  console.log('Admin: admin@bojj.com');
  console.log('Customer: john.doe@example.com');
  console.log('Vendor: alex.dev@example.com');

  console.log('\n📋 Categories Available:');
  console.log('- Web Development (Full-Stack, Frontend, Backend)');
  console.log('- Design (UI/UX, Graphic Design)');
  console.log('- Marketing (Digital Marketing, SEO)');
  console.log('- Writing (Content Writing, Technical Writing)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
