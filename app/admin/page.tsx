"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Search, 
  FileCheck, 
  Ban, 
  RefreshCw,
  Download,
  Eye
} from "lucide-react";

// Placeholder data for demonstration
const ORDERS_DATA = [
  {
    id: "ORD-001",
    customer: "John Smith",
    seller: "Elite Tailors",
    date: "2023-11-10",
    total: 249.99,
    status: "completed",
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    seller: "Fashion Studio",
    date: "2023-11-12",
    total: 129.50,
    status: "in_progress",
  },
  {
    id: "ORD-003",
    customer: "Michael Brown",
    seller: "Custom Suits Co.",
    date: "2023-11-14",
    total: 599.99,
    status: "pending",
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    seller: "Stitch Perfect",
    date: "2023-11-15",
    total: 349.75,
    status: "canceled",
  },
  {
    id: "ORD-005",
    customer: "Robert Wilson",
    seller: "Tailor Masters",
    date: "2023-11-16",
    total: 189.99,
    status: "completed",
  },
  {
    id: "ORD-006",
    customer: "Jennifer Lee",
    seller: "Premium Fabrics",
    date: "2023-11-17",
    total: 279.50,
    status: "disputed",
  },
  {
    id: "ORD-007",
    customer: "David Martinez",
    seller: "Elite Tailors",
    date: "2023-11-18",
    total: 159.99,
    status: "in_progress",
  },
  {
    id: "ORD-008",
    customer: "Amanda Taylor",
    seller: "Fashion Studio",
    date: "2023-11-19",
    total: 429.75,
    status: "pending",
  }
];

// Placeholder user data for demonstration
const USERS_DATA = [
  {
    id: "USR-001",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "buyer",
    status: "active",
    joined: "2023-09-15",
    orders: 5
  },
  {
    id: "USR-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "buyer",
    status: "active",
    joined: "2023-09-22",
    orders: 3
  },
  {
    id: "USR-003",
    name: "Elite Tailors",
    email: "info@elitetailors.com",
    role: "seller",
    status: "verified",
    joined: "2023-08-10",
    orders: 28
  },
  {
    id: "USR-004",
    name: "Fashion Studio",
    email: "contact@fashionstudio.com",
    role: "seller",
    status: "pending",
    joined: "2023-10-05",
    orders: 12
  },
  {
    id: "USR-005",
    name: "Michael Brown",
    email: "mbrown@example.com",
    role: "buyer",
    status: "inactive",
    joined: "2023-07-30",
    orders: 0
  },
  {
    id: "USR-006",
    name: "Custom Suits Co.",
    email: "support@customsuits.com",
    role: "seller",
    status: "verified",
    joined: "2023-06-15",
    orders: 45
  },
  {
    id: "USR-007",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "buyer",
    status: "active",
    joined: "2023-10-18",
    orders: 1
  },
  {
    id: "USR-008",
    name: "Stitch Perfect",
    email: "info@stitchperfect.com",
    role: "seller",
    status: "verified",
    joined: "2023-05-22",
    orders: 37
  }
];

