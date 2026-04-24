import type { AppLocale } from "@/i18n/config";

export type LegalBlock = { heading: string; paragraphs: string[] };

export type LegalDoc = {
  title: string;
  lastUpdated: string;
  intro: string;
  blocks: LegalBlock[];
};

const privacyZh: LegalDoc = {
  title: "隐私政策",
  lastUpdated: "2026-04-24",
  intro:
    "本政策说明 takeadayoff.co.nz（下称「本站」）如何收集、使用与保护您的信息。使用本站即表示您理解本政策；若您不同意，请停止使用。",
  blocks: [
    {
      heading: "我们收集哪些信息",
      paragraphs: [
        "您在向导中自愿填写的内容（例如出行偏好、自由文字说明、所选区域与日期等），仅在生成行程与展示结果所必需的范围内处理。",
        "若您使用「保存 / 注册」类功能，我们可能收集您提供的账户标识（如邮箱）与经加密存储的密码摘要；不会以明文存储您的登录密码。",
        "与多数网站一样，托管平台与网络基础设施可能产生服务器日志（如 IP、User-Agent、访问时间与路径），用于安全与故障排查。",
      ],
    },
    {
      heading: "分析与 Cookie",
      paragraphs: [
        "我们可能使用隐私友好的统计工具（如 Plausible）或常见分析工具（如 Google Analytics）了解访问量与页面使用情况；仅在开启对应环境变量并加载脚本时生效。",
        "若未来接入广告或第三方追踪，我们会更新本政策，并在可行时在站内作出提示。",
      ],
    },
    {
      heading: "第三方与 AI 行程生成",
      paragraphs: [
        "当您已配置由第三方提供的 OpenAI 兼容接口时，为生成行程，相关输入（含您填写的偏好与摘要类上下文）会发送至该第三方处理；其处理行为受该第三方条款与隐私政策约束。",
        "天气与路况等公开数据来自第三方开放接口，本站仅展示摘要，不将此类数据用于识别您个人身份的用途。",
      ],
    },
    {
      heading: "存储、安全与保留",
      paragraphs: [
        "数据主要存储于您部署所选托管商（例如 Netlify）及关联数据库服务所在区域；我们会采取合理措施保护传输与存储安全，但无法保证互联网绝对安全。",
        "我们会在实现目的所必需的期限内保留信息；当您删除账户或要求我们删除时，在法律允许的范围内予以处理。",
      ],
    },
    {
      heading: "您的权利与联系我们",
      paragraphs: [
        "在适用法律允许的范围内，您可请求查阅、更正或删除与您相关的个人信息。",
        "如对本政策有疑问，请通过本站后续公布的联系方式与我们联系；若暂未单独公示邮箱，请通过您已知的产品反馈渠道留言。",
      ],
    },
  ],
};

const privacyEn: LegalDoc = {
  title: "Privacy Policy",
  lastUpdated: "2026-04-24",
  intro:
    "This policy explains how takeadayoff.co.nz (the “Site”) collects, uses, and protects your information. By using the Site you acknowledge this policy; if you disagree, please stop using the Site.",
  blocks: [
    {
      heading: "Information we collect",
      paragraphs: [
        "Information you voluntarily provide in the planner (preferences, free-text notes, selected region and dates, etc.) is processed only as needed to generate and display itineraries.",
        "If you use save/register features, we may collect identifiers such as your email and a salted hash of your password—we do not store passwords in plain text.",
        "Like most sites, hosting and network infrastructure may create server logs (e.g. IP, user agent, time and path) for security and troubleshooting.",
      ],
    },
    {
      heading: "Analytics & cookies",
      paragraphs: [
        "We may use privacy-friendly analytics (e.g. Plausible) or common tools (e.g. Google Analytics) to understand traffic; scripts load only when the corresponding environment variables are enabled.",
        "If we add advertising or additional third-party tracking, we will update this policy and provide notice where practical.",
      ],
    },
    {
      heading: "Third parties & AI generation",
      paragraphs: [
        "When you configure a third-party OpenAI-compatible API, inputs (including your preferences and contextual summaries) are sent to that provider to generate itineraries; their practices are governed by their own terms and privacy policy.",
        "Weather and road snippets come from public APIs; we display summaries only and do not use them to identify you personally.",
      ],
    },
    {
      heading: "Storage, security & retention",
      paragraphs: [
        "Data is primarily stored with your hosting provider (e.g. Netlify) and any linked database region. We apply reasonable safeguards, but no internet transmission is perfectly secure.",
        "We retain information only as long as needed for the stated purposes; you may request deletion where applicable law allows.",
      ],
    },
    {
      heading: "Your rights & contact",
      paragraphs: [
        "Where applicable law provides rights of access, correction, or erasure, you may contact us to exercise them.",
        "Questions about this policy: use contact details published on the Site when available, or any product feedback channel you already use.",
      ],
    },
  ],
};

