import sendEmail from "../utils/email.mjs";
import User from "../models/User.mjs";
import { escapeHtml } from "../utils/html.mjs";

const siteUrl = () => (process.env.SITE_URL || "https://motolineparts.com").replace(/\/$/, "");

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value || 0);

const getRecipient = async (order) => {
  if (order.customerEmail) return order.customerEmail;
  if (!order.user) return null;
  const user = order.user.email ? order.user : await User.findById(order.user).select("email");
  return user?.email || null;
};

const firstName = (order) =>
  order.customerFirstName || (order.customerName || "").split(" ")[0] || "";

const renderHtml = ({ heading, paragraphs, rows, button }) => `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:6px;overflow:hidden">
    <tr><td style="background:#1c1c1c;padding:18px 24px;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:1px">MOTO <span style="color:#ff5500">LINE</span> PARTS</td></tr>
    <tr><td style="padding:24px">
      <h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(heading)}</h1>
      ${paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.5">${escapeHtml(p)}</p>`).join("")}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="6" style="margin:8px 0 20px;border-top:1px solid #e5e7eb">
        ${rows.map(([k, v]) => `<tr><td style="color:#6b7280;border-bottom:1px solid #e5e7eb">${escapeHtml(k)}</td><td style="text-align:right;font-weight:bold;border-bottom:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`).join("")}
      </table>
      <a href="${escapeHtml(button.url)}" style="display:inline-block;background:#ff5500;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:4px">${escapeHtml(button.label)}</a>
    </td></tr>
    <tr><td style="padding:16px 24px;background:#fafafa;color:#6b7280;font-size:12px">Si tienes dudas, responde a este correo. Motoline Parts.</td></tr>
  </table>
</body></html>`;

const renderText = ({ heading, paragraphs, rows, button }) =>
  [heading, "", ...paragraphs, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", `${button.label}: ${button.url}`].join("\n");

const buildMessage = (kind, order) => {
  const number = String(order.id).slice(0, 8);
  const trackingUrl = `${siteUrl()}/seguimiento/${order.id}`;
  const greeting = firstName(order) ? `Hola ${firstName(order)},` : "Hola,";
  const baseRows = [
    ["Pedido", `#${number}`],
    ["Destino", [order.address?.city, order.address?.department].filter(Boolean).join(", ") || "—"],
    ["Total", formatMoney((order.totalPrice || 0) + (order.shippingCost || 0))],
  ];

  if (kind === "shipped") {
    const content = {
      heading: "Tu pedido va en camino",
      paragraphs: [
        greeting,
        "Despachamos tu pedido con Inter Rapidísimo. Con este número de guía puedes seguir tu envío en la sección \"Sigue tu envío\" de interrapidisimo.com.",
      ],
      rows: [["Número de guía", order.trackingNumber], ...baseRows],
      button: { label: "Ver seguimiento de mi pedido", url: trackingUrl },
    };
    return { subject: `Tu pedido #${number} va en camino - Motoline Parts`, content };
  }

  const content = {
    heading: "Recibimos tu pedido",
    paragraphs: [
      greeting,
      "Confirmamos tu pedido y lo estamos preparando. Guarda el número de pedido: lo necesitas, junto con este correo electrónico, para consultar su estado en cualquier momento.",
    ],
    rows: baseRows,
    button: { label: "Ver seguimiento de mi pedido", url: trackingUrl },
  };
  return { subject: `Recibimos tu pedido #${number} - Motoline Parts`, content };
};

export const sendOrderEmail = async (kind, order) => {
  const email = await getRecipient(order);
  if (!email) return;

  const { subject, content } = buildMessage(kind, order);
  await sendEmail({ email, subject, message: renderText(content), html: renderHtml(content) });
};

// Los avisos nunca deben romper el flujo del pedido: se envían sin esperar y los errores solo se registran.
export const notifyOrder = (kind, order) => {
  sendOrderEmail(kind, order).catch((error) =>
    console.error(`No se pudo enviar el correo "${kind}" del pedido ${order?.id}:`, error.message)
  );
};
