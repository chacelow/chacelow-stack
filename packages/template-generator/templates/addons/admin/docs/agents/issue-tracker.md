# Issue Tracker：本地 Markdown

本仓库的 issues 和 specs 以 Markdown 文件形式存放在 `.scratch/` 中。

## 约定

- 每个 feature 使用一个目录：`.scratch/<feature-slug>/`
- Spec 路径为 `.scratch/<feature-slug>/spec.md`
- 每个 implementation ticket 使用独立文件：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 开始编号；不得合并成一个 tickets 文件
- 每个 issue 文件顶部附近使用 `Status:` 记录 triage state；role 字符串见 `triage-labels.md`
- Comments 和对话历史追加到文件底部的 `## Comments` 标题下

## 发布到 Issue Tracker

在 `.scratch/<feature-slug>/` 下创建新文件，必要时创建目录。工作开始前确认 issue 仍未被领取；完成后写入可验证结果和相关路径。

## 读取 Ticket

读取用户提供的路径或 issue number。实现前解析 acceptance criteria、阻塞关系和最新 comments；完成条件是每项 criteria 都有当前源码或运行证据。
