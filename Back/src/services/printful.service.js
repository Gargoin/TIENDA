const PRINTFUL_API_URL = "https://api.printful.com";

export class PrintfulConfigurationError extends Error {}

export class PrintfulApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const readErrorMessage = (payload) => {
  if (typeof payload?.error?.message === "string") return payload.error.message;
  if (typeof payload?.result === "string") return payload.result;
  return "Printful no pudo completar la solicitud";
};

export const createPrintfulClient = ({
  apiToken = process.env.PRINTFUL_API_TOKEN,
  storeId = process.env.PRINTFUL_STORE_ID,
  fetchImpl = fetch,
} = {}) => {
  if (!apiToken) {
    throw new PrintfulConfigurationError(
      "La integración con Printful no está configurada en el servidor",
    );
  }

  const headers = {
    Authorization: `Bearer ${apiToken}`,
  };

  if (storeId) headers["X-PF-Store-Id"] = storeId;

  const request = async (path) => {
    const response = await fetchImpl(`${PRINTFUL_API_URL}${path}`, { headers });
    const payload = await response.json();

    if (!response.ok) {
      throw new PrintfulApiError(readErrorMessage(payload), response.status);
    }

    return payload;
  };

  return {
    getProducts: ({ limit = 20, offset = 0, status = "all" } = {}) => {
      const params = new URLSearchParams({ limit, offset, status });
      return request(`/store/products?${params.toString()}`);
    },
    getProduct: (productId) => request(`/store/products/${productId}`),
  };
};
