import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PortalHeader } from "@/components/PortalHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle2,
  Bell,
  Target,
  DollarSign,
  Home,
  Plus,
  Trash2,
  Loader2,
  Link2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [investmentPreferences, setInvestmentPreferences] = useState({
    preferredLoanTypes: [] as string[],
    targetMarkets: [] as string[],
    budgetMin: "",
    budgetMax: "",
    investmentGoal: "",
    experience: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailUpdates: true,
    applicationStatus: true,
    documentRequests: true,
    marketingEmails: false,
    smsAlerts: false,
  });

  const [newEntity, setNewEntity] = useState("");
  const [entities, setEntities] = useState<{ id: string; name: string; type: string }[]>([
    { id: "1", name: "Sample Investment LLC", type: "LLC" },
  ]);

  const loanTypes = ["DSCR", "Fix & Flip", "New Construction", "Bridge Loan"];
  const markets = ["California", "Texas", "Florida", "Arizona", "Nevada", "Georgia", "Colorado", "North Carolina"];
  const experienceLevels = ["New Investor (0-2 properties)", "Intermediate (3-10 properties)", "Experienced (10+ properties)", "Professional (Full-time investor)"];
  const investmentGoals = ["Build Rental Portfolio", "Fix & Flip for Profit", "Ground-Up Development", "Mixed Strategy"];

  const toggleLoanType = (type: string) => {
    setInvestmentPreferences(prev => ({
      ...prev,
      preferredLoanTypes: prev.preferredLoanTypes.includes(type)
        ? prev.preferredLoanTypes.filter(t => t !== type)
        : [...prev.preferredLoanTypes, type],
    }));
  };

  const toggleMarket = (market: string) => {
    setInvestmentPreferences(prev => ({
      ...prev,
      targetMarkets: prev.targetMarkets.includes(market)
        ? prev.targetMarkets.filter(m => m !== market)
        : [...prev.targetMarkets, market],
    }));
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Saved",
      description: "Your investment preferences have been updated.",
    });
  };

  const handleAddEntity = () => {
    if (!newEntity.trim()) return;
    const newId = Date.now().toString();
    setEntities([...entities, { id: newId, name: newEntity.trim(), type: "LLC" }]);
    setNewEntity("");
    toast({
      title: "Entity Added",
      description: `${newEntity.trim()} has been added to your account.`,
    });
  };

  const handleRemoveEntity = (id: string) => {
    setEntities(entities.filter(e => e.id !== id));
    toast({
      title: "Entity Removed",
      description: "The entity has been removed from your account.",
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      toast({
        title: "Password Update",
        description: "Password change functionality requires backend implementation with Replit Auth. Please contact support for password reset.",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader user={user} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-profile-title">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information as registered with your Replit account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        First Name
                      </Label>
                      <div className="text-lg font-medium" data-testid="text-first-name">
                        {user?.firstName || "Not provided"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        Last Name
                      </Label>
                      <div className="text-lg font-medium" data-testid="text-last-name">
                        {user?.lastName || "Not provided"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <div className="text-lg font-medium" data-testid="text-email">
                      {user?.email || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Account Security</p>
                    <p className="text-sm text-muted-foreground">
                      Your account is secured through Replit authentication. Profile updates are managed through your Replit account settings.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Password Management
              </CardTitle>
              <CardDescription>
                Manage your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Replit Authentication</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Your account uses Replit for authentication. Password changes and account security are managed through your Replit account settings.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      data-testid="input-current-password"
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        data-testid="input-new-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>
                  
                  {passwordError && (
                    <div className="text-sm text-destructive flex items-center gap-2" data-testid="text-password-error">
                      <AlertCircle className="h-4 w-4" />
                      {passwordError}
                    </div>
                  )}
                  
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    data-testid="button-change-password"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Investment Preferences
              </CardTitle>
              <CardDescription>
                Configure your investment strategy and target criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Preferred Loan Types</Label>
                <div className="flex flex-wrap gap-2">
                  {loanTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={investmentPreferences.preferredLoanTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLoanType(type)}
                      data-testid={`badge-loan-type-${type.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Target Markets</Label>
                <div className="flex flex-wrap gap-2">
                  {markets.map((market) => (
                    <Badge
                      key={market}
                      variant={investmentPreferences.targetMarkets.includes(market) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleMarket(market)}
                      data-testid={`badge-market-${market.toLowerCase()}`}
                    >
                      {market}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Investment Experience</Label>
                  <Select
                    value={investmentPreferences.experience}
                    onValueChange={(value) => setInvestmentPreferences(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger data-testid="select-experience">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Investment Goal</Label>
                  <Select
                    value={investmentPreferences.investmentGoal}
                    onValueChange={(value) => setInvestmentPreferences(prev => ({ ...prev, investmentGoal: value }))}
                  >
                    <SelectTrigger data-testid="select-goal">
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentGoals.map((goal) => (
                        <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-min">Minimum Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget-min"
                      type="number"
                      placeholder="100,000"
                      value={investmentPreferences.budgetMin}
                      onChange={(e) => setInvestmentPreferences(prev => ({ ...prev, budgetMin: e.target.value }))}
                      className="pl-9"
                      data-testid="input-budget-min"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-max">Maximum Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget-max"
                      type="number"
                      placeholder="500,000"
                      value={investmentPreferences.budgetMax}
                      onChange={(e) => setInvestmentPreferences(prev => ({ ...prev, budgetMax: e.target.value }))}
                      className="pl-9"
                      data-testid="input-budget-max"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePreferences} data-testid="button-save-preferences">
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Control how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive general updates via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailUpdates}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailUpdates: checked }))}
                    data-testid="switch-email-updates"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Application Status</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your application status changes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.applicationStatus}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, applicationStatus: checked }))}
                    data-testid="switch-application-status"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Document Requests</Label>
                    <p className="text-sm text-muted-foreground">Get notified when documents are needed</p>
                  </div>
                  <Switch
                    checked={notificationSettings.documentRequests}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, documentRequests: checked }))}
                    data-testid="switch-document-requests"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive urgent updates via text message</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsAlerts: checked }))}
                    data-testid="switch-sms-alerts"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive news about products and offers</p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                    data-testid="switch-marketing-emails"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Connected Entities
              </CardTitle>
              <CardDescription>
                Manage business entities and accounts linked to your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {entities.map((entity) => (
                  <div key={entity.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium" data-testid={`text-entity-name-${entity.id}`}>{entity.name}</p>
                        <p className="text-sm text-muted-foreground">{entity.type}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEntity(entity.id)}
                      data-testid={`button-remove-entity-${entity.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add new entity (e.g., ABC Investments LLC)"
                  value={newEntity}
                  onChange={(e) => setNewEntity(e.target.value)}
                  data-testid="input-new-entity"
                />
                <Button onClick={handleAddEntity} data-testid="button-add-entity">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Connected entities can be used as borrowing entities on your loan applications. Make sure to have your operating agreements and entity formation documents ready.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Account Overview
              </CardTitle>
              <CardDescription>
                Your account status and quick actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Account Status</Label>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600" data-testid="text-account-status">Active</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Member Since</Label>
                  <div className="font-medium" data-testid="text-member-since">
                    {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a href="/portal" className="block">
                    <Button variant="outline" className="w-full justify-start" data-testid="link-view-portfolio">
                      <Building2 className="h-4 w-4 mr-2" />
                      View Portfolio
                    </Button>
                  </a>
                  <a href="/portal" className="block">
                    <Button variant="outline" className="w-full justify-start" data-testid="link-analyze-deal">
                      <MapPin className="h-4 w-4 mr-2" />
                      Analyze New Deal
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" data-testid="button-delete-account">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including loan applications and documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        toast({
                          title: "Account Deletion",
                          description: "Please contact support@securedassetfunding.com to delete your account.",
                        });
                      }}
                      data-testid="button-confirm-delete"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-sm text-muted-foreground mt-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
