import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  userId: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

interface UseSupportTicketsOptions {
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
  isAdmin?: boolean;
  userId?: string;
}

export const useSupportTickets = (options: UseSupportTicketsOptions = {}) => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        status,
        priority,
        category,
        page = 1,
        limit = 20,
        isAdmin = false,
        userId,
      } = options;

      let response;
      if (isAdmin) {
        response = await apiService.support.getAdminTickets(
          status,
          priority,
          category,
          page,
          limit
        );
      } else {
        response = await apiService.support.getTickets(
          userId,
          status,
          page,
          limit
        );
      }

      if (response.success) {
        setTickets(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch tickets');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [
    options.status,
    options.priority,
    options.category,
    options.page,
    options.limit,
    options.isAdmin,
    options.userId,
    toast,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.support.getAdminStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch ticket stats:', err);
    }
  }, []);

  const fetchTicketById = useCallback(
    async (id: string): Promise<Ticket | null> => {
      try {
        const response = await apiService.support.getTicketById(id);
        if (response.success) {
          return response.data;
        }
        return null;
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch ticket details',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const createTicket = useCallback(
    async (ticketData: any): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await apiService.support.createTicket(ticketData);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Ticket created successfully',
          });
          await fetchTickets();
          return true;
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to create ticket',
            variant: 'destructive',
          });
          return false;
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to create ticket',
          variant: 'destructive',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets, toast]
  );

  const updateTicket = useCallback(
    async (id: string, ticketData: any): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await apiService.support.updateTicket(id, ticketData);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Ticket updated successfully',
          });
          await fetchTickets();
          return true;
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to update ticket',
            variant: 'destructive',
          });
          return false;
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to update ticket',
          variant: 'destructive',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets, toast]
  );

  const deleteTicket = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await apiService.support.deleteTicket(id);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Ticket deleted successfully',
          });
          await fetchTickets();
          return true;
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to delete ticket',
            variant: 'destructive',
          });
          return false;
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete ticket',
          variant: 'destructive',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets, toast]
  );

  const assignTicket = useCallback(
    async (id: string, assignedToId: string): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await apiService.support.assignTicket(
          id,
          assignedToId
        );
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Ticket assigned successfully',
          });
          await fetchTickets();
          return true;
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to assign ticket',
            variant: 'destructive',
          });
          return false;
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to assign ticket',
          variant: 'destructive',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets, toast]
  );

  const getTicketsByStatus = useCallback(
    async (status: string, page = 1, limit = 10) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.support.getAdminTicketsByStatus(
          status,
          page,
          limit
        );
        if (response.success) {
          setTickets(response.data);
          setPagination(response.pagination);
        } else {
          setError(response.message || 'Failed to fetch tickets');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tickets');
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch tickets',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    // Only fetch tickets if we have a userId (for customer/vendor) or if it's admin
    if (options.userId || options.isAdmin) {
      fetchTickets();
    }
  }, [fetchTickets, options.userId, options.isAdmin]);

  useEffect(() => {
    if (options.isAdmin) {
      fetchStats();
    }
  }, [fetchStats, options.isAdmin]);

  return {
    tickets,
    stats,
    loading,
    error,
    pagination,
    fetchTickets,
    fetchStats,
    fetchTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    getTicketsByStatus,
  };
};
