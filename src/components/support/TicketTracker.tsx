import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TicketTrackerProps {
  userEmail?: string;
}

const TicketTracker = ({ userEmail }: TicketTrackerProps) => {
  const { toast } = useToast();
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    id: string;
    status: "open" | "in-progress" | "resolved" | "closed";
    subject: string;
    created: string;
    lastUpdated: string;
  }>(null);
  
  const handleSearch = () => {
    if (!ticketId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a ticket ID",
      });
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // If the ticket ID starts with TKT-, simulate a found ticket
      if (ticketId.startsWith("TKT-")) {
        setResult({
          id: ticketId,
          status: "open",
          subject: "Sample Support Request",
          created: new Date().toLocaleDateString(),
          lastUpdated: new Date().toLocaleDateString(),
        });
        toast({
          title: "Ticket found",
          description: "Displaying ticket information",
        });
      } else {
        setResult(null);
        toast({
          variant: "destructive",
          title: "Not found",
          description: "No ticket found with that ID",
        });
      }
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Track Your Support Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-id">Ticket ID</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="ticket-id"
                placeholder="Enter your ticket ID (e.g., TKT-123ABC)"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="min-w-0 flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="bg-bojj-primary hover:bg-bojj-primary/90"
                aria-label="Search ticket"
                type="button"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {result && (
            <div className="mt-4 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Ticket Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Ticket ID:</span>
                <span>{result.id}</span>
                
                <span className="text-gray-500">Status:</span>
                <span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    result.status === "open" ? "bg-yellow-100 text-yellow-800" :
                    result.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                    result.status === "resolved" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </span>
                </span>
                
                <span className="text-gray-500">Subject:</span>
                <span>{result.subject}</span>
                
                <span className="text-gray-500">Created:</span>
                <span>{result.created}</span>
                
                <span className="text-gray-500">Last Updated:</span>
                <span>{result.lastUpdated}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketTracker;
