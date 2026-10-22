export const ROLE_ROUTES = {
  EMPLOYEE: "/employee/dashboard",
  DIRECTOR: "/director/dashboard",
  ACCOUNTS: "/accounts/dashboard",
};

export const getDashboardPath = (role) => {
  return ROLE_ROUTES[role] || "/login";
};