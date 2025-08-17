import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock bids data
const mockBids = {
  "job-1": [
    {
      id: "bid-1",
      vendor: "Green Thumb Landscaping",
      amount: "$2,000",
      message: "We can start next week and finish in 3 days.",
      status: "pending",
      submittedAt: "2023-04-26",
    },
    {
      id: "bid-2",
      vendor: "BOJJ Construction",
      amount: "$2,100",
      message: "Experienced team, quality guaranteed.",
      status: "pending",
      submittedAt: "2023-04-27",
    },
  ],
  "job-2": [
    {
      id: "bid-3",
      vendor: "Bathroom Pros",
      amount: "$6,800",
      message: "Can complete in 2 weeks.",
      status: "pending",
      submittedAt: "2023-04-24",
    },
  ],
};

const BidsPage = () => {
  const { id } = useParams();
  const bids = mockBids[id as keyof typeof mockBids] || [];

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Bids for Job</CardTitle>
          <CardDescription>Review and manage all bids for this job.</CardDescription>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No bids found for this job.</div>
          ) : (
            <div className="space-y-6">
              {bids.map((bid) => (
                <div key={bid.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50 dark:bg-gray-900">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{bid.vendor}</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">{bid.status}</Badge>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-1">{bid.message}</div>
                    <div className="text-sm text-gray-500">Submitted: {bid.submittedAt}</div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 md:items-center">
                    <div className="font-bold text-lg mb-2 md:mb-0">{bid.amount}</div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Accept</Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8">
            <Link to="/customer/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidsPage; 