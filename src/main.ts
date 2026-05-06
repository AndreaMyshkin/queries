import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getPendingOrders } from "./queries/order_queries";
import { sendOrderAlert } from "./slack";

const ALERT_CHANNEL = "#order-alerts";
const PENDING_THRESHOLD_DAYS = 3;

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, false);

  const staleOrders = await getPendingOrders(db, PENDING_THRESHOLD_DAYS);

  if (staleOrders.length === 0) {
    console.log("No stale pending orders found.");
    return;
  }

  console.log(
    `Found ${staleOrders.length} stale pending order(s). Sending alerts...`,
  );

  for (const order of staleOrders) {
    await sendOrderAlert(
      ALERT_CHANNEL,
      order.order_number,
      order.customer_name,
      order.phone,
      order.days_pending,
    );
    console.log(
      `Alerted: order ${order.order_number} (${order.days_pending} days pending)`,
    );
  }
}

main();
