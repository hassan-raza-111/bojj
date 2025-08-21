import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  Shield,
  CreditCard,
  Users,
  Globe,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  status: 'active' | 'inactive';
  lastLogin?: string;
  permissions: string[];
  createdAt: string;
  actionLoading?: boolean;
}

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

interface SecuritySettings {
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorRequired: boolean;
  ipWhitelist: string[];
}

interface PaymentSettings {
  defaultCurrency: string;
  supportedCurrencies: string[];
  escrowFeePercentage: number;
  platformFeePercentage: number;
  minimumWithdrawal: number;
  maximumWithdrawal: number;
  autoReleaseDays: number;
  disputeResolutionDays: number;
}

const SettingsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('platform');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const { toast } = useToast();

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteName: 'BOJJ Platform',
    siteDescription: 'Professional service marketplace',
    contactEmail: 'support@bojj.com',
    supportPhone: '+92-300-1234567',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    ipWhitelist: ['127.0.0.1', '::1'],
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    defaultCurrency: 'PKR',
    supportedCurrencies: ['PKR', 'USD', 'EUR', 'GBP'],
    escrowFeePercentage: 2.5,
    platformFeePercentage: 5.0,
    minimumWithdrawal: 1000,
    maximumWithdrawal: 100000,
    autoReleaseDays: 7,
    disputeResolutionDays: 14,
  });

  // Mock admin users data
  const mockAdminUsers: AdminUser[] = [
    {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bojj.com',
      role: 'super_admin',
      status: 'active',
      lastLogin: '2024-01-21T10:30:00Z',
      permissions: ['all'],
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      firstName: 'Moderator',
      lastName: 'User',
      email: 'moderator@bojj.com',
      role: 'moderator',
      status: 'active',
      lastLogin: '2024-01-20T15:45:00Z',
      permissions: ['users', 'jobs', 'payments'],
      createdAt: '2024-01-05',
    },
  ];

  const fetchAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/settings/admin-users',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdminUsers(
            data.data.map((user: AdminUser) => ({
              ...user,
              actionLoading: false,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setAdminUsers(
        mockAdminUsers.map((user) => ({ ...user, actionLoading: false }))
      );
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.data.platform) setPlatformSettings(data.data.platform);
          if (data.data.security) setSecuritySettings(data.data.security);
          if (data.data.payment) setPaymentSettings(data.data.payment);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default mock data
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async (type: 'platform' | 'security' | 'payment') => {
    setSavingSettings(true);
    try {
      let settingsData;
      switch (type) {
        case 'platform':
          settingsData = { platform: platformSettings };
          break;
        case 'security':
          settingsData = { security: securitySettings };
          break;
        case 'payment':
          settingsData = { payment: paymentSettings };
          break;
      }

      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(settingsData),
      });

      if (response.ok) {
        toast({
          title: '✅ Settings Saved',
          description: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } settings have been updated successfully`,
        });
      } else {
        throw new Error(`Failed to save ${type} settings`);
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: `Failed to save ${type} settings`,
        variant: 'destructive',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleAdminStatus = async (
    adminId: string,
    newStatus: 'active' | 'inactive'
  ) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === adminId ? { ...u, actionLoading: true } : u))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/settings/admin-users/${adminId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast({
          title: `✅ Admin Status Updated`,
          description: `Admin user status changed to ${newStatus}`,
        });
        fetchAdminUsers();
      } else {
        throw new Error(`Failed to update admin status to ${newStatus}`);
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update admin status',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    fetchAdminUsers();
    fetchSettings();
  }, []);

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='platform' className='flex items-center space-x-2'>
            <Globe className='h-4 w-4' />
            <span className='hidden sm:inline'>Platform</span>
          </TabsTrigger>
          <TabsTrigger value='security' className='flex items-center space-x-2'>
            <Shield className='h-4 w-4' />
            <span className='hidden sm:inline'>Security</span>
          </TabsTrigger>
          <TabsTrigger value='payment' className='flex items-center space-x-2'>
            <CreditCard className='h-4 w-4' />
            <span className='hidden sm:inline'>Payment</span>
          </TabsTrigger>
          <TabsTrigger
            value='admin-users'
            className='flex items-center space-x-2'
          >
            <Users className='h-4 w-4' />
            <span className='hidden sm:inline'>Admin Users</span>
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value='platform' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Globe className='h-5 w-5' />
                <span>Platform Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='siteName'>Site Name</Label>
                  <Input
                    id='siteName'
                    value={platformSettings.siteName}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        siteName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='contactEmail'>Contact Email</Label>
                  <Input
                    id='contactEmail'
                    type='email'
                    value={platformSettings.contactEmail}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='supportPhone'>Support Phone</Label>
                  <Input
                    id='supportPhone'
                    value={platformSettings.supportPhone}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        supportPhone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maxFileSize'>Max File Size (MB)</Label>
                  <Input
                    id='maxFileSize'
                    type='number'
                    value={platformSettings.maxFileSize}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        maxFileSize: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='siteDescription'>Site Description</Label>
                <Textarea
                  id='siteDescription'
                  value={platformSettings.siteDescription}
                  onChange={(e) =>
                    setPlatformSettings((prev) => ({
                      ...prev,
                      siteDescription: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='allowedFileTypes'>Allowed File Types</Label>
                <Input
                  id='allowedFileTypes'
                  value={platformSettings.allowedFileTypes.join(', ')}
                  onChange={(e) =>
                    setPlatformSettings((prev) => ({
                      ...prev,
                      allowedFileTypes: e.target.value
                        .split(',')
                        .map((t) => t.trim()),
                    }))
                  }
                  placeholder='jpg, png, pdf, doc, docx'
                />
              </div>

              <div className='flex items-center space-x-6'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='maintenanceMode'
                    checked={platformSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        maintenanceMode: checked,
                      }))
                    }
                  />
                  <Label htmlFor='maintenanceMode'>Maintenance Mode</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='registrationEnabled'
                    checked={platformSettings.registrationEnabled}
                    onCheckedChange={(checked) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        registrationEnabled: checked,
                      }))
                    }
                  />
                  <Label htmlFor='registrationEnabled'>
                    Enable Registration
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='emailVerificationRequired'
                    checked={platformSettings.emailVerificationRequired}
                    onCheckedChange={(checked) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        emailVerificationRequired: checked,
                      }))
                    }
                  />
                  <Label htmlFor='emailVerificationRequired'>
                    Require Email Verification
                  </Label>
                </div>
              </div>

              <Button
                onClick={() => saveSettings('platform')}
                disabled={savingSettings}
                className='w-full md:w-auto'
              >
                {savingSettings ? (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                ) : (
                  <Save className='h-4 w-4 mr-2' />
                )}
                Save Platform Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Shield className='h-5 w-5' />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='passwordMinLength'>
                    Minimum Password Length
                  </Label>
                  <Input
                    id='passwordMinLength'
                    type='number'
                    value={securitySettings.passwordMinLength}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        passwordMinLength: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='sessionTimeout'>
                    Session Timeout (hours)
                  </Label>
                  <Input
                    id='sessionTimeout'
                    type='number'
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        sessionTimeout: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maxLoginAttempts'>Max Login Attempts</Label>
                  <Input
                    id='maxLoginAttempts'
                    type='number'
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        maxLoginAttempts: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='autoReleaseDays'>Auto Release Days</Label>
                  <Input
                    id='autoReleaseDays'
                    type='number'
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        sessionTimeout: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className='flex items-center space-x-6'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='requireSpecialChars'
                    checked={securitySettings.requireSpecialChars}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        requireSpecialChars: checked,
                      }))
                    }
                  />
                  <Label htmlFor='requireSpecialChars'>
                    Require Special Characters
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='requireNumbers'
                    checked={securitySettings.requireNumbers}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        requireNumbers: checked,
                      }))
                    }
                  />
                  <Label htmlFor='requireNumbers'>Require Numbers</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='requireUppercase'
                    checked={securitySettings.requireUppercase}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        requireUppercase: checked,
                      }))
                    }
                  />
                  <Label htmlFor='requireUppercase'>Require Uppercase</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='twoFactorRequired'
                    checked={securitySettings.twoFactorRequired}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        twoFactorRequired: checked,
                      }))
                    }
                  />
                  <Label htmlFor='twoFactorRequired'>
                    Require Two-Factor Authentication
                  </Label>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='ipWhitelist'>IP Whitelist</Label>
                <Input
                  id='ipWhitelist'
                  value={securitySettings.ipWhitelist.join(', ')}
                  onChange={(e) =>
                    setSecuritySettings((prev) => ({
                      ...prev,
                      ipWhitelist: e.target.value
                        .split(',')
                        .map((ip) => ip.trim()),
                    }))
                  }
                  placeholder='127.0.0.1, ::1'
                />
              </div>

              <Button
                onClick={() => saveSettings('security')}
                disabled={savingSettings}
                className='w-full md:w-auto'
              >
                {savingSettings ? (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                ) : (
                  <Save className='h-4 w-4 mr-2' />
                )}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value='payment' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <CreditCard className='h-5 w-5' />
                <span>Payment Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='defaultCurrency'>Default Currency</Label>
                  <Select
                    value={paymentSettings.defaultCurrency}
                    onValueChange={(value) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        defaultCurrency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentSettings.supportedCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='escrowFeePercentage'>Escrow Fee (%)</Label>
                  <Input
                    id='escrowFeePercentage'
                    type='number'
                    step='0.1'
                    value={paymentSettings.escrowFeePercentage}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        escrowFeePercentage: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='platformFeePercentage'>
                    Platform Fee (%)
                  </Label>
                  <Input
                    id='platformFeePercentage'
                    type='number'
                    step='0.1'
                    value={paymentSettings.platformFeePercentage}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        platformFeePercentage: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='minimumWithdrawal'>Minimum Withdrawal</Label>
                  <Input
                    id='minimumWithdrawal'
                    type='number'
                    value={paymentSettings.minimumWithdrawal}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        minimumWithdrawal: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maximumWithdrawal'>Maximum Withdrawal</Label>
                  <Input
                    id='maximumWithdrawal'
                    type='number'
                    value={paymentSettings.maximumWithdrawal}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        maximumWithdrawal: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='autoReleaseDays'>Auto Release Days</Label>
                  <Input
                    id='autoReleaseDays'
                    type='number'
                    value={paymentSettings.autoReleaseDays}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        autoReleaseDays: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='disputeResolutionDays'>
                    Dispute Resolution Days
                  </Label>
                  <Input
                    id='disputeResolutionDays'
                    type='number'
                    value={paymentSettings.disputeResolutionDays}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        disputeResolutionDays: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='supportedCurrencies'>
                  Supported Currencies
                </Label>
                <Input
                  id='supportedCurrencies'
                  value={paymentSettings.supportedCurrencies.join(', ')}
                  onChange={(e) =>
                    setPaymentSettings((prev) => ({
                      ...prev,
                      supportedCurrencies: e.target.value
                        .split(',')
                        .map((c) => c.trim()),
                    }))
                  }
                  placeholder='PKR, USD, EUR, GBP'
                />
              </div>

              <Button
                onClick={() => saveSettings('payment')}
                disabled={savingSettings}
                className='w-full md:w-auto'
              >
                {savingSettings ? (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                ) : (
                  <Save className='h-4 w-4 mr-2' />
                )}
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Users Management */}
        <TabsContent value='admin-users' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center space-x-2'>
                  <Users className='h-5 w-5' />
                  <span>Admin Users Management</span>
                </CardTitle>
                <Button onClick={() => setShowAddAdmin(true)}>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Admin User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {adminUsersLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                              <span className='text-blue-600 font-semibold text-sm'>
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className='font-medium'>
                                {user.firstName} {user.lastName}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setEditingAdmin(user)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant={
                                user.status === 'active' ? 'outline' : 'default'
                              }
                              size='sm'
                              onClick={() =>
                                handleToggleAdminStatus(
                                  user.id,
                                  user.status === 'active'
                                    ? 'inactive'
                                    : 'active'
                                )
                              }
                              disabled={user.actionLoading}
                            >
                              {user.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : user.status === 'active' ? (
                                <XCircle className='h-4 w-4' />
                              ) : (
                                <CheckCircle className='h-4 w-4' />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Admin User Dialog */}
      <Dialog
        open={showAddAdmin || !!editingAdmin}
        onOpenChange={() => {
          setShowAddAdmin(false);
          setEditingAdmin(null);
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? 'Edit Admin User' : 'Add New Admin User'}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin
                ? 'Update the admin user information and permissions.'
                : 'Create a new admin user with specific role and permissions.'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  defaultValue={editingAdmin?.firstName || ''}
                  placeholder='Enter first name'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  defaultValue={editingAdmin?.lastName || ''}
                  placeholder='Enter last name'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                defaultValue={editingAdmin?.email || ''}
                placeholder='Enter email address'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select defaultValue={editingAdmin?.role || 'moderator'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='moderator'>Moderator</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='super_admin'>Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setShowAddAdmin(false);
                  setEditingAdmin(null);
                }}
              >
                Cancel
              </Button>
              <Button>{editingAdmin ? 'Update User' : 'Add User'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsManagement;
