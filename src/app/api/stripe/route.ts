import { NextRequest } from "next/server";
import { getTransactions } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const productIds = request.nextUrl.searchParams.get("productIds");
  const fromDate = request.nextUrl.searchParams.get("fromDate") || "";
  if (!productIds) {
    return Response.json({ error: "productIds is required" }, { status: 400 });
  }

  console.log("api> stripe> GET", productIds, fromDate);

  const data = await getTransactions(
    productIds.split(","),
    fromDate ? new Date(fromDate) : undefined
  );

  return Response.json(data);
}
