# 领域文档

本文件规定 engineering work 探索 codebase 时如何使用仓库的领域文档。

## 探索前读取

1. 读取仓库根目录的 `CONTEXT-MAP.md`。
2. 读取其中指向且与当前任务相关的 `CONTEXT.md`。
3. 检查 `docs/adr/` 中与当前区域相关的系统级 ADR。
4. 对于相关 context，同时检查其 `docs/adr/` 中的 context 级决策。

缺少某层文档时继续使用当前源码和测试作为事实来源；只有真实领域概念或决策明确后才补充 context 或 ADR。

## 文件结构

```text
/
├── CONTEXT-MAP.md                    ← context 索引
├── docs/adr/                         ← 系统级决策
├── apps/
│   └── <context>/
│       ├── CONTEXT.md
│       └── docs/adr/                 ← context 级决策
└── packages/
    └── <context>/
        ├── CONTEXT.md
        └── docs/adr/                 ← context 级决策
```

`CONTEXT-MAP.md` 只列出真实存在的领域 contexts。配置、环境和通用 UI 等纯技术 package 通常不需要独立 glossary。

## 统一语言

Issue title、重构提案、hypothesis、API 和 test name 使用相关 `CONTEXT.md` 定义的 canonical term。需要的新概念尚未定义时，先确认源码中确实存在领域缺口，再更新 glossary。

## ADR 冲突

实现或提案与现有 ADR 冲突时，明确列出 ADR、冲突点和重新决策理由，不静默覆盖。
