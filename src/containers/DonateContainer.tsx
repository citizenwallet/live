"use client";

import Image from "next/image";
import Link from "next/link";
import { generateReceiveLink } from "@citizenwallet/sdk";
import { useProfile } from "@/hooks/citizenwallet";
import { getPlugin } from "@/lib/citizenwallet";
import RegenVillageLogo from "@/public/regenvillage.svg";

const DonateButton = ({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon?: string;
}) => (
  <a
    className="flex flex-row items-center bg-white rounded-xl w-full max-w-xs mx-4 h-16 my-4"
    href={href}
  >
    <div className="w-14 flex items-center justify-center">
      {icon && <img src={icon} alt={`${title} icon`} className="w-8 h-8 m-2" />}
    </div>
    <div className="w-full">
      <div className="text-black text-base">{title}</div>
      <div className="text-[#2FA087] text-xs">{description}</div>
    </div>
  </a>
);

export default function DonateContainer({
  accountAddress,
  config,
}: {
  accountAddress: string;
  config: any;
}) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  console.log(">>> profile", profile, accountAddress, communitySlug);
  if (!config) return null;
  const cwDonateLink = generateReceiveLink(
    "https://app.citizenwallet.xyz",
    accountAddress,
    communitySlug
  );

  const givethPlugin = getPlugin(config, "giveth");
  console.log(">>> givethPlugin", givethPlugin);

  return (
    <div className="max-w-xl mx-auto flex justify-center flex-col">
      <RegenVillageLogo className="my-8 mx-auto" />
      <div className="mx-auto w-full max-w-xs">
        <DonateButton
          title="Donate EURb"
          description="via Citizen Wallet"
          href={cwDonateLink}
          icon="/eurb.svg"
        />

        {givethPlugin && (
          <DonateButton
            title="Donate crypto"
            description="via Giveth"
            href={givethPlugin.url}
            icon={givethPlugin.icon}
          />
        )}
      </div>
    </div>
  );
}
