import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
// import { motion } from "framer-motion";
import { Check, CreditCard, DollarSign } from "lucide-react";

const PaymentsPage = () => {
  const location = useLocation();
  const isVendor = location.pathname.includes("vendor");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(isVendor ? "earnings" : "payment");
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Customer payment form state
  const [paymentForm, setPaymentForm] = useState({
    jobTitle: "",
    vendorName: "",
    amount: "",
    cardNumber: "",
    expiration: "",
    cvc: "",
    name: "",
  });
  
  const handlePaymentChange = (field: string, value: string) => {
    setPaymentForm({ ...paymentForm, [field]: value });
  };
  
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      
      toast({
        title: "Payment successful!",
        description: "Your payment has been processed successfully.",
      });
      
      // Reset form after showing success for a moment
      setTimeout(() => {
        setShowSuccess(false);
        setPaymentForm({
          jobTitle: "",
          vendorName: "",
          amount: "",
          cardNumber: "",
          expiration: "",
          cvc: "",
          name: "",
        });
      }, 3000);
    }, 1500);
  };
  
  // Mock data for vendor earnings
  const earnings = [
    {
      id: "trx-1",
      jobTitle: "Kitchen Renovation",
      customerName: "John Smith",
      amount: 1200.00,
      date: "2023-04-25",
      status: "Completed",
      paymentMethod: "Credit Card",
    },
    {
      id: "trx-2",
      jobTitle: "Bathroom Remodel",
      customerName: "Sarah Johnson",
      amount: 850.00,
      date: "2023-04-20",
      status: "Completed",
      paymentMethod: "PayPal",
    },
    {
      id: "trx-3",
      jobTitle: "Deck Installation",
      customerName: "Michael Brown",
      amount: 1800.00,
      date: "2023-04-15",
      status: "Pending",
      paymentMethod: "Bank Transfer",
    },
  ];
  
  // Mock data for customer payment history
  const paymentHistory = [
    {
      id: "pay-1",
      jobTitle: "Landscaping Services",
      vendorName: "Green Thumb Landscaping",
      amount: 450.00,
      date: "2023-04-22",
      status: "Paid",
    },
    {
      id: "pay-2",
      jobTitle: "Plumbing Repair",
      vendorName: "Quick Fix Plumbing",
      amount: 180.00,
      date: "2023-04-18",
      status: "Paid",
    },
  ];
  
  return (
    <div className="w-full px-4 md:px-8 py-6">
      <div className="w-full">
        {/* Vendor View */}
        {isVendor && (
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-left">Earnings & Payments</h2>
              <p className="text-muted-foreground text-left">Manage your earnings and payment methods</p>
            </div>
            
            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Total Earnings</CardTitle>
                  <CardDescription>Lifetime earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${earnings.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Pending Payments</CardTitle>
                  <CardDescription>In process</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${earnings.filter(item => item.status === "Pending").reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Available Balance</CardTitle>
                  <CardDescription>Ready to withdraw</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${earnings.filter(item => item.status === "Completed").reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Earnings Tab */}
            <Tabs defaultValue="earnings" onValueChange={setActiveTab} className="mt-6 w-full">
              <TabsList className="w-full">
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              </TabsList>
              
              <TabsContent value="earnings" className="mt-4 w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-left">Earnings History</CardTitle>
                    <CardDescription className="text-left">
                      Your completed and pending payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto w-full">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3">Job Title</th>
                          <th className="text-left p-3">Customer</th>
                          <th className="text-left p-3">Amount</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.map((item, index) => (
                          // <motion.tr
                          //   key={item.id}
                          //   initial={{ opacity: 0, y: 10 }}
                          //   animate={{ opacity: 1, y: 0 }}
                          //   transition={{ duration: 0.3, delay: index * 0.1 }}
                          //   className="border-b border-border hover:bg-muted dark:hover:bg-muted/40"
                          // >
                          <tr
                            key={item.id}
                            className="border-b border-border hover:bg-muted dark:hover:bg-muted/40"
                          >
                            <td className="p-3">{item.jobTitle}</td>
                            <td className="p-3">{item.customerName}</td>
                            <td className="p-3">${item.amount.toFixed(2)}</td>
                            <td className="p-3">{item.date}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  item.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3">{item.paymentMethod}</td>
                          </tr>
                          // </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="withdraw" className="mt-4 w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Withdraw Funds</CardTitle>
                    <CardDescription>
                      Transfer your available balance to your bank account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold">
                        ${earnings.filter(item => item.status === "Completed").reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Withdrawal Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            className="pl-8"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Withdrawal Method</Label>
                        <div className="grid grid-cols-8 gap-4">
                          <div className="border rounded-lg p-4 cursor-pointer hover:border-bojj-primary hover:bg-bojj-primary/5 transition-colors">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="bankAccount"
                                name="withdrawalMethod"
                                className="accent-bojj-primary"
                                defaultChecked
                              />
                              <Label htmlFor="bankAccount" className="cursor-pointer">Bank Account</Label>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4 cursor-pointer hover:border-bojj-primary hover:bg-bojj-primary/5 transition-colors">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id="paypal"
                                name="withdrawalMethod"
                                className="accent-bojj-primary"
                              />
                              <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-bojj-primary hover:bg-bojj-primary/90">
                      Withdraw Funds
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="payment-methods" className="mt-4 w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage how you receive your payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-md">
                            <CreditCard className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">Bank Account (Default)</p>
                            <p className="text-sm text-muted-foreground">XXXX XX1234</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-md">
                            <DollarSign className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">PayPal</p>
                            <p className="text-sm text-muted-foreground">vendor@example.com</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4" variant="outline">
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* Customer View */}
        {!isVendor && (
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-left">Payments</h2>
              <p className="text-muted-foreground text-left">Manage your payments and transaction history</p>
            </div>
            
            <Tabs defaultValue="history" onValueChange={setActiveTab} className="mt-6 w-full">
              <TabsList className="w-full">
                <TabsTrigger value="payment">Make a Payment</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="payment" className="mt-4 w-full">
                {!showSuccess ? (
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="text-left">Secure Payments & Easy Transactions</CardTitle>
                      <CardDescription className="text-left">
                        Pay and receive payments with confidence through our secure system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                      <form onSubmit={handlePaymentSubmit} className="space-y-6">
                        <h3 className="text-lg font-medium">Payment Details</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Review and complete your payment securely.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                              id="jobTitle"
                              value={paymentForm.jobTitle}
                              onChange={(e) => handlePaymentChange("jobTitle", e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="vendorName">Vendor</Label>
                            <Input
                              id="vendorName"
                              value={paymentForm.vendorName}
                              onChange={(e) => handlePaymentChange("vendorName", e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                              <Input
                                id="amount"
                                type="text"
                                placeholder="0.00"
                                className="pl-8"
                                value={paymentForm.amount}
                                onChange={(e) => handlePaymentChange("amount", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4 mt-6">
                          <h3 className="text-lg font-medium">Payment Method</h3>
                          
                          <div className="space-y-4">
                            <Label>Payment Method</Label>
                            <div className="grid grid-cols-6 gap-4">
                              <div
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                  paymentMethod === "creditCard"
                                    ? "border-bojj-primary bg-bojj-primary/5"
                                    : "hover:border-bojj-primary hover:bg-bojj-primary/5"
                                }`}
                                onClick={() => setPaymentMethod("creditCard")}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="creditCard"
                                    checked={paymentMethod === "creditCard"}
                                    onChange={() => setPaymentMethod("creditCard")}
                                    className="accent-bojj-primary"
                                  />
                                  <Label htmlFor="creditCard" className="cursor-pointer">
                                    Credit/Debit Card
                                  </Label>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Secure payment via Stripe
                                </p>
                              </div>
                              
                              <div
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                  paymentMethod === "paypal"
                                    ? "border-bojj-primary bg-bojj-primary/5"
                                    : "hover:border-bojj-primary hover:bg-bojj-primary/5"
                                }`}
                                onClick={() => setPaymentMethod("paypal")}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="paypal"
                                    checked={paymentMethod === "paypal"}
                                    onChange={() => setPaymentMethod("paypal")}
                                    className="accent-bojj-primary"
                                  />
                                  <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Fast and secure payment
                                </p>
                              </div>
                            </div>
                            
                            {paymentMethod === "creditCard" && (
                              <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="cardNumber">Card Number</Label>
                                  <Input
                                    id="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={paymentForm.cardNumber}
                                    onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
                                    required
                                  />
                                </div>
                                
                                <div className="grid grid-cols-6 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="expiration">Expiration Date</Label>
                                    <Input
                                      id="expiration"
                                      placeholder="MM / YY"
                                      value={paymentForm.expiration}
                                      onChange={(e) => handlePaymentChange("expiration", e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input
                                      id="cvc"
                                      placeholder="123"
                                      value={paymentForm.cvc}
                                      onChange={(e) => handlePaymentChange("cvc", e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="name">Name on Card</Label>
                                  <Input
                                    id="name"
                                    placeholder="John Smith"
                                    value={paymentForm.name}
                                    onChange={(e) => handlePaymentChange("name", e.target.value)}
                                    required
                                  />
                                </div>
                              </div>
                            )}
                            
                            {paymentMethod === "paypal" && (
                              <div className="mt-4 text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                  You will be redirected to PayPal to complete your payment.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mt-6">
                          <h3 className="text-sm font-medium text-blue-800">Payment Protection</h3>
                          <p className="text-xs text-blue-600 mt-1">
                            Your payment is protected by our secure payment system. Funds are held safely until you confirm the job is completed to your satisfaction.
                          </p>
                        </div>
                        
                        <Button
                          type="submit"
                          className="w-full bg-bojj-primary hover:bg-bojj-primary/90"
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Pay Securely"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="w-full">
                    <Card className="border-green-200 w-full">
                      <CardContent className="pt-6 text-center w-full">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                        <p className="text-muted-foreground mb-6">
                          Thank you for your payment. A confirmation email has been sent to your inbox.
                        </p>
                        
                        <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
                          <div className="grid grid-cols-2 gap-2">
                            <p className="text-sm text-muted-foreground">Payment Amount:</p>
                            <p className="text-sm font-medium text-right">${paymentForm.amount}</p>
                            
                            <p className="text-sm text-muted-foreground">Job:</p>
                            <p className="text-sm font-medium text-right">{paymentForm.jobTitle}</p>
                            
                            <p className="text-sm text-muted-foreground">Vendor:</p>
                            <p className="text-sm font-medium text-right">{paymentForm.vendorName}</p>
                            
                            <p className="text-sm text-muted-foreground">Transaction ID:</p>
                            <p className="text-sm font-medium text-right">TRX-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                          <Button variant="outline">View Receipt</Button>
                          <Button
                            className="bg-bojj-primary hover:bg-bojj-primary/90"
                            onClick={() => setShowSuccess(false)}
                          >
                            Return to Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-4 w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-left">Payment History</CardTitle>
                    <CardDescription className="text-left">
                      View your past transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto w-full">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3">Job Title</th>
                          <th className="text-left p-3">Vendor</th>
                          <th className="text-left p-3">Amount</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((item, index) => (
                          // <motion.tr
                          //   key={item.id}
                          //   initial={{ opacity: 0, y: 10 }}
                          //   animate={{ opacity: 1, y: 0 }}
                          //   transition={{ duration: 0.3, delay: index * 0.1 }}
                          //   className="border-b border-border hover:bg-muted dark:hover:bg-muted/40"
                          // >
                          <tr
                            key={item.id}
                            className="border-b border-border hover:bg-muted dark:hover:bg-muted/40"
                          >
                            <td className="p-3">{item.jobTitle}</td>
                            <td className="p-3">{item.vendorName}</td>
                            <td className="p-3">${item.amount.toFixed(2)}</td>
                            <td className="p-3">{item.date}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                          // </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
