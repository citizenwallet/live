import Image from "next/image";
import { displayAddress, getAvatarUrl } from "@/lib/lib";
import Link from "next/link";
import HumanNumber from "./HumanNumber";
import { useProfile } from "@/hooks/citizenwallet";
import { getUrlFromIPFS } from "@/lib/ipfs";
import { Transfer } from "@citizenwallet/sdk";
import { formatUnits } from "ethers";
export default function TransactionRow({
  token,
  tx,
  communitySlug,
  decimals,
}: {
  token: any;
  tx: Transfer;
  communitySlug: string;
  decimals: number;
}) {
  const [fromProfile] = useProfile(communitySlug, tx.from);
  const [toProfile] = useProfile(communitySlug, tx.to);

  const backgroundColor =
    tx.status === "success" ? "highlight-animation" : "bg-yellow-200";

  return (
    <li
      key={`transaction-${tx.tx_hash}`}
      id={`transaction-${tx.tx_hash}`}
      className={`relative p-4 border border-gray-200 flex items-center ${backgroundColor} transition-colors`}
    >
      <Image
        src={
          fromProfile?.image_medium
            ? getUrlFromIPFS(fromProfile.image_medium) || ""
            : getAvatarUrl(tx.from)
        }
        alt="Avatar"
        width={40}
        height={40}
        className="rounded-full mr-4"
      />
      <div className="flex flex-col justify-between w-full">
        <div className="font-bold text-xs text-gray-500">
          {new Date(tx.created_at).toLocaleString()}
        </div>
        <div className="flex flex-row align-left">
          <div className="text-xs  text-gray-500 mr-2">
            <label className="block mr-1 float-left">From:</label>{" "}
            <Link href={`?accountAddress=${tx.from}`}>
              {fromProfile?.name
                ? `${fromProfile.name} (@${fromProfile.username})`
                : displayAddress(tx.from)}
            </Link>
          </div>
          <div className="text-xs text-gray-500">
            <label className="block mr-1 float-left">To:</label>{" "}
            <Link href={`?accountAddress=${tx.to}`}>
              {toProfile?.name
                ? `${toProfile.name} (@${toProfile.username})`
                : displayAddress(tx.to)}{" "}
            </Link>
          </div>
        </div>
      </div>
      <div className="text-lg font-bold text-gray-600 text-right">
        <HumanNumber value={formatUnits(BigInt(tx.value), decimals)} />{" "}
        <span className="text-sm font-normal">{token.symbol}</span>
      </div>
      {/* <div className="absolute bottom-1 right-1 text-xs text-gray-500">
        {tx.status === "success" ? "✅" : "⏳"}
      </div> */}
    </li>
  );
}
