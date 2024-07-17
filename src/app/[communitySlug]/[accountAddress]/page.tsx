"use server";

import MonitorPage from "@/containers/MonitorPage";
import { ConfigService } from "@citizenwallet/sdk";
import { Suspense } from "react";
import Footer from "@/components/Footer";

interface props {
  params: {
    communitySlug: string;
    accountAddress: string;
  };
  searchParams: {
    collectiveSlug?: string;
    from?: string;
    title?: string;
    showHeader: string;
  };
}

export default async function Page({
  params: { communitySlug, accountAddress },
  searchParams: { collectiveSlug, from, title, showHeader = "true" },
}: props) {
  console.log(
    ">>> communitySlug",
    communitySlug,
    "accountAddress",
    accountAddress
  );
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
      {title && <h1 className="text-4xl font-bold my-4">{title}</h1>}
      <MonitorPage
        communityConfig={config}
        accountAddress={accountAddress}
        collectiveSlug={collectiveSlug}
        from={from}
        showHeader={showHeader === "true"}
      />
      <Footer />
    </Suspense>
  );
}
