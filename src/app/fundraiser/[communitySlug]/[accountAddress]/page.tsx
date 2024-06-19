"use server";

import FundraiserPage from "@/containers/FundraiserPage";
import { ConfigService } from "@citizenwallet/sdk";
import { Suspense } from "react";

interface props {
  params: {
    communitySlug: string;
    accountAddress: string;
  };
  searchParams: {
    title: string;
  };
}

export default async function Page({
  params: { communitySlug, accountAddress },
  searchParams: { title },
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
      <FundraiserPage
        communityConfig={config}
        accountAddress={accountAddress}
        title={title}
      />
    </Suspense>
  );
}
