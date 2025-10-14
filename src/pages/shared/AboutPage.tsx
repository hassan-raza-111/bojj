// import { motion } from "framer-motion";
import { Check } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    {
      value: '50K+',
      label: 'Active Users',
    },
    {
      value: '10K+',
      label: 'Verified Vendors',
    },
    {
      value: '100K+',
      label: 'Jobs Completed',
    },
    {
      value: '4.8/5',
      label: 'User Rating',
    },
  ];

  const features = [
    {
      title: 'Find Quality Service at the Right Price',
      description:
        'venbid connects customers with trusted service providers through a competitive bidding system, ensuring fair pricing, convenience, and quality service.',
    },
    {
      title: 'Verified Vendors Only',
      description:
        "All service providers on venbid are verified and vetted to ensure you're working with qualified, trusted professionals.",
    },
    {
      title: 'Secure Payment System',
      description:
        "Our secure payment system holds funds in escrow until you're satisfied with the completed work, providing protection for both customers and vendors.",
    },
  ];

  const customerBenefits = [
    'Post Jobs for Free',
    'Compare Multiple Bids',
    'Secure Payments',
  ];

  const vendorBenefits = [
    'Access to Local Jobs',
    'Build Your Reputation',
    'Get Paid Securely',
    'Grow Your Business',
  ];

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-venbid-primary text-white py-20">
        <div className="container mx-auto px-6 text-center">
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          > */}
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About venbid
            </h1>
            <p className="max-w-2xl mx-auto text-lg opacity-90">
              venbid eliminates unnecessary complexities, giving people control
              over their time and choices. We connect customers with trusted
              service providers through a seamless bidding system, ensuring fair
              pricing, convenience, and quality service.
            </p>
          </>
          {/* </motion.div> */}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              // <motion.div
              //   key={index}
              //   initial={{ opacity: 0, y: 20 }}
              //   whileInView={{ opacity: 1, y: 0 }}
              //   viewport={{ once: true }}
              //   transition={{ duration: 0.5, delay: index * 0.1 }}
              // >
              <>
                <p className="text-4xl font-bold text-venbid-primary">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
              </>
              // </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            > */}
            <>
              <h2 className="text-3xl font-bold text-venbid-dark dark:text-white">
                Our Mission
              </h2>
              <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                Our mission is to simplify the process of finding and hiring
                service professionals, creating a transparent marketplace where
                customers get fair prices and vendors find legitimate work
                opportunities. We're committed to saving you time, reducing
                stress, and ensuring quality outcomes for every job.
              </p>
            </>
            {/* </motion.div> */}

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {/* <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
              > */}
              <>
                <h3 className="text-xl font-semibold mb-4 text-venbid-dark dark:text-white">
                  For Customers
                </h3>
                <ul className="space-y-3">
                  {customerBenefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <div className="bg-venbid-primary/10 p-1 rounded-full mr-3">
                        <Check className="h-4 w-4 text-venbid-primary" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </>
              {/* </motion.div> */}

              {/* <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
              > */}
              <>
                <h3 className="text-xl font-semibold mb-4 text-venbid-dark dark:text-white">
                  For Vendors
                </h3>
                <ul className="space-y-3">
                  {vendorBenefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <div className="bg-venbid-primary/10 p-1 rounded-full mr-3">
                        <Check className="h-4 w-4 text-venbid-primary" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </>
              {/* </motion.div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          > */}
          <>
            <h2 className="text-3xl font-bold text-venbid-dark dark:text-white">
              Why venbid?
            </h2>
          </>
          {/* </motion.div> */}

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              // <motion.div
              //   key={index}
              //   initial={{ opacity: 0, y: 20 }}
              //   whileInView={{ opacity: 1, y: 0 }}
              //   viewport={{ once: true }}
              //   transition={{ duration: 0.5, delay: index * 0.1 }}
              //   className="text-center"
              // >
              <>
                <div className="bg-venbid-primary rounded-full h-14 w-14 flex items-center justify-center mx-auto mb-6">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-venbid-dark dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </>
              // </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          > */}
          <>
            <h2 className="text-3xl font-bold text-venbid-dark dark:text-white">
              Our Story
            </h2>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Founded in 2023 in Illinois, venbid was created to solve a common
              problem: finding reliable service professionals at fair prices.
              Our team of technology and service industry experts built a
              platform that eliminates unnecessary middlemen and connects
              customers directly with qualified service providers.
            </p>
          </>
          {/* </motion.div> */}
        </div>
      </section>

      {/* CTA Section */}

      {/* <section className="py-16 bg-venbid-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the venbid Community</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Whether you need services or provide them, venbid makes the process easier, safer, and more transparent for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup?type=customer"
              className="bg-white text-venbid-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
            >
              Sign Up as Customer
            </a>
            <a
              href="/signup?type=vendor"
              className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors"
            >
              Become a Vendor
            </a>
          </div>
        </div>
      </section> */}
      <section className="py-16 bg-venbid-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the venbid Community</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Whether you need services or provide them, venbid makes the process
            easier, safer, and more transparent for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Customer Button */}
            <a
              href="/signup?type=customer"
              className="bg-white text-venbid-primary px-6 py-3 rounded-md font-medium 
                   hover:bg-gray-100 dark:hover:bg-gray-200 
                   transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
            >
              Sign Up as Customer
            </a>

            {/* Vendor Button */}
            <a
              href="/signup?type=vendor"
              className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium 
                   hover:bg-white/10 dark:hover:bg-white/10 
                   transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
            >
              Become a Vendor
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
