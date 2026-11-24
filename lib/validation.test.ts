import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateWebhookUrl,
  webhookHintFromUrl,
  applicationSchema,
} from "@/lib/validation";

const valid =
  "https://webhooks.amplify.us-east-1.amazonaws.com/prod/webhooks?id=abc&token=secret91f2c";

describe("validateWebhookUrl", () => {
  it("accepts a valid Amplify webhook URL", () => {
    assert.equal(validateWebhookUrl(valid), null);
  });

  it("rejects http", () => {
    assert.notEqual(
      validateWebhookUrl(valid.replace("https://", "http://")),
      null
    );
  });

  it("rejects non-Amplify hosts", () => {
    assert.notEqual(
      validateWebhookUrl("https://example.com/webhooks?id=a&token=b"),
      null
    );
  });

  it("rejects missing token", () => {
    assert.notEqual(
      validateWebhookUrl(
        "https://webhooks.amplify.us-east-1.amazonaws.com/prod/webhooks?id=abc"
      ),
      null
    );
  });

  it("rejects SSRF-ish hosts that only look similar", () => {
    assert.notEqual(
      validateWebhookUrl(
        "https://webhooks.amplify.us-east-1.amazonaws.com.evil.com/x?id=a&token=b"
      ),
      null
    );
  });
});

describe("webhookHintFromUrl", () => {
  it("returns last 6 chars of token", () => {
    assert.equal(webhookHintFromUrl(valid), "t91f2c");
  });
});

describe("applicationSchema", () => {
  it("requires name", () => {
    const result = applicationSchema.safeParse({ name: "" });
    assert.equal(result.success, false);
  });

  it("rejects long names", () => {
    const result = applicationSchema.safeParse({ name: "x".repeat(61) });
    assert.equal(result.success, false);
  });
});
