import { ok } from "@/lib/api/errors";
import { requestIdFrom } from "@/lib/api/request";

/**
 * GET /api/openapi — machine-readable v1 contract for agents/integrators.
 * Generated from this file (single source), not hand-maintained elsewhere.
 */
const spec = {
  openapi: "3.1.0",
  info: {
    title: "Dockyard Strategy API",
    version: "1.0.0",
    description:
      "Self-custodial LP desk backend. Intel is x402-gated (Hedera testnet). All errors use { error, message, requestId, retryable }.",
  },
  servers: [{ url: "/", description: "Same-origin (Vercel or local dev)" }],
  paths: {
    "/api/health": {
      get: { summary: "Liveness probe", responses: { "200": { description: "Alive" } } },
    },
    "/api/ready": {
      get: { summary: "Readiness + dependency status", responses: { "200": { description: "Ready" }, "503": { description: "Core deps unconfigured" } } },
    },
    "/api/intel/preview": {
      post: {
        summary: "Ungated intel preview (iteration only; demo uses /api/intel)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FeeIntelRequest" } } } },
        responses: {
          "200": { description: "FeeIntelPayload", content: { "application/json": { schema: { $ref: "#/components/schemas/FeeIntelPayload" } } } },
          "400": { description: "Invalid request" },
          "429": { description: "Rate limited" },
          "501": { description: "Graph not configured" },
          "502": { description: "Upstream / no data" },
        },
      },
    },
    "/api/intel": {
      get: {
        summary: "x402-gated intel (query params)",
        parameters: [
          { name: "base", in: "query", required: true, schema: { type: "string" } },
          { name: "quote", in: "query", required: true, schema: { type: "string" } },
          { name: "lookbackHours", in: "query", schema: { type: "integer", minimum: 1, maximum: 168, default: 24 } },
        ],
        responses: {
          "402": { description: "Payment required (x402 accepts[])" },
          "200": { description: "Intel payload + receipt" },
        },
      },
      post: {
        summary: "x402-gated intel (JSON body, X-PAYMENT header)",
        responses: {
          "402": { description: "Payment required / unverified" },
          "200": { description: "Intel payload + receipt" },
        },
      },
    },
    "/api/strategy/validate": {
      post: {
        summary: "Validate ship draft, derive strategyHash, allowance guidance",
        responses: { "200": { description: "Valid draft" }, "400": { description: "Invalid draft" } },
      },
    },
  },
  components: {
    schemas: {
      FeeIntelRequest: {
        type: "object",
        required: ["base", "quote"],
        properties: {
          base: { type: "string", description: "0x address or UPPER symbol" },
          quote: { type: "string" },
          lookbackHours: { type: "integer", default: 24 },
        },
      },
      FeeIntelPayload: {
        type: "object",
        properties: {
          asOf: { type: "string", format: "date-time" },
          sources: { type: "array", items: { type: "object" } },
          recommendation: { type: "object" },
          graphQueryIds: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

export async function GET(req: Request) {
  const requestId = requestIdFrom(req);
  return ok(spec, requestId);
}
