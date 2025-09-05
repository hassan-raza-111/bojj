import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, DollarSign } from 'lucide-react';

const PaymentsPage = () => {
  const location = useLocation();
  const isVendor = location.pathname.includes('vendor');
  const { toast } = useToast();

  // Mock data for vendor earnings
  const earnings = [
    {
      id: 'trx-1',
      jobTitle: 'Kitchen Renovation',
      customerName: 'John Smith',
      amount: 1200.0,
      date: '2023-04-25',
      status: 'Completed',
      paymentMethod: 'Stripe',
    },
    {
      id: 'trx-2',
      jobTitle: 'Bathroom Remodel',
      customerName: 'Sarah Johnson',
      amount: 850.0,
      date: '2023-04-20',
      status: 'Completed',
      paymentMethod: 'Stripe',
    },
    {
      id: 'trx-3',
      jobTitle: 'Deck Installation',
      customerName: 'Michael Brown',
      amount: 1800.0,
      date: '2023-04-15',
      status: 'Pending',
      paymentMethod: 'Stripe',
    },
  ];

  // Mock data for customer payment history
  const paymentHistory = [
    {
      id: 'pay-1',
      jobTitle: 'Landscaping Services',
      vendorName: 'Green Thumb Landscaping',
      amount: 450.0,
      date: '2023-04-22',
      status: 'Paid',
    },
    {
      id: 'pay-2',
      jobTitle: 'Plumbing Repair',
      vendorName: 'Quick Fix Plumbing',
      amount: 180.0,
      date: '2023-04-18',
      status: 'Paid',
    },
  ];

  return (
    <div className='w-full px-4 md:px-8 py-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            {isVendor ? 'Earnings & Payments' : 'Payment History'}
          </h1>
          <p className='text-gray-600'>
            {isVendor
              ? 'Track your earnings and payment history'
              : 'View your payment history and receipts'}
          </p>
        </div>

        {isVendor ? (
          <div className='space-y-6'>
            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <p className='text-sm text-green-600 font-medium'>
                      Total Earnings
                    </p>
                    <p className='text-2xl font-bold text-green-700'>
                      $3,850.00
                    </p>
                  </div>
                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <p className='text-sm text-blue-600 font-medium'>
                      This Month
                    </p>
                    <p className='text-2xl font-bold text-blue-700'>
                      $1,200.00
                    </p>
                  </div>
                  <div className='bg-purple-50 p-4 rounded-lg'>
                    <p className='text-sm text-purple-600 font-medium'>
                      Pending
                    </p>
                    <p className='text-2xl font-bold text-purple-700'>
                      $850.00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
                <CardDescription>
                  Your recent job payments and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {earnings.map((earning) => (
                    <div
                      key={earning.id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <h3 className='font-medium text-gray-900'>
                          {earning.jobTitle}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          Customer: {earning.customerName}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Date: {earning.date}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-lg font-bold text-green-600'>
                          ${earning.amount.toFixed(2)}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {earning.paymentMethod}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            earning.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {earning.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CreditCard className='h-5 w-5' />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <p className='text-sm text-blue-600 font-medium'>
                      Total Spent
                    </p>
                    <p className='text-2xl font-bold text-blue-700'>$630.00</p>
                  </div>
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <p className='text-sm text-green-600 font-medium'>
                      Completed Jobs
                    </p>
                    <p className='text-2xl font-bold text-green-700'>2</p>
                  </div>
                  <div className='bg-purple-50 p-4 rounded-lg'>
                    <p className='text-sm text-purple-600 font-medium'>
                      Active Jobs
                    </p>
                    <p className='text-2xl font-bold text-purple-700'>1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Your recent payments and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <h3 className='font-medium text-gray-900'>
                          {payment.jobTitle}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          Vendor: {payment.vendorName}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Date: {payment.date}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-lg font-bold text-blue-600'>
                          ${payment.amount.toFixed(2)}
                        </p>
                        <span className='inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
