import Image from "next/image";
import { displayAddress, getAvatarUrl } from "@/lib/lib";
import Link from "next/link";
import HumanNumber from "./HumanNumber";

export default function TransactionRow({ token, tx, profileContract }: { token: any, tx:any, profileContract: any }) {

  return (
    <li
      key={`transaction-${tx.hash}-${tx.logIndex}`}
      id={`transaction-${tx.hash}-${tx.logIndex}`}
      className={`p-4 border-b border-gray-200 flex items-center ${
        tx.isNew ? "highlight-animation" : ""
      }`}
    >
      <Image
        src={getAvatarUrl(tx.from)}
        alt="Avatar"
        width={40}
        height={40}
        className="rounded-full mr-4"
      />
      <div className="flex flex-col justify-between w-full">
        <div className="font-bold text-xs text-gray-500">
          {tx.date.toLocaleString()}
        </div>
        <div className="flex flex-row align-left">
          <div className="text-xs  text-gray-500 mr-2">
            <label className="block mr-1 float-left">From:</label>{" "}
            <Link href={`?accountAddress=${tx.from}`}>
              {displayAddress(tx.from)}
            </Link>
          </div>
          <div className="text-xs text-gray-500">
            <label className="block mr-1 float-left">To:</label>{" "}
            <Link href={`?accountAddress=${tx.to}`}>
              {displayAddress(tx.to)}
            </Link>
          </div>
        </div>
      </div>
      <div className="text-lg font-bold text-gray-600 text-right">
        <HumanNumber
          value={parseFloat(tx.formattedAmount).toFixed(2)}
        />{" "}
        <span className="text-sm font-normal">{token.symbol}</span>
      </div>
    </li>
  )
}