import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Pizza, 
  Clock, 
  Star, 
  ChefHat, 
  Truck, 
  CheckCircle,
  Plus,
  History,
  Heart,
  Settings
} from "lucide-react";

export default function Dashboard() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
    memberSince: "January 2024",
    totalOrders: 12,
    favoriteOrder: "Pepperoni Supreme"
  };

  const currentOrder = {
    id: "#PZ-2024-001",
    pizza: "Custom Margherita",
    status: "In Kitchen",
    progress: 65,
    estimatedTime: "15 mins",
    total: "₹1549"
  };

  const featuredPizzas = [
    {
      id: 1,
      name: "Margherita Supreme",
      description: "Fresh mozzarella, basil, san marzano tomatoes",
      price: "₹1299",
      image: "🍕",
      rating: 4.9,
      cookTime: "12-15 mins",
      popular: true
    },
    {
      id: 2,
      name: "Pepperoni Classic",
      description: "Premium pepperoni, mozzarella, signature sauce",
      price: "₹1599",
      image: "🍕",
      rating: 4.8,
      cookTime: "10-12 mins",
      popular: false
    },
    {
      id: 3,
      name: "BBQ Chicken",
      description: "Grilled chicken, BBQ sauce, red onions, cilantro",
      price: "₹1699",
      image: "🍕",
      rating: 4.7,
      cookTime: "15-18 mins",
      popular: true
    },
    {
      id: 4,
      name: "Veggie Deluxe",
      description: "Bell peppers, mushrooms, olives, onions, cheese",
      price: "₹1399",
      image: "🍕",
      rating: 4.6,
      cookTime: "12-15 mins",
      popular: false
    },
    {
      id: 5,
      name: "Meat Lovers",
      description: "Pepperoni, sausage, bacon, ham, mozzarella",
      price: "₹1899",
      image: "🍕",
      rating: 4.8,
      cookTime: "18-20 mins",
      popular: true
    },
    {
      id: 6,
      name: "Hawaiian Paradise",
      description: "Ham, pineapple, mozzarella, signature sauce",
      price: "₹1599",
      image: "🍕",
      rating: 4.5,
      cookTime: "12-15 mins",
      popular: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Order Received": return "bg-blue-500";
      case "In Kitchen": return "bg-yellow-500";
      case "Sent to Delivery": return "bg-green-500";
      default: return "bg-gray-500";
    }
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
            <span className="text-2xl font-bold pizza-text-gradient">PizzaCraft</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link to="/build" className="text-sm font-medium hover:text-primary transition-colors">
              Build Pizza
            </Link>
            <Link to="/orders" className="text-sm font-medium hover:text-primary transition-colors">
              My Orders
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">{user.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium">Member Since</div>
                  <div className="text-sm text-muted-foreground">{user.memberSince}</div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/orders">
                      <History className="mr-2 h-4 w-4" />
                      Order History
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}! 🍕</h1>
              <p className="text-muted-foreground">Ready to craft your next delicious pizza?</p>
            </div>

            {/* Current Order Tracking */}
            {currentOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Order</span>
                    <Badge variant="outline">{currentOrder.id}</Badge>
                  </CardTitle>
                  <CardDescription>Track your pizza's journey to your door</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{currentOrder.pizza}</h3>
                      <p className="text-sm text-muted-foreground">Total: {currentOrder.total}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{currentOrder.status}</div>
                      <div className="text-sm text-muted-foreground">ETA: {currentOrder.estimatedTime}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentOrder.progress}%</span>
                    </div>
                    <Progress value={currentOrder.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${currentOrder.status === "Order Received" ? getStatusColor(currentOrder.status) : "bg-green-500"}`}></div>
                      <span>Order Received</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${currentOrder.status === "In Kitchen" ? getStatusColor(currentOrder.status) : currentOrder.progress >= 50 ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <span>In Kitchen</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${currentOrder.status === "Sent to Delivery" ? getStatusColor(currentOrder.status) : currentOrder.progress >= 100 ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <span>Out for Delivery</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/build">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="pizza-gradient p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Build Custom Pizza</h3>
                    <p className="text-sm text-muted-foreground">Create your perfect pizza from scratch</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/orders">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="pizza-gradient p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Truck className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Track Orders</h3>
                    <p className="text-sm text-muted-foreground">Monitor your pizza delivery status</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Available Pizzas */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Available Pizzas</h2>
                  <p className="text-muted-foreground">Choose from our delicious menu or build your own</p>
                </div>
                <Button asChild>
                  <Link to="/build">
                    <Plus className="mr-2 h-4 w-4" />
                    Build Custom
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPizzas.map((pizza) => (
                  <Card key={pizza.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square bg-gradient-to-br from-pizza-cream to-pizza-orange/20 flex items-center justify-center text-6xl">
                      {pizza.image}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold">{pizza.name}</h3>
                        {pizza.popular && (
                          <Badge variant="secondary" className="bg-pizza-orange/10 text-pizza-red border-pizza-orange/20">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{pizza.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{pizza.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{pizza.cookTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{pizza.price}</span>
                        <Button size="sm">Add to Cart</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
