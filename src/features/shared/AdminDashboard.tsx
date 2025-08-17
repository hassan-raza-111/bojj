import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar-components";
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  Layers,
  LogOut,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import DashboardOverview from "@/components/admin-dashboard/DashboardOverview";
import VendorRequests from "@/components/admin-dashboard/VendorRequests";
import UserManagement from "@/components/admin-dashboard/UserManagement";
import Payments from "@/components/admin-dashboard/Payments";
import Categories from "@/components/admin-dashboard/Categories";

// --- Reusable Components ---

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <span className="text-4xl mb-2">😕</span>
    <span className="text-lg">{message}</span>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="animate-spin w-8 h-8 text-primary" />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let variant: any = "secondary";
  let label = status;
  if (status === "Approved" || status === "Active" || status === "Completed") {
    variant = "default";
  } else if (status === "Rejected" || status === "Inactive") {
    variant = "destructive";
  } else if (status === "Pending") {
    variant = "secondary";
  } else if (status === "On Hold") {
    variant = "outline";
  }
  return <Badge variant={variant}>{label}</Badge>;
};

const OverviewCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <Card className="flex flex-col items-center justify-center py-6 px-2 sm:px-4 shadow hover:shadow-lg transition-shadow group w-full">
    <CardHeader className="flex flex-col items-center p-0">
      <div className="mb-2 text-primary group-hover:scale-110 transition-transform">{icon}</div>
      <CardTitle className="text-2xl sm:text-3xl font-bold">{value}</CardTitle>
      <CardDescription className="text-sm sm:text-base text-center">{label}</CardDescription>
    </CardHeader>
  </Card>
);

// --- Main Admin Dashboard ---

