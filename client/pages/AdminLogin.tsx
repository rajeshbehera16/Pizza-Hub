import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pizza, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    adminId: "",
    password: ""
  });

  // Default admin credentials (in production, these should be in environment variables)
  const ADMIN_CREDENTIALS = {
    adminId: "admin123",
    password: "pizzacraft2024"
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (formData.adminId === ADMIN_CREDENTIALS.adminId && 
        formData.password === ADMIN_CREDENTIALS.password) {
      
      // Store admin session
      localStorage.setItem('adminToken', 'admin-authenticated');
      localStorage.setItem('adminId', formData.adminId);
      localStorage.setItem('adminLoginTime', new Date().toISOString());
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } else {
      setError("Invalid Admin ID or Password. Please try again.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 pizza-gradient opacity-5"></div>
      
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="pizza-gradient p-3 rounded-2xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            Secure login for PizzaCraft administrators
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId">Admin ID</Label>
              <Input
                id="adminId"
                type="text"
                placeholder="Enter your admin ID"
                value={formData.adminId}
                onChange={(e) => handleInputChange('adminId', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full pizza-gradient" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login to Admin Panel"}
            </Button>
          </form>


          
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
              ← Back to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
