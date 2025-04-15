import { NextRequest } from 'next/server';
import CitizenWalletCommunity from '@/lib/citizenwallet';

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { communitySlug: string; accountAddress: string };
  }
) {
  const { communitySlug, accountAddress } = params;
  const size = request.nextUrl.searchParams.get('size');

  const cw = new CitizenWalletCommunity(communitySlug);
  let profile;
  if (accountAddress.length !== 42 || !accountAddress.startsWith('0x')) {
    profile = await cw.getProfileFromUsername(accountAddress);
  } else {
    profile = await cw.getProfile(accountAddress);
  }

  // const defaultAvatar = `https://avatar.vercel.sh/${accountAddress}`;
  const defaultAvatar = `https://api.multiavatar.com/${accountAddress}.png`;

  const image_size = ['small', 'medium'].includes(size || '')
    ? `image_${size}`
    : 'image';
  const imgsrc = profile?.[image_size] || defaultAvatar;

  try {
    const avatarResponse = await fetch(
      imgsrc.replace('ipfs://', 'https://ipfs.internal.citizenwallet.xyz/')
    );
    if (!avatarResponse.ok) {
      return Response.redirect(defaultAvatar);
    }
    const imageBuffer = await avatarResponse.arrayBuffer();
    return new Response(Buffer.from(imageBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'cache-control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error(`Unable to fetch ${imgsrc}`, error);
    return Response.json({ error: 'Failed to fetch avatar' }, { status: 500 });
  }
}
