import Link from "next/link";
import { ConfigService } from "@citizenwallet/sdk";
import { Heading, Text } from "@radix-ui/themes";

async function HomePage(request) {
  const configService = new ConfigService();
  const configs = await configService.get();

  return (
    <div className="flex flex-col flex-1 p-20 max-w-screen-md">
      <Heading as="h1" className="mb-2">
        Monitor transactions on the blockchain
      </Heading>
      <Heading as="h2" className="mb-2">
        Citizen Wallet Commmunities
      </Heading>
      <ul>
        {configs
          .filter((c) => !c.community.hidden)
          .map(({ community }) => (
            <li key={community.alias}>
              <Link href={`/${community.alias}`}>{community.name}</Link>
            </li>
          ))}
      </ul>
      <Heading as="h2" className="mb-2">
        Any other ERC20 token
      </Heading>
      <Text as="p" className="mb-2">
        Just append <code>/:chain/:tokenAddress</code> to the URL
      </Text>
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
          <Link href="/gnosis/EURb">/gnosis/EURb</Link>
        </li>
        <li>
          <Link href="/polygon/ZINNE">/polygon/ZINNE</Link>
        </li>
      </ul>
    </div>
  );
}

export default HomePage;
