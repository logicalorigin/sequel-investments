import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import ProfilePage from "@/pages/ProfilePage";
import STRCalculatorPage from "@/pages/STRCalculatorPage";
import RecentFundingsPage from "@/pages/RecentFundingsPage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
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
      <Route path="/portal/profile" component={ProfilePage} />
      <Route path="/str-calculator" component={STRCalculatorPage} />
      <Route path="/fundings" component={RecentFundingsPage} />
      <Route path="/fundings/:propertyId" component={PropertyDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
