import AnimatedNumber from "@/components/AnimatedNumber";

type PropsType = {
  stats: {
    totalTransfers: number;
    totalAmountTransferred: number;
  };
  currency: string;
};

export default function StatsBar({ stats, currency }: PropsType) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">
            Number of Transactions
          </div>
          <div className="font-bold">
            <AnimatedNumber value={stats.totalTransfers} />
          </div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">
            Total Amount Transferred
          </div>
          <div className="font-bold flex items-baseline">
            <div className="text-right mr-1">
              <AnimatedNumber
                value={stats.totalAmountTransferred}
                decimals={stats.totalAmountTransferred >= 10000 ? 0 : 2}
              />
            </div>
            {} <span className="font-normal text-sm">{currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
