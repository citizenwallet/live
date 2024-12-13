'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Event } from '@/types/event';
import Loading from './Loading';
import useSWR from 'swr';
import { sortBy } from 'lodash';

type Props = {
  items: Event[];
  loading: boolean;
}

export function AvatarContributions() {

  const { data, isLoading } = useSWR('/api/contributions', async (url) => {
    const response = await fetch(url);
    return await response.json();
  });

  return (
    <Card className="col-span-2 pb-6 mt-3 min-w-full">
      <CardHeader>
        <CardTitle className={'text-[#8F8A9D] text-center'}>Contributors</CardTitle>
      </CardHeader>
      <CardContent className={'max-h-screen overflow-y-scroll'}>
        {isLoading && <Loading />}
        {data?.data ? <div className="flex flex-wrap gap-2">
          {sortBy(data.data, 'count').reverse().map((item: any, key) => (
            <div key={key} className="">
              <div className="flex-none relative">
                <img src={item.image || 'https://www.londondentalsmiles.co.uk/wp-content/uploads/2017/06/person-dummy.jpg'} alt={item.username}
                       className="rounded-full" />
                <div className={'text-center font-extrabold text-2xl mt-1 hidden'}>{item.count} 🎉</div>
              </div>
            </div>
          ))}
        </div> : <p className="text-muted-foreground">No events found</p>}
      </CardContent>
    </Card>
  );
}

