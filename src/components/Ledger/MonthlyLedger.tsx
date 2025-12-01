import { Card, CardBody } from '../UI/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MonthlyLedgerEntry } from '../../utils/calcLedger';

interface MonthlyLedgerProps {
  ledgerEntries: MonthlyLedgerEntry[];
}

export function MonthlyLedger({ ledgerEntries }: MonthlyLedgerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const reversedEntries = [...ledgerEntries].reverse();

  return (
    <Card>
      <CardBody>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Ledger</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Month
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Opening Balance
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">
                  Credits
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-red-600 dark:text-red-400">
                  Debits
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Closing Balance
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody>
              {reversedEntries.map((entry, index) => (
                <tr
                  key={`${entry.month}-${index}`}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                    {entry.month}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                    {formatCurrency(entry.openingBalance)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">
                    {formatCurrency(entry.credits)}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 font-medium">
                    {formatCurrency(entry.debits)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(entry.closingBalance)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end">
                      {entry.differenceFromLastMonth > 0 ? (
                        <>
                          <TrendingUp size={16} className="text-green-500 mr-1" />
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            +{formatCurrency(entry.differenceFromLastMonth)}
                          </span>
                        </>
                      ) : entry.differenceFromLastMonth < 0 ? (
                        <>
                          <TrendingDown size={16} className="text-red-500 mr-1" />
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(entry.differenceFromLastMonth)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus size={16} className="text-gray-500 mr-1" />
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ledgerEntries.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No ledger entries found. Transactions will appear here once available.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
