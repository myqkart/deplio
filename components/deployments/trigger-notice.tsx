import { InfoIcon } from "@primer/octicons-react";

export function TriggerNotice() {
  return (
    <div className="flex items-start gap-3 rounded-[6px] border border-info-border bg-info p-4 text-sm leading-[21px] text-foreground">
      <InfoIcon size={16} className="mt-0.5 shrink-0 text-info-foreground" />
      <p>
        <span className="font-semibold">
          Triggered means Amplify accepted the webhook request.
        </span>{" "}
        It does not confirm the build succeeded. Check the Amplify console for
        build results.
      </p>
    </div>
  );
}
