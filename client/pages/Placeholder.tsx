import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pizza, ArrowLeft, Wrench } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  suggestedAction?: string;
}

export default function Placeholder({ 
  title, 
  description, 
  suggestedAction = "Continue exploring other pages or ask to implement this feature" 
}: PlaceholderProps) {
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
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
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

      {/* Content */}
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-muted">
                <Wrench className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {suggestedAction}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/dashboard">
                  <Pizza className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
