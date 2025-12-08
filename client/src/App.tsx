import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleMapsProvider } from "@/components/GoogleMapsProvider";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}
import HomePage from "@/pages/HomePage";
import DSCRLoansPage from "@/pages/DSCRLoansPage";
import FixFlipPage from "@/pages/FixFlipPage";
import NewConstructionPage from "@/pages/NewConstructionPage";
import CalculatorPage from "@/pages/CalculatorPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import GetQuotePage from "@/pages/GetQuotePage";
import WhereWeLendPage from "@/pages/WhereWeLendPage";
import StateInvestmentPage from "@/pages/StateInvestmentPage";
import StateLoanTypePage from "@/pages/StateLoanTypePage";
import PortalPage from "@/pages/PortalPage";
import ApplicationDetailPage from "@/pages/ApplicationDetailPage";
import ApplicationDocumentsPage from "@/pages/ApplicationDocumentsPage";
import InvestmentAnalysisPage from "@/pages/InvestmentAnalysisPage";
import DSCRAnalyzerPage from "@/pages/DSCRAnalyzerPage";
import FixFlipAnalyzerPage from "@/pages/FixFlipAnalyzerPage";
import ConstructionAnalyzerPage from "@/pages/ConstructionAnalyzerPage";
import ProfilePage from "@/pages/ProfilePage";
import ActiveLoansPage from "@/pages/ActiveLoansPage";
import LoanDetailPage from "@/pages/LoanDetailPage";
import STRCalculatorPage from "@/pages/STRCalculatorPage";
import RecentFundingsPage from "@/pages/RecentFundingsPage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import FundedDealDetailPage from "@/pages/FundedDealDetailPage";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminApplicationDetail from "@/pages/AdminApplicationDetail";
import BorrowerProfilePage from "@/pages/BorrowerProfilePage";
import JoinPage from "@/pages/JoinPage";
import StaffLoginPage from "@/pages/StaffLoginPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ArticlePage from "@/pages/ArticlePage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dscr-loans" component={DSCRLoansPage} />
      <Route path="/fix-flip" component={FixFlipPage} />
      <Route path="/hard-money" component={FixFlipPage} />
      <Route path="/new-construction" component={NewConstructionPage} />
      <Route path="/calculator" component={CalculatorPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/get-quote" component={GetQuotePage} />
      <Route path="/where-we-lend" component={WhereWeLendPage} />
      <Route path="/states/:stateSlug" component={StateInvestmentPage} />
      <Route path="/states/:stateSlug/:loanType" component={StateLoanTypePage} />
      <Route path="/portal" component={PortalPage} />
      <Route path="/portal/application/:id" component={ApplicationDetailPage} />
      <Route path="/portal/application/:id/documents" component={ApplicationDocumentsPage} />
      <Route path="/portal/investment-analysis" component={InvestmentAnalysisPage} />
      <Route path="/portal/dscr-analyzer" component={DSCRAnalyzerPage} />
      <Route path="/portal/fixflip-analyzer" component={FixFlipAnalyzerPage} />
      <Route path="/portal/construction-analyzer" component={ConstructionAnalyzerPage} />
      <Route path="/portal/profile" component={ProfilePage} />
      <Route path="/portal/loans" component={ActiveLoansPage} />
      <Route path="/portal/loans/:id" component={LoanDetailPage} />
      <Route path="/str-calculator" component={STRCalculatorPage} />
      <Route path="/fundings" component={RecentFundingsPage} />
      <Route path="/fundings/:propertyId" component={PropertyDetailPage} />
      <Route path="/funded-deals/:id" component={FundedDealDetailPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin/login" component={StaffLoginPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/application/:id" component={AdminApplicationDetail} />
      <Route path="/admin/borrower/:id" component={BorrowerProfilePage} />
      <Route path="/join/:token" component={JoinPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/resources/:slug" component={ArticlePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GoogleMapsProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </GoogleMapsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
