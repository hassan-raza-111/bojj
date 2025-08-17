import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobData } from "../customer/JobCrud";

// Mock data (should be replaced with API or context in real app)
const jobs: JobData[] = [
  {
    id: "job-1",
    title: "Kitchen Renovation",
    category: "Home Renovation",
    subcategory: "Kitchen",
    description: "Complete renovation of kitchen including cabinets, countertops, and appliances.",
    street: "123 Main St",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60601",
    budget: "$8,000 - $12,000",
    timeline: "ASAP",
    date: "",
    time: "",
    additionalRequests: "",
    contactPreference: "email",
    status: "active",
    postedDate: "2023-04-25",
    bidsCount: 5,
    unreadMessages: 2,
    company: "BOJJ Construction",
    serviceCategory: "Home Renovation",
    serviceType: "Kitchen"
  },
  {
    id: "job-2",
    title: "Bathroom Remodel",
    category: "Home Renovation",
    subcategory: "Bathroom",
    description: "Full bathroom remodel with new fixtures, tile, and vanity.",
    street: "456 Oak Ave",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60602",
    budget: "$5,000 - $7,500",
    timeline: "Within a month",
    date: "",
    time: "",
    additionalRequests: "",
    contactPreference: "phone",
    status: "active",
    postedDate: "2023-04-23",
    bidsCount: 3,
    unreadMessages: 0,
    company: "BOJJ Construction",
    serviceCategory: "Home Renovation",
    serviceType: "Bathroom"
  },
  {
    id: "job-3",
    title: "Lawn Landscaping",
    category: "Landscaping",
    subcategory: "Lawn Care",
    description: "Front yard landscaping with new plants, mulch, and decorative stones.",
    street: "789 Pine Rd",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60603",
    budget: "$1,500 - $2,500",
    timeline: "Specific Date",
    date: "2023-04-15",
    time: "10:00",
    additionalRequests: "",
    contactPreference: "both",
    status: "completed",
    postedDate: "2023-04-10",
    completedDate: "2023-04-18",
    finalCost: "$2,100",
    vendor: "Green Thumb Landscaping",
    bidsCount: 2,
    unreadMessages: 0,
    company: "Green Thumb Landscaping",
    serviceCategory: "Landscaping",
    serviceType: "Lawn Care"
  }
];

const JobDetailPage = () => {
  const { id } = useParams();
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold mb-4">Job not found</h2>
        <Link to="/customer/jobs">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription className="mt-1">{job.status === "completed" ? `Completed on ${job.completedDate}` : `Posted on ${job.postedDate}`}</CardDescription>
            </div>
            <Badge variant="outline" className={job.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}>
              {job.status === "completed" ? "Completed" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">{job.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{job.category} / {job.subcategory}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-medium">{job.budget}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timeline</p>
              <p className="font-medium">{job.timeline}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{job.street}, {job.city}, {job.state} {job.zipCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Preference</p>
              <p className="font-medium capitalize">{job.contactPreference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="font-medium">{job.serviceCategory} - {job.serviceType}</p>
            </div>
            {job.status === "completed" && (
              <div>
                <p className="text-sm text-gray-500">Final Cost</p>
                <p className="font-medium">{job.finalCost}</p>
              </div>
            )}
            {job.vendor && (
              <div>
                <p className="text-sm text-gray-500">Vendor</p>
                <p className="font-medium">{job.vendor}</p>
              </div>
            )}
          </div>
          {job.additionalRequests && (
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Additional Requests</h4>
              <p className="text-gray-700 dark:text-gray-300">{job.additionalRequests}</p>
            </div>
          )}
          <div className="flex gap-2 mt-6">
            <Link to="/customer/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
            <Link to={`/customer/jobs/${job.id}/edit`}>
              <Button>Edit Job</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetailPage; 