import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const accountAddress = request.nextUrl.searchParams.get("accountAddress");

  if (!accountAddress || accountAddress.length !== 42) {
    return Response.json(
      { error: "accountAddress is required and must be a char(42)" },
      { status: 400 }
    );
  }

  try {
    const avatarResponse = await fetch(
      `https://api.multiavatar.com/${accountAddress}.png`
    );
    if (!avatarResponse.ok) {
      throw new Error(`Failed to fetch avatar for ${accountAddress}`);
    }
    const imageBuffer = await avatarResponse.arrayBuffer();
    return new Response(Buffer.from(imageBuffer), {
      headers: {
        "Content-Type": "image/png",
        "cache-control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch avatar" }, { status: 500 });
  }
}
