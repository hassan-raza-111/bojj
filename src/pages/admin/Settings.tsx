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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Shield,
  Users,
  CreditCard,
  Bell,
  Globe,
  Database,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  FileText,
  Download,
  Upload,
  Trash2,
  Plus,
} from 'lucide-react';

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'BOJJ Platform',
    siteDescription: 'Professional job marketplace',
    contactEmail: 'admin@bojj.com',
    contactPhone: '+1-555-0123',
    address: '123 Business St, City, State 12345',
    timezone: 'UTC-5',
    currency: 'USD',
    language: 'en',
    maintenanceMode: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableCaptcha: true,
    ipWhitelist: '',
    sslRequired: true,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    platformFee: 5.0,
    escrowEnabled: true,
    autoReleaseDays: 7,
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    stripeEnabled: true,
    minimumPayout: 50,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    userRegistration: true,
    jobPosting: true,
    paymentReceived: true,
    disputeAlert: true,
  });

  const handleGeneralChange = (field: string, value: any) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: any) => {
    setSecuritySettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: string, value: any) => {
    setPaymentSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: any) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>System Settings</h1>
        <p className='text-blue-100'>
          Configure platform settings, security, and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue='general' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='payments'>Payments</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='advanced'>Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic platform configuration and information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Site Name</label>
                  <Input
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      handleGeneralChange('siteName', e.target.value)
                    }
                    placeholder='Enter site name'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Site Description
                  </label>
                  <Input
                    value={generalSettings.siteDescription}
                    onChange={(e) =>
                      handleGeneralChange('siteDescription', e.target.value)
                    }
                    placeholder='Enter site description'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Contact Email</label>
                  <Input
                    type='email'
                    value={generalSettings.contactEmail}
                    onChange={(e) =>
                      handleGeneralChange('contactEmail', e.target.value)
                    }
                    placeholder='admin@example.com'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Contact Phone</label>
                  <Input
                    value={generalSettings.contactPhone}
                    onChange={(e) =>
                      handleGeneralChange('contactPhone', e.target.value)
                    }
                    placeholder='+1-555-0123'
                  />
                </div>
                <div className='space-y-2 md:col-span-2'>
                  <label className='text-sm font-medium'>Address</label>
                  <Input
                    value={generalSettings.address}
                    onChange={(e) =>
                      handleGeneralChange('address', e.target.value)
                    }
                    placeholder='Enter business address'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Timezone</label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) =>
                      handleGeneralChange('timezone', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='UTC-8'>UTC-8 (PST)</SelectItem>
                      <SelectItem value='UTC-5'>UTC-5 (EST)</SelectItem>
                      <SelectItem value='UTC+0'>UTC+0 (GMT)</SelectItem>
                      <SelectItem value='UTC+1'>UTC+1 (CET)</SelectItem>
                      <SelectItem value='UTC+5:30'>UTC+5:30 (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Currency</label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) =>
                      handleGeneralChange('currency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select currency' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='USD'>USD ($)</SelectItem>
                      <SelectItem value='EUR'>EUR (€)</SelectItem>
                      <SelectItem value='GBP'>GBP (£)</SelectItem>
                      <SelectItem value='JPY'>JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 rounded-lg border'>
                <div>
                  <div className='font-medium'>Maintenance Mode</div>
                  <div className='text-sm text-gray-500'>
                    Enable maintenance mode to restrict access
                  </div>
                </div>
                <Switch
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleGeneralChange('maintenanceMode', checked)
                  }
                />
              </div>

              <div className='flex gap-2 justify-end'>
                <Button variant='outline'>Reset to Default</Button>
                <Button className='flex items-center gap-2'>
                  <Save className='h-4 w-4' />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure platform security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Session Timeout (minutes)
                  </label>
                  <Input
                    type='number'
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      handleSecurityChange(
                        'sessionTimeout',
                        parseInt(e.target.value)
                      )
                    }
                    min='5'
                    max='1440'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Max Login Attempts
                  </label>
                  <Input
                    type='number'
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      handleSecurityChange(
                        'maxLoginAttempts',
                        parseInt(e.target.value)
                      )
                    }
                    min='3'
                    max='10'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Password Min Length
                  </label>
                  <Input
                    type='number'
                    value={securitySettings.passwordMinLength}
                    onChange={(e) =>
                      handleSecurityChange(
                        'passwordMinLength',
                        parseInt(e.target.value)
                      )
                    }
                    min='6'
                    max='20'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>IP Whitelist</label>
                  <Input
                    value={securitySettings.ipWhitelist}
                    onChange={(e) =>
                      handleSecurityChange('ipWhitelist', e.target.value)
                    }
                    placeholder='192.168.1.1, 10.0.0.1'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Two-Factor Authentication</div>
                    <div className='text-sm text-gray-500'>
                      Require 2FA for admin accounts
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      handleSecurityChange('twoFactorAuth', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>
                      Strong Password Requirement
                    </div>
                    <div className='text-sm text-gray-500'>
                      Enforce complex password rules
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.requireStrongPassword}
                    onCheckedChange={(checked) =>
                      handleSecurityChange('requireStrongPassword', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>CAPTCHA Protection</div>
                    <div className='text-sm text-gray-500'>
                      Enable CAPTCHA on login forms
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.enableCaptcha}
                    onCheckedChange={(checked) =>
                      handleSecurityChange('enableCaptcha', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>SSL Required</div>
                    <div className='text-sm text-gray-500'>
                      Force HTTPS connections
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.sslRequired}
                    onCheckedChange={(checked) =>
                      handleSecurityChange('sslRequired', checked)
                    }
                  />
                </div>
              </div>

              <div className='flex gap-2 justify-end'>
                <Button variant='outline'>Reset to Default</Button>
                <Button className='flex items-center gap-2'>
                  <Save className='h-4 w-4' />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='payments' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment processing and fees
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Platform Fee (%)
                  </label>
                  <Input
                    type='number'
                    value={paymentSettings.platformFee}
                    onChange={(e) =>
                      handlePaymentChange(
                        'platformFee',
                        parseFloat(e.target.value)
                      )
                    }
                    min='0'
                    max='20'
                    step='0.1'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Auto Release Days
                  </label>
                  <Input
                    type='number'
                    value={paymentSettings.autoReleaseDays}
                    onChange={(e) =>
                      handlePaymentChange(
                        'autoReleaseDays',
                        parseInt(e.target.value)
                      )
                    }
                    min='1'
                    max='30'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Minimum Payout</label>
                  <Input
                    type='number'
                    value={paymentSettings.minimumPayout}
                    onChange={(e) =>
                      handlePaymentChange(
                        'minimumPayout',
                        parseFloat(e.target.value)
                      )
                    }
                    min='10'
                    step='10'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Supported Currencies
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='Select currencies' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='USD'>USD</SelectItem>
                      <SelectItem value='EUR'>EUR</SelectItem>
                      <SelectItem value='GBP'>GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Escrow Service</div>
                    <div className='text-sm text-gray-500'>
                      Hold payments until job completion
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.escrowEnabled}
                    onCheckedChange={(checked) =>
                      handlePaymentChange('escrowEnabled', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Stripe Integration</div>
                    <div className='text-sm text-gray-500'>
                      Enable Stripe payment processing
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.stripeEnabled}
                    onCheckedChange={(checked) =>
                      handlePaymentChange('stripeEnabled', checked)
                    }
                  />
                </div>
              </div>

              <div className='flex gap-2 justify-end'>
                <Button variant='outline'>Reset to Default</Button>
                <Button className='flex items-center gap-2'>
                  <Save className='h-4 w-4' />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure platform notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Email Notifications</div>
                    <div className='text-sm text-gray-500'>
                      Send notifications via email
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('emailNotifications', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>SMS Notifications</div>
                    <div className='text-sm text-gray-500'>
                      Send notifications via SMS
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('smsNotifications', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Push Notifications</div>
                    <div className='text-sm text-gray-500'>
                      Send push notifications to users
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('pushNotifications', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Admin Alerts</div>
                    <div className='text-sm text-gray-500'>
                      Receive alerts for important events
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.adminAlerts}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('adminAlerts', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>User Registration</div>
                    <div className='text-sm text-gray-500'>
                      Notify admins of new registrations
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.userRegistration}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('userRegistration', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Job Posting</div>
                    <div className='text-sm text-gray-500'>
                      Notify admins of new job postings
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.jobPosting}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('jobPosting', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Payment Received</div>
                    <div className='text-sm text-gray-500'>
                      Notify admins of payments
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentReceived}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('paymentReceived', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg border'>
                  <div>
                    <div className='font-medium'>Dispute Alerts</div>
                    <div className='text-sm text-gray-500'>
                      Notify admins of disputes
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.disputeAlert}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('disputeAlert', checked)
                    }
                  />
                </div>
              </div>

              <div className='flex gap-2 justify-end'>
                <Button variant='outline'>Reset to Default</Button>
                <Button className='flex items-center gap-2'>
                  <Save className='h-4 w-4' />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='advanced' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Database Settings */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='h-5 w-5' />
                  Database Settings
                </CardTitle>
                <CardDescription>
                  Database configuration and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Database Type</label>
                  <div className='text-sm text-gray-500'>PostgreSQL</div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Connection Status
                  </label>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm text-green-600'>Connected</span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Test Connection
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Download className='h-4 w-4 mr-2' />
                    Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Settings */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Key className='h-5 w-5' />
                  API Settings
                </CardTitle>
                <CardDescription>API configuration and keys</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>API Version</label>
                  <div className='text-sm text-gray-500'>v1.0.0</div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Rate Limiting</label>
                  <div className='text-sm text-gray-500'>
                    100 requests per 15 minutes
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    <Key className='h-4 w-4 mr-2' />
                    Generate API Key
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Eye className='h-4 w-4 mr-2' />
                    View Keys
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Info className='h-5 w-5' />
                  System Information
                </CardTitle>
                <CardDescription>
                  Platform version and system details
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Platform Version
                  </label>
                  <div className='text-sm text-gray-500'>1.0.0</div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Node.js Version</label>
                  <div className='text-sm text-gray-500'>18.17.0</div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Database Version
                  </label>
                  <div className='text-sm text-gray-500'>PostgreSQL 15.0</div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Last Updated</label>
                  <div className='text-sm text-gray-500'>
                    2024-01-25 10:30:00
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5' />
                  Maintenance
                </CardTitle>
                <CardDescription>
                  System maintenance and updates
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Cache Status</label>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm text-green-600'>Active</span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Clear Cache
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Upload className='h-4 w-4 mr-2' />
                    Check Updates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
