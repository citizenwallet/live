"use server";

import DonateContainer from "@/containers/DonateContainer";
import CitizenWalletCommunity from "@/lib/citizenwallet";
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
    <div
      className="w-full overflow-x-hidden"
     
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DonateContainer
          profile={profile}
          success={Boolean(success)}
          config={config}
          accountAddress={profile?.account || accountAddress}
        />
      </Suspense>
    </div>
  );
}
