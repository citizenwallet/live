"use server";

import { generateReceiveLink } from "@citizenwallet/sdk";
import DonateContainer from "@/containers/DonateContainer";
import { ConfigService } from "@citizenwallet/sdk";
import { Suspense } from "react";
import { getTextColor } from "@/lib/colors";
interface props {
  params: {
    chainOrCommunitySlug: string;
  };
  searchParams: {
    accountAddress: string;
  };
}

export default async function Page({
  params: { chainOrCommunitySlug: communitySlug },
  searchParams: { accountAddress },
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
        backgroundColor: config.community.theme.secondary,
        color: getTextColor(config.community.theme.secondary),
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DonateContainer config={config} accountAddress={accountAddress} />
      </Suspense>
    </div>
  );
}
