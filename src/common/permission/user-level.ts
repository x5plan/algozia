// Attention!
// If you want to add more levels in the future,
// please insert the new value directly,
// do NOT modify the existing level.
export const enum CE_UserLevel {
    Admin = 100, // Someone that can manage anything
    Manager = 90, // Someone that can manage settings except security related
    Internal = 50, // Internal user (students)
    Paid = 30, // External paid user
    General = 1,
    Specific = 0, // Specific user, check permission in specific case
    Disabled = -1,
}
