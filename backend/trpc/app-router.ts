import { createTRPCRouter } from "./create-context.js";

// example
import hiRoute from "./routes/example/hi/route.js";

// billing
import createSubscriptionRoute from "./routes/billing/createSubscription/route.js";
import getPlansRoute from "./routes/billing/getPlans/route.js";
import getUserSubscriptionRoute from "./routes/billing/getUserSubscription/route.js";
import renewSubscriptionsRoute from "./routes/billing/renewSubscriptions/route.js";
import renewPlanEarlyRoute from "./routes/billing/renewPlanEarly/route.js";

// admin
import getDashboardStatsRoute from "./routes/admin/getDashboardStats/route.js";
import getUserDetailsRoute from "./routes/admin/getUserDetails/route.js";
import { getAllUsersProcedure } from "./routes/admin/getAllUsers/route.js";
import { getPricingPlansProcedure } from "./routes/admin/getPricingPlans/route.js";
import { updatePricingPlanProcedure } from "./routes/admin/updatePricingPlan/route.js";
import { deleteUserProcedure } from "./routes/admin/deleteUser/route.js";
import { getCGUProcedure } from "./routes/admin/getCGU/route.js";
import { updateCGUProcedure } from "./routes/admin/updateCGU/route.js";
import { createUserProcedure } from "./routes/admin/createUser/route.js";
import { updateUserProcedure } from "./routes/admin/updateUser/route.js";
import { updateUserPasswordProcedure } from "./routes/admin/updateUserPassword/route.js";
import { createPricingPlanProcedure } from "./routes/admin/createPricingPlan/route.js";
import { deletePricingPlanProcedure } from "./routes/admin/deletePricingPlan/route.js";
import { getAllowedCountriesProcedure } from "./routes/admin/getAllowedCountries/route.js";
import { updateAllowedCountriesProcedure } from "./routes/admin/updateAllowedCountries/route.js";

// calls
import getUserCallsRoute from "./routes/calls/getUserCalls/route.js";
import getCallDetailsRoute from "./routes/calls/getCallDetails/route.js";

// agent
import toggleAgentRoute from "./routes/agent/toggleAgent/route.js";
import canReactivateAgentRoute from "./routes/agent/canReactivateAgent/route.js";

// referral
import getReferralStatsRoute from "./routes/referral/getReferralStats/route.js";
import applyReferralCodeRoute from "./routes/referral/applyReferralCode/route.js";

// auth ✅
import { sendVerificationCodeProcedure } from "./routes/auth/sendVerificationCode/route.js";
import { verifyCodeProcedure } from "./routes/auth/verifyCode/route.js";
import { registerProcedure } from "./routes/auth/register/index.js";

// user
import { assignVirtualNumberProcedure } from "./routes/user/assignVirtualNumber/route.js";

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
    register: registerProcedure, // ✅ ROUTE INSCRIPTION BACKEND
  }),

  user: createTRPCRouter({
    assignVirtualNumber: assignVirtualNumberProcedure,
  }),
});

export type AppRouter = typeof appRouter;
