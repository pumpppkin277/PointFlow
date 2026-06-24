# PointFlow · 积分活动运营平台 Demo

在线预览：<https://pumpppkin277.github.io/PointFlow/>

基于两份 PRD 搭建的内部运营端交互 Demo，覆盖：

- 运营总览、积分池与活动排期
- 三类活动创建（任务类、排位赛、定价折扣）
- UID 客户分层、且/或条件和奖励规则配置
- 积分返还、模型定价和有效期规则管理
- 高风险审批、阈值校验与活动状态回写
- 自动复盘、NPS 归因提示、权限与回滚记录

## 直接打开（推荐）

在 Finder 中双击 `打开Demo.command`，或直接双击 `PointFlow-Demo.html`。这个版本不需要启动服务，也不依赖 Node、Python或端口。

## 开发模式

```bash
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5173`。

## Demo 说明

当前版本使用前端模拟数据，适合产品评审和交互讨论；刷新页面后，临时创建的活动及审批操作会重置。

## 自动部署

推送到 `main` 后，GitHub Actions 会构建项目并自动发布到 GitHub Pages。
