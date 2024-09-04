"use server";

import MonitorPage from "@/containers/MonitorPage";
import CitizenWalletCommunity from "@/lib/citizenwallet";
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
  
  const cw = new CitizenWalletCommunity(communitySlug);
  const config = await cw.loadConfig();
  let profile;
  if (accountAddress.length !== 42 || !accountAddress.startsWith('0x')) {
    profile = await cw.getProfileFromUsername(accountAddress);
  } else {
    profile = await cw.getProfile(accountAddress);
  }

  if (!config) {
    return <div>Community not found</div>;
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {title && <h1 className="text-4xl font-bold my-4">{title}</h1>}
      <MonitorPage
        communityConfig={config}
        accountAddress={profile?.account || accountAddress}
        profile={profile}
        collectiveSlug={collectiveSlug}
        from={from}
        showHeader={showHeader === "true"}
      />
      <Footer />
    </Suspense>
  );
}
