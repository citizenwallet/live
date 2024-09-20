import moment from 'moment';
import { useState, useEffect } from 'react';

export default function DisplayDate({
  datetime,
  relative,
  refresh,
}: {
  datetime: Date;
  relative: boolean;
  refresh: boolean;
}) {
  const [datestr, setDate] = useState(
    relative ? moment(datetime).fromNow() : datetime.toLocaleString()
  );

  useEffect(() => {
    if (refresh) {
      const intervalId = setInterval(() => {
        setDate(moment(datetime).fromNow());
      }, 1000 * 60);

      // Cleanup function to clear the interval when unmounting
      return () => clearInterval(intervalId);
    }
  }, [datetime, refresh, relative]);

  return <div>{datestr}</div>;
}
