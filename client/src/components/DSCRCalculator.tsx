import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function DSCRCalculator() {
  const [propertyValue, setPropertyValue] = useState("300000");
  const [monthlyRent, setMonthlyRent] = useState("2500");
  const [monthlyExpenses, setMonthlyExpenses] = useState("800");

  const calculateDSCR = () => {
    const rent = parseFloat(monthlyRent) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    const value = parseFloat(propertyValue) || 0;
    
    const loanAmount = value * 0.8;
    const annualRate = 7.5;
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = 30 * 12;
    
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const totalMonthlyDebt = monthlyPayment + expenses;
    const dscr = totalMonthlyDebt > 0 ? rent / totalMonthlyDebt : 0;
    
    return {
      dscr: dscr.toFixed(2),
      monthlyPayment: monthlyPayment.toFixed(2),
      qualifies: dscr >= 1.0,
    };
  };

  const results = calculateDSCR();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DSCR Calculator</CardTitle>
        <CardDescription>
          Calculate your Debt Service Coverage Ratio to see if you qualify
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="propertyValue">Property Value ($)</Label>
            <Input
              id="propertyValue"
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="300000"
              data-testid="input-calc-property-value"
            />
          </div>

          <div>
            <Label htmlFor="monthlyRent">Monthly Rental Income ($)</Label>
            <Input
              id="monthlyRent"
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              placeholder="2500"
              data-testid="input-calc-monthly-rent"
            />
          </div>

          <div>
            <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              placeholder="800"
              data-testid="input-calc-monthly-expenses"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Include taxes, insurance, HOA, maintenance
            </p>
          </div>
        </div>

        <div className="bg-accent/20 rounded-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">DSCR Ratio:</span>
            <span className="text-2xl font-bold" data-testid="text-calc-dscr">
              {results.dscr}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Est. Monthly Payment:</span>
            <span className="text-xl font-semibold" data-testid="text-calc-payment">
              ${results.monthlyPayment}
            </span>
          </div>

          <div className="pt-4 border-t">
            {results.qualifies ? (
              <div className="text-center">
                <p className="text-accent-foreground font-semibold mb-2">
                  ✓ You likely qualify for a DSCR loan!
                </p>
                <p className="text-sm text-muted-foreground">
                  DSCR of 1.0 or higher typically qualifies
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground font-semibold mb-2">
                  DSCR below 1.0 - Contact us to discuss options
                </p>
                <p className="text-sm text-muted-foreground">
                  We may still be able to help with alternative programs
                </p>
              </div>
            )}
          </div>
        </div>

        <Link href="/contact">
          <Button className="w-full" size="lg" data-testid="button-calc-getquote">
            Get a Custom Quote
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
