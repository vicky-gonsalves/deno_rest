export const roles = ["user", "admin"];
export const roleRights = new Map();
roleRights.set(roles[0], [
  "getMe",
]);
roleRights.set(roles[1], [
  "getMe",
  "getUsers",
  "manageUsers",
]);
