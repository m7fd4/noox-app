const { getStore } = require("@netlify/blobs");

function j(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return j(405, { error: "Method Not Allowed" });
  }

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}

  const code = String(body.code || "").trim();
  const fingerprint = String(body.fingerprint || "").trim();

  if (!code || !fingerprint) {
    return j(400, { error: "Missing code or fingerprint" });
  }

  // 🔑 ضيف أكوادك هنا
  const VALID_CODES = ["NOOX-1111", "NOOX-2222", "NOOX-3333"];

  if (!VALID_CODES.includes(code)) {
    return j(401, { error: "كود غير صحيح" });
  }

  const store = getStore("device-lock");
  const saved = await store.get(code);

  if (!saved) {
    await store.setJSON(code, { fingerprint, activatedAt: Date.now() });
    return j(200, { ok: true, status: "activated" });
  }

  if (saved.fingerprint === fingerprint) {
    return j(200, { ok: true, status: "ok" });
  }

  return j(403, { error: "الكود مستخدم على جهاز آخر" });
};
