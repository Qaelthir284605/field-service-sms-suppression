import { notifyTechnician } from "../src/field_service_sms.js";
const phone = process.env.DEMO_PHONE;
if (!phone) throw new Error("DEMO_PHONE is required");
const result = await notifyTechnician({ id: "WO-DEMO", customerPhone: phone, technicianName: "Ari", dispatchStatus: "assigned", photos: [{ id: "photo-1", caption: "meter reading" }], followUp: "reply with a convenient access time", optOutPhones: (process.env.SUPPRESSION_PHONES ?? "").split(",").filter(Boolean) });
console.log(JSON.stringify(result, null, 2));
