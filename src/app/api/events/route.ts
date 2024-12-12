import axios from 'axios';
import ical from 'ical';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const icalUrl = process.env.NEXT_PUBLIC_ICAL || '';

  if (!icalUrl) {
    return  Response.json({ error: 'Missing iCal URL' });
  }

  try {
    // Fetch the iCal data from the provided URL
    const response = await axios.get(icalUrl);
    const icalData = response.data;

    // Parse the iCal data
    const events = ical.parseICS(icalData);
    const eventList = Object.values(events).filter(event => event.type === 'VEVENT');
    return Response.json({ data: eventList.reverse() });
  } catch (error: any) {
    return  Response.json({ error: error.message });
  }
}
