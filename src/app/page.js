import { ConfigService } from "@citizenwallet/sdk";
import { Box, Container, Link, Text } from "@radix-ui/themes";
import Loading from "../components/Loading";
import Image from "next/image";
async function HomePage(request) {
  const configService = new ConfigService();
  const configs = await configService.get();

  return (
    <Box className="flex flex-col flex-1 px-3">
      <Container className="mt-6">
        <div className="flex items-center">
          <Loading />
          <h1 className="ml-2">Transactions monitor</h1>
        </div>

        <div>
          <h2>Trending</h2>
          <ul>
            <li className="border-gray-200 rounded-lg my-2 p-2 border-2">
              <Link href="/fundraiser/regenvillage.wallet.pay.brussels/0x32330e05494177CF452F4093290306c4598ddA98?title=Support%20the%20Regen%20Village&goal=100000&collectiveSlug=regen-village">
                Regen Village Fundraising
              </Link>
            </li>
            <li className="border-gray-200 rounded-lg my-2 p-2 border-2">
              <Link href="/regenvillage.wallet.pay.brussels/0x32330e05494177CF452F4093290306c4598ddA98">
                Regen Village Donate EURb
              </Link>
            </li>
            <li className="border-gray-200 rounded-lg my-2 p-2 border-2">
              <Link href="/wallet.pay.brussels/0x84FdEfF8a5bdC8Cd22f8FBd3A4308166F419a773">
                133wav at the Regen Village
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2">Citizen Wallet Commmunities</h2>
          <ul>
            {configs
              .filter((c) => !c.community.hidden)
              .map(({ community }) => (
                <li
                  key={community.alias}
                  className="border-gray-200 rounded-lg my-2 p-2 border-2"
                >
                  <Link href={`/${community.alias}`}>
                    <div className="flex items-center">
                      <Image
                        src={community.logo}
                        width={24}
                        height={24}
                        className="mr-2"
                      />{" "}
                      {community.name}
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="mb-2">Any other ERC20 token</h2>
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
      </Container>
    </Box>
  );
}

export default HomePage;
