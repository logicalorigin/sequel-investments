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
