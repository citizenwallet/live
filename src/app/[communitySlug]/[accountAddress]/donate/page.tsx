"use server";

import { generateReceiveLink } from "@citizenwallet/sdk";
import DonateContainer from "@/containers/DonateContainer";
import { ConfigService } from "@citizenwallet/sdk";
import { Suspense } from "react";
import { getTextColor } from "@/lib/colors";
interface props {
  params: {
    communitySlug: string;
    accountAddress: string;
  };
  searchParams: {
    success: string;
  };
}

export default async function Page({
  params: { communitySlug, accountAddress },
  searchParams: { success },
}: props) {
  const configService = new ConfigService();
  const configs = await configService.get(true);
  const config = configs.find(
    (config: any) => config.community.alias === communitySlug
  );

  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: config.community?.theme?.secondary || "#333",
        color: getTextColor(config.community?.theme?.secondary || "#333"),
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DonateContainer
          success={Boolean(success)}
          config={config}
          accountAddress={accountAddress}
        />
      </Suspense>
    </div>
  );
}
