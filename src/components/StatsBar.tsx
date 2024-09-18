import AnimatedNumber from '@/components/AnimatedNumber';

type PropsType = {
  stats: {
    totalTransfers: number;
    totalAmountTransferred: number;
    uniqueUsers?: number;
  };
  currency: string;
};

export default function StatsBar({ stats, currency }: PropsType) {
  return (
    <div className="flex flex-row justify-between mx-0 sm:mx-2 my-2">
      {stats.uniqueUsers && (
        <div className="bg-white shadow rounded-lg p-3 sm:p-4 flex items-center justify-between w-1/4 mx-1 sm:mx-2">
          <div>
            <div className="font-bold">
              <AnimatedNumber value={stats.uniqueUsers} />
            </div>
            <div className="text-sm font-medium text-gray-500">users</div>
          </div>
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4 flex items-center justify-between w-1/4 min-w-[100px] mx-1 sm:mx-2">
        <div>
          <div className="font-bold">
            <AnimatedNumber value={stats.totalTransfers} />
          </div>
          <div className="text-sm font-medium text-gray-500">transactions</div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-3 sm:p-4 flex items-center justify-between w-1/2 mx-1 sm:mx-2">
        <div>
          <div className="font-bold flex items-baseline">
            <div className="text-right mr-1">
              <AnimatedNumber
                value={stats.totalAmountTransferred}
                decimals={stats.totalAmountTransferred >= 10000 ? 0 : 2}
              />
            </div>
            {} <span className="font-normal text-sm">{currency}</span>
          </div>
          <div className="text-sm font-medium text-gray-500">transferred</div>
        </div>
      </div>
    </div>
  );
}
