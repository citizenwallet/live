import { GraphQLClient, gql } from "graphql-request";
import AbortController from "abort-controller";
import useSWR from "swr";
import HumanNumber from "./HumanNumber";

const query = gql`
  fragment DonationCoreFields on Donation {
    __typename
    id
    anonymous
    amount
    valueUsd
    currency
    transactionId
    transactionNetworkId
    chainType
    createdAt
    donationType
    status
    onramperId
  }
  query DonationsByProjectId(
    $take: Int
    $skip: Int
    $traceable: Boolean
    $qfRoundId: Int
    $projectId: Int!
    $searchTerm: String
    $orderBy: SortBy
    $status: String
  ) {
    donationsByProjectId(
      take: $take
      skip: $skip
      traceable: $traceable
      qfRoundId: $qfRoundId
      projectId: $projectId
      searchTerm: $searchTerm
      orderBy: $orderBy
      status: $status
    ) {
      donations {
        ...DonationCoreFields
        user {
          name
          walletAddress
          avatar
        }
      }
      totalCount
      totalUsdBalance
    }
  }
`;

const getGivethData = async (collectiveSlug, take, skip) => {
  if (!collectiveSlug) throw new Error("Missing collectiveSlug");

  const slugParts = collectiveSlug.split("/");
  const slug = slugParts[slugParts.length - 1];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000);
  const graphQLClient = new GraphQLClient(process.env.GIVETH_GRAPHQL_API, {
    signal: controller.signal,
  });
  const data = await graphQLClient.request(
    query,
    {
      projectId: 1871,
      take: take || 100,
      skip: skip || 0,
      orderBy: { field: "CreationDate", direction: "DESC" },
      status: "verified",
    },
    {
      "cache-control": "no-cache",
    }
  );
  const result = data.donationsByProjectId;
  return result;
};

const Donations = ({ projectId, take, skip, showStatus }) => {
  const { data, error } = useSWR(
    projectId,
    (collectiveSlug) => getGivethData(collectiveSlug, take, skip),
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000, // 1 minute
      refreshInterval: 20000, // 20s
      errorRetryCount: 3,
      errorRetryInterval: 15000, // 15 seconds
      keepPreviousData: true,
    }
  );

  // console.log(">>> error received", error);
  // console.log(">>> data received", data);

  if (error) return <div>An error has occurred.</div>;
  if (!data) return <div className="text-center">Loading...</div>;
  return (
    <div>
      <ul className="list-none m-3">
        {data.donations.map((donation) => (
          <li
            key={donation.id}
            className="flex flex-row my-2 items-center px-4 py-2 border-b border-gray-200 dark:border-gray-800 justify-between font-bold"
          >
            <div className="mr-2 text-left">
              <a
                href={`https://opencollective.com/${collectiveSlug}/donations/${donation.id}`}
                title="open donation on opencollective.com"
              >
                {donation.description}
              </a>
            </div>
            <div className="text-right flex flex-row">
              {donation.currency}
              <HumanNumber value={donation.amount} />
              {donation.valueUsd !== donation.amount &&
                `($${donation.valueUsd})`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Donations;
