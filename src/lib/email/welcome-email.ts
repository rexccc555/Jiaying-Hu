import type { AppLocale } from "@/i18n/config";
import { getSiteUrl } from "@/lib/site-url";
import { escapeHtml } from "@/lib/email/escape-html";
import { sendTransactionalEmail } from "@/lib/email/resend-send";

function buildWelcomePayload(nickname: string, locale: AppLocale, site: string) {
  const safe = escapeHtml(nickname);
  const accountUrl = `${site}/${locale}/account`;
  const wizardUrl = `${site}/${locale}/wizard`;
  const homeUrl = `${site}/${locale}`;

  if (locale === "zh") {
    const subject = `${nickname}，欢迎加入 Take a Day Off`;
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8" /></head>
<body style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #e2e8f0;">
          <tr><td>
            <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Take a Day Off · takeadayoff.co.nz</p>
            <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;">感谢注册，${safe}！</h1>
            <p style="margin:0 0 16px;font-size:15px;">你的账户已创建成功。你在本站使用的昵称为 <strong>${safe}</strong>。</p>
            <p style="margin:0 0 24px;font-size:15px;">你可以随时登录后管理<strong>已保存的行程</strong>与<strong>邮件偏好</strong>，或继续规划新西兰一日游与短途路线。</p>
            <p style="margin:0 0 16px;">
              <a href="${accountUrl}" style="display:inline-block;background:linear-gradient(90deg,#0284c7,#4f46e5);color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600;font-size:15px;">进入我的账户</a>
            </p>
            <p style="margin:0 0 8px;font-size:14px;color:#64748b;">或从这些入口开始：</p>
            <ul style="margin:0;padding-left:20px;font-size:14px;color:#334155;">
              <li style="margin-bottom:6px;"><a href="${wizardUrl}" style="color:#0369a1;">开始规划行程</a></li>
              <li><a href="${homeUrl}" style="color:#0369a1;">返回首页</a></li>
            </ul>
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px;">
              本邮件为注册确认，无需回复。若你未在本站注册，请忽略此邮件。
            </p>
          </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`.trim();

    const text = [
      `感谢注册，${nickname}！`,
      "",
      `你的昵称为：${nickname}`,
      "",
      `进入我的账户：${accountUrl}`,
      `开始规划：${wizardUrl}`,
      `首页：${homeUrl}`,
      "",
      "本邮件为注册确认。若你未在本站注册，请忽略。",
    ].join("\n");

    return { subject, html, text };
  }

  const subject = `Welcome to Take a Day Off, ${nickname}!`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #e2e8f0;">
          <tr><td>
            <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Take a Day Off · takeadayoff.co.nz</p>
            <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;">Thanks for signing up, ${safe}!</h1>
            <p style="margin:0 0 16px;font-size:15px;">Your account is ready. We’ll refer to you as <strong>${safe}</strong> on the site.</p>
            <p style="margin:0 0 24px;font-size:15px;">Open <strong>My account</strong> to manage saved itineraries and email preferences, or jump back into the planner for NZ day trips and short breaks.</p>
            <p style="margin:0 0 16px;">
              <a href="${accountUrl}" style="display:inline-block;background:linear-gradient(90deg,#0284c7,#4f46e5);color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600;font-size:15px;">Go to My account</a>
            </p>
            <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Quick links:</p>
            <ul style="margin:0;padding-left:20px;font-size:14px;color:#334155;">
              <li style="margin-bottom:6px;"><a href="${wizardUrl}" style="color:#0369a1;">Start planning</a></li>
              <li><a href="${homeUrl}" style="color:#0369a1;">Home</a></li>
            </ul>
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px;">
              This is an automated registration confirmation—no reply needed. If you didn’t create an account, you can ignore this email.
            </p>
          </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`.trim();

  const text = [
    `Thanks for signing up, ${nickname}!`,
    "",
    `Your display name: ${nickname}`,
    "",
    `My account: ${accountUrl}`,
    `Start planning: ${wizardUrl}`,
    `Home: ${homeUrl}`,
    "",
    "This is an automated message. If you didn’t sign up, you can ignore it.",
  ].join("\n");

  return { subject, html, text };
}

/** 注册成功后发送欢迎邮件（失败仅打日志，不影响注册） */
export async function sendWelcomeEmailAfterRegistration(params: {
  to: string;
  nickname: string;
  locale: AppLocale;
}): Promise<void> {
  const site = getSiteUrl();
  const { subject, html, text } = buildWelcomePayload(params.nickname, params.locale, site);
  await sendTransactionalEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}
