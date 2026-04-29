/**
 * 通过 Resend HTTP API 发送事务邮件（不增加 npm 依赖）。
 * 生产环境请配置 RESEND_API_KEY，并在 Resend 控制台验证发件域名后设置 EMAIL_FROM。
 */

export type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(params: TransactionalEmail): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] skipped (RESEND_API_KEY unset)", params.to, params.subject);
    }
    return;
  }

  const from =
    process.env.EMAIL_FROM?.trim() ||
    "Take a Day Off <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend HTTP ${res.status}: ${body.slice(0, 500)}`);
  }
}
