import { readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(repoRoot, "apps", "web", "src");
const localePaths = {
  en: join(repoRoot, "packages", "i18n", "src", "locales", "en.json"),
  zh: join(repoRoot, "packages", "i18n", "src", "locales", "zh.json"),
};

const userFacingAttributes = new Set([
  "alt",
  "aria-label",
  "cancelBtnText",
  "confirmText",
  "desc",
  "description",
  "empty",
  "label",
  "placeholder",
  "title",
]);
const userFacingProperties = new Set([
  "cancelBtnText",
  "confirmText",
  "desc",
  "description",
  "empty",
  "label",
  "placeholder",
  "title",
]);

// Product names, application branding, avatar initials, and keyboard shortcuts are intentionally invariant.
const invariantUiText = new Set([
  "API",
  "Better Auth",
  "K",
  "PostgreSQL",
  "SN",
  readJson(join(repoRoot, "package.json")).name,
  "⌘S",
  "⇧⌘P",
  "⇧⌘Q",
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function flatten(value, prefix = "", result = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, fullKey, result);
    } else {
      result.set(fullKey, child);
    }
  }
  return result;
}

function listSourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(path));
    } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
      files.push(path);
    }
  }
  return files;
}

function interpolationTokens(value) {
  if (typeof value !== "string") {
    return [];
  }
  return [...value.matchAll(/{{\s*([^},\s]+)[^}]*}}/g)]
    .map((match) => match[1])
    .sort();
}

function isTranslationCall(node) {
  if (!ts.isCallExpression(node)) {
    return false;
  }
  if (ts.isIdentifier(node.expression)) {
    return node.expression.text === "t";
  }
  return (
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === "t"
  );
}

function staticText(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
}

function normalizedUiText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function isUserFacingText(value) {
  const normalized = normalizedUiText(value);
  if (!/[A-Za-z\u3400-\u9fff]/u.test(normalized)) {
    return false;
  }
  if (invariantUiText.has(normalized)) {
    return false;
  }
  if (/^\S+@\S+\.\S+$/.test(normalized)) {
    return false;
  }
  return true;
}

const locales = Object.fromEntries(
  Object.entries(localePaths).map(([language, path]) => [
    language,
    flatten(readJson(path)),
  ])
);
const [referenceLanguage] = Object.keys(locales);
const reference = locales[referenceLanguage];
const violations = [];

for (const [language, locale] of Object.entries(locales)) {
  for (const key of reference.keys()) {
    if (!locale.has(key)) {
      violations.push(`${language}: missing locale key "${key}"`);
    }
  }
  for (const key of locale.keys()) {
    if (!reference.has(key)) {
      violations.push(`${language}: extra locale key "${key}"`);
    }
  }
  for (const [key, referenceValue] of reference) {
    if (!locale.has(key)) {
      continue;
    }
    const expected = interpolationTokens(referenceValue);
    const actual = interpolationTokens(locale.get(key));
    if (expected.join("\0") !== actual.join("\0")) {
      violations.push(
        `${language}: interpolation tokens for "${key}" are [${actual.join(", ")}], expected [${expected.join(", ")}]`
      );
    }
  }
}

for (const path of listSourceFiles(sourceRoot).sort()) {
  const normalizedPath = path.replaceAll("\\", "/");
  if (
    normalizedPath.includes("/assets/") ||
    normalizedPath.includes(".test.") ||
    normalizedPath.includes(".spec.") ||
    normalizedPath.endsWith("/routeTree.gen.ts")
  ) {
    continue;
  }

  const source = readFileSync(path, "utf8");
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const location = (node) => {
    const { line } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile)
    );
    return `${relative(repoRoot, path).replaceAll("\\", "/")}:${line + 1}`;
  };
  const reportUiText = (node, kind, value) => {
    const normalized = normalizedUiText(value);
    if (isUserFacingText(normalized)) {
      violations.push(`${location(node)}: hard-coded ${kind} "${normalized}"`);
    }
  };

  const visit = (node) => {
    if (isTranslationCall(node)) {
      const key = node.arguments[0] && staticText(node.arguments[0]);
      if (key && !reference.has(key)) {
        violations.push(`${location(node)}: unknown translation key "${key}"`);
      }
    }

    if (ts.isJsxText(node)) {
      reportUiText(node, "JSX text", node.getText(sourceFile));
    }

    if (
      ts.isJsxAttribute(node) &&
      userFacingAttributes.has(node.name.getText(sourceFile)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      reportUiText(
        node,
        `"${node.name.getText(sourceFile)}" attribute`,
        node.initializer.text
      );
    }

    if (
      ts.isPropertyAssignment(node) &&
      userFacingProperties.has(node.name.getText(sourceFile))
    ) {
      const value = staticText(node.initializer);
      if (value !== undefined) {
        reportUiText(
          node,
          `"${node.name.getText(sourceFile)}" property`,
          value
        );
      }
    }

    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      const value = staticText(node.expression);
      if (value !== undefined) {
        reportUiText(node, "JSX expression", value);
      }
    }

    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

if (violations.length > 0) {
  console.error(`i18n check failed with ${violations.length} violation(s):`);
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `i18n check passed: ${reference.size} locale keys across ${Object.keys(locales).length} locales; no hard-coded UI text found.`
  );
}
