import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Blocks,
  Check,
  ChevronRight,
  Clipboard,
  Code2,
  Database,
  ExternalLink,
  GitBranch,
  Languages,
  Menu,
  Package,
  PanelLeftClose,
  Server,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import "./styles.css";

type Language = "zh" | "en";
type PackageManager = "npm" | "pnpm" | "bun";
type TemplateId = "chacelow-admin-base" | "chacelow-admin-rbac" | "chacelow-admin-saas";

const templates = [
  {
    id: "chacelow-admin-base",
    name: "Admin Base",
    description: "生产可用的后台基础模板：登录、Session、API 健康检测和中英文。",
    descriptionEn: "Production admin foundation with auth, sessions, API health checks, and i18n.",
    icon: Server,
    features: ["shadcn-admin", "Better Auth", "PostgreSQL + Drizzle", "Hono + tRPC", "中文 / English", "API health"],
  },
  {
    id: "chacelow-admin-rbac",
    name: "Admin RBAC",
    description: "Base 的权限升级版：动态角色、用户多角色、服务端鉴权和审计。",
    descriptionEn: "Admin Base plus dynamic roles, server authorization, multi-role users, and audit logs.",
    icon: ShieldCheck,
    features: ["Admin Base 全部能力", "动态角色", "静态权限目录", "permissionProcedure", "用户管理", "审计日志"],
  },
  {
    id: "chacelow-admin-saas",
    name: "Admin SaaS",
    description: "RBAC 的多租户升级版：组织、成员、邀请、租户角色和数据隔离。",
    descriptionEn: "Tenant-scoped RBAC with organizations, members, invitations, roles, and isolation.",
    icon: Users,
    features: ["Admin RBAC 全部能力", "Better Auth Organization", "组织切换", "成员与邀请", "租户角色", "tenant API guard"],
  },
] as const;

const copy = {
  zh: {
    templates: "模板",
    builder: "项目生成器",
    capabilities: "能力说明",
    repository: "GitHub 仓库",
    title: "选择一个可直接使用的后台模板",
    subtitle: "每个选项都对应真实生成器、数据库 Schema、API 和页面，不展示 Mock 模板。",
    project: "项目名称",
    packageManager: "包管理器",
    command: "执行命令",
    copy: "复制命令",
    copied: "已复制",
    included: "实际包含",
    selected: "当前模板",
    install: "生成后安装依赖并启动数据库，即可打开真实登录页。",
    public: "公开 Builder",
    status: "静态站 · 无需登录",
  },
  en: {
    templates: "Templates",
    builder: "Project builder",
    capabilities: "Capabilities",
    repository: "GitHub repository",
    title: "Choose a production-ready admin template",
    subtitle: "Every option maps to real generator files, database schemas, APIs, and pages. No mock templates.",
    project: "Project name",
    packageManager: "Package manager",
    command: "Command",
    copy: "Copy command",
    copied: "Copied",
    included: "Included",
    selected: "Selected template",
    install: "Install dependencies and start the database to open the real login page.",
    public: "Public Builder",
    status: "Static · no login required",
  },
} as const;

function commandFor(packageManager: PackageManager, template: TemplateId, projectName: string) {
  const name = projectName.trim().replaceAll(/\s+/g, "-") || "my-admin";
  const runner = packageManager === "npm"
    ? "npx @chacelow-stack/create@latest"
    : packageManager === "pnpm"
      ? "pnpm create chacelow-stack@latest"
      : "bun create chacelow-stack@latest";
  return `${runner} ${name} --template ${template}`;
}

