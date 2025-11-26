export interface AmortizationScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface AmortizationSummary {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  schedule: AmortizationScheduleRow[];
}

export function calculateAmortization(
  loanAmount: number,
  annualInterestRate: number,
  termMonths: number
): AmortizationSummary {
  if (loanAmount <= 0 || annualInterestRate <= 0 || termMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      totalPrincipal: loanAmount,
      schedule: [],
    };
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  
  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  const schedule: AmortizationScheduleRow[] = [];
  let balance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    
    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  return {
    monthlyPayment,
    totalPayment: monthlyPayment * termMonths,
    totalInterest: cumulativeInterest,
    totalPrincipal: loanAmount,
    schedule,
  };
}

export function calculateInterestOnlyAmortization(
  loanAmount: number,
  annualInterestRate: number,
  termMonths: number,
  interestOnlyMonths: number = 0
): AmortizationSummary {
  if (loanAmount <= 0 || annualInterestRate <= 0 || termMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      totalPrincipal: loanAmount,
      schedule: [],
    };
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const interestOnlyPayment = loanAmount * monthlyRate;
  
  const amortizingMonths = termMonths - interestOnlyMonths;
  const amortizingPayment = amortizingMonths > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, amortizingMonths)) /
      (Math.pow(1 + monthlyRate, amortizingMonths) - 1)
    : 0;

  const schedule: AmortizationScheduleRow[] = [];
  let balance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let month = 1; month <= termMonths; month++) {
    const isInterestOnly = month <= interestOnlyMonths;
    const interestPayment = balance * monthlyRate;
    const principalPayment = isInterestOnly ? 0 : (amortizingPayment - interestPayment);
    const payment = isInterestOnly ? interestOnlyPayment : amortizingPayment;
    
    balance = Math.max(0, balance - principalPayment);
    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;

    schedule.push({
      month,
      payment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  return {
    monthlyPayment: interestOnlyMonths > 0 ? interestOnlyPayment : amortizingPayment,
    totalPayment: schedule.reduce((sum, row) => sum + row.payment, 0),
    totalInterest: cumulativeInterest,
    totalPrincipal: loanAmount,
    schedule,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
