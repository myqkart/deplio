import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { triggerAmplifyWebhook } from "./trigger-impl";

describe("triggerAmplifyWebhook", () => {
  it("classifies 2xx as triggered and extracts job id", async () => {
    mock.method(
      globalThis,
      "fetch",
      async () =>
        new Response(JSON.stringify({ jobId: "job-123" }), { status: 200 })
    );
    const result = await triggerAmplifyWebhook(
      "https://webhooks.amplify.us-east-1.amazonaws.com/prod/webhooks?id=a&token=b"
    );
    assert.equal(result.status, "triggered");
    if (result.status === "triggered") {
      assert.equal(result.amplifyJobId, "job-123");
      assert.equal(result.httpStatus, 200);
    }
    mock.restoreAll();
  });

  it("classifies non-2xx as failed without leaking URL", async () => {
    mock.method(
      globalThis,
      "fetch",
      async () => new Response("nope", { status: 403 })
    );
    const result = await triggerAmplifyWebhook(
      "https://webhooks.amplify.us-east-1.amazonaws.com/prod/webhooks?id=a&token=secret"
    );
    assert.equal(result.status, "failed");
    if (result.status === "failed") {
      assert.equal(result.httpStatus, 403);
      assert.equal(result.errorMessage.includes("secret"), false);
      assert.equal(result.errorMessage.includes("webhooks.amplify"), false);
    }
    mock.restoreAll();
  });

  it("classifies abort as timeout", async () => {
    mock.method(globalThis, "fetch", async () => {
      const err = new Error("Aborted");
      err.name = "TimeoutError";
      throw err;
    });
    const result = await triggerAmplifyWebhook(
      "https://webhooks.amplify.us-east-1.amazonaws.com/prod/webhooks?id=a&token=b"
    );
    assert.equal(result.status, "failed");
    if (result.status === "failed") {
      assert.equal(
        result.errorMessage,
        "Amplify didn't respond within 10 seconds."
      );
    }
    mock.restoreAll();
  });
});