const termsZh: LegalDoc = {
  title: "用户条款",
  lastUpdated: "2026-04-24",
  intro:
    "欢迎使用 takeadayoff.co.nz。本条款约束您对本站工具与内容的使用；请在使用前阅读。若您不同意，请勿使用本站。",
  blocks: [
    {
      heading: "服务性质",
      paragraphs: [
        "本站提供行程规划辅助与公开信息摘要，不构成法律、医疗、移民、保险或专业旅行顾问意见。",
        "行程由算法与（若已配置）第三方模型生成，可能存在错误、过时或与现场不符之处；出发前请自行向官方与运营商核实开放时间、路况、天气、许可与安全事项。",
      ],
    },
    {
      heading: "账户与内容",
      paragraphs: [
        "您对账户凭证保密负责；若发现未授权使用，请及时通过可用渠道通知我们。",
        "您保证在自由文字等字段中不提交违法、侵权、骚扰或恶意内容；我们有权在法律允许范围内限制或终止明显滥用行为。",
      ],
    },
    {
      heading: "知识产权",
      paragraphs: [
        "本站界面、文案与代码结构受适用法律保护；未经许可，请勿大规模抓取或以商业方式复制以替代本站服务。",
      ],
    },
    {
      heading: "免责声明与责任限制",
      paragraphs: [
        "在法律允许的最大范围内，本站按「现状」提供；不对因使用或无法使用本站而产生的任何间接、附带、特殊或后果性损害承担责任。",
        "部分司法辖区不允许排除某些保证或限制责任，则以该辖区法律允许的最低限度为准。",
      ],
    },
    {
      heading: "条款变更",
      paragraphs: [
        "我们可能更新本条款；更新后继续使用即视为接受修订版本。重大变更时，我们将在合理范围内通过站内提示或其他方式告知。",
      ],
    },
  ],
};

const termsEn: LegalDoc = {
  title: "Terms of Use",
  lastUpdated: "2026-04-24",
  intro:
    "Welcome to takeadayoff.co.nz. These terms govern your use of the Site’s tools and content. If you disagree, do not use the Site.",
  blocks: [
    {
      heading: "Nature of the service",
      paragraphs: [
        "The Site provides planning assistance and summaries of public information. It is not legal, medical, immigration, insurance, or professional travel advice.",
        "Itineraries may be produced by automated systems and/or third-party models and may be wrong, incomplete, or outdated—verify hours, access, weather, roads, permits, and safety with official sources and operators before you travel.",
      ],
    },
    {
      heading: "Accounts & content",
      paragraphs: [
        "You are responsible for safeguarding credentials; notify us through available channels if you suspect unauthorized access.",
        "You agree not to submit unlawful, infringing, harassing, or malicious content in free-text fields; we may restrict or terminate clear abuse where permitted by law.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "The Site’s UI, copy, and code structure are protected by applicable law; do not scrape or copy at scale to replace the service without permission.",
      ],
    },
    {
      heading: "Disclaimer & limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, the Site is provided “as is” without warranties; we are not liable for indirect, incidental, special, or consequential damages arising from use or inability to use the Site.",
        "Some jurisdictions do not allow certain exclusions; in those cases, limitations apply only to the extent permitted by law.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "We may update these terms; continued use after changes constitutes acceptance. For material changes, we will provide reasonable notice where practical.",
      ],
    },
  ],
};

const byLocale = {
  zh: { privacy: privacyZh, terms: termsZh },
  en: { privacy: privacyEn, terms: termsEn },
} as const;

export function legalDoc(locale: AppLocale, kind: "privacy" | "terms"): LegalDoc {
  return byLocale[locale][kind];
}
