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
}

export default async function Page({
  params: { communitySlug, accountAddress },
}: props) {
  console.log(
    ">>> communitySlug",
    communitySlug,
    "accountAddress",
    accountAddress
  );
  const configService = new ConfigService();
  const configs = await configService.get(true);
  console.log(">>> configs", configs);
  const config = configs.find(
    (config) => config.community.alias === communitySlug
  );

  if (!config) {
    return <div>Community not found</div>;
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MonitorPage communityConfig={config} accountAddress={accountAddress} />
      <Footer />
    </Suspense>
  );
}
