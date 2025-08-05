import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Pizza,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  Edit,
  Plus,
  Trash2,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  threshold: number;
  unit: string;
  isActive: boolean;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  pricing: {
    total: number;
  };
  status: string;
  createdAt: string;
  estimatedDeliveryTime: string;
}

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  statusBreakdown: Record<string, number>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    statusBreakdown: {}
  });
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API calls
    setStats({
      todayOrders: 23,
      todayRevenue: 37899,
      monthlyRevenue: 1024500,
      statusBreakdown: {
        pending: 3,
        confirmed: 5,
        preparing: 4,
        ready: 2,
        out_for_delivery: 6,
        delivered: 125,
        cancelled: 2
      }
    });

    setInventory([
      { _id: "1", name: "Classic Thin Crust", category: "base", description: "Light and crispy", price: 0, stock: 15, threshold: 20, unit: "pieces", isActive: true },
      { _id: "2", name: "Mozzarella", category: "cheese", description: "Classic cheese", price: 0, stock: 45, threshold: 50, unit: "servings", isActive: true },
      { _id: "3", name: "Pepperoni", category: "meat", description: "Spicy pepperoni", price: 150, stock: 8, threshold: 25, unit: "servings", isActive: true },
      { _id: "4", name: "Mushrooms", category: "vegetables", description: "Fresh mushrooms", price: 80, stock: 30, threshold: 30, unit: "servings", isActive: true }
    ]);

    setLowStockItems([
      { _id: "1", name: "Classic Thin Crust", category: "base", description: "Light and crispy", price: 0, stock: 15, threshold: 20, unit: "pieces", isActive: true },
      { _id: "3", name: "Pepperoni", category: "meat", description: "Spicy pepperoni", price: 150, stock: 8, threshold: 25, unit: "servings", isActive: true }
    ]);

    setOrders([
      {
        _id: "1",
        orderNumber: "PZ-20241201-001",
        customerInfo: { name: "John Doe", email: "john@example.com", phone: "+1234567890" },
        items: [{ name: "Margherita Pizza", quantity: 2, price: 16.99 }],
        pricing: { total: 2799 },
        status: "preparing",
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toISOString()
      },
      {
        _id: "2", 
        orderNumber: "PZ-20241201-002",
        customerInfo: { name: "Jane Smith", email: "jane@example.com", phone: "+1234567891" },
        items: [{ name: "Pepperoni Pizza", quantity: 1, price: 18.99 }],
        pricing: { total: 1599 },
        status: "confirmed",
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000).toISOString()
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-orange-100 text-orange-800",
      ready: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      case "preparing": return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order =>
      order._id === orderId ? { ...order, status: newStatus } : order
    ));
    // TODO: Call API to update order status
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      setInventory(prev => prev.filter(item => item._id !== itemId));
      setLowStockItems(prev => prev.filter(item => item._id !== itemId));
      // TODO: Call API to delete item
    }
  };

  const handleSaveEdit = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item =>
      item._id === updatedItem._id ? updatedItem : item
    ));
    setLowStockItems(prev => prev.map(item =>
      item._id === updatedItem._id ? updatedItem : item
    ));
    setIsEditDialogOpen(false);
    setEditingItem(null);
    // TODO: Call API to update item
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Edit Item Form Component
  const EditItemForm = ({ item, onSave, onCancel }: {
    item: InventoryItem;
    onSave: (item: InventoryItem) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(item);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="edit-price">Price (₹)</Label>
            <Input
              id="edit-price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="edit-stock">Stock</Label>
            <Input
              id="edit-stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="edit-threshold">Threshold</Label>
            <Input
              id="edit-threshold"
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData(prev => ({ ...prev, threshold: Number(e.target.value) }))}
              min="0"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">Save Changes</Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="pizza-gradient p-2 rounded-xl">
              <Pizza className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold pizza-text-gradient">PizzaCraft Admin</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">User View</Link>
            </Button>
            <Button variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your pizza restaurant operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayOrders}</div>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders & Low Stock Alerts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest pizza orders requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customerInfo.name}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-sm text-muted-foreground">₹{order.pricing.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Low Stock Alerts
                  </CardTitle>
                  <CardDescription>Items below threshold levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockItems.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-destructive">
                            {item.stock} {item.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Threshold: {item.threshold}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage all pizza orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerInfo.name}</p>
                            <p className="text-sm text-muted-foreground">{order.customerInfo.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>₹{order.pricing.total}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order._id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <p className="text-muted-foreground">Manage pizza ingredients and stock levels</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>Add a new ingredient to your inventory</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Item name" />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="base">Pizza Base</SelectItem>
                            <SelectItem value="sauce">Sauce</SelectItem>
                            <SelectItem value="cheese">Cheese</SelectItem>
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="meat">Meat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Item description" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input id="price" type="number" step="1" placeholder="0" />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input id="stock" type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label htmlFor="threshold">Threshold</Label>
                        <Input id="threshold" type="number" placeholder="10" />
                      </div>
                    </div>
                    <Button className="w-full">Add Item</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          <span className={item.stock <= item.threshold ? 'text-destructive font-semibold' : ''}>
                            {item.stock} {item.unit}
                          </span>
                        </TableCell>
                        <TableCell>{item.threshold} {item.unit}</TableCell>
                        <TableCell>
                          <Badge variant={item.stock <= item.threshold ? "destructive" : "default"}>
                            {item.stock <= item.threshold ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                              title="Edit item"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteItem(item._id)}
                              title="Delete item"
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Item Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Inventory Item</DialogTitle>
                  <DialogDescription>Update the details of this inventory item</DialogDescription>
                </DialogHeader>
                {editingItem && (
                  <EditItemForm
                    item={editingItem}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditDialogOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Order Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Average Order Value</span>
                    <span className="font-semibold">₹1649</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Preparation Time</span>
                    <span className="font-semibold">12 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Satisfaction</span>
                    <span className="font-semibold">4.8/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On-time Delivery</span>
                    <span className="font-semibold">94%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Restock Low Items
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Send Stock Alerts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Export Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
