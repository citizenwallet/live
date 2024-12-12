import { NextRequest } from 'next/server';
import CitizenWalletCommunity from '@/lib/citizenwallet';

export async function GET(
  _request: NextRequest,
  { params }: { params: { communitySlug: string; accountAddress: string } }
) {
  const { communitySlug, accountAddress } = params;

  const cw = new CitizenWalletCommunity(communitySlug);
  let profile;
  if (accountAddress.length !== 42 || !accountAddress.startsWith('0x')) {
    profile = await cw.getProfileFromUsername(accountAddress);
  } else {
    profile = await cw.getProfile(accountAddress);
  }

  return Response.json({
    profile,
  });
}
