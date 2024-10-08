"use server";

import MonitorPage from "@/containers/MonitorPage";
import { ConfigService } from "@citizenwallet/sdk";
import { Suspense } from "react";
import Footer from "@/components/Footer";
interface props {
  params: {
    communitySlug: string;
  };
  searchParams: {
    accountAddress: string;
    showHeader: string;
    from: string;
  };
}

export default async function Page({
  params: { communitySlug },
  searchParams: { accountAddress, showHeader, from },
}: props) {
  const configService = new ConfigService();

  const configs = await configService.get(true);
  const config = configs.find(
    (config) => config.community.alias === communitySlug
  );

  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MonitorPage
        communityConfig={config}
        accountAddress={accountAddress}
        from={from}
        showHeader={showHeader !== "false"}
      />
      <Footer />
    </Suspense>
  );
}
