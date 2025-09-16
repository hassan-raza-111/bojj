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
import { useSupportTickets } from '@/hooks/useSupportTickets';
import TicketDetailsModal from '@/components/admin/TicketDetailsModal';

const SupportTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all-tickets');

  const {
    tickets,
    stats,
    loading,
    error,
    pagination,
    fetchTickets,
    getTicketsByStatus,
  } = useSupportTickets({
    isAdmin: true,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  });

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
      case 'URGENT':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
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
      `${ticket.user.firstName} ${ticket.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDetailsModalOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== 'all-tickets') {
      const status = value.toUpperCase().replace('-', '_');
      getTicketsByStatus(status);
    } else {
      fetchTickets();
    }
  };

  const handleTicketUpdated = () => {
    fetchTickets();
  };

  // Use stats from API or fallback to 0
  const openTickets = stats?.openTickets || 0;
  const inProgressTickets = stats?.inProgressTickets || 0;
  const resolvedTickets = stats?.resolvedTickets || 0;
  const closedTickets = stats?.closedTickets || 0;

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
      <Tabs value={activeTab} onValueChange={handleTabChange} className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='all-tickets'>All Tickets</TabsTrigger>
          <TabsTrigger value='open'>Open</TabsTrigger>
          <TabsTrigger value='in-progress'>In Progress</TabsTrigger>
          <TabsTrigger value='resolved'>Resolved</TabsTrigger>
          <TabsTrigger value='closed'>Closed</TabsTrigger>
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8'>
                          <div className='flex items-center justify-center gap-2'>
                            <Activity className='h-4 w-4 animate-spin' />
                            Loading tickets...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='text-center py-8'>
                          <div className='text-gray-500'>No tickets found</div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
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
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-2'>
                              <div className='font-medium'>
                                {ticket.user.firstName} {ticket.user.lastName}
                              </div>
                              <div className='text-sm text-gray-500 flex items-center gap-2'>
                                <Mail className='h-3 w-3' />
                                {ticket.user.email}
                              </div>
                              <div className='text-xs text-gray-500'>
                                <Badge variant='outline' className='text-xs'>
                                  {ticket.user.role}
                                </Badge>
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
                                {ticket.assignedTo ? 
                                  `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 
                                  'Unassigned'
                                }
                              </div>
                              {ticket.assignedTo && (
                                <div className='text-xs text-gray-500'>
                                  {ticket.assignedTo.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-2 text-sm'>
                              <div className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3' />
                                Created: {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                              <div className='flex items-center gap-1'>
                                <Clock className='h-3 w-3' />
                                Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                              </div>
                              {ticket.resolvedAt && (
                                <div className='flex items-center gap-1'>
                                  <CheckCircle className='h-3 w-3' />
                                  Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Button 
                                variant='ghost' 
                                size='sm'
                                onClick={() => handleTicketClick(ticket)}
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button variant='ghost' size='sm'>
                                <Reply className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between mt-6'>
                <div className='text-sm text-gray-500'>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className='flex gap-2'>
                  <Button 
                    variant='outline' 
                    size='sm'
                    disabled={pagination.page <= 1}
                    onClick={() => {
                      // Handle previous page
                    }}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant='outline' 
                    size='sm'
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => {
                      // Handle next page
                    }}
                  >
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
                Open Tickets ({openTickets})
              </CardTitle>
              <CardDescription>
                Tickets that require immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Activity className='h-6 w-6 animate-spin mr-2' />
                  Loading open tickets...
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  {filteredTickets.length} open tickets found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='in-progress' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                In Progress Tickets ({inProgressTickets})
              </CardTitle>
              <CardDescription>
                Tickets currently being handled by support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Activity className='h-6 w-6 animate-spin mr-2' />
                  Loading in-progress tickets...
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  {filteredTickets.length} in-progress tickets found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='resolved' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5' />
                Resolved Tickets ({resolvedTickets})
              </CardTitle>
              <CardDescription>
                Successfully resolved support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Activity className='h-6 w-6 animate-spin mr-2' />
                  Loading resolved tickets...
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  {filteredTickets.length} resolved tickets found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='closed' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <XCircle className='h-5 w-5' />
                Closed Tickets ({closedTickets})
              </CardTitle>
              <CardDescription>
                Closed support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Activity className='h-6 w-6 animate-spin mr-2' />
                  Loading closed tickets...
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  {filteredTickets.length} closed tickets found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTicket(null);
        }}
        onTicketUpdated={handleTicketUpdated}
      />
    </div>
  );
};

export default SupportTickets;
