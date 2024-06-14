"use server";

import MonitorPage from "@/containers/MonitorPage";
import { ConfigService } from "@citizenwallet/sdk";
import { Suspense } from "react";

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

  const configs = await configService.get();

  const config = configs.find(
    (config) => config.community.alias === communitySlug
  );

  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MonitorPage communityConfig={config} accountAddress={accountAddress} />
    </Suspense>
  );
}