// Placeholder tailor data for demonstration
const TAILORS_DATA = [
  {
    id: "USR-003",
    businessName: "Elite Tailors",
    ownerName: "James Wilson",
    email: "info@elitetailors.com",
    phone: "+1 (555) 123-4567",
    joinDate: "2023-08-10",
    verificationStatus: "verified",
    specialties: ["Suits", "Formal wear", "Alterations"],
    orders: 28,
    rating: 4.8,
    location: "New York, NY"
  },
  {
    id: "USR-004",
    businessName: "Fashion Studio",
    ownerName: "Maria Garcia",
    email: "contact@fashionstudio.com",
    phone: "+1 (555) 987-6543",
    joinDate: "2023-10-05",
    verificationStatus: "pending",
    specialties: ["Dresses", "Custom designs", "Bridal"],
    orders: 12,
    rating: 4.5,
    location: "Los Angeles, CA"
  },
  {
    id: "USR-006",
    businessName: "Custom Suits Co.",
    ownerName: "Robert Chen",
    email: "support@customsuits.com",
    phone: "+1 (555) 234-5678",
    joinDate: "2023-06-15",
    verificationStatus: "verified",
    specialties: ["Bespoke suits", "Tuxedos", "Business attire"],
    orders: 45,
    rating: 4.9,
    location: "Chicago, IL"
  },
  {
    id: "USR-008",
    businessName: "Stitch Perfect",
    ownerName: "Sophia Martinez",
    email: "info@stitchperfect.com",
    phone: "+1 (555) 345-6789",
    joinDate: "2023-05-22",
    verificationStatus: "verified",
    specialties: ["Casual wear", "Athletic wear", "Alterations"],
    orders: 37,
    rating: 4.7,
    location: "Miami, FL"
  },
  {
    id: "USR-009",
    businessName: "Tailor Masters",
    ownerName: "Daniel Johnson",
    email: "contact@tailormasters.com",
    phone: "+1 (555) 456-7890",
    joinDate: "2023-09-30",
    verificationStatus: "pending",
    specialties: ["Shirts", "Pants", "Suits"],
    orders: 8,
    rating: 4.3,
    location: "Boston, MA"
  },
  {
    id: "USR-010",
    businessName: "Premium Fabrics",
    ownerName: "Linda Kim",
    email: "info@premiumfabrics.com",
    phone: "+1 (555) 567-8901",
    joinDate: "2023-07-18",
    verificationStatus: "rejected",
    specialties: ["Custom designs", "Luxury fabrics", "Evening wear"],
    orders: 5,
    rating: 3.9,
    location: "Seattle, WA"
  },
  {
    id: "USR-011",
    businessName: "Swift Alterations",
    ownerName: "Carlos Rodriguez",
    email: "carlos@swiftalterations.com",
    phone: "+1 (555) 678-9012",
    joinDate: "2023-10-10",
    verificationStatus: "pending",
    specialties: ["Quick repairs", "Hemming", "Size adjustments"],
    orders: 3,
    rating: 4.1,
    location: "Dallas, TX"
  },
  {
    id: "USR-012",
    businessName: "Heritage Tailoring",
    ownerName: "Elizabeth Brown",
    email: "info@heritagetailoring.com",
    phone: "+1 (555) 789-0123",
    joinDate: "2023-04-12",
    verificationStatus: "verified",
    specialties: ["Traditional wear", "Historical costumes", "Formal wear"],
    orders: 27,
    rating: 4.6,
    location: "Philadelphia, PA"
  }
];

