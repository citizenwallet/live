import { NextRequest } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';
import AbortController from 'abort-controller';

const USD_EUR_FXRATE = parseFloat(process.env.USD_EUR_FXRATE || '0.92');

export const dynamic = 'force-dynamic';

export type TransferStatus = 'sending' | 'pending' | 'success' | 'fail';
export interface TransferData {
  description: string;
  originalValue?: number;
  originalCurrency?: string;
  valueUSD?: number;
  valueEUR?: number;
  via: string;
}
export interface Transfer {
  hash: string;
  tx_hash: string;
  token_id: number;
  created_at: Date;
  from: string;
  fromProfile?: {
    name: string;
    imgsrc: string;
  };
  to: string;
  nonce?: number;
  value: number;
  currency: string;
  data: TransferData | null;
  status: TransferStatus;
  networkId: number;
}

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

const getGivethData = async (
  projectId: number = 1871,
  projectAddress: string,
  take: number = 10,
  skip: number = 0,
  fromDate: string,
  sinceLastId?: number
) => {
  const fromDateTime = new Date(fromDate).getTime();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000);
  const graphQLClient = new GraphQLClient(
    process.env.GIVETH_GRAPHQL_API || '',
    {
      // @ts-ignore
      signal: controller.signal,
    }
  );
  const data: any = await graphQLClient.request(query, {
    projectId,
    take,
    skip,
    orderBy: { field: 'CreationDate', direction: 'DESC' },
    status: 'verified',
  });

  console.log('>>> filter', fromDate, fromDateTime);

  let filterCondition = (donation: any) => true;
  if (sinceLastId && sinceLastId > 0) {
    filterCondition = (donation: any) => donation.id > sinceLastId;
  }
  if (fromDate) {
    filterCondition = (donation: any) =>
      new Date(donation.createdAt).getTime() > fromDateTime;
  }
  const transfers: Transfer[] = [];
  const donations = data.donationsByProjectId.donations.filter(filterCondition);

  donations.map((donation: any) => {
    transfers.push({
      status: 'success',
      hash: donation.transactionId,
      tx_hash: donation.transactionId,
      token_id: parseInt(donation.id),
      value: Math.round(donation.valueUsd * USD_EUR_FXRATE * 10 ** 6),
      currency: 'EUR',
      created_at: new Date(donation.createdAt),
      from: donation.user.walletAddress,
      to: projectAddress,
      networkId: donation.transactionNetworkId,
      fromProfile: {
        name: donation.user.name,
        imgsrc: donation.user.avatar,
      },
      data: {
        description: `Donation of ${donation.amount} ${donation.currency} via Giveth`,
        originalCurrency: donation.currency,
        originalValue: donation.amount,
        valueUSD: donation.valueUsd,
        valueEUR: Math.round(donation.valueUsd * USD_EUR_FXRATE * 10 ** 6),
        via: 'giveth',
      },
    });
  });
  const result = data.donationsByProjectId;
  return {
    stats: {
      totalUsdBalance: result.totalUsdBalance,
      totalCount: result.totalCount,
    },
    transfers,
  };
};

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('projectId');
  const projectAddress = request.nextUrl.searchParams.get('projectAddress');
  const take = parseInt(request.nextUrl.searchParams.get('take') || '10');
  const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0');
  const fromDate = request.nextUrl.searchParams.get('fromDate') || '';
  const sinceLastId = parseInt(
    request.nextUrl.searchParams.get('sinceLastId') || '0'
  );
  if (!projectId) {
    return Response.json({ error: 'projectId is required' }, { status: 400 });
  }
  const data = await getGivethData(
    parseInt(projectId),
    projectAddress || '',
    take,
    skip,
    fromDate,
    sinceLastId
  );

  return Response.json(data);
}
