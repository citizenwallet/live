"use client";

import { generateReceiveLink, Profile } from "@citizenwallet/sdk";
import { getPlugin } from "@/lib/citizenwallet";
import RegenVillageLogo from "@/public/regenvillage.svg";
import OpenCollectiveIcon from "@/public/opencollective.svg";
import CreditCardIcon from "@/public/creditcard.svg";
import OrSeparator from "@/public/or-separator.svg";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import accountsConfig from "../../config.json";
import { Milestone } from "@/components/ProgressBar";
import { getUrlFromIPFS } from "@/lib/ipfs";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  priceDescription: string;
  url?: string;
  amount?: number;
  currency?: string;
  recurring?: string;
  image?: string;
};

type AccountSettings = {
  [key: string]: Settings;
};

type Settings = {
  donatePage?: {
    title?: string;
    amounts?: string;
  };
  opencollectiveSlug?: string;
  giveth?: {
    projectId: number;
    url?: string;
  };
  stripe?: {
    products: Product[];
  };
  milestones?: Milestone[];
};

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
    className="flex flex-row items-center bg-gray-200 hover:bg-gray-300 rounded-xl w-full max-w-xs h-16 my-4"
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
  profile,
  accountAddress,
  config,
  success,
}: {
  profile?: Profile;
  accountAddress: string;
  config: any;
  success?: boolean;
}) {
  const communitySlug = config?.community.alias;
  const { width, height } = useWindowSize();
  if (!config) return null;
  const cwDonateLink = generateReceiveLink(
    "https://app.citizenwallet.xyz",
    accountAddress,
    communitySlug === "regenvillage.wallet.pay.brussels"
      ? "wallet.pay.brussels"
      : communitySlug
  );
  const redirectUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/${communitySlug}/${accountAddress}/donate`;
  const topupPlugin = getPlugin(config, "Top Up");
  const accountSettings: AccountSettings = accountsConfig;
  const settings: Settings = accountSettings[accountAddress] || {};
  const title = settings?.donatePage?.title || "Top Up";
  const amounts =
    settings?.donatePage?.amounts || "1, 2, 5, 10, 20, 50, custom";


  const avatarImg = getUrlFromIPFS(profile?.image || "") || `https://api.multiavatar.com/${profile?.username}.png`;
  return (
    <div className="w-full min-h-screen">
      {success && <Confetti width={width} height={height} />}
      <div className="max-w-xl mx-auto flex justify-center flex-col h-full">
      { profile?.username && <div className="flex flex-col items-center pt-6">
        <Image src={avatarImg} width={100} height={100} className="rounded-full" alt={profile?.username} />
        <h1 className="text-2xl font-bold mt-4">{profile?.name}</h1>
        <h1 className="text-lg mb-4">@{profile?.username}</h1>
        </div>}
        {accountAddress === "0x32330e05494177CF452F4093290306c4598ddA98" && (
          <RegenVillageLogo className="my-8 mx-auto" />
        )}

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
            <div className="mx-auto w-full max-w-xs p-4 h-full">
              {settings.stripe?.products &&
                settings.stripe.products.map((product: Product) => (
                  <DonateButton
                    key={product.id}
                    title={product.name}
                    description={product.priceDescription}
                    href={product.url || ""}
                    icon={product.image}
                  />
                ))}
              {settings.stripe?.products && (
                <div className="flex justify-center w-full text-center mx-auto">
                  <OrSeparator className="" />
                </div>
              )}
              {settings.giveth && (
                <div>
                  <DonateButton
                    title="Donate crypto"
                    description="via Giveth"
                    href={settings.giveth.url || ""}
                    icon={
                      "https://wallet.regenvillage.brussels/uploads/giveth.svg"
                    }
                  />
                  {!settings.stripe?.products && (
                    <div className="flex justify-center w-full text-center mx-auto">
                      <OrSeparator className="" />
                    </div>
                  )}
                </div>
              )}

              <DonateButton
                title="Donate EURb"
                description="via Citizen Wallet"
                href={cwDonateLink}
                icon="/eurb.svg"
              />

              {topupPlugin && (
                <div>
                  {!settings.giveth && (
                    <div className="flex justify-center w-full text-center mx-auto">
                      <OrSeparator className="" />
                    </div>
                  )}
                  <DonateButton
                    title="Donate with credit card"
                    description="via Stripe"
                    href={`${
                      topupPlugin.url
                    }?account=${accountAddress}&title=${encodeURIComponent(
                      title
                    )}&amounts=${amounts}&redirectUrl=${encodeURIComponent(
                      redirectUrl
                    )}`}
                    icon={<CreditCardIcon width={22} height={16} />}
                  />
                </div>
              )}
              {settings.opencollectiveSlug && (
                <DonateButton
                  title="Donate euros"
                  description="via Open Collective"
                  href={`https://opencollective.com/${settings.opencollectiveSlug}/donate`}
                  icon={<OpenCollectiveIcon width={22} height={22} />}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
