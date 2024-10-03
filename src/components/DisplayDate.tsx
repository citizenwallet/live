import moment from 'moment';
import { useState, useEffect } from 'react';

function formatDate(date: Date, isRelative: boolean) {
  if (isRelative) {
    return moment(date).fromNow();
  } else {
    const localeData = moment.localeData();
    const dateFormat = localeData.longDateFormat('L');
    const timeFormat = localeData.longDateFormat('LTS');
    return moment(date).format(`${dateFormat} ${timeFormat}`);
  }
}

export default function DisplayDate({
  datetime,
  relative,
  refresh,
}: {
  datetime: Date;
  relative: boolean;
  refresh: boolean;
}) {
  const [datestr, setDate] = useState(() => formatDate(datetime, relative));

  useEffect(() => {
    setDate(formatDate(datetime, relative));
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
