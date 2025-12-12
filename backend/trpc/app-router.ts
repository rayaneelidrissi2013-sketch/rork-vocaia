import { createTRPCRouter } from "./create-context";

// example
import hiRoute from "./routes/example/hi/route";

// billing
import createSubscriptionRoute from "./routes/billing/createSubscription/route";
import getPlansRoute from "./routes/billing/getPlans/route";
import getUserSubscriptionRoute from "./routes/billing/getUserSubscription/route";
import renewSubscriptionsRoute from "./routes/billing/renewSubscriptions/route";
import renewPlanEarlyRoute from "./routes/billing/renewPlanEarly/route";

// admin
import getDashboardStatsRoute from "./routes/admin/getDashboardStats/route";
import getUserDetailsRoute from "./routes/admin/getUserDetails/route";
import { getAllUsersProcedure } from "./routes/admin/getAllUsers/route";
import { getPricingPlansProcedure } from "./routes/admin/getPricingPlans/route";
import { updatePricingPlanProcedure } from "./routes/admin/updatePricingPlan/route";
import { deleteUserProcedure } from "./routes/admin/deleteUser/route";
import { getCGUProcedure } from "./routes/admin/getCGU/route";
import { updateCGUProcedure } from "./routes/admin/updateCGU/route";
import { createUserProcedure } from "./routes/admin/createUser/route";
import { updateUserProcedure } from "./routes/admin/updateUser/route";
import { updateUserPasswordProcedure } from "./routes/admin/updateUserPassword/route";
import { createPricingPlanProcedure } from "./routes/admin/createPricingPlan/route";
import { deletePricingPlanProcedure } from "./routes/admin/deletePricingPlan/route";
import { getAllowedCountriesProcedure } from "./routes/admin/getAllowedCountries/route";
import { updateAllowedCountriesProcedure } from "./routes/admin/updateAllowedCountries/route";
import { runMigrationProcedure } from "./routes/admin/runMigration/route";
import { getPayPalSettingsProcedure } from "./routes/admin/getPayPalSettings/route";
import { updatePayPalSettingsProcedure } from "./routes/admin/updatePayPalSettings/route";

// calls
import getUserCallsRoute from "./routes/calls/getUserCalls/route";
import getCallDetailsRoute from "./routes/calls/getCallDetails/route";

// agent
import toggleAgentRoute from "./routes/agent/toggleAgent/route";
import canReactivateAgentRoute from "./routes/agent/canReactivateAgent/route";

// referral
import getReferralStatsRoute from "./routes/referral/getReferralStats/route";
import applyReferralCodeRoute from "./routes/referral/applyReferralCode/route";

// auth ✅
import { sendVerificationCodeProcedure } from "./routes/auth/sendVerificationCode/route";
import { verifyCodeProcedure } from "./routes/auth/verifyCode/route";
import { registerProcedure } from "./routes/auth/register";
import { loginProcedure } from "./routes/auth/login/route";

// user
import { assignVirtualNumberProcedure } from "./routes/user/assignVirtualNumber/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),

  billing: createTRPCRouter({
    createSubscription: createSubscriptionRoute,
    getPlans: getPlansRoute,
    getUserSubscription: getUserSubscriptionRoute,
    renewSubscriptions: renewSubscriptionsRoute,
    renewPlanEarly: renewPlanEarlyRoute,
  }),

  admin: createTRPCRouter({
    getDashboardStats: getDashboardStatsRoute,
    getUserDetails: getUserDetailsRoute,
    getAllUsers: getAllUsersProcedure,
    getPricingPlans: getPricingPlansProcedure,
    updatePricingPlan: updatePricingPlanProcedure,
    createPricingPlan: createPricingPlanProcedure,
    deletePricingPlan: deletePricingPlanProcedure,
    deleteUser: deleteUserProcedure,
    getCGU: getCGUProcedure,
    updateCGU: updateCGUProcedure,
    createUser: createUserProcedure,
    updateUser: updateUserProcedure,
    updateUserPassword: updateUserPasswordProcedure,
    getAllowedCountries: getAllowedCountriesProcedure,
    updateAllowedCountries: updateAllowedCountriesProcedure,
    runMigration: runMigrationProcedure,
    getPayPalSettings: getPayPalSettingsProcedure,
    updatePayPalSettings: updatePayPalSettingsProcedure,
  }),

  calls: createTRPCRouter({
    getUserCalls: getUserCallsRoute,
    getCallDetails: getCallDetailsRoute,
  }),

  agent: createTRPCRouter({
    toggleAgent: toggleAgentRoute,
    canReactivateAgent: canReactivateAgentRoute,
  }),

  referral: createTRPCRouter({
    getReferralStats: getReferralStatsRoute,
    applyReferralCode: applyReferralCodeRoute,
  }),

  auth: createTRPCRouter({
    sendVerificationCode: sendVerificationCodeProcedure,
    verifyCode: verifyCodeProcedure,
    register: registerProcedure,
    login: loginProcedure,
  }),

  user: createTRPCRouter({
    assignVirtualNumber: assignVirtualNumberProcedure,
  }),
});

export type AppRouter = typeof appRouter;

console.log('[Router] tRPC router initialized with routes:', Object.keys(appRouter._def.procedures).join(', '));
