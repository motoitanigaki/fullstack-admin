import type { NotificationProvider } from "@refinedev/core";
import { toast } from "sonner";

export const notificationProvider: NotificationProvider = {
  open: ({ key, message, type, undoableTimeout, cancelMutation, ...rest }) => {
    const toastOptions = {
      id: key,
      duration: type === "error" ? 6000 : 4000,
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error": {
        // Refine passes error.message in response via rest.description by default
        toast.error(rest?.description || message, toastOptions);
        break;
      }
      case "progress":
        toast.loading(message, {
          id: key,
          duration: undoableTimeout ? undoableTimeout * 1000 : Infinity,
        });

        if (cancelMutation && undoableTimeout) {
          setTimeout(() => {
            toast.dismiss(key);
          }, undoableTimeout * 1000);
        }
        break;
      default:
        toast(message, toastOptions);
        break;
    }
  },

  close: (key: string) => {
    toast.dismiss(key);
  },
};
