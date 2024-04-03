import Link from "next/link";
import { ConfigService } from "@citizenwallet/sdk";

async function HomePage(request) {
  const configService = new ConfigService();
  const configs = await configService.get();

  return (
    <div className="container">
      <h1>Monitor transactions on the blockchain</h1>
      <h2>Citizen Wallet Commmunities</h2>
      <ul>
        {configs
          .filter((c) => !c.community.hidden)
          .map(({ community }) => (
            <li key={community.alias}>
              <Link href={`/${community.alias}`}>{community.name}</Link>
            </li>
          ))}
      </ul>
      <h2>Any other ERC20 token</h2>
      <p>
        Just append <code>/:chain/:tokenAddress</code> to the URL
      </p>
      <ul>
        <li>
          <Link href="/celo/cEUR">/celo/cEUR</Link>
        </li>
        <li>
          <Link href="/celo/cUSD">/celo/cUSD</Link>
        </li>
        <li>
          <Link href="/base/OAK">/base/oak</Link>
        </li>
        <li>
          <Link href="/polygon/EURe">/polygon/EURe</Link>
        </li>
        <li>
          <Link href="/gnosis/EURb">/gnosos/EURb</Link>
        </li>
        <li>
          <Link href="/polygon/ZINNE">/polygon/ZINNE</Link>
        </li>
      </ul>
    </div>
  );
}

export default HomePage;
