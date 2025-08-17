import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
import { PlusCircle, MessageSquare, Clock } from "lucide-react";


const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  
  // Mock data for jobs
  const activeJobs = [
    {
      id: "job-1",
      title: "Kitchen Renovation",
      description: "Complete renovation of kitchen including cabinets, countertops, and appliances.",
      postedDate: "2023-04-25",
      budget: "$8,000 - $12,000",
      bidsCount: 5,
      status: "active",
      unreadMessages: 2,
    },
    {
      id: "job-2",
      title: "Bathroom Remodel",
      description: "Full bathroom remodel with new fixtures, tile, and vanity.",
      postedDate: "2023-04-23",
      budget: "$5,000 - $7,500",
      bidsCount: 3,
      status: "active",
      unreadMessages: 0,
    },
  ];
  
  const completedJobs = [
    {
      id: "job-3",
      title: "Lawn Landscaping",
      description: "Front yard landscaping with new plants, mulch, and decorative stones.",
      postedDate: "2023-04-10",
      completedDate: "2023-04-18",
      budget: "$1,500 - $2,500",
      finalCost: "$2,100",
      vendor: "Green Thumb Landscaping",
      status: "completed",
    },
  ];
  
  // Combine all jobs for displaying in the dashboard
  const allJobs = [...activeJobs, ...completedJobs];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        <Link to="/customer/jobs/new">
          <Button className="bg-bojj-primary hover:bg-bojj-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Jobs</CardTitle>
            <CardDescription>Currently open for bids</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeJobs.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Bids</CardTitle>
            <CardDescription>Across all your jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeJobs.reduce((acc, job) => acc + job.bidsCount, 0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Completed Jobs</CardTitle>
            <CardDescription>Successfully finished</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedJobs.length}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Jobs List */}
      <Tabs defaultValue="active" onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeJobs.map((job) => (
              // <motion.div
              //   key={job.id}
              //   initial={{ opacity: 0, y: 10 }}
              //   animate={{ opacity: 1, y: 0 }}
              //   transition={{ duration: 0.3 }}
              // >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="mt-1">Posted on {job.postedDate}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="font-medium">{job.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bids</p>
                        <p className="font-medium">{job.bidsCount}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4">
                      <Link to={`/customer/jobs/${job.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      
                      <Link to={`/customer/jobs/${job.id}/bids`} className="flex-1">
                        <Button className="w-full bg-bojj-primary hover:bg-bojj-primary/90">
                          Review Bids
                        </Button>
                      </Link>
                    </div>
                    
                    {job.unreadMessages > 0 && (
                      <div className="mt-4 flex items-center text-bojj-primary">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="text-sm">{job.unreadMessages} new message{job.unreadMessages > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              // </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription className="mt-1">Completed on {job.completedDate}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-medium">{job.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Final Cost</p>
                      <p className="font-medium">{job.finalCost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vendor</p>
                      <p className="font-medium">{job.vendor}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <Link to={`/customer/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {job.status === "completed" 
                          ? `Completed on ${(job as any).completedDate}` 
                          : `Posted on ${job.postedDate}`}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={job.status === "completed" 
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {job.status === "completed" ? "Completed" : "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  
                  <Link to={`/customer/jobs/${job.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
      </Tabs>
      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="bg-bojj-primary/10 p-2 rounded-full">
                <Clock className="h-4 w-4 text-bojj-primary" />
              </div>
              <div>
                <p className="font-medium">New bid received</p>
                <p className="text-sm text-gray-500">A new bid was submitted for your Kitchen Renovation project.</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-bojj-primary/10 p-2 rounded-full">
                <MessageSquare className="h-4 w-4 text-bojj-primary" />
              </div>
              <div>
                <p className="font-medium">New message</p>
                <p className="text-sm text-gray-500">Sarah Miller sent you a message about Kitchen Renovation.</p>
                <p className="text-xs text-gray-400 mt-1">Yesterday at 8:15 PM</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
