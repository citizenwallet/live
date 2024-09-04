import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const imgsrc = request.nextUrl.searchParams.get("imgsrc");

  if (!imgsrc) {
    return Response.json(
      { error: "imgsrc is required and must be a char(42)" },
      { status: 400 }
    );
  }

  const accountAddress =
    imgsrc.length === 42 && imgsrc.startsWith("0x") ? imgsrc : null;

  const imgsrc_url = accountAddress
    ? `https://api.multiavatar.com/${accountAddress}.png`
    : imgsrc;

  if (!imgsrc_url.match(/https?:\/\//)) {
    return Response.json(
      { error: "imgsrc must be a valid URL or an Ethereum address" },
      { status: 400 }
    );
  }

  try {
    const avatarResponse = await fetch(imgsrc_url);
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
