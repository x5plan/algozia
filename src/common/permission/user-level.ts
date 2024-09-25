// Attention!
// If you want to add more levels in the future,
// please insert the new value directly,
// do NOT modify the existing level.
export const enum CE_UserLevel {
    Admin = 1000, // Someone that can manage anything
    Manager = 500, // Someone that can manage settings except security related
    Internal = 100, // Internal user (students)
    Paid = 50, // External paid user
    General = 1,
    Temp = 0, // Temporary user, check permission in specific case
    Disabled = -1,
}
