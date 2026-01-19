const cron = require("node-cron");
const {
  expireOutdatedSubscriptions
} = require("../services/subscriptionExpiry.service");

cron.schedule(
  "5 0 * * *",
  async () => {
    try {
      const count = await expireOutdatedSubscriptions();

      if (count > 0) {
        console.log(
          `🕒 Cron: expired ${count} subscriptions`
        );
      }
    } catch (err) {
      console.error("❌ Cron expiry failed:", err);
    }
  },
  {
    timezone: "UTC"
  }
);
