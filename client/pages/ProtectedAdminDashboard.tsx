import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pizza, Shield, AlertTriangle } from "lucide-react";

export default function ProtectedAdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{
    id: string;
    loginTime: string;
  } | null>(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminId = localStorage.getItem('adminId');
      const loginTime = localStorage.getItem('adminLoginTime');

      if (adminToken === 'admin-authenticated' && adminId && loginTime) {
        // Check if session is still valid (24 hours)
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          setIsAuthenticated(true);
          setAdminInfo({ id: adminId, loginTime });
        } else {
          // Session expired
          handleLogout();
        }
      } else {
        // Not authenticated
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-gradient p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Verifying Access...</h2>
          <p className="text-muted-foreground">Please wait while we authenticate your session</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-destructive/10">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You need to be authenticated as an administrator to access this panel.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/admin/login')} 
                className="w-full pizza-gradient"
              >
                Go to Admin Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Back to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add logout functionality to the authenticated admin dashboard
  return (
    <div>
      {/* Admin info bar */}
      <div className="bg-muted/30 border-b px-4 py-2">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Logged in as: <strong>{adminInfo?.id}</strong></span>
            <span className="text-muted-foreground">
              • Session: {adminInfo?.loginTime ? new Date(adminInfo.loginTime).toLocaleString() : ''}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      
      {/* Render the actual admin dashboard */}
      <AdminDashboard />
    </div>
  );
}
