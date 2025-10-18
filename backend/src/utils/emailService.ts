import nodemailer from 'nodemailer';
import { logger } from './logger';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Verify connection
transporter.verify((error: Error | null) => {
  if (error) {
    logger.error('Email service configuration error:', error);
  } else {
    logger.info('Email service is ready');
  }
});

// Email templates
export const emailTemplates = {
  newBid: (
    recipientName: string,
    jobTitle: string,
    bidAmount: number,
    vendorName: string
  ) => ({
    subject: `New Bid Received for "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #FF0000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #FF0000; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Bid Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Great news! You've received a new bid on your job posting.</p>
            
            <div class="highlight">
              <p><strong>Job:</strong> ${jobTitle}</p>
              <p><strong>Bid Amount:</strong> $${bidAmount}</p>
              <p><strong>Vendor:</strong> ${vendorName}</p>
            </div>
            
            <p>Log in to your dashboard to review the bid details and vendor profile.</p>
            
            <a href="${process.env.FRONTEND_URL}/customer/bids" class="button">View Bid</a>
            
            <p>Don't wait too long – great vendors get booked quickly!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  bidAccepted: (
    recipientName: string,
    jobTitle: string,
    customerName: string
  ) => ({
    subject: `🎉 Your Bid Was Accepted for "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .success-box { background: #D1FAE5; border-left: 4px solid #10B981; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your bid has been accepted</p>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            
            <div class="success-box">
              <p><strong>Excellent news!</strong></p>
              <p><strong>${customerName}</strong> has accepted your bid for <strong>"${jobTitle}"</strong></p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the job requirements carefully</li>
              <li>Contact the customer to discuss details</li>
              <li>Start working on the project</li>
              <li>Update progress regularly</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="button">Go to Dashboard</a>
            
            <p>Good luck with the project!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newMessage: (
    recipientName: string,
    senderName: string,
    jobTitle: string
  ) => ({
    subject: `💬 New Message from ${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>You have a new message from <strong>${senderName}</strong> regarding the job <strong>"${jobTitle}"</strong>.</p>
            
            <a href="${process.env.FRONTEND_URL}/chat" class="button">View Message</a>
            
            <p>Respond quickly to keep the conversation going!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  jobCompleted: (
    recipientName: string,
    jobTitle: string,
    vendorName: string
  ) => ({
    subject: `✅ Job Completed: "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Job Completed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p><strong>${vendorName}</strong> has marked your job <strong>"${jobTitle}"</strong> as completed.</p>
            
            <p>Please review the work and leave feedback to help other customers!</p>
            
            <a href="${process.env.FRONTEND_URL}/customer/jobs" class="button">Review & Rate</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentReleased: (
    recipientName: string,
    amount: number,
    jobTitle: string
  ) => ({
    subject: `💰 Payment Released: $${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 36px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payment Released!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Great news! Your payment has been released.</p>
            
            <div class="amount">$${amount}</div>
            
            <p><strong>Job:</strong> ${jobTitle}</p>
            
            <p>The funds will be transferred to your account within 2-3 business days.</p>
            
            <a href="${process.env.FRONTEND_URL}/vendor/earnings" class="button">View Earnings</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  accountVerified: (recipientName: string) => ({
    subject: '✅ Your VenBid Account is Verified!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #FF0000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .checkmark { font-size: 64px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Verified!</h1>
          </div>
          <div class="content">
            <div class="checkmark">✅</div>
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Congratulations! Your VenBid account has been successfully verified.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Access all platform features</li>
              <li>Bid on jobs with confidence</li>
              <li>Build your professional reputation</li>
              <li>Earn money by completing projects</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newJobPosted: (
    recipientName: string,
    jobTitle: string,
    customerName: string,
    budget: number,
    location: string,
    category: string
  ) => ({
    subject: `🎯 New Job Available: "${jobTitle}" - $${budget}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #FF0000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .job-card { background: #fff; padding: 20px; border-left: 4px solid #FF0000; margin: 15px 0; border-radius: 5px; }
          .budget { font-size: 24px; font-weight: bold; color: #FF0000; }
          .category { background: #FF0000; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Job Available!</h1>
            <p>Don't miss this opportunity</p>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>A new job has been posted that might interest you!</p>
            
            <div class="job-card">
              <h3>${jobTitle}</h3>
              <p><strong>Posted by:</strong> ${customerName}</p>
              <p><strong>Budget:</strong> <span class="budget">$${budget}</span></p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Category:</strong> <span class="category">${category}</span></p>
            </div>
            
            <p><strong>Why bid on this job?</strong></p>
            <ul>
              <li>Great earning potential</li>
              <li>Build your reputation</li>
              <li>Expand your client base</li>
              <li>Work on interesting projects</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/vendor/jobs" class="button">View & Bid Now</a>
            
            <p><strong>Pro tip:</strong> Early bids often get more attention from customers!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Counter-Offer Email Templates
  counterOfferReceived: (
    recipientName: string,
    jobTitle: string,
    originalAmount: number,
    counterAmount: number,
    counterPartyName: string
  ) => ({
    subject: `💰 Counter-Offer Received for "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .offer-card { background: #fff; padding: 20px; border-left: 4px solid #10B981; margin: 15px 0; border-radius: 5px; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; }
          .original { text-decoration: line-through; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Counter-Offer Received!</h1>
            <p>Someone wants to negotiate</p>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p><strong>${counterPartyName}</strong> has made a counter-offer for your job!</p>
            
            <div class="offer-card">
              <h3>${jobTitle}</h3>
              <p><strong>Original Amount:</strong> <span class="original">$${originalAmount}</span></p>
              <p><strong>Counter-Offer:</strong> <span class="amount">$${counterAmount}</span></p>
              <p><strong>Difference:</strong> $${counterAmount - originalAmount}</p>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Review the counter-offer carefully</li>
              <li>Consider if the new amount works for you</li>
              <li>Accept, reject, or make another counter-offer</li>
              <li>Remember: negotiation is part of the process!</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/vendor/jobs" class="button">Review Counter-Offer</a>
            
            <p><strong>Pro tip:</strong> Quick responses show professionalism and help close deals faster!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  counterOfferAccepted: (
    recipientName: string,
    jobTitle: string,
    agreedAmount: number,
    otherPartyName: string
  ) => ({
    subject: `🎉 Counter-Offer Accepted for "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .success-card { background: #fff; padding: 20px; border-left: 4px solid #8B5CF6; margin: 15px 0; border-radius: 5px; }
          .amount { font-size: 24px; font-weight: bold; color: #8B5CF6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Counter-Offer Accepted!</h1>
            <p>Deal closed successfully</p>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p><strong>Great news!</strong> Your counter-offer has been accepted!</p>
            
            <div class="success-card">
              <h3>${jobTitle}</h3>
              <p><strong>Agreed Amount:</strong> <span class="amount">$${agreedAmount}</span></p>
              <p><strong>Accepted by:</strong> ${otherPartyName}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Start working on the project</li>
              <li>Communicate regularly with the client</li>
              <li>Update progress in the dashboard</li>
              <li>Deliver quality work on time</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="button">Go to Dashboard</a>
            
            <p>Congratulations on closing the deal! 🎉</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  negotiationLimitReached: (recipientName: string, jobTitle: string) => ({
    subject: `⚠️ Negotiation Limit Reached for "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning-card { background: #fff; padding: 20px; border-left: 4px solid #F59E0B; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Negotiation Limit Reached</h1>
            <p>Time to make a decision</p>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>The maximum number of negotiation rounds has been reached for this job.</p>
            
            <div class="warning-card">
              <h3>${jobTitle}</h3>
              <p><strong>Status:</strong> Negotiation limit reached</p>
              <p><strong>Action Required:</strong> Accept or reject the current offer</p>
            </div>
            
            <p><strong>What you need to do:</strong></p>
            <ul>
              <li>Review the current offer carefully</li>
              <li>Make your final decision</li>
              <li>Accept or reject the offer</li>
              <li>No more counter-offers are allowed</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/vendor/jobs" class="button">Review & Decide</a>
            
            <p><strong>Important:</strong> Please respond promptly to avoid any delays.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  jobDisputed: (
    recipientName: string,
    jobTitle: string,
    disputeReason: string
  ) => ({
    subject: `⚠️ Job Disputed: "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .dispute-card { background: #fff; padding: 20px; border-left: 4px solid #EF4444; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Job Disputed</h1>
            <p>Action required</p>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>A dispute has been raised for one of your jobs.</p>
            
            <div class="dispute-card">
              <h3>${jobTitle}</h3>
              <p><strong>Dispute Reason:</strong> ${disputeReason}</p>
              <p><strong>Status:</strong> Under review</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review the dispute</li>
              <li>You may be contacted for additional information</li>
              <li>We'll work to resolve this fairly</li>
              <li>Keep all communication professional</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/support" class="button">View Dispute Details</a>
            
            <p><strong>Important:</strong> Please respond to any requests from our support team promptly.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  accountSuspended: (
    recipientName: string,
    reason: string,
    suspensionDuration?: string
  ) => ({
    subject: `🚫 Account Suspended - Action Required`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #6B7280; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .suspension-card { background: #fff; padding: 20px; border-left: 4px solid #6B7280; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚫 Account Suspended</h1>
            <p>Important notice</p>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Your account has been temporarily suspended.</p>
            
            <div class="suspension-card">
              <p><strong>Reason:</strong> ${reason}</p>
              ${suspensionDuration ? `<p><strong>Duration:</strong> ${suspensionDuration}</p>` : ''}
              <p><strong>Status:</strong> Under review</p>
            </div>
            
            <p><strong>What this means:</strong></p>
            <ul>
              <li>You cannot access your account temporarily</li>
              <li>All active jobs are on hold</li>
              <li>We're reviewing the situation</li>
              <li>You'll be notified of any updates</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/support" class="button">Contact Support</a>
            
            <p><strong>Need help?</strong> Contact our support team if you have questions about this suspension.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VenBid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
export const sendEmail = async (
  to: string,
  template: { subject: string; html: string }
) => {
  try {
    const info = await transporter.sendMail({
      from: `"VenBid" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Send multiple emails
export const sendBulkEmails = async (
  recipients: string[],
  template: { subject: string; html: string }
) => {
  const results = await Promise.allSettled(
    recipients.map((email) => sendEmail(email, template))
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  logger.info(`Bulk email sent: ${successful} successful, ${failed} failed`);
  return { successful, failed };
};
