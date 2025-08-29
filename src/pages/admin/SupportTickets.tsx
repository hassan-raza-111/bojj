import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  HeadphonesIcon,
  Search,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  Tag,
  Plus,
  MoreHorizontal,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  Filter,
  Download,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const SupportTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data for demonstration
  const tickets = [
    {
      id: 'TICKET-001',
      title: 'Payment not received for completed job',
      description:
        "I completed the website development job but haven't received payment yet. The job was marked as completed 3 days ago.",
      customer: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1-555-0123',
      assignedTo: 'Admin Support',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'Payment Issue',
      createdAt: '2024-01-25 10:30:00',
      updatedAt: '2024-01-25 14:20:00',
      lastResponse: '2 hours ago',
      responses: 3,
      attachments: ['payment_proof.pdf'],
      tags: ['payment', 'urgent', 'website'],
    },
    {
      id: 'TICKET-002',
      title: 'Account verification pending',
      description:
        'I submitted all required documents for vendor verification but my account is still pending after 5 days.',
      customer: 'Jane Smith',
      customerEmail: 'jane@example.com',
      customerPhone: '+1-555-0124',
      assignedTo: 'Vendor Support',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      category: 'Account Issue',
      createdAt: '2024-01-23 15:45:00',
      updatedAt: '2024-01-25 09:15:00',
      lastResponse: '1 day ago',
      responses: 5,
      attachments: ['id_proof.pdf', 'business_license.pdf'],
      tags: ['verification', 'vendor', 'pending'],
    },
    {
      id: 'TICKET-003',
      title: 'Job posting not appearing in search',
      description:
        "I posted a new job for logo design but it's not showing up in the search results. I can see it in my dashboard though.",
      customer: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1-555-0125',
      assignedTo: 'Technical Support',
      status: 'RESOLVED',
      priority: 'LOW',
      category: 'Technical Issue',
      createdAt: '2024-01-20 11:20:00',
      updatedAt: '2024-01-22 16:30:00',
      lastResponse: '3 days ago',
      responses: 4,
      attachments: [],
      tags: ['technical', 'search', 'resolved'],
    },
    {
      id: 'TICKET-004',
      title: 'Dispute with vendor over project quality',
      description:
        "The delivered project doesn't meet the requirements specified in the job description. I need help resolving this dispute.",
      customer: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1-555-0126',
      assignedTo: 'Dispute Resolution',
      status: 'ESCALATED',
      priority: 'HIGH',
      category: 'Dispute',
      createdAt: '2024-01-24 08:15:00',
      updatedAt: '2024-01-25 12:45:00',
      lastResponse: '4 hours ago',
      responses: 7,
      attachments: ['job_description.pdf', 'delivered_project.zip'],
      tags: ['dispute', 'quality', 'escalated'],
    },
    {
      id: 'TICKET-005',
      title: 'Unable to withdraw earnings',
      description:
        "I'm trying to withdraw my earnings but getting an error message. My account is verified and I have sufficient balance.",
      customer: 'David Brown',
      customerEmail: 'david@example.com',
      customerPhone: '+1-555-0127',
      assignedTo: 'Payment Support',
      status: 'OPEN',
      priority: 'MEDIUM',
      category: 'Payment Issue',
      createdAt: '2024-01-25 13:00:00',
      updatedAt: '2024-01-25 13:00:00',
      lastResponse: 'No responses yet',
      responses: 0,
      attachments: ['error_screenshot.png'],
      tags: ['withdrawal', 'payment', 'error'],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className='bg-red-100 text-red-800'>Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge className='bg-blue-100 text-blue-800'>In Progress</Badge>;
      case 'RESOLVED':
        return <Badge className='bg-green-100 text-green-800'>Resolved</Badge>;
      case 'ESCALATED':
        return (
          <Badge className='bg-orange-100 text-orange-800'>Escalated</Badge>
        );
      case 'CLOSED':
        return <Badge className='bg-gray-100 text-gray-800'>Closed</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge className='bg-red-100 text-red-800'>High</Badge>;
      case 'MEDIUM':
        return <Badge className='bg-yellow-100 text-yellow-800'>Medium</Badge>;
      case 'LOW':
        return <Badge className='bg-green-100 text-green-800'>Low</Badge>;
      default:
        return <Badge variant='outline'>{priority}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      case 'MEDIUM':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'LOW':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      default:
        return <Activity className='h-4 w-4 text-gray-600' />;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'IN_PROGRESS'
  ).length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED').length;
  const escalatedTickets = tickets.filter(
    (t) => t.status === 'ESCALATED'
  ).length;

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Support Tickets</h1>
        <p className='text-blue-100'>
          Manage and resolve customer support requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Open Tickets
            </CardTitle>
            <div className='p-2 rounded-lg bg-red-50'>
              <AlertCircle className='h-4 w-4 text-red-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{openTickets}</div>
            <p className='text-xs text-red-600'>Requires attention</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              In Progress
            </CardTitle>
            <div className='p-2 rounded-lg bg-blue-50'>
              <Clock className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{inProgressTickets}</div>
            <p className='text-xs text-blue-600'>Being handled</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Resolved
            </CardTitle>
            <div className='p-2 rounded-lg bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{resolvedTickets}</div>
            <p className='text-xs text-green-600'>Successfully closed</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Escalated
            </CardTitle>
            <div className='p-2 rounded-lg bg-orange-50'>
              <AlertTriangle className='h-4 w-4 text-orange-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{escalatedTickets}</div>
            <p className='text-xs text-orange-600'>Needs escalation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='all-tickets' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='all-tickets'>All Tickets</TabsTrigger>
          <TabsTrigger value='open'>Open</TabsTrigger>
          <TabsTrigger value='in-progress'>In Progress</TabsTrigger>
          <TabsTrigger value='resolved'>Resolved</TabsTrigger>
          <TabsTrigger value='escalated'>Escalated</TabsTrigger>
        </TabsList>

        <TabsContent value='all-tickets' className='space-y-6'>
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div>
                  <CardTitle>Support Ticket Management</CardTitle>
                  <CardDescription>
                    Search, filter, and manage support tickets
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='flex items-center gap-2'
                      >
                        <Download className='h-4 w-4' />
                        Export
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export Tickets</DialogTitle>
                        <DialogDescription>
                          Export tickets data in various formats
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <Button
                            variant='outline'
                            className='flex items-center gap-2'
                          >
                            <Download className='h-4 w-4' />
                            CSV Export
                          </Button>
                          <Button
                            variant='outline'
                            className='flex items-center gap-2'
                          >
                            <Download className='h-4 w-4' />
                            Excel Export
                          </Button>
                        </div>
                        <div className='flex gap-2 justify-end'>
                          <Button variant='outline'>Cancel</Button>
                          <Button>Export</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Create Ticket
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search tickets...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='OPEN'>Open</SelectItem>
                    <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                    <SelectItem value='RESOLVED'>Resolved</SelectItem>
                    <SelectItem value='ESCALATED'>Escalated</SelectItem>
                    <SelectItem value='CLOSED'>Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Priority</SelectItem>
                    <SelectItem value='HIGH'>High</SelectItem>
                    <SelectItem value='MEDIUM'>Medium</SelectItem>
                    <SelectItem value='LOW'>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tickets Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status & Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='font-medium'>{ticket.title}</div>
                            <div className='text-sm text-gray-500 line-clamp-2'>
                              {ticket.description}
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {ticket.category}
                              </Badge>
                              {ticket.tags.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className='text-xs text-gray-500'>
                              {ticket.attachments.length > 0 && (
                                <span className='flex items-center gap-1'>
                                  <Tag className='h-3 w-3' />
                                  {ticket.attachments.length} attachment(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='font-medium'>{ticket.customer}</div>
                            <div className='text-sm text-gray-500 flex items-center gap-2'>
                              <Mail className='h-3 w-3' />
                              {ticket.customerEmail}
                            </div>
                            <div className='text-sm text-gray-500 flex items-center gap-2'>
                              <User className='h-3 w-3' />
                              {ticket.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                            <div className='flex items-center gap-1 text-xs text-gray-500'>
                              {getPriorityIcon(ticket.priority)}
                              {ticket.priority} Priority
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              {ticket.assignedTo}
                            </div>
                            <div className='text-xs text-gray-500'>
                              Assigned {ticket.createdAt}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2 text-sm'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              Created: {ticket.createdAt}
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              Updated: {ticket.updatedAt}
                            </div>
                            <div className='flex items-center gap-1'>
                              <MessageSquare className='h-3 w-3' />
                              {ticket.responses} responses
                            </div>
                            <div className='text-xs text-gray-500'>
                              Last: {ticket.lastResponse}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Reply className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Forward className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between mt-6'>
                <div className='text-sm text-gray-500'>
                  Showing 1 to {filteredTickets.length} of {tickets.length}{' '}
                  results
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    Previous
                  </Button>
                  <Button variant='outline' size='sm'>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='open' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AlertCircle className='h-5 w-5' />
                Open Tickets
              </CardTitle>
              <CardDescription>
                Tickets that require immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <MessageSquare className='h-4 w-4' />
                  Respond to Tickets
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Open Tickets Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Response Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Open tickets management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='in-progress' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                In Progress Tickets
              </CardTitle>
              <CardDescription>
                Tickets currently being handled by support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Activity className='h-4 w-4' />
                  Monitor Progress
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Progress Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Performance Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                In-progress tickets management interface will be implemented
                here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='resolved' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5' />
                Resolved Tickets
              </CardTitle>
              <CardDescription>
                Successfully resolved support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4' />
                  Review Resolved
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Resolution Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Success Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Resolved tickets management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='escalated' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5' />
                Escalated Tickets
              </CardTitle>
              <CardDescription>
                Tickets that require escalation to senior staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Handle Escalations
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Escalation Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingDown className='h-4 w-4' />
                  Escalation Trends
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Escalated tickets management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportTickets;
