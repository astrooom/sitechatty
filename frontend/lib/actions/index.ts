import { createSafeActionClient } from "next-safe-action";
import { getErrorMessage } from "@/lib/utils";

export const action = createSafeActionClient({
  handleReturnedServerError(e) {
    return getErrorMessage(e);
  },
  handleServerErrorLog(err) {
    const msg = getErrorMessage(err);
    console.error({ type: "SERVER_ACTION", err, msg });
  },
});
