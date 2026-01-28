exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
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
      body: JSON.stringify({ error: "بيانات ناقصة" }),
    };
  }

  const VALID_CODES = ["NOOX-1111", "NOOX-2222", "NOOX-3333"];

  if (!VALID_CODES.includes(code)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "كود غير صحيح" }),
    };
  }

  // 🔐 قفل على الجهاز (localStorage)
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};
