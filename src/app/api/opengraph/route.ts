import { NextRequest } from 'next/server';
import ogs from 'open-graph-scraper';

export async function GET(request: NextRequest) {

  // extract opengraph info from url
  const url:string = request.nextUrl.searchParams.get('url') || '';
  // fetch opengraph info
  const { result, error } = await ogs({ url });

  return Response.json({ result, error });
}
