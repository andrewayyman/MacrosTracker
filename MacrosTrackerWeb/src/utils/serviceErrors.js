export function parseServiceErrors(error, fallbackMessage) {
  const payload = error.response?.data;
  const errorList = Array.isArray(payload?.errorList) ? payload.errorList : [];
  const fieldErrors = {};

  for (const item of errorList) {
    if (typeof item !== "string" || !item.startsWith("VALIDATION:")) {
      continue;
    }

    const [, propertyName, ...messageParts] = item.split(":");
    if (!propertyName || messageParts.length === 0) {
      continue;
    }

    const normalizedKey = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
    fieldErrors[normalizedKey] = messageParts.join(":");
  }

  return {
    errorMessage: payload?.message ?? fallbackMessage,
    fieldErrors,
  };
}
