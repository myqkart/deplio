export type TriggerOutcome =
  | {
      status: "triggered";
      httpStatus: number;
      amplifyJobId: string | null;
    }
  | {
      status: "failed";
      httpStatus: number | null;
      errorMessage: string;
      amplifyJobId: null;
    };

function extractJobId(body: string): string | null {
  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    const candidates = [
      json.jobId,
      json.job_id,
      json.id,
      (json.job as { id?: string } | undefined)?.id,
    ];
    for (const value of candidates) {
      if (typeof value === "string" && value.length > 0) return value;
    }
  } catch {
    // non-JSON body is fine
  }
  return null;
}

function sanitizeError(message: string): string {
  return message
    .replace(/https?:\/\/[^\s]+/gi, "[redacted]")
    .replace(/token=[^&\s]+/gi, "token=[redacted]")
    .replace(/id=[^&\s]+/gi, "id=[redacted]")
    .slice(0, 280);
}

export async function triggerAmplifyWebhook(
  webhookUrl: string
): Promise<TriggerOutcome> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });

    const httpStatus = response.status;
    let body = "";
    try {
      body = await response.text();
    } catch {
      body = "";
    }

    if (httpStatus >= 200 && httpStatus < 300) {
      return {
        status: "triggered",
        httpStatus,
        amplifyJobId: extractJobId(body),
      };
    }

    return {
      status: "failed",
      httpStatus,
      errorMessage: sanitizeError(
        `Amplify rejected the request (HTTP ${httpStatus}).`
      ),
      amplifyJobId: null,
    };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return {
        status: "failed",
        httpStatus: null,
        errorMessage: "Amplify didn't respond within 10 seconds.",
        amplifyJobId: null,
      };
    }
    return {
      status: "failed",
      httpStatus: null,
      errorMessage: "Couldn't reach Amplify.",
      amplifyJobId: null,
    };
  }
}