// Placeholder analytics data
const ANALYTICS_DATA = {
  summary: {
    totalUsers: 2456,
    totalOrders: 1823,
    totalRevenue: 142789.50,
    activeListings: 583
  },
  revenueData: [
    { month: 'Jan', revenue: 8250 },
    { month: 'Feb', revenue: 9400 },
    { month: 'Mar', revenue: 11200 },
    { month: 'Apr', revenue: 10500 },
    { month: 'May', revenue: 12300 },
    { month: 'Jun', revenue: 14500 },
    { month: 'Jul', revenue: 16200 },
    { month: 'Aug', revenue: 18100 },
    { month: 'Sep', revenue: 19700 },
    { month: 'Oct', revenue: 21500 },
    { month: 'Nov', revenue: 0 },
    { month: 'Dec', revenue: 0 }
  ],
  ordersData: [
    { month: 'Jan', orders: 95 },
    { month: 'Feb', orders: 110 },
    { month: 'Mar', orders: 135 },
    { month: 'Apr', orders: 129 },
    { month: 'May', orders: 156 },
    { month: 'Jun', orders: 187 },
    { month: 'Jul', orders: 205 },
    { month: 'Aug', orders: 226 },
    { month: 'Sep', orders: 252 },
    { month: 'Oct', orders: 328 },
    { month: 'Nov', orders: 0 },
    { month: 'Dec', orders: 0 }
  ],
  userSignups: [
    { month: 'Jan', buyers: 85, sellers: 12 },
    { month: 'Feb', buyers: 92, sellers: 15 },
    { month: 'Mar', buyers: 118, sellers: 22 },
    { month: 'Apr', buyers: 125, sellers: 19 },
    { month: 'May', buyers: 157, sellers: 24 },
    { month: 'Jun', buyers: 183, sellers: 31 },
    { month: 'Jul', buyers: 205, sellers: 28 },
    { month: 'Aug', buyers: 234, sellers: 35 },
    { month: 'Sep', buyers: 275, sellers: 39 },
    { month: 'Oct', buyers: 312, sellers: 47 },
    { month: 'Nov', buyers: 0, sellers: 0 },
    { month: 'Dec', buyers: 0, sellers: 0 }
  ],
  categoryPerformance: [
    { category: 'Custom Suits', orders: 412, revenue: 45320 },
    { category: 'Dresses', orders: 387, revenue: 32450 },
    { category: 'Alterations', orders: 329, revenue: 19740 },
    { category: 'Casual Wear', orders: 253, revenue: 17650 },
    { category: 'Formal Wear', orders: 189, revenue: 15280 },
    { category: 'Bridal', orders: 124, revenue: 24890 },
    { category: 'Uniforms', orders: 86, revenue: 7450 },
    { category: 'Other', orders: 43, revenue: 3210 }
  ],
  userMetrics: {
    activeUsers: 1872,
    inactiveUsers: 584,
    averageOrdersPerBuyer: 3.2,
    averageRevenuePerSeller: 8374.25,
    verifiedSellers: 78,
    pendingVerifications: 23
  }
};

// Generate status badge with appropriate color
function OrderStatusBadge({ status }: { status: string }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    canceled: "bg-gray-100 text-gray-800 border-gray-200",
    disputed: "bg-red-100 text-red-800 border-red-200",
  };

  const color = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// User status badge component
function UserStatusBadge({ status }: { status: string }) {
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    verified: "bg-blue-100 text-blue-800 border-blue-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    suspended: "bg-red-100 text-red-800 border-red-200"
  };

  const color = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

