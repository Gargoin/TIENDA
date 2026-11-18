import { expect } from "chai";
import {
  createPrintfulClient,
  PrintfulApiError,
  PrintfulConfigurationError,
} from "../src/services/printful.service.js";

describe("Printful client", () => {
  it("requires a private token", () => {
    expect(() => createPrintfulClient({ apiToken: "" })).to.throw(PrintfulConfigurationError);
  });

  it("retrieves store products with the configured store header", async () => {
    let request;
    const client = createPrintfulClient({
      apiToken: "token",
      storeId: "123",
      fetchImpl: async (url, options) => {
        request = { url, options };
        return {
          ok: true,
          json: async () => ({ result: [{ id: 1 }], paging: { total: 1 } }),
        };
      },
    });

    const result = await client.getProducts({ limit: 10, offset: 5 });

    expect(result.result).to.deep.equal([{ id: 1 }]);
    expect(request.url).to.equal("https://api.printful.com/store/products?limit=10&offset=5&status=all");
    expect(request.options.headers).to.include({
      Authorization: "Bearer token",
      "X-PF-Store-Id": "123",
    });
  });

  it("normalizes Printful API failures", async () => {
    const client = createPrintfulClient({
      apiToken: "token",
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Unauthorized" } }),
      }),
    });

    try {
      await client.getProduct(1);
      expect.fail("La solicitud debía fallar");
    } catch (error) {
      expect(error).to.be.instanceOf(PrintfulApiError);
      expect(error.status).to.equal(401);
    }
  });
});
