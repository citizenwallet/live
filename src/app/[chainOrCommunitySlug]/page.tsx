"use server";

import MonitorPage from "@/containers/MonitorPage";
import { Suspense } from "react";

const configUrl =
  "https://config.internal.citizenwallet.xyz/v3/communities.json";

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
  const res = await fetch(
    `${configUrl}?cacheBuster=${Math.round(new Date().getTime() / 10000)}`
  );
  const configs = await res.json();
  const config = configs.find(
    (config) => config.community.alias === communitySlug
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MonitorPage communityConfig={config} accountAddress={accountAddress} />
    </Suspense>
  );
}