// Verification status badge component
function VerificationStatusBadge({ status }: { status: string }) {
  const statusColors = {
    verified: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rejected: "bg-red-100 text-red-800 border-red-200"
  };

  const color = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // User management state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Tailor management state
  const [tailorSearch, setTailorSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedTailor, setSelectedTailor] = useState<typeof TAILORS_DATA[0] | null>(null);
  const [tailorCurrentPage, setTailorCurrentPage] = useState(1);
  const tailorsPerPage = 5;

  // Analytics state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("year");

  // Filter orders based on search and status filter
  const filteredOrders = ORDERS_DATA.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.seller.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate the filtered orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Filter users based on search, role, and status filters
  const filteredUsers = USERS_DATA.filter(user => {
    const matchesSearch = 
      user.id.toLowerCase().includes(userSearch.toLowerCase()) || 
      user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === "all" || user.status === userStatusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginate the filtered users
  const indexOfLastUser = userCurrentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Filter tailors based on search and verification status
  const filteredTailors = TAILORS_DATA.filter(tailor => {
    const matchesSearch = 
      tailor.id.toLowerCase().includes(tailorSearch.toLowerCase()) || 
      tailor.businessName.toLowerCase().includes(tailorSearch.toLowerCase()) || 
      tailor.ownerName.toLowerCase().includes(tailorSearch.toLowerCase()) || 
      tailor.email.toLowerCase().includes(tailorSearch.toLowerCase()) ||
      tailor.location.toLowerCase().includes(tailorSearch.toLowerCase());
    
    const matchesVerification = verificationFilter === "all" || tailor.verificationStatus === verificationFilter;
    
    return matchesSearch && matchesVerification;
  });

  // Paginate the filtered tailors
  const indexOfLastTailor = tailorCurrentPage * tailorsPerPage;
  const indexOfFirstTailor = indexOfLastTailor - tailorsPerPage;
  const currentTailors = filteredTailors.slice(indexOfFirstTailor, indexOfLastTailor);
  const totalTailorPages = Math.ceil(filteredTailors.length / tailorsPerPage);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="orders" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tailors">Tailors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>View and manage all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search orders by ID, customer, or seller..." 
                    className="pl-8"
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setCurrentPage(1); // Reset to first page on new search
                    }}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="whitespace-nowrap" onClick={() => {
                  setOrderSearch("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset Filters
                </Button>
                <Button className="whitespace-nowrap">
                  <Download className="mr-2 h-4 w-4" /> Export Orders
                </Button>
              </div>

              {/* Orders Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.seller}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {order.status === "pending" && (
                                  <DropdownMenuItem>
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    Approve Order
                                  </DropdownMenuItem>
                                )}
                                {(order.status === "pending" || order.status === "in_progress") && (
                                  <DropdownMenuItem>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                )}
                                {order.status === "disputed" && (
                                  <DropdownMenuItem>
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    Resolve Dispute
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No orders found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredOrders.length > 0 && (
                <div className="flex items-center justify-between space-x-6 mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstOrder + 1}-
                    {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                    {filteredOrders.length} orders
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users by ID, name, or email..." 
                    className="pl-8"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserCurrentPage(1); // Reset to first page on new search
                    }}
                  />
                </div>
                <div className="w-full md:w-40">
                  <Select value={userRoleFilter} onValueChange={(value) => {
                    setUserRoleFilter(value);
                    setUserCurrentPage(1); // Reset to first page on filter change
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="buyer">Buyers</SelectItem>
                      <SelectItem value="seller">Sellers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-40">
                  <Select value={userStatusFilter} onValueChange={(value) => {
                    setUserStatusFilter(value);
                    setUserCurrentPage(1); // Reset to first page on filter change
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="whitespace-nowrap" onClick={() => {
                  setUserSearch("");
                  setUserRoleFilter("all");
                  setUserStatusFilter("all");
                  setUserCurrentPage(1);
                }}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset Filters
                </Button>
                <Button className="whitespace-nowrap">
                  <Download className="mr-2 h-4 w-4" /> Export Users
                </Button>
              </div>
              
              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'seller' ? 'secondary' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <UserStatusBadge status={user.status} />
                          </TableCell>
                          <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
                          <TableCell>{user.orders}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "active" && (
                                  <DropdownMenuItem>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend User
                                  </DropdownMenuItem>
                                )}
                                {user.status === "suspended" && (
                                  <DropdownMenuItem>
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    Reactivate User
                                  </DropdownMenuItem>
                                )}
                                {user.status === "pending" && user.role === "seller" && (
                                  <DropdownMenuItem>
                                    <FileCheck className="mr-2 h-4 w-4" />
                                    Verify Seller
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                          No users found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between space-x-6 mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstUser + 1}-
                    {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserCurrentPage(userCurrentPage - 1)}
                      disabled={userCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>
                    <div className="text-sm">
                      Page {userCurrentPage} of {totalUserPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserCurrentPage(userCurrentPage + 1)}
                      disabled={userCurrentPage === totalUserPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tailors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tailors Management</CardTitle>
              <CardDescription>Manage tailor profiles, verification, and business details.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTailor ? (
                // Tailor Detail View
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <Button variant="outline" onClick={() => setSelectedTailor(null)}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
                    </Button>
                    
                    <div className="flex gap-2">
                      {selectedTailor.verificationStatus === "pending" && (
                        <>
                          <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200">
                            <FileCheck className="mr-2 h-4 w-4" /> Approve Verification
                          </Button>
                          <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                            <Ban className="mr-2 h-4 w-4" /> Reject Verification
                          </Button>
                        </>
                      )}
                      {selectedTailor.verificationStatus === "verified" && (
                        <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                          <Ban className="mr-2 h-4 w-4" /> Revoke Verification
                        </Button>
                      )}
                      {selectedTailor.verificationStatus === "rejected" && (
                        <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200">
                          <FileCheck className="mr-2 h-4 w-4" /> Reconsider Verification
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Business Profile */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Business Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                            <p className="mt-1 text-base">{selectedTailor.businessName}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Owner Name</h3>
                            <p className="mt-1 text-base">{selectedTailor.ownerName}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="mt-1 text-base">{selectedTailor.email}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                            <p className="mt-1 text-base">{selectedTailor.phone}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Location</h3>
                            <p className="mt-1 text-base">{selectedTailor.location}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
                            <p className="mt-1 text-base">{new Date(selectedTailor.joinDate).toLocaleDateString()}</p>
                          </div>
                          <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500">Specialties</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedTailor.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary">{specialty}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Performance Stats */}
                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
                            <div className="mt-1">
                              <VerificationStatusBadge status={selectedTailor.verificationStatus} />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                            <p className="mt-1 text-2xl font-semibold">{selectedTailor.orders}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                            <div className="mt-1 flex items-center">
                              <span className="text-2xl font-semibold mr-2">{selectedTailor.rating.toFixed(1)}</span>
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                    className={`w-5 h-5 ${i < Math.floor(selectedTailor.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Verification Documents - Placeholder */}
                    <div className="lg:col-span-3">
                      <Card>
                        <CardHeader>
                          <CardTitle>Verification Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border rounded-md p-4">
                              <h4 className="font-medium mb-2">Business License</h4>
                              <div className="h-40 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                                <span className="text-gray-400">Document Preview</span>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="mr-2 h-4 w-4" /> View Document
                              </Button>
                            </div>
                            <div className="border rounded-md p-4">
                              <h4 className="font-medium mb-2">Identity Verification</h4>
                              <div className="h-40 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                                <span className="text-gray-400">Document Preview</span>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="mr-2 h-4 w-4" /> View Document
                              </Button>
                            </div>
                            <div className="border rounded-md p-4">
                              <h4 className="font-medium mb-2">Portfolio Samples</h4>
                              <div className="h-40 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                                <span className="text-gray-400">3 Images</span>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="mr-2 h-4 w-4" /> View Images
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                // Tailors List View
                <>
                  {/* Filters and Search */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search tailors by name, business, or location..." 
                        className="pl-8"
                        value={tailorSearch}
                        onChange={(e) => {
                          setTailorSearch(e.target.value);
                          setTailorCurrentPage(1); // Reset to first page on new search
                        }}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={verificationFilter} onValueChange={(value) => {
                        setVerificationFilter(value);
                        setTailorCurrentPage(1); // Reset to first page on filter change
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Verification status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending Verification</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="whitespace-nowrap" onClick={() => {
                      setTailorSearch("");
                      setVerificationFilter("all");
                      setTailorCurrentPage(1);
                    }}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Reset Filters
                    </Button>
                  </div>
                  
                  {/* Highlight pending verifications */}
                  {verificationFilter === "all" && 
                    TAILORS_DATA.some(t => t.verificationStatus === "pending") && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Attention needed</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>There are {TAILORS_DATA.filter(t => t.verificationStatus === "pending").length} tailors pending verification. Please review their applications.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tailors Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTailors.length > 0 ? (
                          currentTailors.map((tailor) => (
                            <TableRow key={tailor.id} className={tailor.verificationStatus === "pending" ? "bg-yellow-50" : ""}>
                              <TableCell className="font-medium">
                                {tailor.businessName}
                              </TableCell>
                              <TableCell>{tailor.ownerName}</TableCell>
                              <TableCell>{tailor.location}</TableCell>
                              <TableCell>{new Date(tailor.joinDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <VerificationStatusBadge status={tailor.verificationStatus} />
                              </TableCell>
                              <TableCell>{tailor.orders}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">{tailor.rating.toFixed(1)}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedTailor(tailor)}
                                  >
                                    View Details
                                  </Button>
                                  
                                  {tailor.verificationStatus === "pending" && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="ml-2">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-green-600">
                                          <FileCheck className="mr-2 h-4 w-4" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                          <Ban className="mr-2 h-4 w-4" />
                                          Reject
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                              No tailors found matching your filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {filteredTailors.length > 0 && (
                    <div className="flex items-center justify-between space-x-6 mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {indexOfFirstTailor + 1}-
                        {Math.min(indexOfLastTailor, filteredTailors.length)} of{" "}
                        {filteredTailors.length} tailors
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTailorCurrentPage(tailorCurrentPage - 1)}
                          disabled={tailorCurrentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous Page</span>
                        </Button>
                        <div className="text-sm">
                          Page {tailorCurrentPage} of {totalTailorPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTailorCurrentPage(tailorCurrentPage + 1)}
                          disabled={tailorCurrentPage === totalTailorPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next Page</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Timeframe selector */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Platform Analytics</h2>
              <div className="flex items-center space-x-1 rounded-md border p-1">
                <Button 
                  variant={analyticsTimeframe === "month" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setAnalyticsTimeframe("month")}
                >
                  Month
                </Button>
                <Button 
                  variant={analyticsTimeframe === "quarter" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setAnalyticsTimeframe("quarter")}
                >
                  Quarter
                </Button>
                <Button 
                  variant={analyticsTimeframe === "year" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setAnalyticsTimeframe("year")}
                >
                  Year
                </Button>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-sm font-medium text-gray-500">Total Users</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{ANALYTICS_DATA.summary.totalUsers.toLocaleString()}</span>
                      <span className="text-xs text-green-500 font-medium rounded-full bg-green-50 px-1.5 py-0.5 flex items-center">
                        +12.3%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-sm font-medium text-gray-500">Total Orders</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{ANALYTICS_DATA.summary.totalOrders.toLocaleString()}</span>
                      <span className="text-xs text-green-500 font-medium rounded-full bg-green-50 px-1.5 py-0.5 flex items-center">
                        +8.7%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-sm font-medium text-gray-500">Total Revenue</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">${ANALYTICS_DATA.summary.totalRevenue.toLocaleString()}</span>
                      <span className="text-xs text-green-500 font-medium rounded-full bg-green-50 px-1.5 py-0.5 flex items-center">
                        +15.2%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-sm font-medium text-gray-500">Active Listings</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{ANALYTICS_DATA.summary.activeListings.toLocaleString()}</span>
                      <span className="text-xs text-green-500 font-medium rounded-full bg-green-50 px-1.5 py-0.5 flex items-center">
                        +5.8%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {/* Revenue Chart Visualization */}
                    <div className="h-full flex flex-col">
                      <div className="flex-1 flex">
                        <div className="flex flex-col justify-between text-xs text-gray-500 pr-2">
                          <div>$25k</div>
                          <div>$20k</div>
                          <div>$15k</div>
                          <div>$10k</div>
                          <div>$5k</div>
                          <div>$0</div>
                        </div>
                        <div className="flex-1 flex items-end">
                          {ANALYTICS_DATA.revenueData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="relative w-full">
                                <div 
                                  className="w-10 mx-auto bg-blue-500 rounded-t" 
                                  style={{ 
                                    height: `${(data.revenue / 25000) * 100}%`,
                                    maxHeight: '90%', 
                                    minHeight: '4px'
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex text-xs text-gray-500 mt-2 justify-between px-5">
                        {ANALYTICS_DATA.revenueData.map((data, index) => (
                          <div key={index}>{data.month}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Orders Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Monthly order volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {/* Orders Chart Visualization */}
                    <div className="h-full flex flex-col">
                      <div className="flex-1 flex">
                        <div className="flex flex-col justify-between text-xs text-gray-500 pr-2">
                          <div>350</div>
                          <div>280</div>
                          <div>210</div>
                          <div>140</div>
                          <div>70</div>
                          <div>0</div>
                        </div>
                        <div className="flex-1 flex items-end">
                          {ANALYTICS_DATA.ordersData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="relative w-full">
                                <div 
                                  className="w-10 mx-auto bg-purple-500 rounded-t" 
                                  style={{ 
                                    height: `${(data.orders / 350) * 100}%`, 
                                    maxHeight: '90%',
                                    minHeight: '4px'
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex text-xs text-gray-500 mt-2 justify-between px-5">
                        {ANALYTICS_DATA.ordersData.map((data, index) => (
                          <div key={index}>{data.month}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* User Growth and Category Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly new user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {/* User Growth Chart */}
                    <div className="h-full flex flex-col">
                      <div className="flex-1 flex">
                        <div className="flex flex-col justify-between text-xs text-gray-500 pr-2">
                          <div>350</div>
                          <div>280</div>
                          <div>210</div>
                          <div>140</div>
                          <div>70</div>
                          <div>0</div>
                        </div>
                        <div className="flex-1 flex items-end">
                          {ANALYTICS_DATA.userSignups.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="relative w-full flex flex-col items-center">
                                <div className="w-10 flex flex-col items-center">
                                  <div 
                                    className="w-full bg-green-400 rounded-t" 
                                    style={{ 
                                      height: `${(data.sellers / 350) * 100}%`,
                                      minHeight: data.sellers > 0 ? '4px' : '0px'
                                    }}
                                  ></div>
                                  <div 
                                    className="w-full bg-blue-400" 
                                    style={{ 
                                      height: `${(data.buyers / 350) * 100}%`,
                                      minHeight: data.buyers > 0 ? '4px' : '0px'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex text-xs text-gray-500 mt-2 justify-between px-5">
                        {ANALYTICS_DATA.userSignups.map((data, index) => (
                          <div key={index}>{data.month}</div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-400 rounded-sm mr-2"></div>
                          <span className="text-sm text-gray-600">Buyers</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-sm mr-2"></div>
                          <span className="text-sm text-gray-600">Sellers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Orders and revenue by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ANALYTICS_DATA.categoryPerformance.slice(0, 5).map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm text-gray-500">${category.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ 
                              width: `${(category.revenue / ANALYTICS_DATA.categoryPerformance[0].revenue) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* User Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>User Metrics</CardTitle>
                <CardDescription>Key user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Active Users</span>
                      <span className="font-medium">{ANALYTICS_DATA.userMetrics.activeUsers}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ 
                          width: `${(ANALYTICS_DATA.userMetrics.activeUsers / (ANALYTICS_DATA.userMetrics.activeUsers + ANALYTICS_DATA.userMetrics.inactiveUsers)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((ANALYTICS_DATA.userMetrics.activeUsers / (ANALYTICS_DATA.userMetrics.activeUsers + ANALYTICS_DATA.userMetrics.inactiveUsers)) * 100)}% of total users
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg. Orders per Buyer</span>
                      <span className="font-medium">{ANALYTICS_DATA.userMetrics.averageOrdersPerBuyer}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(ANALYTICS_DATA.userMetrics.averageOrdersPerBuyer / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: 5 orders per buyer
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg. Revenue per Seller</span>
                      <span className="font-medium">${ANALYTICS_DATA.userMetrics.averageRevenuePerSeller.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ width: `${(ANALYTICS_DATA.userMetrics.averageRevenuePerSeller / 10000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: $10,000 per seller
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Verified Sellers</span>
                      <span className="font-medium">{ANALYTICS_DATA.userMetrics.verifiedSellers}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ 
                          width: `${(ANALYTICS_DATA.userMetrics.verifiedSellers / (ANALYTICS_DATA.userMetrics.verifiedSellers + ANALYTICS_DATA.userMetrics.pendingVerifications)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((ANALYTICS_DATA.userMetrics.verifiedSellers / (ANALYTICS_DATA.userMetrics.verifiedSellers + ANALYTICS_DATA.userMetrics.pendingVerifications)) * 100)}% of total sellers
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pending Verifications</span>
                      <span className="font-medium">{ANALYTICS_DATA.userMetrics.pendingVerifications}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Button size="sm" variant="outline" className="h-8">
                        Review Queue
                      </Button>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Attention Needed
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">User Retention</span>
                      <span className="font-medium">76.3%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '76.3%' }}></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: 80% retention rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 