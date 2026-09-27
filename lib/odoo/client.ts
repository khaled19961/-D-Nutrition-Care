type OdooConfig = {
  baseUrl: string;
  database?: string;
  apiKey: string;
};

function getConfig(): OdooConfig {
  const baseUrl = process.env.ODOO_BASE_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.ODOO_API_KEY?.trim();
  const database = process.env.ODOO_DATABASE?.trim();

  if (!baseUrl || !apiKey) {
    throw new Error("Odoo integration is not configured.");
  }

  return { baseUrl, database: database || undefined, apiKey };
}

export function isOdooConfigured() {
  return Boolean(
    process.env.ODOO_BASE_URL?.trim() &&
      process.env.ODOO_API_KEY?.trim()
  );
}

export async function odooJson2<T>(
  model: string,
  method: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const config = getConfig();

  const headers: Record<string, string> = {
    Authorization: `bearer ${config.apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "D-Nutrition-Care/1.0 Odoo integration",
  };

  if (config.database) {
    headers["X-Odoo-Database"] = config.database;
  }

  const response = await fetch(
    `${config.baseUrl}/json/2/${encodeURIComponent(model)}/${encodeURIComponent(method)}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const raw = await response.text();
  let payload: unknown = null;

  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Odoo API request failed with HTTP ${response.status}.`;

    throw new Error(message);
  }

  return payload as T;
}

export async function odooHealthCheck() {
  return odooJson2<unknown>("res.users", "context_get", {});
}

export async function searchOdooProducts(domain: unknown[] = []) {
  return odooJson2<Array<Record<string, unknown>>>(
    "product.product",
    "search_read",
    {
      domain,
      fields: ["id", "name", "default_code", "product_tmpl_id", "active"],
      limit: 200,
      context: { lang: "ar_001" },
    },
  );
}
