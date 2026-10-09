import assert from "node:assert/strict";
import test from "node:test";
import { notifyTechnician, type WorkOrder } from "../src/field_service_sms.js";

const order: WorkOrder = { id: "WO-42", customerPhone: "+15550000042", technicianName: "Mina", dispatchStatus: "en_route", photos: [{ id: "p1", caption: "boiler label" }], followUp: "confirm access window", optOutPhones: ["+15550000099"] };
test("suppression wins before a send", async () => {
  let called = false;
  const result = await notifyTechnician({ ...order, optOutPhones: [order.customerPhone] }, async () => { called = true; return {}; }, async () => ({}));
  assert.deepEqual(result, { decision: "suppressed" });
  assert.equal(called, false);
});
test("an opted-in work order sends and records delivery", async () => {
  const result = await notifyTechnician(order, async (payload) => { assert.match(JSON.stringify(payload), /boiler label/); return { message_id: "msg-42" }; }, async (id) => ({ id, state: "delivered" }));
  assert.deepEqual(result, { decision: "sent", messageId: "msg-42", event: { id: "msg-42", state: "delivered" } });
});
