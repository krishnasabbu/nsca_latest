import { Investment, SmsMessage } from '../types';

export interface MonthlyLedgerEntry {
  month: string;
  year: number;
  openingBalance: number;
  credits: number;
  debits: number;
  closingBalance: number;
  differenceFromLastMonth: number;
}

export function calculateLedger(
  investments: Investment[],
  smsMessages: SmsMessage[]
): MonthlyLedgerEntry[] {
  const mainFund = investments.reduce((sum, inv) => sum + inv.amount, 0);

  const messagesByMonth = new Map<string, { credits: number; debits: number }>();

  smsMessages.forEach((msg) => {
    const date = new Date(msg.smsDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!messagesByMonth.has(monthKey)) {
      messagesByMonth.set(monthKey, { credits: 0, debits: 0 });
    }

    const entry = messagesByMonth.get(monthKey)!;
    if (msg.transactionType.toLowerCase() === 'credit') {
      entry.credits += msg.amount;
    } else if (msg.transactionType.toLowerCase() === 'debit') {
      entry.debits += msg.amount;
    }
  });

  const sortedMonths = Array.from(messagesByMonth.keys()).sort();

  const ledgerEntries: MonthlyLedgerEntry[] = [];
  let previousClosingBalance = mainFund;

  sortedMonths.forEach((monthKey) => {
    const [year, month] = monthKey.split('-');
    const { credits, debits } = messagesByMonth.get(monthKey)!;

    const openingBalance = previousClosingBalance;
    const closingBalance = openingBalance + credits - debits;
    const differenceFromLastMonth = closingBalance - previousClosingBalance;

    ledgerEntries.push({
      month: new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      year: parseInt(year),
      openingBalance,
      credits,
      debits,
      closingBalance,
      differenceFromLastMonth,
    });

    previousClosingBalance = closingBalance;
  });

  return ledgerEntries;
}

export function getCurrentMonthStats(
  investments: Investment[],
  smsMessages: SmsMessage[]
): {
  totalInvestments: number;
  currentMonthCredits: number;
  currentMonthDebits: number;
  currentClosingBalance: number;
  differenceFromLastMonth: number;
} {
  const mainFund = investments.reduce((sum, inv) => sum + inv.amount, 0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let currentMonthCredits = 0;
  let currentMonthDebits = 0;

  smsMessages.forEach((msg) => {
    const date = new Date(msg.smsDate);
    if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
      if (msg.transactionType.toLowerCase() === 'credit') {
        currentMonthCredits += msg.amount;
      } else if (msg.transactionType.toLowerCase() === 'debit') {
        currentMonthDebits += msg.amount;
      }
    }
  });

  const ledgerEntries = calculateLedger(investments, smsMessages);

  const currentMonthEntry = ledgerEntries.find((entry) => {
    const entryDate = new Date(entry.month);
    return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
  });

  const currentClosingBalance = currentMonthEntry?.closingBalance || mainFund;
  const differenceFromLastMonth = currentMonthEntry?.differenceFromLastMonth || 0;

  return {
    totalInvestments: mainFund,
    currentMonthCredits,
    currentMonthDebits,
    currentClosingBalance,
    differenceFromLastMonth,
  };
}

export function filterLedgerByDateRange(
  ledgerEntries: MonthlyLedgerEntry[],
  startYear?: number,
  startMonth?: number,
  endYear?: number,
  endMonth?: number
): MonthlyLedgerEntry[] {
  if (!startYear && !endYear) return ledgerEntries;

  return ledgerEntries.filter((entry) => {
    const entryDate = new Date(entry.month);
    const entryYear = entryDate.getFullYear();
    const entryMonth = entryDate.getMonth();

    if (startYear && startMonth !== undefined) {
      if (entryYear < startYear || (entryYear === startYear && entryMonth < startMonth)) {
        return false;
      }
    }

    if (endYear && endMonth !== undefined) {
      if (entryYear > endYear || (entryYear === endYear && entryMonth > endMonth)) {
        return false;
      }
    }

    return true;
  });
}
