import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pizza, Clock, Star, Truck, ChefHat, Shield } from "lucide-react";

export default function Index() {
  const featuredPizzas = [
    {
      name: "Margherita Supreme",
      description: "Fresh mozzarella, basil, san marzano tomatoes",
      price: "₹1299",
      image: "🍕",
      rating: 4.9,
      popular: true
    },
    {
      name: "Pepperoni Classic",
      description: "Premium pepperoni, mozzarella, signature sauce",
      price: "₹1599",
      image: "🍕",
      rating: 4.8,
      popular: false
    },
    {
      name: "Veggie Deluxe",
      description: "Bell peppers, mushrooms, olives, onions, cheese",
      price: "₹1399",
      image: "🍕",
      rating: 4.7,
      popular: true
    }
  ];

  const features = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: "30-Min Delivery",
      description: "Fresh pizza delivered hot to your door in 30 minutes or less"
    },
    {
      icon: <ChefHat className="h-8 w-8" />,
      title: "Fresh Ingredients",
      description: "Made with the finest ingredients sourced daily"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "100% Secure",
      description: "Safe and secure online payments with multiple options"
    }
  ];

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
            <Link to="/menu" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </Link>
            <Link to="/build" className="text-sm font-medium hover:text-primary transition-colors">
              Build Pizza
            </Link>
            <Link to="/orders" className="text-sm font-medium hover:text-primary transition-colors">
              Track Order
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pizza-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              🍕 Now delivering in 30 minutes or less!
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Craft Your Perfect
              <span className="block pizza-text-gradient">Pizza Experience</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build your custom pizza from scratch with premium ingredients, or choose from our chef-crafted favorites. Fast delivery, fresh ingredients, unforgettable taste.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/build">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Build Your Pizza
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link to="/menu">
                  View Menu
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Pizzas</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our most popular handcrafted pizzas, loved by thousands of customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPizzas.map((pizza, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-pizza-cream to-pizza-orange/20 flex items-center justify-center text-8xl">
                  {pizza.image}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{pizza.name}</h3>
                    {pizza.popular && (
                      <Badge variant="secondary" className="bg-pizza-orange/10 text-pizza-red border-pizza-orange/20">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{pizza.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{pizza.rating}</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">{pizza.price}</span>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <Link to="/build">Add to Cart</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PizzaCraft?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to delivering the best pizza experience with quality ingredients and exceptional service
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="pizza-gradient p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 pizza-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Perfect Pizza?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust PizzaCraft for their pizza cravings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/build">
                <Pizza className="mr-2 h-5 w-5" />
                Start Building
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/register">
                <Truck className="mr-2 h-5 w-5" />
                Order Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="pizza-gradient p-2 rounded-xl">
                  <Pizza className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">PizzaCraft</span>
              </div>
              <p className="text-muted-foreground">
                Crafting perfect pizzas with love, one slice at a time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/menu" className="hover:text-foreground transition-colors">Menu</Link></li>
                <li><Link to="/build" className="hover:text-foreground transition-colors">Build Pizza</Link></li>
                <li><Link to="/orders" className="hover:text-foreground transition-colors">Track Order</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link to="/admin/login" className="hover:text-foreground transition-colors">Admin</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>📞 (555) 123-PIZZA</li>
                <li>📧 hello@pizzacraft.com</li>
                <li>🕐 Mon-Sun: 11AM-11PM</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PizzaCraft. All rights reserved. Made with ❤️ for pizza lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
