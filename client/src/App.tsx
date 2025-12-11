import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleMapsProvider } from "@/components/GoogleMapsProvider";
import { WhiteLabelProvider } from "@/context/WhiteLabelContext";
import { DemoModeBanner } from "@/components/DemoModeBanner";

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
import ConversationalQuote from "@/components/ConversationalQuote";
import WhereWeLendPage from "@/pages/WhereWeLendPage";
import StateInvestmentPage from "@/pages/StateInvestmentPage";
import StateLoanTypePage from "@/pages/StateLoanTypePage";
import PortalPage from "@/pages/PortalPage";
import ApplicationDetailPage from "@/pages/ApplicationDetailPage";
import ApplicationDocumentsPage from "@/pages/ApplicationDocumentsPage";
import PhotoVerificationPage from "@/pages/PhotoVerificationPage";
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
import AdminAnalyticsPage from "@/pages/AdminAnalyticsPage";
import AdminApplicationDetail from "@/pages/AdminApplicationDetail";
import AdminServicingPage from "@/pages/AdminServicingPage";
import AdminLoanDetailPage from "@/pages/AdminLoanDetailPage";
import BorrowerProfilePage from "@/pages/BorrowerProfilePage";
import JoinPage from "@/pages/JoinPage";
import StaffLoginPage from "@/pages/StaffLoginPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ArticlePage from "@/pages/ArticlePage";
import AmericanMigration2025Page from "@/pages/AmericanMigration2025Page";
import DSCRLoansGuidePage from "@/pages/DSCRLoansGuidePage";
import ADUGuidePage from "@/pages/ADUGuidePage";
import RenovationsGuidePage from "@/pages/RenovationsGuidePage";
import ScopeOfWorkGuidePage from "@/pages/ScopeOfWorkGuidePage";
import AdminWhiteLabelPage from "@/pages/AdminWhiteLabelPage";
import AdminEmailLogPage from "@/pages/AdminEmailLogPage";
import AdminSmsLogPage from "@/pages/AdminSmsLogPage";
import AdminAppointmentsPage from "@/pages/AdminAppointmentsPage";
import BookConsultationPage from "@/pages/BookConsultationPage";
import MyAppointmentsPage from "@/pages/MyAppointmentsPage";
import SignDocumentPage from "@/pages/SignDocumentPage";
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
      <Route path="/get-quote" component={ConversationalQuote} />
      <Route path="/where-we-lend" component={WhereWeLendPage} />
      <Route path="/states/:stateSlug" component={StateInvestmentPage} />
      <Route path="/states/:stateSlug/:loanType" component={StateLoanTypePage} />
      <Route path="/portal" component={PortalPage} />
      <Route path="/portal/application/:id" component={ApplicationDetailPage} />
      <Route path="/portal/application/:id/documents" component={ApplicationDocumentsPage} />
      <Route path="/portal/application/:id/verification" component={PhotoVerificationPage} />
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
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/admin/application/:id" component={AdminApplicationDetail} />
      <Route path="/admin/servicing" component={AdminServicingPage} />
      <Route path="/admin/servicing/:id" component={AdminLoanDetailPage} />
      <Route path="/admin/borrower/:id" component={BorrowerProfilePage} />
      <Route path="/admin/white-label" component={AdminWhiteLabelPage} />
      <Route path="/admin/email-log" component={AdminEmailLogPage} />
      <Route path="/admin/sms-log" component={AdminSmsLogPage} />
      <Route path="/admin/appointments" component={AdminAppointmentsPage} />
      <Route path="/portal/book-consultation" component={BookConsultationPage} />
      <Route path="/portal/appointments" component={MyAppointmentsPage} />
      <Route path="/join/:token" component={JoinPage} />
      <Route path="/sign/:token" component={SignDocumentPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/resources/american-migration-2025" component={AmericanMigration2025Page} />
      <Route path="/resources/complete-guide-to-dscr-loans" component={DSCRLoansGuidePage} />
      <Route path="/resources/what-investors-should-know-about-adus" component={ADUGuidePage} />
      <Route path="/resources/top-renovations-to-maximize-profits" component={RenovationsGuidePage} />
      <Route path="/resources/scope-of-work-guide" component={ScopeOfWorkGuidePage} />
      <Route path="/resources/:slug" component={ArticlePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WhiteLabelProvider>
          <GoogleMapsProvider>
            <DemoModeBanner />
            <ScrollToTop />
            <Toaster />
            <Router />
          </GoogleMapsProvider>
        </WhiteLabelProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
