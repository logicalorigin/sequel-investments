import { forwardRef } from "react";
import logoUrl from "@assets/ChatGPT Image Jun 25, 2025, 12_56_17 PM_1764028561921.png";

interface DSCREstimatePDFProps {
  data: {
    propertyAddress: string;
    propertyType: string;
    transactionType: string;
    rentalType: string;
    propertyValue: number;
    loanAmount: number;
    ltv: number;
    monthlyRent: number;
    annualTaxes: number;
    annualInsurance: number;
    annualHOA: number;
    creditScore: number;
    calculatedRate: number;
    dscrRatio: number;
    monthlyPI: number;
    monthlyTIA: number;
    monthlyPITIA: number;
    monthlyCashFlow: number;
    cashToClose: number;
    cashToBorrower: number;
  };
  userName?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const propertyTypeLabels: Record<string, string> = {
  sfr: "Single Family Residence",
  duplex: "Duplex (2-Unit)",
  triplex: "Triplex (3-Unit)",
  fourplex: "Fourplex (4-Unit)",
  townhome: "Townhome/Condo",
};

const transactionTypeLabels: Record<string, string> = {
  purchase: "Purchase",
  rate_term: "Rate & Term Refinance",
  cash_out: "Cash-Out Refinance",
};

const rentalTypeLabels: Record<string, string> = {
  long_term: "Long-Term Rental",
  short_term: "Short-Term Rental (STR)",
};

export const DSCREstimatePDF = forwardRef<HTMLDivElement, DSCREstimatePDFProps>(
  ({ data, userName }, ref) => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 w-[8.5in] min-h-[11in] mx-auto print:p-6"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {/* Letterhead */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-[#D4A01D]">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Sequel Investments" className="h-14 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-[#1a1a2e]">Sequel Investments</h1>
              <p className="text-xs text-gray-600">Investor-Focused Real Estate Lending</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>www.fundwithsequel.com</p>
            <p>josh@fundwithsequel.com</p>
            <p>302.388.8860</p>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1a1a2e] uppercase tracking-wide">
            DSCR Estimate
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Prepared: {today} {userName ? `for ${userName}` : ""}
          </p>
        </div>

        {/* Property Information */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[#D4A01D] uppercase tracking-wide mb-2 pb-1 border-b border-gray-200">
            Property Information
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium">{data.propertyAddress || "TBD"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Property Type:</span>
              <span className="font-medium">{propertyTypeLabels[data.propertyType] || data.propertyType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction:</span>
              <span className="font-medium">{transactionTypeLabels[data.transactionType] || data.transactionType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rental Strategy:</span>
              <span className="font-medium">{rentalTypeLabels[data.rentalType] || data.rentalType}</span>
            </div>
          </div>
        </div>

        {/* Loan Terms */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[#D4A01D] uppercase tracking-wide mb-2 pb-1 border-b border-gray-200">
            Loan Terms
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">Property Value</p>
              <p className="text-lg font-bold text-[#1a1a2e]">{formatCurrency(data.propertyValue)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">Loan Amount</p>
              <p className="text-lg font-bold text-[#1a1a2e]">{formatCurrency(data.loanAmount)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">LTV</p>
              <p className="text-lg font-bold text-[#1a1a2e]">{data.ltv.toFixed(1)}%</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="bg-[#D4A01D]/10 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 uppercase">Interest Rate</p>
              <p className="text-xl font-bold text-[#D4A01D]">{data.calculatedRate.toFixed(3)}%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 uppercase">DSCR</p>
              <p className="text-xl font-bold text-green-600">{data.dscrRatio.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">Credit Score</p>
              <p className="text-lg font-bold text-[#1a1a2e]">{data.creditScore}</p>
            </div>
          </div>
        </div>

        {/* Monthly Cash Flow Analysis */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[#D4A01D] uppercase tracking-wide mb-2 pb-1 border-b border-gray-200">
            Monthly Cash Flow Analysis
          </h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Gross Rental Income</td>
                    <td className="py-1.5 text-right font-medium text-green-600">+{formatCurrency(data.monthlyRent)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Principal & Interest</td>
                    <td className="py-1.5 text-right font-medium">-{formatCurrency(data.monthlyPI)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Taxes/Insurance/HOA</td>
                    <td className="py-1.5 text-right font-medium">-{formatCurrency(data.monthlyTIA)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 font-semibold">Total PITIA</td>
                    <td className="py-2 text-right font-bold">{formatCurrency(data.monthlyPITIA)}</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="py-2 font-semibold text-green-700">Net Cash Flow</td>
                    <td className="py-2 text-right font-bold text-green-600">
                      {data.monthlyCashFlow >= 0 ? "+" : ""}{formatCurrency(data.monthlyCashFlow)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Annual Property Taxes</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(data.annualTaxes)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Annual Insurance</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(data.annualInsurance)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Annual HOA</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(data.annualHOA)}</td>
                  </tr>
                  <tr className="bg-[#D4A01D]/10">
                    <td className="py-2 font-semibold">
                      {data.transactionType === "purchase" ? "Cash to Close" : "Cash to Borrower"}
                    </td>
                    <td className="py-2 text-right font-bold text-[#D4A01D]">
                      {formatCurrency(data.transactionType === "purchase" ? data.cashToClose : data.cashToBorrower)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> This DSCR Estimate is for illustrative purposes only and does not constitute a loan commitment, 
            pre-approval, or guarantee of terms. Actual loan terms, rates, and eligibility are subject to credit approval, property 
            appraisal, and underwriting review. Interest rates and loan programs are subject to change without notice. Sequel 
            Investments reserves the right to modify or discontinue any loan program at any time. Contact a loan specialist for current 
            rates and personalized loan options. NMLS #2394066
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#D4A01D] flex justify-between items-center text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Sequel Investments. All rights reserved.</span>
          <span className="text-[#D4A01D] font-medium">fundwithsequel.com</span>
        </div>
      </div>
    );
  }
);

DSCREstimatePDF.displayName = "DSCREstimatePDF";
