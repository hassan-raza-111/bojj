import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How does Bojj work?",
          answer: "Bojj connects customers with verified service providers. Customers post job requests with details about what they need done, and available vendors in their area submit bids. Customers can review bids, check vendor profiles and reviews, and select the best match for their needs."
        },
        {
          question: "Is Bojj free to use?",
          answer: "Yes! Bojj is completely free for customers to post jobs and receive bids. Vendors pay a small commission only when they successfully complete jobs through our platform."
        },
        {
          question: "How do I create an account?",
          answer: "You can sign up either as a customer or vendor by clicking the 'Sign Up' button at the top of the page. Follow the simple registration process, verify your email, and you're ready to go!"
        }
      ]
    },
    {
      category: "For Customers",
      questions: [
        {
          question: "How do I post a job?",
          answer: "Log in to your customer account, click on 'Post a Job' from your dashboard, fill in the job details form with information about your project, upload any relevant photos, set your budget (optional), and submit. Once submitted, local vendors will be notified and can send you quotes."
        },
        {
          question: "How do I choose the right vendor?",
          answer: "When evaluating bids, consider the vendor's rating, reviews from previous customers, experience level, response time, and price. You can also message vendors directly with specific questions before making your decision."
        },
        {
          question: "What if I'm not satisfied with the service?",
          answer: "Bojj takes quality seriously. If you're not satisfied with the service provided, please contact our support team immediately. We have a dispute resolution process and payment protection system to ensure you only pay for satisfactory work."
        }
      ]
    },
    {
      category: "For Vendors",
      questions: [
        {
          question: "How do I become a verified vendor?",
          answer: "To become a verified vendor, sign up for a vendor account, complete your profile, upload any required licenses or certifications, and verify your identity. Our team will review your application and verify your credentials, typically within 1-2 business days."
        },
        {
          question: "How do I find jobs?",
          answer: "Once your vendor account is verified, you'll receive notifications when new jobs matching your skills and location are posted. You can also browse available jobs through your vendor dashboard."
        },
        {
          question: "How and when do I get paid?",
          answer: "When a customer accepts your bid and you complete the job to their satisfaction, payment is processed through our secure payment system. Funds are typically released 3-5 business days after job completion, and you can withdraw to your linked bank account."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "How do I reset my password?",
          answer: "To reset your password, go to the login page and click on 'Forgot Password'. Enter your registered email address and follow the link sent to your inbox to set a new password."
        },
        {
          question: "Where can I find my invoice?",
          answer: "You can view and download all your invoices from the 'Billing' section of your dashboard. Simply log in, navigate to your profile, and click on 'Billing & Invoices'."
        },
        {
          question: "How to update my profile?",
          answer: "To update your profile, log in to your account, go to the 'Profile Settings' section from the menu, and edit your personal information, contact details, or preferences. Don't forget to click 'Save Changes'."
        }
      ]
    },
    {
      category: "Payments & Security",
      questions: [
        {
          question: "Is my payment secure?",
          answer: "Yes, all payments on Bojj are processed through our secure payment system. We use industry-standard encryption and secure payment processors to protect your financial information."
        },
        {
          question: "When am I charged?",
          answer: "As a customer, you're only charged when you approve a vendor's bid and the job is completed to your satisfaction. You can set up payment information when accepting a bid, but funds are only transferred upon job completion."
        },
        {
          question: "What payment methods are accepted?",
          answer: "Bojj accepts all major credit cards, debit cards, and payment services like PayPal. For larger jobs, bank transfers may also be available."
        }
      ]
    }
    
  ];
  
  const filteredFAQs = searchTerm
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(item =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-6 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      > */}
      <>
        <h1 className="text-4xl font-bold text-bojj-dark dark:text-white">FAQs - Your Questions, Answered</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          Find answers to commonly asked questions about using Bojj
        </p>
      </>
      {/* </motion.div> */}
      
      {/* Search */}
      <div className="mb-10">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-5 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-bojj-primary/50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400">
            🔍
          </button>
        </div>
      </div>
      
      {/* FAQ Sections */}
      <div className="space-y-10">
        {filteredFAQs.map((category, index) => (
          category.questions.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-bojj-dark dark:text-white">{category.category}</h2>
              <Accordion type="single" collapsible className="border rounded-lg overflow-hidden dark:border-gray-700">
                {category.questions.map((item, i) => (
                  <AccordionItem key={i} value={`item-${index}-${i}`}>
                    <AccordionTrigger className="px-6 hover:bg-gray-50 dark:hover:bg-gray-800 text-left text-gray-900 dark:text-white">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-700 dark:text-gray-300">
                      <p>{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )
        ))}
      </div>
      
      {/* Support CTA */}
 

{/* <motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.4 }}
  className="mt-16 text-center"
> */}
<>
  <h2 className="text-xl font-semibold mb-4 text-bojj-dark dark:text-white">
    Still have questions?
  </h2>
  
  <div className="flex justify-center gap-4 flex-wrap">
    {/* Primary Support Button */}
    <Link to="/contact">
  <Button
    className="bg-bojj-primary text-white px-6 py-3 rounded-md font-medium 
    transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg 
    hover:bg-bojj-primary/90"
  >
    Contact Support
  </Button>
</Link>

    {/* Outline Chat Button */}
    <Button
      variant="outline"
      className="flex items-center gap-2 px-6 py-3 rounded-md font-medium border border-gray-300 dark:border-gray-700 
                 text-bojj-dark dark:text-white 
                 hover:bg-gray-100 dark:hover:bg-gray-800 
                 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
    >
      <MessageSquare className="h-4 w-4" />
      Live Chat
    </Button>
  </div>
</>
{/* </motion.div> */}

    </div>
  );
};

export default FAQPage;
