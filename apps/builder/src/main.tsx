import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Blocks,
  Check,
  Code2,
  GitBranch,
  Languages,
  Package,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import "@/styles/index.css";

type Language = "zh" | "en";
type PackageManager = "npm" | "pnpm" | "bun";
type TemplateId = "chacelow-admin-base" | "chacelow-admin-rbac" | "chacelow-admin-saas";

const templates = [
  {
    id: "chacelow-admin-base",
    name: "Admin Base",
    description: "登录、Session、API 健康检测和中英文后台基础模板。",
    descriptionEn: "Admin foundation with auth, sessions, API health checks, and i18n.",
    icon: Server,
    features: ["shadcn-admin", "Better Auth", "PostgreSQL + Drizzle", "Hono + tRPC", "中文 / English", "API health"],
  },
  {
    id: "chacelow-admin-rbac",
    name: "Admin RBAC",
    description: "动态角色、用户多角色、服务端鉴权和真实审计日志。",
    descriptionEn: "Dynamic roles, server authorization, multi-role users, and audit logs.",
    icon: ShieldCheck,
    features: ["Admin Base 全部能力", "动态角色", "静态权限目录", "permissionProcedure", "用户管理", "审计日志"],
  },
  {
    id: "chacelow-admin-saas",
    name: "Admin SaaS",
    description: "组织、成员、邀请、租户角色和服务端数据隔离。",
    descriptionEn: "Organizations, members, invitations, tenant roles, and server isolation.",
    icon: Users,
    features: ["Admin RBAC 全部能力", "Better Auth Organization", "组织切换", "成员与邀请", "租户角色", "tenant API guard"],
  },
] as const;

const translations = {
  zh: {
    templates: "模板",
    builder: "项目生成器",
    repository: "GitHub 仓库",
    title: "选择后台模板",
    subtitle: "每个选项都对应真实生成器、数据库 Schema、API 和页面。",
    project: "项目名称",
    packageManager: "包管理器",
    command: "执行命令",
    copy: "复制命令",
    copied: "已复制",
    selected: "当前模板",
    status: "公开静态 Builder",
    ready: "已通过 npm E2E",
  },
  en: {
    templates: "Templates",
    builder: "Project Builder",
    repository: "GitHub Repository",
    title: "Choose an admin template",
    subtitle: "Every option maps to real generator files, database schemas, APIs, and pages.",
    project: "Project name",
    packageManager: "Package manager",
    command: "Command",
    copy: "Copy command",
    copied: "Copied",
    selected: "Selected template",
    status: "Public static Builder",
    ready: "npm E2E verified",
  },
} as const;

const commandFor = (packageManager: PackageManager, template: TemplateId, projectName: string) => {
  const name = projectName.trim().replaceAll(/\s+/g, "-") || "my-admin";
  const runner = packageManager === "npm"
    ? "npx @chacelow-stack/create@latest"
    : packageManager === "pnpm"
      ? "pnpm create chacelow-stack@latest"
      : "bun create chacelow-stack@latest";
  return `${runner} ${name} --template ${template}`;
};

function BuilderSidebar({ language }: { language: Language }) {
  const text = translations[language];
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Chacelow Stack" isActive>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Code2 className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">Chacelow Stack</span>
                <span className="truncate text-xs">{text.status}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{text.builder}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip={text.templates}>
                  <Blocks />
                  <span>{text.templates}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Capabilities">
                  <Package />
                  <span>Capabilities</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={text.repository}>
                  <a href="https://github.com/chacelow/chacelow-stack">
                    <GitBranch />
                    <span>{text.repository}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={text.ready}>
              <Check className="text-emerald-600" />
              <span>{text.ready}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>("zh");
  const [templateId, setTemplateId] = useState<TemplateId>("chacelow-admin-rbac");
  const [projectName, setProjectName] = useState("my-admin");
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);
  const text = translations[language];
  const selectedTemplate = templates.find((template) => template.id === templateId) ?? templates[1];
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
    <SidebarProvider>
      <BuilderSidebar language={language} />
      <SidebarInset>
        <Header fixed>
          <div className="flex flex-1 items-center gap-2 text-sm">
            <span className="text-muted-foreground">{text.builder}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{text.templates}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={language === "zh" ? "secondary" : "ghost"} size="sm" onClick={() => setLanguage("zh")}>中文</Button>
            <Button variant={language === "en" ? "secondary" : "ghost"} size="sm" onClick={() => setLanguage("en")}>EN</Button>
            <Button asChild variant="outline" size="icon"><a href="https://github.com/chacelow/chacelow-stack" aria-label="GitHub"><GitBranch /></a></Button>
          </div>
        </Header>
        <Main>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{text.title}</h1>
              <p className="mt-1 text-muted-foreground">{text.subtitle}</p>
            </div>
            <Badge variant="outline" className="w-fit gap-1.5 text-emerald-700"><Check className="size-3.5" />{text.ready}</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {templates.map((template) => {
              const Icon = template.icon;
              const selected = template.id === templateId;
              return (
                <Card
                  key={template.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  className={selected ? "border-primary ring-1 ring-primary" : "transition-colors hover:border-foreground/30"}
                  onClick={() => setTemplateId(template.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") setTemplateId(template.id);
                  }}
                >
                  <CardHeader>
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4" /></div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{language === "zh" ? template.description : template.descriptionEn}</CardDescription>
                    <CardAction>{selected ? <Badge><Check className="size-3" />{text.selected}</Badge> : null}</CardAction>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {template.features.map((feature) => <div className="flex items-center gap-2 text-sm text-muted-foreground" key={feature}><Check className="size-3.5 text-emerald-600" />{feature}</div>)}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{text.selected}</CardTitle>
                <CardDescription>{selectedTemplate.name}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                <label className="grid gap-2 text-sm font-medium">
                  {text.project}
                  <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {text.packageManager}
                  <Select value={packageManager} onValueChange={(value) => setPackageManager(value as PackageManager)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pnpm">pnpm</SelectItem><SelectItem value="bun">bun</SelectItem><SelectItem value="npm">npm</SelectItem></SelectContent>
                  </Select>
                </label>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{text.command}</CardTitle>
                <CardDescription>CLI 0.2.0 · npm registry</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>{command}</code></pre>
                <Button className="w-full" onClick={copyCommand}>{copied ? <Check /> : <Code2 />}{copied ? text.copied : text.copy}</Button>
              </CardContent>
            </Card>
          </div>
        </Main>
      </SidebarInset>
    </SidebarProvider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
