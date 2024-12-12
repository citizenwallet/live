import axios from 'axios';
import { ContributionService } from '@/services/contribution-service';

export async function GET(request: any) {
  const service = new ContributionService();
  const timeline = await service.getTimeline();
  return Response.json(timeline);
}
