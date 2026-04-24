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
        "关于 Open-Meteo、DOC、NZTA、Google 地图等署名、许可与商业使用边界，详见《免责声明与第三方署名》页面。",
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
      heading: "新西兰《Privacy Act 2020》与其他法律",
      paragraphs: [
        "若我们向新西兰居民提供服务或在新西兰开展与个人信息相关的活动，我们将在合理范围内遵守《Privacy Act 2020》对组织透明度的要求，包括说明如何收集、使用、持有与披露个人信息。",
        "若其他法域（例如 GDPR）对您适用，您可能享有额外的法定权利；我们会在法律与资源允许的范围内予以回应。",
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
        "For attribution, licences, and commercial-use boundaries (Open-Meteo, DOC, NZTA, Google Maps), see the Disclaimer & third-party attribution page.",
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
      heading: "New Zealand Privacy Act 2020 & other laws",
      paragraphs: [
        "Where we offer services to people in New Zealand or otherwise engage in activities regulated there, we aim to meet transparency expectations under the Privacy Act 2020, including explaining how personal information is collected, used, held, and disclosed.",
        "If other regimes (e.g. GDPR) apply to you, you may have additional statutory rights; we will respond where law and resources reasonably allow.",
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
      heading: "第三方品牌、数据与地图",
      paragraphs: [
        "行程与结果中出现的 DOC、NZTA、Open-Meteo、Google 等名称、标识或链接仅用于帮助您跳转至官方或供应商资源，不代表对方赞助、背书或与本站存在雇佣、合伙关系。",
        "关于 Open-Meteo CC BY 4.0 署名、免费 API 与商业使用、DOC / NZTA 材料署名、以及 Google 地图产品的展示规则等，请参阅「免责声明与第三方署名」页面。",
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
      heading: "Third-party brands, data & maps",
      paragraphs: [
        "References or links to DOC, NZTA, Open-Meteo, Google, and similar names are to help you reach official or vendor resources—they do not imply sponsorship, endorsement, employment, or partnership.",
        "For CC BY 4.0 credit to Open-Meteo, non-commercial vs commercial API use, DOC/NZTA attribution, and Google Maps display rules, see the Disclaimer & third-party attribution page.",
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

const disclaimerZh: LegalDoc = {
  title: "免责声明与第三方署名",
  lastUpdated: "2026-04-24",
  intro:
    "本页说明 takeadayoff.co.nz（下称「本站」）如何引用天气、路况、保护部与地图等第三方信息，以及本站与官方机构的关系。内容旨在帮助运营者遵守常见署名与许可要求，不构成法律意见；如有疑问请咨询专业顾问。",
  blocks: [
    {
      heading: "网站独立性（非政府、非官方）",
      paragraphs: [
        "本站为独立的行程规划与信息摘要工具，并非新西兰保护部（Department of Conservation, DOC）、新西兰交通局（Waka Kotahi NZ Transport Agency, NZTA）、Open-Meteo、Google LLC 或任何政府机构的官方网站、雇员、代理或背书方。",
        "本站不发布具有法律约束力的官方通告。徒步、海岸、道路、天气、许可与安全信息可能随时变化；出行前请务必通过 DOC、NZTA、MetService、地方议会等官方渠道核对实时信息与现场告示。",
      ],
    },
    {
      heading: "Open-Meteo 天气数据",
      paragraphs: [
        "本站展示的预报摘要来自 Open-Meteo 的开放接口。页脚与结果页已标注「Weather data provided by Open-Meteo」类致谢；Open-Meteo 数据按 CC BY 4.0 授权，需保留对 Open-Meteo.com 的适当署名（详见 open-meteo.com 的许可说明）。",
        "Open-Meteo 免费 API 通常面向非商业用途；若您计划将本站或相关数据用于广告、会员、收费功能、商业合作等营利场景，应自行评估并取得 Open-Meteo 的商业方案或其他已获授权的数据源，本站不对您的使用场景承担合规责任。",
      ],
    },
    {
      heading: "DOC（保护部）",
      paragraphs: [
        "本站通过链接指向 DOC 官方网站，并在部分文案中提供简短摘要式指引。DOC 网站材料多受新西兰 Crown copyright 等规则约束，许多内容在遵守条款的前提下可按 CC BY 4.0 等方式使用；凡引用或可识别为源自 DOC 的摘要，应适当署名「Department of Conservation」，且第三方托管内容以 DOC 网站标注为准。",
        "本站不爬取、不批量复制 DOC 长文或图片以冒充官方出版物；更完整、最新的步道开放、风险提示与许可信息，始终以 DOC 官网为准。",
      ],
    },
    {
      heading: "NZTA（交通局）与路况",
      paragraphs: [
        "路况摘要与「NZTA Journeys」等入口链接指向 Waka Kotahi / NZTA 官方资源。NZTA 公开材料常依 Creative Commons Attribution 4.0 International（CC BY 4.0）授权再使用；若您转载或衍生相关内容，请按 NZTA 要求保留署名与许可声明。",
        "封路、施工与延误以 NZTA 及现场标志为准；本站摘要不能替代官方实时路况。",
      ],
    },
    {
      heading: "Google Maps / Google 地理产品",
      paragraphs: [
        "本站以「在 Google 地图中打开」等外链为主，引导您至 Google 地图查看地点与路线；不把 Google 地图/街景/地球的界面截图当作本站自有图片库，也不批量抓取 Google 上的评论、评分或图片。",
        "若未来在站内嵌入 Google 地图组件，将遵守 Google Maps/Google Earth/Google Street View 的品牌与展示规则，保留 Google 及数据提供方要求的署名与徽标，不遮挡或移除其 attribution。",
      ],
    },
    {
      heading: "一般说明",
      paragraphs: [
        "本页及站内其他法律文件可能随服务调整而更新；重大变更时我们将在合理范围内提示。若您认为本站某处引用或署名不当，欢迎通过届时公布的联系渠道反馈。",
      ],
    },
  ],
};

const disclaimerEn: LegalDoc = {
  title: "Disclaimer & third-party attribution",
  lastUpdated: "2026-04-24",
  intro:
    "This page explains how takeadayoff.co.nz (the “Site”) cites weather, roads, conservation, and mapping sources, and how the Site relates to official agencies. It is practical guidance, not legal advice—consult a professional where needed.",
  blocks: [
    {
      heading: "Independence (not a government site)",
      paragraphs: [
        "The Site is an independent planning tool. It is not the official website, employee, agent, or endorsement of the New Zealand Department of Conservation (DOC), Waka Kotahi NZ Transport Agency (NZTA), Open-Meteo, Google LLC, or any government body.",
        "The Site does not issue binding official notices. Tracks, coasts, roads, weather, permits, and safety information change; always verify live conditions with DOC, NZTA, MetService, local councils, and on-site signage before you travel.",
      ],
    },
    {
      heading: "Open-Meteo weather data",
      paragraphs: [
        "Forecast summaries are obtained from Open-Meteo’s open API. The footer and results credit Open-Meteo (e.g. “Weather data provided by Open-Meteo”). Open-Meteo data is licensed under CC BY 4.0—retain appropriate credit to Open-Meteo.com (see open-meteo.com for licence details).",
        "The free API is generally intended for non-commercial use. If you commercialise the Site or its outputs (ads, subscriptions, paid features, partnerships, etc.), you must assess and obtain Open-Meteo’s commercial offering or another licensed data source yourself; the Site operator is not responsible for your compliance choices.",
      ],
    },
    {
      heading: "Department of Conservation (DOC)",
      paragraphs: [
        "The Site links to official DOC pages and may include short summary pointers. DOC material is often subject to New Zealand Crown copyright and related rules; much may be reused under terms such as CC BY 4.0 where stated—credit “Department of Conservation” when reusing or clearly deriving from DOC content, and follow DOC’s site for third-party exceptions.",
        "The Site does not scrape or bulk-copy DOC long-form text or imagery to impersonate official publications; authoritative track status and safety information is always on DOC’s website.",
      ],
    },
    {
      heading: "NZTA / Waka Kotahi & roads",
      paragraphs: [
        "Road snippets and links (e.g. NZTA Journeys) point to official NZTA resources. Much NZTA public information may be reused under Creative Commons Attribution 4.0 International (CC BY 4.0)—include NZTA attribution and licence notices when you republish or adapt.",
        "Closures, works, and delays are authoritative on NZTA channels and on-site signage; summaries here are not a substitute for live road information.",
      ],
    },
    {
      heading: "Google Maps & geographic products",
      paragraphs: [
        "The Site primarily uses outbound links such as “Open in Google Maps” for places and routes; it does not treat Google Maps / Street View / Earth screenshots as a proprietary image library, and does not bulk-harvest Google reviews, ratings, or photos.",
        "If embedded Google maps are added later, the Site will follow Google Maps / Earth / Street View branding and display rules, preserve required Google and data-provider attribution, and not obscure or remove mandated logos or notices.",
      ],
    },
    {
      heading: "General",
      paragraphs: [
        "This page and other legal documents may be updated as the service evolves; we will give reasonable notice for material changes where practical. If you believe attribution or reuse on the Site is incorrect, use the contact channel published on the Site when available.",
      ],
    },
  ],
};

const byLocale = {
  zh: { privacy: privacyZh, terms: termsZh, disclaimer: disclaimerZh },
  en: { privacy: privacyEn, terms: termsEn, disclaimer: disclaimerEn },
} as const;

export function legalDoc(locale: AppLocale, kind: "privacy" | "terms" | "disclaimer"): LegalDoc {
  return byLocale[locale][kind];
}
