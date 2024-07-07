"use client";

import Image from "next/image";
import Link from "next/link";
import { generateReceiveLink } from "@citizenwallet/sdk";
import { useProfile } from "@/hooks/citizenwallet";
import { getPlugin } from "@/lib/citizenwallet";
import RegenVillageLogo from "@/public/regenvillage.svg";
import CreditCardIcon from "@/public/creditcard.svg";
import OrSeparator from "@/public/or-separator.svg";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

const DonateButton = ({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon?: string | React.ReactNode;
}) => (
  <a
    className="flex flex-row items-center bg-white rounded-xl w-full max-w-xs h-16 my-4"
    href={href}
  >
    <div className="w-14 flex items-center justify-center">
      {icon && typeof icon === "string" ? (
        <img src={icon} alt={`${title} icon`} className="w-8 h-8 m-2" />
      ) : (
        icon
      )}
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
  success,
}: {
  accountAddress: string;
  config: any;
  success?: boolean;
}) {
  const communitySlug = config?.community.alias;
  const [profile] = useProfile(communitySlug, accountAddress);
  const { width, height } = useWindowSize();
  console.log(">>> profile", profile, accountAddress, communitySlug);
  console.log(">>> width, height", width, height);
  if (!config) return null;
  const cwDonateLink = generateReceiveLink(
    "https://app.citizenwallet.xyz",
    accountAddress,
    communitySlug === "regenvillage.wallet.pay.brussels"
      ? "wallet.pay.brussels"
      : communitySlug
  );
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${communitySlug}/${accountAddress}/donate`;
  const givethPlugin = getPlugin(config, "giveth");
  const topupPlugin = getPlugin(config, "Top Up");
  console.log(">>> givethPlugin", givethPlugin);

  return (
    <div className="w-full h-full relative">
      {success && <Confetti width={width} height={height} />}
      <div className="max-w-xl mx-auto flex justify-center flex-col">
        <RegenVillageLogo className="my-8 mx-auto" />

        <div>
          {success && (
            <div className="rounded-xl max-w-sm mx-auto h-dvh flex flex-col items-center">
              <div>
                <h1 className="font-bold text-center">Success! 🎉</h1>
                <p className="text-center">
                  Thank you for your contribution 🙏
                </p>
              </div>
            </div>
          )}
          {!success && (
            <div className="mx-auto w-full max-w-xs p-4">
              {givethPlugin && (
                <DonateButton
                  title="Donate crypto"
                  description="via Giveth"
                  href={givethPlugin.url}
                  icon={givethPlugin.icon}
                />
              )}

              <div className="flex justify-center w-full text-center mx-auto">
                <OrSeparator className="" />
              </div>
              <DonateButton
                title="Donate EURb"
                description="via Citizen Wallet"
                href={cwDonateLink}
                icon="/eurb.svg"
              />

              {topupPlugin && (
                <DonateButton
                  title="Donate with credit card"
                  description="via Stripe"
                  href={`${
                    topupPlugin.url
                  }?account=${accountAddress}&redirectUrl=${encodeURIComponent(
                    redirectUrl
                  )}`}
                  icon={<CreditCardIcon width={22} height={16} />}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
