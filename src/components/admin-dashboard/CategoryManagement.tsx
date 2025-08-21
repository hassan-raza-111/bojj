import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Check,
  X,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Loader2,
  Shield,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Layers,
  Tag,
  Settings,
  Users,
  Briefcase,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'main' | 'sub';
  parentId?: string;
  parentName?: string;
  status: 'active' | 'inactive';
  totalServices?: number;
  totalVendors?: number;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  actionLoading?: boolean;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  // Mock data for fallback
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Web Development',
      description: 'Custom website development and web applications',
      type: 'main',
      status: 'active',
      totalServices: 45,
      totalVendors: 28,
      icon: '🌐',
      color: '#3B82F6',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'React Development',
      description: 'React.js and React Native development services',
      type: 'sub',
      parentId: '1',
      parentName: 'Web Development',
      status: 'active',
      totalServices: 23,
      totalVendors: 18,
      icon: '⚛️',
      color: '#61DAFB',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-15',
    },
    {
      id: '3',
      name: 'Graphic Design',
      description: 'Logo design, branding, and visual identity',
      type: 'main',
      status: 'active',
      totalServices: 32,
      totalVendors: 25,
      icon: '🎨',
      color: '#10B981',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
    },
    {
      id: '4',
      name: 'Logo Design',
      description: 'Professional logo design services',
      type: 'sub',
      parentId: '3',
      parentName: 'Graphic Design',
      status: 'active',
      totalServices: 18,
      totalVendors: 15,
      icon: '🖼️',
      color: '#F59E0B',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-12',
    },
    {
      id: '5',
      name: 'Mobile Development',
      description: 'iOS and Android app development',
      type: 'main',
      status: 'active',
      totalServices: 28,
      totalVendors: 22,
      icon: '📱',
      color: '#8B5CF6',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-08',
    },
    {
      id: '6',
      name: 'Content Writing',
      description: 'Blog posts, articles, and copywriting',
      type: 'main',
      status: 'inactive',
      totalServices: 15,
      totalVendors: 12,
      icon: '✍️',
      color: '#EF4444',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-05',
    },
  ];

  // Filtered categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      category.description
        ?.toLowerCase()
        .includes(categorySearchQuery.toLowerCase());
    const matchesType =
      categoryTypeFilter === 'all' || category.type === categoryTypeFilter;
    return matchesSearch && matchesType;
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/categories',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(
            data.data.map((category: Category) => ({
              ...category,
              actionLoading: false,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use mock data as fallback
      setCategories(
        mockCategories.map((category) => ({
          ...category,
          actionLoading: false,
        }))
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Handle category status toggle
  const handleToggleCategoryStatus = async (
    categoryId: string,
    newStatus: 'active' | 'inactive'
  ) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, actionLoading: true } : c))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/categories/${categoryId}/status`,
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
          title: `✅ Category ${
            newStatus === 'active' ? 'Activated' : 'Deactivated'
          }`,
          description: `Category status updated to ${newStatus}`,
        });
        fetchCategories();
      } else {
        throw new Error(`Failed to update category status to ${newStatus}`);
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update category status',
        variant: 'destructive',
      });
    }
  };

  // Handle view category details
  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryDetails(true);
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowAddCategory(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, actionLoading: true } : c))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: '✅ Category Deleted',
          description: 'Category has been successfully deleted',
        });
        fetchCategories();
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'main':
        return 'default';
      case 'sub':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Category Management
          </h3>
          <p className='text-sm text-gray-600'>
            Manage service categories and subcategories
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setShowAddCategory(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Category
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' size='sm'>
            <Upload className='h-4 w-4 mr-2' />
            Import
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search categories by name or description...'
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={categoryTypeFilter}
              onValueChange={setCategoryTypeFilter}
            >
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue placeholder='Filter by type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='main'>Main Categories</SelectItem>
                <SelectItem value='sub'>Sub Categories</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Categories ({filteredCategories.length})</span>
            <Button variant='outline' size='sm' onClick={fetchCategories}>
              <RotateCcw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
              <span className='ml-2 text-gray-600'>Loading categories...</span>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Vendors</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className='flex items-center space-x-3'>
                          <div
                            className='w-10 h-10 rounded-lg flex items-center justify-center text-lg'
                            style={{
                              backgroundColor: category.color + '20',
                              color: category.color,
                            }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {category.name}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {category.description}
                            </p>
                            {category.type === 'sub' && category.parentName && (
                              <p className='text-xs text-gray-400'>
                                Parent: {category.parentName}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(category.type)}>
                          {category.type === 'main' ? (
                            <Layers className='h-3 w-3 mr-1' />
                          ) : (
                            <Tag className='h-3 w-3 mr-1' />
                          )}
                          {category.type.charAt(0).toUpperCase() +
                            category.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(category.status)}>
                          {category.status === 'active' ? (
                            <Check className='h-3 w-3 mr-1' />
                          ) : (
                            <X className='h-3 w-3 mr-1' />
                          )}
                          {category.status.charAt(0).toUpperCase() +
                            category.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p className='font-medium'>
                            {category.totalServices}
                          </p>
                          <p className='text-gray-500'>Services</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p className='font-medium'>{category.totalVendors}</p>
                          <p className='text-gray-500'>Vendors</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewCategory(category)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>

                          {category.status === 'active' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleToggleCategoryStatus(
                                  category.id,
                                  'inactive'
                                )
                              }
                              disabled={category.actionLoading}
                              className='text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                            >
                              {category.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <X className='h-4 w-4' />
                              )}
                            </Button>
                          )}

                          {category.status === 'inactive' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleToggleCategoryStatus(
                                  category.id,
                                  'active'
                                )
                              }
                              disabled={category.actionLoading}
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              {category.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <Check className='h-4 w-4' />
                              )}
                            </Button>
                          )}

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={category.actionLoading}
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                          >
                            {category.actionLoading ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <Trash2 className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!categoriesLoading && filteredCategories.length === 0 && (
            <div className='text-center py-8'>
              <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>
                No categories found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Details Dialog */}
      <Dialog open={showCategoryDetails} onOpenChange={setShowCategoryDetails}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedCategory?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedCategory && (
            <div className='space-y-6'>
              {/* Basic Info */}
              <div className='flex items-center space-x-4'>
                <div
                  className='w-16 h-16 rounded-lg flex items-center justify-center text-3xl'
                  style={{
                    backgroundColor: selectedCategory.color + '20',
                    color: selectedCategory.color,
                  }}
                >
                  {selectedCategory.icon}
                </div>
                <div>
                  <h3 className='text-xl font-semibold'>
                    {selectedCategory.name}
                  </h3>
                  <p className='text-gray-600'>
                    {selectedCategory.description}
                  </p>
                  <div className='flex items-center space-x-4 mt-2'>
                    <Badge
                      variant={getStatusBadgeVariant(selectedCategory.status)}
                    >
                      {selectedCategory.status.charAt(0).toUpperCase() +
                        selectedCategory.status.slice(1)}
                    </Badge>
                    <Badge variant={getTypeBadgeVariant(selectedCategory.type)}>
                      {selectedCategory.type.charAt(0).toUpperCase() +
                        selectedCategory.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-600'>Total Services</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {selectedCategory.totalServices}
                  </p>
                </div>
                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-600'>Total Vendors</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {selectedCategory.totalVendors}
                  </p>
                </div>
                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-600'>Category Type</p>
                  <p className='text-lg font-medium text-gray-900'>
                    {selectedCategory.type === 'main'
                      ? 'Main Category'
                      : 'Sub Category'}
                  </p>
                </div>
              </div>

              {/* Parent Category */}
              {selectedCategory.type === 'sub' &&
                selectedCategory.parentName && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Parent Category
                    </h4>
                    <div className='flex items-center space-x-2 p-3 bg-blue-50 rounded-lg'>
                      <Layers className='h-4 w-4 text-blue-600' />
                      <span className='font-medium text-blue-900'>
                        {selectedCategory.parentName}
                      </span>
                    </div>
                  </div>
                )}

              {/* Dates */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Created Date</p>
                  <p className='font-medium'>
                    {new Date(selectedCategory.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Last Updated</p>
                  <p className='font-medium'>
                    {new Date(selectedCategory.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => {
                    handleEditCategory(selectedCategory);
                    setShowCategoryDetails(false);
                  }}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Category
                </Button>

                {selectedCategory.status === 'active' && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      handleToggleCategoryStatus(
                        selectedCategory.id,
                        'inactive'
                      );
                      setShowCategoryDetails(false);
                    }}
                    className='border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                  >
                    <X className='h-4 w-4 mr-2' />
                    Deactivate
                  </Button>
                )}

                {selectedCategory.status === 'inactive' && (
                  <Button
                    onClick={() => {
                      handleToggleCategoryStatus(selectedCategory.id, 'active');
                      setShowCategoryDetails(false);
                    }}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <Check className='h-4 w-4 mr-2' />
                    Activate
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update category information'
                : 'Create a new service category'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>
                Category Name
              </label>
              <Input
                placeholder='Enter category name'
                defaultValue={editingCategory?.name}
                className='mt-1'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Description
              </label>
              <Input
                placeholder='Enter category description'
                defaultValue={editingCategory?.description}
                className='mt-1'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Category Type
              </label>
              <Select defaultValue={editingCategory?.type || 'main'}>
                <SelectTrigger className='mt-1'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='main'>Main Category</SelectItem>
                  <SelectItem value='sub'>Sub Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Status
              </label>
              <Select defaultValue={editingCategory?.status || 'active'}>
                <SelectTrigger className='mt-1'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Icon (Emoji)
              </label>
              <Input
                placeholder='🌐'
                defaultValue={editingCategory?.icon}
                className='mt-1'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Color (Hex)
              </label>
              <Input
                placeholder='#3B82F6'
                defaultValue={editingCategory?.color}
                className='mt-1'
              />
            </div>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button variant='outline' onClick={() => setShowAddCategory(false)}>
              Cancel
            </Button>
            <Button>
              {editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;
