export function failureToastDescription(cause: string, httpStatus?: number | null) {
  switch (cause) {
    case "disabled":
      return "Deployments are disabled for this branch.";
    case "cooldown":
      return "Already triggered moments ago. Try again in a few seconds.";
    case "timeout":
      return "Amplify didn't respond within 10 seconds.";
    case "non2xx":
      return `Amplify rejected the request (HTTP ${httpStatus ?? "error"}).`;
    case "network":
      return "Couldn't reach Amplify.";
    case "missing":
      return "This branch no longer exists.";
    case "unauthenticated":
      return "Your session expired. Sign in again.";
    default:
      return "Something went wrong. Try again.";
  }
}
