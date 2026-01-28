import { getStore } from "@netlify/blobs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}

  const code = String(body.code || "").trim();
  const fingerprint = String(body.fingerprint || "").trim();

  if (!code || !fingerprint) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Missing code or fingerprint" }),
    };
  }

  // 🔑 ضيف أكوادك هنا
  const VALID_CODES = ["NOOX-1111", "NOOX-2222", "NOOX-3333"];

  if (!VALID_CODES.includes(code)) {
    return {
      statusCode: 401,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "كود غير صحيح" }),
    };
  }

  const store = getStore("device-lock");
  const saved = await store.get(code);

  // أول مرة: اربط الكود بهذا الجهاز
  if (!saved) {
    await store.setJSON(code, { fingerprint, activatedAt: Date.now() });
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true, status: "activated" }),
    };
  }

  // نفس الجهاز
  if (saved.fingerprint === fingerprint) {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true, status: "ok" }),
    };
  }

  // جهاز ثاني
  return {
    statusCode: 403,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ error: "الكود مستخدم على جهاز آخر" }),
  };
}