function App() {
  const [language, setLanguage] = useState<Language>("zh");
  const [templateId, setTemplateId] = useState<TemplateId>("chacelow-admin-rbac");
  const [projectName, setProjectName] = useState("my-admin");
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = copy[language];
  const selectedTemplate = templates.find((item) => item.id === templateId) ?? templates[1];
  const command = useMemo(
    () => commandFor(packageManager, templateId, projectName),
    [packageManager, projectName, templateId],
  );

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {sidebarOpen ? <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}
      <aside className={`admin-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Code2 /></span>
          <div className="brand-copy"><strong>Chacelow Stack</strong><small>{text.public}</small></div>
          <button className="mobile-close" type="button" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>
        <nav className="sidebar-nav" aria-label="Builder navigation">
          <p>{text.builder}</p>
          <button className="nav-item active" type="button"><Blocks /><span>{text.templates}</span></button>
          <button className="nav-item" type="button"><Package /><span>{text.capabilities}</span></button>
          <p>Project</p>
          <a className="nav-item" href="https://github.com/chacelow/chacelow-stack"><GitBranch /><span>{text.repository}</span><ExternalLink className="nav-external" /></a>
        </nav>
        <div className="sidebar-status"><span className="online-dot" /><div><strong>{text.status}</strong><small>Cloudflare Pages</small></div></div>
        <button className="collapse-button" type="button" onClick={() => setSidebarCollapsed((value) => !value)}>
          {sidebarCollapsed ? <ChevronRight /> : <PanelLeftClose />}<span>{sidebarCollapsed ? "" : "Collapse"}</span>
        </button>
      </aside>

      <section className="admin-content">
        <header className="site-header">
          <button className="menu-button" type="button" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <div className="breadcrumbs"><span>{text.builder}</span><ChevronRight /><strong>{text.templates}</strong></div>
          <div className="header-actions">
            <div className="language-control"><Languages /><button type="button" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button><button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button></div>
            <a className="icon-button" href="https://github.com/chacelow/chacelow-stack" aria-label="GitHub"><GitBranch /></a>
          </div>
        </header>

        <main className="main-content">
          <div className="page-heading"><div><h1>{text.title}</h1><p>{text.subtitle}</p></div><span className="real-badge"><Check />Real output only</span></div>

          <section className="template-grid" aria-label={text.templates}>
            {templates.map((template) => {
              const Icon = template.icon;
              const selected = template.id === templateId;
              return (
                <button className={`template-card ${selected ? "selected" : ""}`} key={template.id} type="button" aria-pressed={selected} onClick={() => setTemplateId(template.id)}>
                  <div className="template-card-head"><span className="template-icon"><Icon /></span>{selected ? <span className="selected-check"><Check /></span> : null}</div>
                  <div><h2>{template.name}</h2><p>{language === "zh" ? template.description : template.descriptionEn}</p></div>
                  <div className="feature-list">{template.features.map((feature) => <span key={feature}><Check />{feature}</span>)}</div>
                </button>
              );
            })}
          </section>

          <div className="builder-grid">
            <section className="config-card">
              <div className="card-header"><div><h2>{text.selected}</h2><p>{selectedTemplate.name}</p></div><selectedTemplate.icon /></div>
              <div className="form-grid">
                <label><span>{text.project}</span><input value={projectName} onChange={(event) => setProjectName(event.target.value)} /></label>
                <label><span>{text.packageManager}</span><select value={packageManager} onChange={(event) => setPackageManager(event.target.value as PackageManager)}><option value="pnpm">pnpm</option><option value="bun">bun</option><option value="npm">npm</option></select></label>
              </div>
              <div className="dependency-row"><Database /><span>PostgreSQL + Drizzle</span><Server /><span>Hono + tRPC</span><ShieldCheck /><span>Better Auth</span></div>
            </section>

            <section className="command-card">
              <div className="card-header"><div><h2>{text.command}</h2><p>{text.install}</p></div><Clipboard /></div>
              <pre><code>{command}</code></pre>
              <button className="primary-button" type="button" onClick={copyCommand}>{copied ? <Check /> : <Clipboard />}{copied ? text.copied : text.copy}</button>
            </section>
          </div>
        </main>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
