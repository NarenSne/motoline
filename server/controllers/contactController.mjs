import sendEmail from "../utils/email.mjs";
import { escapeHtml } from "../utils/html.mjs";

const CATEGORIES = ["Soporte Técnico", "Ventas y Pedidos", "Garantías", "Otros"];
const EMAIL_PATTERN = /^[^\s@<>(),;:"[\]\\]+@[^\s@<>(),;:"[\]\\]+\.[^\s@<>(),;:"[\]\\]+$/;

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export const sendContactMessage = async (req, res) => {
  const { website, terms } = req.body ?? {};
  const name = clean(req.body?.name);
  const email = clean(req.body?.email);
  const phone = clean(req.body?.phone);
  const category = clean(req.body?.category);
  const message = clean(req.body?.message);

  // Campo trampa para bots: un humano nunca lo ve ni lo llena.
  if (clean(website)) {
    return res.json({ ok: true });
  }

  const errors = [];
  if (name.length < 2 || name.length > 100) errors.push("name");
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.push("email");
  if (phone && !/^\+?\d{7,15}$/.test(phone.replace(/[\s-]/g, ""))) errors.push("phone");
  if (!CATEGORIES.includes(category)) errors.push("category");
  if (message.length < 10 || message.length > 2000) errors.push("message");
  if (terms !== true) errors.push("terms");
  if (errors.length) {
    return res.status(400).json({ error: "Invalid data", fields: errors });
  }

  const to = process.env.CONTACT_TO || process.env.EMAIL_USER;
  const rows = [
    ["Nombre", name],
    ["Correo", email],
    ["Teléfono", phone || "—"],
    ["Categoría", category],
  ];

  try {
    await sendEmail({
      email: to,
      replyTo: email,
      subject: `Nuevo mensaje de contacto - ${category}`,
      message: [...rows.map(([k, v]) => `${k}: ${v}`), "", "Mensaje:", message].join("\n"),
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;max-width:560px">
  <h2 style="margin:0 0 12px">Nuevo mensaje desde la página de contacto</h2>
  <table cellspacing="0" cellpadding="6" style="border-top:1px solid #e5e7eb;width:100%">
    ${rows.map(([k, v]) => `<tr><td style="color:#6b7280;border-bottom:1px solid #e5e7eb;width:110px">${escapeHtml(k)}</td><td style="border-bottom:1px solid #e5e7eb"><strong>${escapeHtml(v)}</strong></td></tr>`).join("")}
  </table>
  <h3 style="margin:16px 0 6px">Mensaje</h3>
  <p style="white-space:pre-wrap;line-height:1.5;margin:0">${escapeHtml(message)}</p>
  <p style="color:#6b7280;font-size:12px;margin-top:20px">Puedes responder a este correo para contestarle directamente a ${escapeHtml(name)}.</p>
</div>`,
    });
    res.json({ ok: true });
  } catch (error) {
    console.error("No se pudo enviar el mensaje de contacto:", error.message);
    res.status(502).json({ error: "Could not send the message" });
  }
};
