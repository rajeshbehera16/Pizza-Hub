import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function AdminCredentials() {
  const [showPassword, setShowPassword] = useState(false);

  const credentials = {
    adminId: "admin123",
    password: "pizzacraft2024"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Admin Access Credentials</CardTitle>
        <CardDescription>Use these credentials to access the admin panel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Admin ID:</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
              {credentials.adminId}
            </code>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(credentials.adminId)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Password:</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
              {showPassword ? credentials.password : "••••••••••••"}
            </code>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(credentials.password)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-3 rounded border">
          <strong>🔒 Security Note:</strong> These are demo credentials for testing. In production, use strong, unique passwords and proper authentication systems.
        </div>
      </CardContent>
    </Card>
  );
}
