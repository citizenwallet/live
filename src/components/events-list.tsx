import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Event } from '@/types/event';
import Loading from "./Loading";

type Props = {
  items: Event[];
  loading: boolean;
}

export function EventsList({ items, loading }: Props) {
  return (
    <Card className="col-span-2 pb-6">
      <CardHeader>
        <CardTitle className={'text-[#8F8A9D] text-center'}>Events</CardTitle>
      </CardHeader>
      <CardContent className={'max-h-96 overflow-y-scroll'}>
        {loading && <Loading />}
        {items && items.length ? <div className="space-y-8">
          {items.map((event) => (
            <div key={event.uid} className="space-y-2 flex items-start">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{event.summary}</h3>
                <div className="text-sm">
                  <p><strong>Start Time:</strong> {new Date(event.start).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div> : <p className="text-muted-foreground">No events found</p>}
      </CardContent>
    </Card>
  )
}

