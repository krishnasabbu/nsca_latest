import { Card, CardBody } from '../UI/Card';
import { TrendingUp, TrendingDown, Wallet, DollarSign, CreditCard, Minus } from 'lucide-react';

interface LedgerDashboardProps {
  totalInvestments: number;
  currentMonthCredits: number;
  currentMonthDebits: number;
  currentClosingBalance: number;
  differenceFromLastMonth: number;
}

export function LedgerDashboard({
  totalInvestments,
  currentMonthCredits,
  currentMonthDebits,
  currentClosingBalance,
  differenceFromLastMonth,
}: LedgerDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Investments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalInvestments)}
              </p>
            </div>
            <Wallet className="text-blue-500" size={32} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Credits (This Month)</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(currentMonthCredits)}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Debits (This Month)</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(currentMonthDebits)}
              </p>
            </div>
            <TrendingDown className="text-red-500" size={32} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentClosingBalance)}
              </p>
              <div className="flex items-center mt-1">
                {differenceFromLastMonth > 0 ? (
                  <>
                    <TrendingUp size={16} className="text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      +{formatCurrency(differenceFromLastMonth)}
                    </span>
                  </>
                ) : differenceFromLastMonth < 0 ? (
                  <>
                    <TrendingDown size={16} className="text-red-500 mr-1" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {formatCurrency(differenceFromLastMonth)}
                    </span>
                  </>
                ) : (
                  <>
                    <Minus size={16} className="text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">No change</span>
                  </>
                )}
              </div>
            </div>
            <DollarSign className="text-yellow-500" size={32} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
