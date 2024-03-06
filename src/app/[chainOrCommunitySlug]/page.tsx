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
  const config = await configService.getBySlug(communitySlug);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MonitorPage communityConfig={config} accountAddress={accountAddress} />
    </Suspense>
  );
}
