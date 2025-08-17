import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SubmitBidPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate("/vendor-dashboard?tab=bids"), 1500);
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Submit Bid</CardTitle>
          <CardDescription>Send your proposal for this job.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center text-green-600 font-semibold py-8">Bid submitted successfully!</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Bid Amount</label>
                <Input
                  type="text"
                  placeholder="$0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message to Client</label>
                <Textarea
                  placeholder="Describe your approach, timeline, or ask questions..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="submit" className="bg-bojj-primary hover:bg-bojj-primary/90 w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Bid"}
                </Button>
                <Link to="/vendor-dashboard">
                  <Button variant="outline" type="button" className="w-full">Cancel</Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitBidPage; 