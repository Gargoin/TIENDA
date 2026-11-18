import {
  createPrintfulClient,
  PrintfulApiError,
  PrintfulConfigurationError,
} from "../services/printful.service.js";

const parseNumber = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, maximum);
};

const handlePrintfulError = (error, res) => {
  if (error instanceof PrintfulConfigurationError) {
    return res.status(503).json({ message: error.message });
  }

  if (error instanceof PrintfulApiError) {
    return res.status(error.status >= 400 && error.status < 600 ? error.status : 502).json({
      message: "No se pudo obtener la información de Printful",
    });
  }

  return res.status(502).json({ message: "No se pudo conectar con Printful" });
};

export const getPrintfulProducts = async (req, res) => {
  try {
    const client = createPrintfulClient();
    const result = await client.getProducts({
      limit: parseNumber(req.query.limit, 20, 100) || 20,
      offset: parseNumber(req.query.offset, 0, Number.MAX_SAFE_INTEGER),
      status: req.query.status || "all",
    });

    return res.json({ products: result.result, paging: result.paging ?? null });
  } catch (error) {
    return handlePrintfulError(error, res);
  }
};

export const getPrintfulProduct = async (req, res) => {
  const productId = Number.parseInt(req.params.productId, 10);

  if (!Number.isInteger(productId) || productId < 1) {
    return res.status(400).json({ message: "El identificador de producto no es válido" });
  }

  try {
    const client = createPrintfulClient();
    const result = await client.getProduct(productId);
    return res.json(result.result);
  } catch (error) {
    return handlePrintfulError(error, res);
  }
};
