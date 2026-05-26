export function getSetupStep(status) {
  switch (status) {
    case "AccountCreated":
      return "profile";
    case "ProfilePending":
      return "goals";
    case "ProfileCompleted":
      return "complete";
    default:
      return "profile";
  }
}

export function isSetupComplete(status) {
  return status === "ProfileCompleted";
}
