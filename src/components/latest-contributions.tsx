import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Event } from '@/types/event';
import Loading from './Loading';
import useSWR from 'swr';
import { sortBy } from 'lodash';

type Props = {
  items: Event[];
  loading: boolean;
}

export function LatestContributions() {

  const { data, isLoading } = useSWR('/api/contributions', async (url) => {
    const response = await fetch(url);
    return await response.json();
  });

  return (
    <Card className="col-span-2 pb-6 mt-3">
      <CardHeader>
        <CardTitle className={'text-[#8F8A9D] text-center'}>Top contributors</CardTitle>
      </CardHeader>
      <CardContent className={'max-h-96 overflow-y-scroll'}>
        {isLoading && <Loading />}
        {data && data.userMentions ? <div className="space-y-8">
          {sortBy(data.userMentions, 'count').reverse().map((item: any, key) => (
            <div key={key} className="space-y-2 flex items-start">
              <div className="flex-none w-12 h-12 relative">
                {item.avatar ? <img src={`https://cdn.discordapp.com/avatars/${item.id}/${item.avatar}.png`} alt={item.username} className="rounded-full" /> : <div className="rounded-full bg-gray-200 w-full h-full" />}
              </div>
              <div className="flex-grow pl-3">
                <h3 className="text-lg font-semibold">{item.username}</h3>
                <div className="text-sm">
                  <p>{item.count} mentions</p>
                </div>
              </div>
            </div>
          ))}
        </div> : <p className="text-muted-foreground">No events found</p>}
      </CardContent>
    </Card>
  );
}

