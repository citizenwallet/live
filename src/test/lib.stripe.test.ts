import { getTransactions } from "@/lib/stripe";

describe("lib.stripe", () => {
  it("should return the latest transactions", async () => {
    // test payment link: https://buy.stripe.com/test_3cseWy6kggTDbE45kk
    const transactions = await getTransactions(["prod_QOEupbhxgRRRaO"]);
    // console.log(JSON.stringify(transactions, null, "  "));
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions[0].data.product_id).toBe("prod_QOEupbhxgRRRaO");
  }, 10000);
});
