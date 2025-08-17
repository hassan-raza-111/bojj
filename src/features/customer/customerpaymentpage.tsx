import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

const CustomerPaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-2">Secure Payments & Easy Transactions</h1>
      <p className="text-muted-foreground mb-6">
        Pay and receive payments with confidence through our secure system.
      </p>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="payment">Customer Payment</TabsTrigger>
        </TabsList>

        {/* Payment Form */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Review and complete your payment securely.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" placeholder="e.g. Kitchen Renovation" />
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input id="vendor" placeholder="Vendor name or ID" />
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" placeholder="$1000" type="number" />
              </div>

              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md px-4 py-3">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">
                      <span className="font-medium block">Credit/Debit Card</span>
                      <span className="text-sm text-muted-foreground">Secure payment via Stripe</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-md px-4 py-3">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">
                      <span className="font-medium block">PayPal</span>
                      <span className="text-sm text-muted-foreground">Fast and secure payment</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start sm:items-stretch space-y-4">
              <Button className="w-full bg-bojj-primary hover:bg-bojj-primary/90 text-white">
                <Lock className="w-4 h-4 mr-2" /> Pay Securely
              </Button>
              <div className="text-sm text-muted-foreground">
                <strong>Payment Protection:</strong> Your payment is protected by our secure system. Funds are held safely until you confirm the job is completed.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerPaymentPage;
