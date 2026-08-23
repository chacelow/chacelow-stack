import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { analyzeStackCompatibility } from "@/app/(home)/new/_components/utils";
import { DEFAULT_STACK, type StackState, TECH_OPTIONS } from "@/lib/constant";
import { sanitizeStackState } from "@/lib/sanitize-stack-addons";
import { formatProjectName, generateStackCommand, getSelectedTechs } from "@/lib/stack-utils";

import "./styles.css";
import { getOptionDescription, type Language, messages } from "./i18n";

type Category = keyof typeof TECH_OPTIONS;
type Option = (typeof TECH_OPTIONS)[Category][number];

const MAX_COMPATIBILITY_PASSES = 10;

const sections: Array<{ category: Category; multiple?: boolean }> = [
  { category: "webFrontend" },
  { category: "nativeFrontend" },
  { category: "backend" },
  { category: "runtime" },
  { category: "api" },
  { category: "database" },
  { category: "orm" },
  { category: "dbSetup" },
  { category: "auth" },
  { category: "payments" },
  { category: "packageManager" },
  { category: "webDeploy" },
  { category: "serverDeploy" },
  { category: "addons", multiple: true },
  { category: "examples", multiple: true },
];

const arrayCategories = new Set<Category>(["webFrontend", "nativeFrontend", "addons", "examples"]);

function resolveCompatibility(input: StackState) {
  let stack = sanitizeStackState(input);
  const changes: Array<{ category: string; message: string }> = [];

  for (let pass = 0; pass < MAX_COMPATIBILITY_PASSES; pass += 1) {
    const analysis = analyzeStackCompatibility(stack);
    if (!analysis.adjustedStack) return { stack, changes };
    changes.push(...analysis.changes);
    stack = sanitizeStackState(analysis.adjustedStack);
  }

  return { stack, changes };
}

function updateCategory(stack: StackState, category: Category, optionId: string, multiple: boolean) {
  if (multiple) {
    const current = stack[category as keyof StackState];
    const selected = Array.isArray(current) ? current : [];
    const withoutNone = selected.filter((id) => id !== "none");
    const next = optionId === "none"
      ? ["none"]
      : withoutNone.includes(optionId)
        ? withoutNone.filter((id) => id !== optionId)
        : [...withoutNone, optionId];
    return { ...stack, [category]: next.length > 0 ? next : ["none"] };
  }

  return {
    ...stack,
    [category]: arrayCategories.has(category) ? [optionId] : optionId,
  };
}

function isSelected(stack: StackState, category: Category, id: string) {
  const value = stack[category as keyof StackState];
  return Array.isArray(value) ? value.includes(id) : value === id;
}

function App() {
  const [stack, setStack] = useState<StackState>(() => resolveCompatibility(DEFAULT_STACK).stack);
  const [adjustments, setAdjustments] = useState<Array<{ category: string; message: string }>>([]);
  const [copied, setCopied] = useState(false);
  const [addonQuery, setAddonQuery] = useState("");
  const [language, setLanguage] = useState<Language>("zh");
  const copy = messages[language];

  const command = useMemo(
    () => generateStackCommand({ ...stack, projectName: formatProjectName(stack.projectName) }),
    [stack],
  );
  const selectedTechs = useMemo(() => getSelectedTechs(stack), [stack]);

  const selectOption = (category: Category, optionId: string, multiple: boolean) => {
    const result = resolveCompatibility(updateCategory(stack, category, optionId, multiple));
    setStack(result.stack);
    setAdjustments(result.changes.slice(-3));
  };

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main>
      <header className="hero">
        <div>
          <div className="language-switch" aria-label="Language">
            <button type="button" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
          </div>
          <a className="eyebrow" href="https://github.com/chacelow/chacelow-stack">{copy.eyebrow}</a>
          <h1>{copy.titleTop}<br />{copy.titleBottom}</h1>
          <p>{copy.description}</p>
        </div>
        <div className="hero-meta">
          <span><strong>{selectedTechs.length}</strong> {copy.selected}</span>
          <span><strong>{TECH_OPTIONS.addons.length}</strong> {copy.addonsAvailable}</span>
          <a href="https://www.npmjs.com/package/@chacelow-stack/create">CLI v0.1.0</a>
        </div>
      </header>

      <section className="project-row" aria-label="Project settings">
        <label htmlFor="project-name">{copy.projectName}</label>
        <input
          id="project-name"
          value={stack.projectName ?? ""}
          onChange={(event) => setStack({ ...stack, projectName: event.target.value })}
          spellCheck={false}
        />
        <button type="button" className="reset-button" onClick={() => setStack(resolveCompatibility(DEFAULT_STACK).stack)}>
          {copy.reset}
        </button>
      </section>

      <div className="workspace">
        <div className="categories">
          {sections.map(({ category, multiple }) => {
            const options = TECH_OPTIONS[category] as readonly Option[];
            const visibleOptions = category === "addons" && addonQuery
              ? options.filter((option) => `${option.name} ${option.description}`.toLowerCase().includes(addonQuery.toLowerCase()))
              : options;

            return (
              <section className={`category ${category === "addons" ? "addons-category" : ""}`} key={category}>
                <div className="category-heading">
                  <div>
                    <span className="category-index">{String(sections.findIndex((item) => item.category === category) + 1).padStart(2, "0")}</span>
                    <h2>{copy.categories[category]}</h2>
                  </div>
                  <span>{multiple ? copy.selectMultiple : copy.selectOne}</span>
                </div>
                {category === "addons" ? (
                  <div className="addon-toolbar">
                    <p>{copy.addonDescription}</p>
                    <input
                      aria-label="Filter addons"
                      placeholder={copy.filterAddons}
                      value={addonQuery}
                      onChange={(event) => setAddonQuery(event.target.value)}
                    />
                  </div>
                ) : null}
                <div className="option-grid">
                  {visibleOptions.map((option) => {
                    const selected = isSelected(stack, category, option.id);
                    return (
                      <button
                        type="button"
                        key={option.id}
                        className={`option-card ${selected ? "selected" : ""}`}
                        aria-pressed={selected}
                        onClick={() => selectOption(category, option.id, Boolean(multiple))}
                      >
                        <span className="option-mark">{selected ? "●" : "○"}</span>
                        <span className="option-icon" aria-hidden="true">
                          {option.icon ? (
                            <img src={option.icon} alt="" loading="lazy" />
                          ) : (
                            option.name.slice(0, 1)
                          )}
                        </span>
                        <span className="option-copy">
                          <strong>{option.name}</strong>
                          <small>{getOptionDescription(language, option.id, option.name, option.description)}</small>
                        </span>
                        {"experimental" in option && option.experimental ? <em>{copy.experimental}</em> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="command-panel">
          <div className="command-heading">
            <span>{copy.generatedCommand}</span>
            <span className="status-dot">{copy.compatible}</span>
          </div>
          <pre><code>{command.replaceAll(" --", " \\\n  --")}</code></pre>
          <button type="button" className="copy-button" onClick={copyCommand}>
            {copied ? copy.copied : copy.copy}
          </button>
          {adjustments.length > 0 ? (
            <div className="adjustments">
              <strong>{copy.adjusted}</strong>
              {adjustments.map((change, index) => <p key={`${change.category}-${index}`}>{change.message}</p>)}
            </div>
          ) : null}
          <div className="selection-list">
            <span>{copy.currentStack}</span>
            <div>{selectedTechs.map((tech) => <b key={`${tech.category}-${tech.id}`}>{tech.name}</b>)}</div>
          </div>
        </aside>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
