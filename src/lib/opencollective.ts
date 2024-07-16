import { GraphQLClient, gql } from "graphql-request";
import AbortController from "abort-controller";
import { Transfer } from "@citizenwallet/sdk";

type ExtendedTransfer = Transfer & {
  fromProfile?: {
    name: string;
    imgsrc: string;
  };
  data: {
    description: string;
    value?: number;
    currency: string;
    valueUsd?: number;
    via: string;
  };
};

const transactionsQuery = gql`
  query getTransactions(
    $collectiveSlug: String!
    $dateFrom: String
    $dateTo: String
    $limit: Int
  ) {
    allTransactions(
      collectiveSlug: $collectiveSlug
      type: "CREDIT"
      dateFrom: $dateFrom
      dateTo: $dateTo
      limit: $limit
    ) {
      id
      uuid
      createdAt
      hostCurrency
      amount
      description
      fromCollective {
        slug
        name
        imageUrl
      }
    }
  }
`;

export const getTransactions = async (
  collectiveSlug: string,
  dateFrom?: Date,
  dateTo?: Date,
  limit?: number
) => {
  if (!collectiveSlug) throw new Error("Missing collectiveSlug");

  const slugParts = collectiveSlug.split("/");
  const slug = slugParts[slugParts.length - 1];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000);
  const graphQLClient = new GraphQLClient(
    process.env.NEXT_PUBLIC_OC_GRAPHQL_API || "",
    {
      // @ts-ignore
      signal: controller.signal,
    }
  );
  try {
    const res: any = await graphQLClient.request(transactionsQuery, {
      collectiveSlug: slug,
      dateFrom,
      limit,
    });
    console.log(">>> result since", dateFrom, res);
    if (!res.allTransactions) return [];
    const transactions = res.allTransactions || [];
    const transfers: ExtendedTransfer[] = [];
    transactions.map((transaction: any) => {
      transfers.push({
        hash: `oc#${transaction.id}`,
        tx_hash: transaction.uuid,
        to: `https://opencollective.com/${slug}`,
        nonce: 0,
        token_id: 0,
        status: "success",
        created_at: new Date(transaction.createdAt),
        from: `https://opencollective.com/${transaction.fromCollective.slug}`,
        fromProfile: {
          name: transaction.fromCollective.name,
          imgsrc: transaction.fromCollective.imageUrl,
        },
        value: (transaction.amount / 100) * 10 ** 6,
        data: {
          description: transaction.description,
          currency: transaction.hostCurrency,
          value: transaction.amount,
          via: "Open Collective",
        },
      });
    });
    console.log(">>> transfers", transfers);
    return transfers;
  } catch (e) {
    console.error(">>> error", e);
    return [];
  }
};
