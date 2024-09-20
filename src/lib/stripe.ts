// Import the Stripe library
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET || '');

export type TransferStatus = 'sending' | 'pending' | 'success' | 'fail';
export interface TransferData {
  description: string;
  fees?: number;
  originalCurrency?: string;
  originalValue?: number;
  valueUSD?: number;
  valueEUR?: number;
  quantity?: number;
  price_id?: string;
  product_id?: string;
  unit_price?: number;
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
  data: TransferData | undefined;
  status: TransferStatus;
  networkId: number | string;
}
// Function to get the latest balance transactions
export async function getTransactions(
  product_ids: string[],
  dateFrom?: Date,
  dateTo?: Date,
  limit?: number
) {
  const transfers: Transfer[] = [];
  try {
    // Fetch the list of balance transactions
    const transactions = await stripe.charges.list({
      limit: limit || 10, // Number of transactions to retrieve
      created: {
        gte: dateFrom ? Math.floor(dateFrom.getTime() / 1000) : undefined,
        lte: dateTo ? Math.floor(dateTo.getTime() / 1000) : undefined,
      },
    });

    for (const tx of transactions.data) {
      const amount = tx.amount - (tx.application_fee_amount || 0);

      const transfer: Transfer = {
        status: 'success',
        hash: tx.id,
        tx_hash: tx.id,
        token_id: parseInt(tx.id),
        value: Math.round(amount * 10 ** 4), // stripe uses cents, stable coins 10**6
        currency: tx.currency.toUpperCase(),
        created_at: new Date(tx.created * 1000),
        from: tx.metadata?.from || tx.billing_details?.name || '',
        to:
          tx.metadata?.to ||
          tx.metadata?.to ||
          process.env.STRIPE_ACCOUNT_NAME ||
          'Stripe',
        networkId: 'stripe',
        fromProfile: {
          name: tx.billing_details?.name || '',
          imgsrc: '',
        },
        data: undefined,
      };
      transfer.data = {
        description: tx.description || '',
        fees: tx.application_fee_amount || undefined,
        originalCurrency: tx.currency,
        originalValue: tx.amount,
        via:
          tx.metadata?.to && tx.metadata?.to.match(/opencollective.com/)
            ? 'opencollective'
            : 'stripe',
      };

      if (tx.payment_intent) {
        const details = await getDetailsFromPaymentIntent(
          tx.payment_intent.toString()
        );
        // if (tx.payment_intent === "pi_3Pm23RFAhaWeDyow04qEjdFH") {
        //   console.log(">>> details", JSON.stringify(details, null, "  "));
        // }
        if (details?.metadata?.description) {
          transfer.data.description = details.metadata?.description || '';
          transfer.to = details.metadata?.accountAddress;
        } else if (
          details &&
          details.lineItems &&
          details.lineItems.length > 0
        ) {
          const firstItem = details.lineItems[0];
          transfer.data.product_id = firstItem?.price?.product.toString();
          transfer.data.price_id = firstItem?.price?.id;
          transfer.data.description = firstItem?.description || '';
          transfer.data.quantity = firstItem?.quantity || undefined;
          transfer.data.unit_price = firstItem?.amount_total || undefined;
        }
      }

      if (product_ids.length > 0) {
        if (product_ids.includes(transfer.data?.product_id || '')) {
          transfers.push(transfer);
        }
      } else {
        transfers.push(transfer);
      }
    }

    return transfers;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

async function getDetailsFromPaymentIntent(paymentIntentId: string) {
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
  });
  if (sessions.data.length === 0) {
    return null;
  }
  const res = await stripe.checkout.sessions.listLineItems(sessions.data[0].id);
  return {
    metadata: sessions.data[0].metadata,
    lineItems: res?.data,
  };
}

async function getInvoiceDetails(invoiceId: string) {
  try {
    // Retrieve the invoice
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ['lines.data.price.product'], // Expand to include product details
    });

    // Log the invoice details
    // console.log(`Invoice ID: ${invoice.id}`);
    // console.log(`Customer ID: ${invoice.customer}`);
    // console.log(`Status: ${invoice.status}`);
    // console.log(`Amount Due: ${invoice.amount_due}`);
    // console.log(`Amount Paid: ${invoice.amount_paid}`);
    // console.log(`Amount Remaining: ${invoice.amount_remaining}`);

    // // Log line items
    // invoice.lines.data.forEach((item) => {
    //   console.log(`\nProduct: ${item.price.product.name}`);
    //   console.log(`Description: ${item.description}`);
    //   console.log(`Quantity: ${item.quantity}`);
    //   console.log(`Unit Amount: ${item.price.unit_amount}`);
    //   console.log(`Total Amount: ${item.amount}`);
    // });

    // const firstItem = invoice.lines.data[0];
    return invoice;
  } catch (error) {
    console.error('Error retrieving invoice details:', error);
    throw error;
  }
}
