import { z } from "zod";
import { infrai } from "./infrai.js";

export const workOrderSchema = z.object({
  id: z.string().min(1), customerPhone: z.string().min(7), technicianName: z.string().min(1),
  dispatchStatus: z.enum(["assigned", "en_route", "complete"]),
  photos: z.array(z.object({ id: z.string(), caption: z.string().min(1) })),
  followUp: z.string().min(1), optOutPhones: z.array(z.string()).default([]),
});
export type WorkOrder = z.infer<typeof workOrderSchema>;
export type SendResult = { decision: "suppressed" | "sent"; messageId?: string; event?: unknown };

export async function notifyTechnician(order: WorkOrder, send = infrai.sms.batch.send, events = infrai.sms.events): Promise<SendResult> {
  const input = workOrderSchema.parse(order);
  if (input.optOutPhones.includes(input.customerPhone)) return { decision: "suppressed" };
  const photoNote = input.photos.length ? ` Photos: ${input.photos.map((photo) => photo.caption).join(", ")}.` : "";
  const text = `Work order ${input.id} is ${input.dispatchStatus}. Technician ${input.technicianName}.${photoNote} Follow-up: ${input.followUp}`;
  const sent = await send({ messages: [{ to: input.customerPhone, text }] });
  const result: SendResult = { decision: "sent", messageId: sent.message_id };
  if (sent.message_id) result.event = await events(sent.message_id);
  return result;
}
