import nodemailer from "nodemailer";

export interface Smtp {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
}

export type SendMail = (smtp: Smtp, to: string, subject: string, html: string, text: string) => Promise<void>;

export const sendMail: SendMail = async (smtp, to, subject, html, text) => {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });
  await transport.sendMail({ from: `"${smtp.fromName || "takeadayoff"}" <${smtp.user}>`, to, subject, html, text });
};

export function codeEmail(code: string, purpose: "register" | "reset"): { subject: string; html: string; text: string } {
  const what = purpose === "register" ? "完成注册" : "重设密码";
  const subject = `takeadayoff 验证码：${code}`;
  const text = `你的验证码是 ${code}，10 分钟内有效，用于${what}。如果不是你本人操作，请忽略这封邮件。\n\ntakeadayoff · 拍完就去休息，剪辑交给我们`;
  const html = `<div style="font-family:'PingFang SC','Microsoft YaHei',Arial,sans-serif;max-width:460px;margin:0 auto;padding:28px;background:#fbf7f1;border-radius:18px;color:#15243b">
  <p style="margin:0 0 4px;font-size:13px;letter-spacing:.16em;color:#ff7a59;font-weight:700">TAKEADAYOFF</p>
  <h2 style="margin:0 0 18px;font-size:20px">你的验证码</h2>
  <p style="margin:0 0 18px;font-size:36px;font-weight:800;letter-spacing:.3em;color:#15243b">${code}</p>
  <p style="margin:0 0 6px;font-size:14px;color:#66758a">10 分钟内有效，用于${what}。</p>
  <p style="margin:0;font-size:13px;color:#99a3b1">如果不是你本人操作，请忽略这封邮件。</p>
  <p style="margin:22px 0 0;font-size:12px;color:#99a3b1">takeadayoff · 拍完就去休息，剪辑交给我们</p>
</div>`;
  return { subject, html, text };
}
