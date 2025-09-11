import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');

    // Check if tables exist
    console.log('🔍 Checking existing tables...');
    
    try {
      const userCount = await prisma.user.count();
      console.log('✅ Users table exists, count:', userCount);
    } catch (error) {
      console.log('❌ Users table missing');
    }

    try {
      const jobCount = await prisma.job.count();
      console.log('✅ Jobs table exists, count:', jobCount);
    } catch (error) {
      console.log('❌ Jobs table missing');
    }

    try {
      const paymentCount = await prisma.payment.count();
      console.log('✅ Payments table exists, count:', paymentCount);
    } catch (error) {
      console.log('❌ Payments table missing');
    }

    // Create sample data if tables exist
    console.log('🔍 Creating sample data...');
    
    // Create a sample vendor
    try {
      const vendor = await prisma.user.create({
        data: {
          email: 'vendor@example.com',
          password: 'hashedpassword123',
          firstName: 'John',
          lastName: 'Vendor',
          role: 'VENDOR',
          status: 'ACTIVE',
          vendorProfile: {
            create: {
              companyName: 'Tech Solutions Inc',
              businessType: 'Technology',
              experience: 5,
              skills: ['Web Development', 'Mobile Development'],
              verified: false
            }
          }
        }
      });
      console.log('✅ Sample vendor created:', vendor.id);
    } catch (error) {
      console.log('⚠️ Could not create sample vendor:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Create a sample customer
    try {
      const customer = await prisma.user.create({
        data: {
          email: 'customer@example.com',
          password: 'hashedpassword123',
          firstName: 'Jane',
          lastName: 'Customer',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          customerProfile: {
            create: {
              preferredCategories: ['Web Development', 'Design'],
              budgetRange: '$1000-$5000',
              totalJobsPosted: 0,
              totalSpent: 0
            }
          }
        }
      });
      console.log('✅ Sample customer created:', customer.id);
    } catch (error) {
      console.log('⚠️ Could not create sample customer:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Create a sample job
    try {
      const job = await prisma.job.create({
        data: {
          title: 'Website Development',
          description: 'Need a professional website for my business',
          category: 'Web Development',
          budget: 2500,
          budgetType: 'FIXED',
          status: 'OPEN',
          priority: 'MEDIUM',
          location: 'Remote',
          isRemote: true,
          customerId: (await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }))?.id || 'admin-user-id'
        }
      });
      console.log('✅ Sample job created:', job.id);
    } catch (error) {
      console.log('⚠️ Could not create sample job:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('✅ Database setup completed!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
