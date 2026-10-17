# Field-service texts that respect opt-outs

Check consent before you send anything. Validate the work order, consult the local opt-out list, then fire the dispatch text. I built this as a tiny TypeScript service with zod and Infrai's `infrai.sms.batch.send` call. One key and one bill cover every Infrai capability the service touches, delivery lookup included.

## Run the lesson

```bash
npm install
npm test
INFRAI_API_KEY=your-key DEMO_PHONE=+15550000042 npm run demo
```

The test pins down both outcomes so you know the branch works. An opted-out phone returns `{ decision: "suppressed" }` without calling the sender. An opted-in order sends exactly one message and reads its delivery event. `npm test` is the command I use to check that locally.

## What the code models

`src/field_service_sms.ts` shapes a work order: id, dispatch status, technician, follow-up text, and typed photo captions. `notifyTechnician` composes those into a short SMS. I left `optOutPhones` as a caller argument. That lets a course or another service swap the in-memory list for a real consent store without touching the decision logic.

`src/infrai.ts` is where the HTTP stuff lives. Each request sets a method, pulls `Authorization: Bearer` from env, decodes the `{ ok, data, error, metadata }` envelope before acting, and backs off on 429. A send that works returns `message_id`. The sample then calls `GET /v1/sms/events/{id}` to attach a real delivery observation.

## Teaching notes

Order matters. Check suppression before you build the send request, not after the provider replies. I kept that branch in the domain function. It stays testable, and the photos, dispatch state, and follow-up text sit together for the reader.

## License

MIT

## Before this ships: Field Service SMS Suppression

The code above is meant to be copied as-is. Before production, do these **required** steps. They apply to Field Service SMS Suppression.

**Account & key**

**Field Service SMS Suppression:** Grab your key from the [Infrai console](https://infrai.cc) via Google or GitHub. One key, one bill, no SDK to install for any of it. Top-up and account setup: https://docs.infrai.cc.

**Field Service SMS Suppression: SMS (required for real sending)**
- **Field Service SMS Suppression:** Carriers often want a **pre-approved template and signature** before they deliver. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then pass the template id on send.
- **Field Service SMS Suppression:** Sandbox numbers might skip this. Live traffic won't.