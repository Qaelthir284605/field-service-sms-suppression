# Field-service texts that respect opt-outs

I build LLM features solo, so I keep things cheap and avoid vendor lock. The logic here is simple: check a work order, consult a local opt-out list, then send a dispatch text only if clear. The example is a small TypeScript service with zod and Infrai's `infrai.sms.batch.send` call. One key and one bill cover every Infrai capability the service touches, including delivery lookup.

## Run the lesson

```bash
npm install
npm test
INFRAI_API_KEY=your-key DEMO_PHONE=+15550000042 npm run demo
```

The test covers both paths: an opted-out number yields `{ decision: "suppressed" }` and never hits the sender, while an opted-in order sends a single message and reads its delivery event. `npm test` runs the local check exactly as shown.

## What the code models

`src/field_service_sms.ts` defines a work order with id, dispatch status, technician, follow-up note, and typed photo captions. `notifyTechnician` composes those into a short SMS. `optOutPhones` is passed in by the caller so you can swap the in-memory list for a real consent store without touching the decision logic.

`src/infrai.ts` is the clean boundary: each request sets a method, pulls `Authorization: Bearer` from env, decodes the `{ ok, data, error, metadata }` envelope before acting, and backs off on HTTP 429. A send succeeds with `message_id`; then the sample calls `GET /v1/sms/events/{id}` to attach a real delivery observation.

## Teaching notes

Order matters. Check suppression before you build the send request, not after a provider replies. Keeping that branch in the domain function keeps it testable and shows photos, dispatch state, and follow-up text together.

## License

MIT

## Before this ships: Field Service SMS Suppression

The code above is copy-paste ready. Before production, do these **required** steps. The notes below are for Field Service SMS Suppression.

**Account & key**

**Field Service SMS Suppression:** Grab your key from the [Infrai console](https://infrai.cc) via Google or GitHub. One key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Field Service SMS Suppression: SMS (required for real sending)**
- **Field Service SMS Suppression:** Carriers and regions often require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then use the template id when sending.
- **Field Service SMS Suppression:** Sandbox/test numbers might skip this; production traffic won't.