import { showToast } from "../utils/toast.util";

export const handleApiError = (error: any, fallbackMessage: string) => {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    Object.values(errors).forEach((message: any) => {
      showToast(message, "error");
    });
  } else if (error?.response?.data?.message) {
    showToast(error?.response?.data?.message, "error");
  } else {
    showToast(fallbackMessage, "error");
  }
};