const initialVendors = [
  { id: 1, name: "Ali Khan", email: "ali@email.com", category: "Plumbing", status: "Pending" },
  { id: 2, name: "Sara Malik", email: "sara@email.com", category: "Cleaning", status: "Pending" },
];
const initialAllVendors = [
  { id: 1, name: "Ali Khan", email: "ali@email.com", category: "Plumbing", status: "Active" },
  { id: 2, name: "Sara Malik", email: "sara@email.com", category: "Cleaning", status: "Inactive" },
];
const initialCustomers = [
  { id: 1, name: "John Doe", email: "john@email.com", date: "2024-06-20", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@email.com", date: "2024-06-22", status: "Active" },
];
const initialCategories = [
  { id: 1, name: "Plumbing", sub: [{ id: 1, name: "Leak Repair" }, { id: 2, name: "Pipe Installation" }] },
  { id: 2, name: "Cleaning", sub: [{ id: 3, name: "Home Cleaning" }, { id: 4, name: "Office Cleaning" }] },
];
const initialPayments = [
  { id: 1, jobId: "J1001", vendor: "Ali Khan", customer: "John Doe", amount: 120, status: "Pending" },
  { id: 2, jobId: "J1002", vendor: "Sara Malik", customer: "Jane Smith", amount: 200, status: "Completed" },
];

// --- Service Categories State (object-based) ---
const initialServiceCategories: Record<string, string[]> = {
  "Home Maintenance and Repairs": [
    "Plumbing",
    "Electrical Work",
    "HVAC Service",
    "Appliance Service",
    "General Handymen Service",
  ],
  "Cleaning Services": [
    "Residential Cleaning",
    "Commercial Cleaning",
    "Window Cleaning",
    "Move-in/Move-out Cleaning",
    "Pest Control Services",
  ],
  "Landscaping and Outdoor Services": [
    "Lawn Mowing and Maintenance",
    "Tree Trimming and Removal",
    "Garden Design and Installation",
    "Seasonal Cleanup",
    "Swimming Pool Cleaning and Maintenance",
  ],
  "Other Services": [
    "Moving Services",
    "Interior Design",
    "Home Security",
    "Smart Home Installation",
    "Home Inspection",
  ],
};

const AdminDashboard: React.FC = () => {
  // State
  const [activeSection, setActiveSection] = useState("overview");
  const [sectionHistory, setSectionHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Vendor Approval
  const [pendingVendors, setPendingVendors] = useState(initialVendors);
  const [vendorActionLoading, setVendorActionLoading] = useState<number | null>(null);

  // Vendors & Customers
  const [allVendors, setAllVendors] = useState(initialAllVendors);
  const [customers, setCustomers] = useState(initialCustomers);
  const [vendorSearch, setVendorSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Categories
  const [categories, setCategories] = useState(initialCategories);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<{ id: number; name: string } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [subModal, setSubModal] = useState(false);
  const [editSub, setEditSub] = useState<{ cat: string; sub: string } | null>(null);
  const [newSub, setNewSub] = useState("");
  const [subError, setSubError] = useState("");

  // Payments
  const [payments, setPayments] = useState(initialPayments);
  const [paymentActionLoading, setPaymentActionLoading] = useState<number | null>(null);

  // --- Category/Subcategory CRUD State ---
  const [serviceCategories, setServiceCategories] = useState(initialServiceCategories);
  const [catAccordion, setCatAccordion] = useState<string | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catError, setCatError] = useState("");
  const [subName, setSubName] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ type: "cat" | "sub"; cat: string; sub?: string } | null>(null);
  const [catLoading, setCatLoading] = useState(false);

  // Toast
  const { toast } = useToast();

  // Overview Stats
  const overviewStats = useMemo(() => [
    { label: "Total Vendors", value: allVendors.length, icon: <Briefcase className="w-5 h-5" /> },
    { label: "Total Customers", value: customers.length, icon: <Users className="w-5 h-5" /> },
    { label: "Jobs Posted", value: 350, icon: <Layers className="w-5 h-5" /> },
    { label: "Payments Pending", value: payments.filter((p) => p.status === "Pending").length, icon: <DollarSign className="w-5 h-5" /> },
  ], [allVendors, customers, payments]);

  // --- Vendor Approval Handlers ---
  const handleApproveVendor = (id: number) => {
    setVendorActionLoading(id);
    setTimeout(() => {
      setPendingVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: "Approved" } : v))
      );
      setAllVendors((prev) => [
        ...prev,
        { ...pendingVendors.find((v) => v.id === id)!, status: "Active" },
      ]);
      setVendorActionLoading(null);
      toast({ title: "Vendor Approved", description: "Vendor has been approved and activated." });
    }, 800);
  };
  const handleRejectVendor = (id: number) => {
    setVendorActionLoading(id);
    setTimeout(() => {
      setPendingVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: "Rejected" } : v))
      );
      setVendorActionLoading(null);
      toast({ title: "Vendor Rejected", description: "Vendor request has been rejected." });
    }, 800);
  };

  // --- Vendor/Customer Table Handlers ---
  const handleToggleVendor = (id: number) => {
    setAllVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: v.status === "Active" ? "Inactive" : "Active" }
          : v
      )
    );
    toast({
      title: "Vendor Status Updated",
      description: "Vendor account status has been changed.",
    });
  };
  const handleToggleCustomer = (id: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" }
          : c
      )
    );
    toast({
      title: "Customer Status Updated",
      description: "Customer account status has been changed.",
    });
  };

  // --- Category CRUD ---
  const handleAddCategory = () => {
    if (!catName.trim()) {
      setCatError("Category name is required.");
      return;
    }
    setCatLoading(true);
    setTimeout(() => {
      setServiceCategories((prev) => ({ ...prev, [catName.trim()]: [] }));
      setCatName("");
      setCatModal(false);
      setCatError("");
      setCatLoading(false);
      toast({ title: "Category Added", description: "New category has been added." });
    }, 500);
  };
  const handleEditCategory = () => {
    if (!editCat || !catName.trim()) {
      setCatError("Category name is required.");
      return;
    }
    setCatLoading(true);
    setTimeout(() => {
      setServiceCategories((prev) => {
        const {[editCat]: oldSubs, ...rest} = prev;
        return { ...rest, [catName.trim()]: oldSubs };
      });
      setEditCat(null);
      setCatModal(false);
      setCatError("");
      setCatLoading(false);
      toast({ title: "Category Updated", description: "Category name has been updated." });
    }, 500);
  };
  const handleDeleteCategory = (cat: string) => {
    setCatLoading(true);
    setTimeout(() => {
      setServiceCategories((prev) => {
        const { [cat]: _, ...rest } = prev;
        return rest;
      });
      setDeleteModal(null);
      setCatLoading(false);
      toast({ title: "Category Deleted", description: "Category has been deleted." });
    }, 500);
  };

  // --- Subcategory CRUD ---
  const handleAddSub = (cat: string) => {
    if (!subName.trim()) {
      setSubError("Subcategory name is required.");
      return;
    }
    setCatLoading(true);
    setTimeout(() => {
      setServiceCategories((prev) => ({
        ...prev,
        [cat]: [...prev[cat], subName.trim()],
      }));
      setSubName("");
      setSubModal(false);
      setSubError("");
      setCatLoading(false);
      toast({ title: "Subcategory Added", description: "New subcategory has been added." });
    }, 500);
  };
  const handleEditSub = () => {
    if (!editSub || !subName.trim()) {
      setSubError("Subcategory name is required.");
      return;
    }
    setCatLoading(true);
    setTimeout(() => {
      setServiceCategories((prev) => ({
        ...prev,
        [editSub.cat]: prev[editSub.cat].map((s) => (s === editSub.sub ? subName.trim() : s)),
      }));
      setEditSub(null);
      setSubModal(false);
      setSubError("");
      setCatLoading(false);
      toast({ title: "Subcategory Updated", description: "Subcategory name has been updated." });
    }, 500);
  };
  const handleDeleteSub = (cat: string, sub: string) => {
    setCatLoading(true);
    setTimeout(() => {
      setServiceCategories((prev) => ({
        ...prev,
        [cat]: prev[cat].filter((s) => s !== sub),
      }));
      setDeleteModal(null);
      setCatLoading(false);
      toast({ title: "Subcategory Deleted", description: "Subcategory has been deleted." });
    }, 500);
  };

  // --- Payment Handlers ---
  const handleConfirmPayment = (id: number) => {
    setPaymentActionLoading(id);
    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "Completed" } : p
        )
      );
      setPaymentActionLoading(null);
      toast({ title: "Payment Confirmed", description: "Payment has been marked as completed." });
    }, 800);
  };
  const handleReleasePayment = (id: number) => {
    setPaymentActionLoading(id);
    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "Completed" } : p
        )
      );
      setPaymentActionLoading(null);
      toast({ title: "Payment Released", description: "Payment has been released." });
    }, 800);
  };

  // --- Filtered Data ---
  const filteredVendors = allVendors.filter((v) =>
    [v.name, v.email, v.category].join(" ").toLowerCase().includes(vendorSearch.toLowerCase())
  );
  const filteredCustomers = customers.filter((c) =>
    [c.name, c.email].join(" ").toLowerCase().includes(customerSearch.toLowerCase())
  );

  // --- Sidebar Section Navigation ---
  const handleSectionChange = (section: string) => {
    setSectionHistory((prev) =>
      prev.length === 0 || prev[prev.length - 1] !== activeSection
        ? [...prev, activeSection]
        : prev
    );
    setActiveSection(section);
    setSidebarOpen(false);
  };
  const handleSidebarBack = () => {
    setSectionHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setActiveSection(last);
      return prev.slice(0, -1);
    });
  };

  // --- Render ---
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
        {/* Mobile Top Navbar */}
        <div className="md:hidden sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-border flex items-center justify-between px-4 py-2">
          <span className="text-base font-semibold text-primary">BOJJ Admin</span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg bg-muted hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary transition"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6 text-primary" />
          </button>
        </div>

        {/* Sidebar: drawer on mobile, sticky on desktop */}
        {/* Overlay for mobile drawer */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setSidebarOpen(false)}
        ></div>
        <aside
          className={`
            fixed z-50 top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-border flex flex-col shadow-md
            transition-transform duration-200 md:static md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{ zIndex: 60 }}
        >
          <div className="flex items-center h-16 border-b border-border px-4">
            <span className="text-2xl font-bold text-primary">BOJJ Admin</span>
            <button
              type="button"
              onClick={handleSidebarBack}
              className="ml-3 hidden md:inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-border disabled:opacity-50"
              aria-label="Back"
              disabled={sectionHistory.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="ml-auto md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-border"
              aria-label="Close sidebar"
              style={{ marginRight: 8 }}
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-2 md:space-y-1 px-2">
              {[
                { label: "Dashboard Overview", icon: <Home />, key: "overview" },
                { label: "Vendor Requests", icon: <Check />, key: "vendorRequests" },
                { label: "User Management", icon: <Users />, key: "userManagement" },
                { label: "Payments", icon: <DollarSign />, key: "payments" },
                { label: "Categories", icon: <Layers />, key: "categories" },
              ].map((item) => (
                <li key={item.key}>
                  <Button
                    variant={activeSection === item.key ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 px-4 py-3 md:py-2 rounded-lg text-base md:text-sm"
                    onClick={() => handleSectionChange(item.key)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 w-full max-w-full px-2 sm:px-4 md:px-8 py-4 md:py-8 mx-auto">
          {/* Overview Cards */}
          {activeSection === "overview" && (
            <DashboardOverview overviewStats={overviewStats} />
          )}

          {/* Vendor Approval Panel */}
          {activeSection === "vendorRequests" && (
            <VendorRequests
              pendingVendors={pendingVendors}
              loading={loading}
              vendorActionLoading={vendorActionLoading}
              handleApproveVendor={handleApproveVendor}
              handleRejectVendor={handleRejectVendor}
            />
          )}

          {/* Vendors & Customers Table */}
          {activeSection === "userManagement" && (
            <UserManagement
              filteredVendors={filteredVendors}
              filteredCustomers={filteredCustomers}
              vendorSearch={vendorSearch}
              setVendorSearch={setVendorSearch}
              customerSearch={customerSearch}
              setCustomerSearch={setCustomerSearch}
              handleToggleVendor={handleToggleVendor}
              handleToggleCustomer={handleToggleCustomer}
            />
          )}

          {/* Category + Subcategory Manager */}
          {activeSection === "categories" && (
            <Categories
              serviceCategories={serviceCategories}
              setServiceCategories={setServiceCategories}
              catModal={catModal}
              setCatModal={setCatModal}
              editCat={editCat}
              setEditCat={setEditCat}
              catName={catName}
              setCatName={setCatName}
              catError={catError}
              setCatError={setCatError}
              catLoading={catLoading}
              subModal={subModal}
              setSubModal={setSubModal}
              editSub={editSub}
              setEditSub={setEditSub}
              subName={subName}
              setSubName={setSubName}
              subError={subError}
              setSubError={setSubError}
              deleteModal={deleteModal}
              setDeleteModal={setDeleteModal}
              handleAddCategory={handleAddCategory}
              handleEditCategory={handleEditCategory}
              handleDeleteCategory={handleDeleteCategory}
              handleAddSub={handleAddSub}
              handleEditSub={handleEditSub}
              handleDeleteSub={handleDeleteSub}
            />
          )}

          {/* Payment Oversight */}
          {activeSection === "payments" && (
            <Payments
              payments={payments}
              paymentActionLoading={paymentActionLoading}
              handleConfirmPayment={handleConfirmPayment}
              handleReleasePayment={handleReleasePayment}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard; 