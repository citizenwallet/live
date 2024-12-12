import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contribution {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
}

type Props = {
  items: Contribution[]
}

export function ContributionTimeline({ items }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chronologie des Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-muted"></div>
          <div className="relative flex justify-between">
            {items.map((contribution, index) => (
              <div key={contribution.id} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full mb-2 ${
                    contribution.status === 'completed' ? 'bg-green-500' :
                      contribution.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}
                ></div>
                <div className="text-sm font-medium text-center w-24 overflow-hidden text-ellipsis whitespace-nowrap"
                     title={contribution.title}>
                  {contribution.title}
                </div>
                <div className="text-xs text-muted-foreground">{contribution.date}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContributionTimeline;
