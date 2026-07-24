/**
 * Centralized Application Config for FixByte Marketing Website
 * Configures dynamic URLs pointing to the CMMS Dashboard application.
 */

export const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";

export const DASHBOARD_LOGIN_URL = `${DASHBOARD_URL}/login`;
export const DASHBOARD_REGISTER_URL = `${DASHBOARD_URL}/register`;
export const DASHBOARD_BOOK_DEMO_URL = `${DASHBOARD_URL}/book-demo`;
