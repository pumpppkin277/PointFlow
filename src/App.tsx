import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileBarChart,
  Filter,
  Gift,
  History,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  Users,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'

type PageKey = 'dashboard' | 'activities' | 'rules' | 'approvals' | 'risk' | 'design-lab'
type ActivityStatus = '进行中' | '待开始' | '待审批' | '已结束'
type ActivityType = '任务类' | '排位赛' | '定价折扣'
type AccentKey = 'peach' | 'sage' | 'rose' | 'blue' | 'lavender'

type DesignSettings = {
  panelWhite: number
  gridSize: number
  gridOpacity: number
  borderWidth: number
  shadowOffset: number
  radius: number
  saturation: number
  density: number
  accent: AccentKey
}

type NumberDesignSetting = Exclude<keyof DesignSettings, 'accent'>

type ActivityItem = {
  id: number
  name: string
  type: ActivityType
  status: ActivityStatus
  range: string
  points: string
  people: string
  owner: string
  progress: number
  goal: string
  accent: string
}

type ActivityDetailSeriesPoint = {
  day: string
  consumption: number
  consumptionWow: string
  materials: number
  materialsWow: string
  arpu: number
  arpuWow: string
}

type Approval = {
  id: number
  title: string
  kind: string
  applicant: string
  time: string
  risk: '高风险' | '中风险'
  summary: string
  status: '待处理' | '已通过' | '已驳回'
}

const initialActivities: ActivityItem[] = [
  {
    id: 1,
    name: 'Seedance 2.0 尝鲜季',
    type: '任务类',
    status: '进行中',
    range: '6月20日 — 6月30日',
    points: '328,600',
    people: '1,842',
    owner: '杨翘楚',
    progress: 64,
    goal: '提升新模型体验渗透率',
    accent: 'violet',
  },
  {
    id: 2,
    name: '美妆行业创意排位赛',
    type: '排位赛',
    status: '进行中',
    range: '6月16日 — 6月28日',
    points: '240,000',
    people: '986',
    owner: '林然',
    progress: 78,
    goal: '拉升美妆客户生成量',
    accent: 'orange',
  },
  {
    id: 3,
    name: '618 模型限时 8 折',
    type: '定价折扣',
    status: '待开始',
    range: '6月25日 — 6月27日',
    points: '180,000',
    people: '预计 1,200',
    owner: '周予',
    progress: 0,
    goal: '节点促销 · 拉动消耗',
    accent: 'cyan',
  },
  {
    id: 4,
    name: 'A0 → A1 新手成长计划',
    type: '任务类',
    status: '待审批',
    range: '7月1日 — 7月31日',
    points: '450,000',
    people: '预计 3,000',
    owner: '杨翘楚',
    progress: 0,
    goal: '新客完成首条素材投放',
    accent: 'green',
  },
  {
    id: 5,
    name: '一键同款积分加倍周',
    type: '定价折扣',
    status: '已结束',
    range: '6月2日 — 6月8日',
    points: '168,400',
    people: '2,106',
    owner: '陈霁',
    progress: 100,
    goal: '提升灵感工具使用率',
    accent: 'blue',
  },
]

const initialApprovals: Approval[] = [
  {
    id: 1,
    title: 'A0 → A1 新手成长计划',
    kind: '活动发布',
    applicant: '杨翘楚',
    time: '今天 10:42',
    risk: '高风险',
    summary: '预计覆盖 3,000 个 UID，积分预算 45 万，超过单活动默认阈值。',
    status: '待处理',
  },
  {
    id: 2,
    title: 'Seedream 4.0 模型定价调整',
    kind: '积分规则变更',
    applicant: '周予',
    time: '昨天 18:20',
    risk: '高风险',
    summary: '模型单次生成定价将由 45 积分调整为 38 积分，影响全部客户。',
    status: '待处理',
  },
  {
    id: 3,
    title: '服饰行业排位赛预算追加',
    kind: '预算变更',
    applicant: '林然',
    time: '昨天 15:08',
    risk: '中风险',
    summary: '活动奖励池追加 8 万积分，追加后仍处于团队月度预算内。',
    status: '待处理',
  },
]

const defaultDesignSettings: DesignSettings = {
  panelWhite: 100,
  gridSize: 16,
  gridOpacity: 4,
  borderWidth: 2,
  shadowOffset: 5,
  radius: 0,
  saturation: 76,
  density: 100,
  accent: 'peach',
}

const accentPalettes: Record<AccentKey, { label: string; main: string; soft: string; muted: string; text: string }> = {
  peach: { label: '杏桃', main: '#dec3aa', soft: '#f3e6da', muted: '#cdb9a6', text: '#684d38' },
  sage: { label: '鼠尾草', main: '#dbe8d6', soft: '#eef6eb', muted: '#b8c9b1', text: '#3e665d' },
  rose: { label: '灰玫瑰', main: '#eadde1', soft: '#f7eef1', muted: '#d7c0c8', text: '#76515e' },
  blue: { label: '雾蓝', main: '#dfecef', soft: '#f0f7f8', muted: '#bfd1d7', text: '#45626b' },
  lavender: { label: '灰紫', main: '#dfdcef', soft: '#f1f0fa', muted: '#c4bfde', text: '#5a567c' },
}

const designPresets: Array<DesignSettings & { id: string; name: string }> = [
  { ...defaultDesignSettings, id: 'white-grid', name: '白色方格' },
  { panelWhite: 99, gridSize: 18, gridOpacity: 3, borderWidth: 1, shadowOffset: 4, radius: 2, saturation: 62, density: 96, accent: 'sage', id: 'morandi-soft', name: '莫兰迪软白' },
  { panelWhite: 100, gridSize: 12, gridOpacity: 7, borderWidth: 2, shadowOffset: 7, radius: 0, saturation: 86, density: 92, accent: 'lavender', id: 'pixel-game', name: '像素游戏机' },
  { panelWhite: 100, gridSize: 22, gridOpacity: 2, borderWidth: 1, shadowOffset: 2, radius: 4, saturation: 54, density: 108, accent: 'blue', id: 'clean-desk', name: '清爽工作台' },
]

const navItems: { key: PageKey; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { key: 'dashboard', label: '运营总览', icon: LayoutDashboard },
  { key: 'activities', label: '活动管理', icon: Sparkles },
  { key: 'rules', label: '积分规则', icon: CircleDollarSign },
  { key: 'approvals', label: '审批中心', icon: ListChecks, badge: '3' },
]

const pageMeta: Record<PageKey, { eyebrow: string; title: string; desc: string }> = {
  dashboard: { eyebrow: 'POINTS BOOK', title: '积分活动小账本', desc: '用账本视角看活动、预算、审批和客户分层表现。' },
  activities: { eyebrow: 'ACTIVITY STUDIO', title: '活动管理', desc: '从配置、审批到执行与归档，管理每一场积分活动。' },
  rules: { eyebrow: 'POINTS ENGINE', title: '积分规则', desc: '管理返还比例、模型定价和积分有效期等底层机制。' },
  approvals: { eyebrow: 'APPROVAL CENTER', title: '审批中心', desc: '在规则或积分真正生效前，拦住风险，也放行好主意。' },
  risk: { eyebrow: 'GUARDRAILS', title: '风控与权限', desc: '用权限、阈值与回滚记录守住运营安全边界。' },
  'design-lab': { eyebrow: 'DESIGN LAB', title: 'UI 调参台', desc: '直接调产品视觉参数，满意后再固化成正式样式。' },
}

const pageKeys: PageKey[] = ['dashboard', 'activities', 'rules', 'approvals', 'risk', 'design-lab']

const getInitialDesignSettings = (): DesignSettings => {
  if (typeof window === 'undefined') return defaultDesignSettings
  try {
    const cached = window.localStorage.getItem('pointflow-design-settings')
    if (!cached) return defaultDesignSettings
    const parsed = JSON.parse(cached) as Partial<DesignSettings>
    return {
      ...defaultDesignSettings,
      ...parsed,
      accent: parsed.accent && parsed.accent in accentPalettes ? parsed.accent : defaultDesignSettings.accent,
    }
  } catch {
    return defaultDesignSettings
  }
}

const getInitialPage = (): PageKey => {
  if (typeof window === 'undefined') return 'dashboard'
  const key = window.location.hash.replace('#', '') as PageKey
  return pageKeys.includes(key) ? key : 'dashboard'
}

const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(value)

function App() {
  const [page, setPageState] = useState<PageKey>(getInitialPage)
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [designSettings, setDesignSettings] = useState<DesignSettings>(getInitialDesignSettings)
  const [showWizard, setShowWizard] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const syncPageFromHash = () => setPageState(getInitialPage())
    window.addEventListener('hashchange', syncPageFromHash)
    return () => window.removeEventListener('hashchange', syncPageFromHash)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const palette = accentPalettes[designSettings.accent]
    const panelLightness = Math.max(94, Math.min(100, designSettings.panelWhite))
    root.style.setProperty('--lab-page', `hsl(48 24% ${panelLightness}%)`)
    root.style.setProperty('--lab-panel', `hsl(48 18% ${panelLightness}%)`)
    root.style.setProperty('--lab-panel-alt', `hsl(48 16% ${Math.max(92, panelLightness - 1.8)}%)`)
    root.style.setProperty('--lab-grid-size', `${designSettings.gridSize}px`)
    root.style.setProperty('--lab-grid-color', `rgba(57, 52, 47, ${designSettings.gridOpacity / 100})`)
    root.style.setProperty('--lab-border-width', `${designSettings.borderWidth}px`)
    root.style.setProperty('--lab-radius', `${designSettings.radius}px`)
    root.style.setProperty('--lab-shadow-offset', `${designSettings.shadowOffset}px`)
    root.style.setProperty('--lab-shadow-color', `color-mix(in srgb, ${palette.muted} 52%, #dedbd4)`)
    root.style.setProperty('--lab-density', `${designSettings.density / 100}`)
    root.style.setProperty('--lab-saturation', `${designSettings.saturation}%`)
    root.style.setProperty('--lab-accent', palette.main)
    root.style.setProperty('--lab-accent-soft', palette.soft)
    root.style.setProperty('--lab-accent-muted', palette.muted)
    root.style.setProperty('--lab-accent-text', palette.text)
    window.localStorage.setItem('pointflow-design-settings', JSON.stringify(designSettings))
  }, [designSettings])

  const setPage = (nextPage: PageKey) => {
    setPageState(nextPage)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${nextPage}`)
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const createActivity = (activity: ActivityItem) => {
    setActivities((items) => [activity, ...items])
    setApprovals((items) => [
      {
        id: Date.now(),
        title: activity.name,
        kind: '活动发布',
        applicant: '杨翘楚',
        time: '刚刚',
        risk: '中风险',
        summary: `预计积分预算 ${activity.points}，提交后将进入运营负责人审批。`,
        status: '待处理',
      },
      ...items,
    ])
    setShowWizard(false)
    setPage('activities')
    notify('活动已提交审批，可在审批中心查看进度')
  }

  const handleApproval = (id: number, status: '已通过' | '已驳回') => {
    const target = approvals.find((item) => item.id === id)
    setApprovals((items) => items.map((item) => (item.id === id ? { ...item, status } : item)))
    if (target?.kind === '活动发布' && status === '已通过') {
      setActivities((items) =>
        items.map((item) => (item.name === target.title ? { ...item, status: '待开始' as ActivityStatus } : item)),
      )
    }
    notify(status === '已通过' ? '审批已通过，配置将按计划生效' : '已驳回申请并通知发起人')
  }

  const pendingCount = approvals.filter((item) => item.status === '待处理').length

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳过导航</a>
      <Sidebar page={page} setPage={setPage} pendingCount={pendingCount} />
      <main className="main-shell" id="main-content" tabIndex={-1}>
        <Topbar page={page} onCreate={() => setShowWizard(true)} />
        <div className="content-shell">
          {page === 'dashboard' && (
            <Dashboard activities={activities} setPage={setPage} />
          )}
          {page === 'activities' && <ActivitiesPage activities={activities} onCreate={() => setShowWizard(true)} />}
          {page === 'rules' && <RulesPage notify={notify} />}
          {page === 'approvals' && (
            <ApprovalsPage approvals={approvals} onDecision={handleApproval} />
          )}
          {page === 'risk' && <RiskPage notify={notify} />}
          {page === 'design-lab' && (
            <DesignLab
              settings={designSettings}
              setSettings={setDesignSettings}
              setPage={setPage}
              notify={notify}
            />
          )}
        </div>
      </main>
      {showWizard && <ActivityWizard onClose={() => setShowWizard(false)} onSubmit={createActivity} />}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  )
}

function Sidebar({
  page,
  setPage,
  pendingCount,
}: {
  page: PageKey
  setPage: (page: PageKey) => void
  pendingCount: number
}) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => setPage('dashboard')} aria-label="返回运营总览">
        <span className="brand-mark">
          <span />
          <span />
          <span />
        </span>
        <span>
          <strong>PointFlow</strong>
          <small>积分运营工作台</small>
        </span>
      </button>

      <div className="workspace-switch">
        <div className="workspace-avatar">即</div>
        <div>
          <span>即创业务线</span>
          <small>运营积分池</small>
        </div>
        <ChevronDown size={15} />
      </div>

      <nav className="nav-list" aria-label="主导航">
        <p className="nav-caption">工作台</p>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              className={page === item.key ? 'active' : ''}
              onClick={() => setPage(item.key)}
              data-testid={`nav-${item.key}`}
              aria-current={page === item.key ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.key === 'approvals' && pendingCount > 0 && <em>{pendingCount}</em>}
            </button>
          )
        })}
        <p className="nav-caption nav-caption-spaced">系统</p>
        <button className={page === 'risk' ? 'active' : ''} onClick={() => setPage('risk')} aria-current={page === 'risk' ? 'page' : undefined}>
          <ShieldCheck size={18} strokeWidth={1.8} />
          <span>风控与权限</span>
        </button>
        <button className={page === 'design-lab' ? 'active' : ''} onClick={() => setPage('design-lab')} aria-current={page === 'design-lab' ? 'page' : undefined}>
          <Settings2 size={18} strokeWidth={1.8} />
          <span>UI 调参台</span>
        </button>
      </nav>

      <div className="pool-mini">
        <div className="pool-mini-top">
          <span>本月积分池</span>
          <strong>68%</strong>
        </div>
        <div className="tiny-progress"><span style={{ width: '68%' }} /></div>
        <small>剩余 63.8 万 / 200 万</small>
      </div>

      <button className="user-card" aria-label="打开当前用户菜单">
        <span className="user-avatar">YC</span>
        <span>
          <strong>杨翘楚</strong>
          <small>活动运营 · 管理员</small>
        </span>
        <MoreHorizontal size={17} />
      </button>
    </aside>
  )
}

function Topbar({ page, onCreate }: { page: PageKey; onCreate: () => void }) {
  const meta = pageMeta[page]
  const showActions = !['dashboard', 'activities', 'rules', 'design-lab'].includes(page)
  return (
    <header className="topbar">
      <div className="page-heading">
        <span>{meta.eyebrow}</span>
        <div>
          <h1>{meta.title}</h1>
          <p>{meta.desc}</p>
        </div>
      </div>
      {showActions && (
        <div className="topbar-actions">
          <label className="global-search">
            <Search size={16} />
            <input aria-label="全局搜索" placeholder="搜索活动、规则或 UID" />
            <kbd>⌘ K</kbd>
          </label>
          <button className="icon-button notification-button" aria-label="通知">
            <Bell size={19} />
            <span aria-hidden="true" />
          </button>
          <button className="primary-button" onClick={onCreate} data-testid="create-activity">
            <Plus size={17} />
            新建活动
          </button>
        </div>
      )}
    </header>
  )
}

function DesignLab({
  settings,
  setSettings,
  setPage,
  notify,
}: {
  settings: DesignSettings
  setSettings: Dispatch<SetStateAction<DesignSettings>>
  setPage: (page: PageKey) => void
  notify: (message: string) => void
}) {
  const cssSnapshot = useMemo(() => {
    const palette = accentPalettes[settings.accent]
    return [
      `panelWhite: ${settings.panelWhite}`,
      `gridSize: ${settings.gridSize}px`,
      `gridOpacity: ${settings.gridOpacity}%`,
      `borderWidth: ${settings.borderWidth}px`,
      `shadowOffset: ${settings.shadowOffset}px`,
      `radius: ${settings.radius}px`,
      `saturation: ${settings.saturation}%`,
      `density: ${settings.density}%`,
      `accent: ${palette.label}`,
    ].join('\n')
  }, [settings])

  const updateNumber = (key: NumberDesignSetting, value: number) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const isPresetActive = (preset: DesignSettings) =>
    preset.panelWhite === settings.panelWhite &&
    preset.gridSize === settings.gridSize &&
    preset.gridOpacity === settings.gridOpacity &&
    preset.borderWidth === settings.borderWidth &&
    preset.shadowOffset === settings.shadowOffset &&
    preset.radius === settings.radius &&
    preset.saturation === settings.saturation &&
    preset.density === settings.density &&
    preset.accent === settings.accent

  const applyPreset = (preset: DesignSettings) => {
    setSettings({
      panelWhite: preset.panelWhite,
      gridSize: preset.gridSize,
      gridOpacity: preset.gridOpacity,
      borderWidth: preset.borderWidth,
      shadowOffset: preset.shadowOffset,
      radius: preset.radius,
      saturation: preset.saturation,
      density: preset.density,
      accent: preset.accent,
    })
  }

  const copySettings = async () => {
    try {
      await navigator.clipboard.writeText(cssSnapshot)
      notify('当前 UI 参数已复制')
    } catch {
      notify('浏览器未开放复制权限，参数已显示在右下角')
    }
  }

  return (
    <div className="design-lab-page page-enter">
      <aside className="design-lab-controls" aria-label="UI 调参控制台">
        <div className="design-lab-heading">
          <span className="section-kicker">TUNE PANEL</span>
          <strong>视觉参数</strong>
        </div>

        <div className="preset-grid" aria-label="风格预设">
          {designPresets.map((preset) => (
            <button
              key={preset.id}
              className={isPresetActive(preset) ? 'active' : ''}
              onClick={() => applyPreset(preset)}
            >
              <span>{preset.name}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="design-control-stack">
          <DesignSlider label="背景白度" value={settings.panelWhite} min={94} max={100} suffix="%" onChange={(value) => updateNumber('panelWhite', value)} />
          <DesignSlider label="方格尺寸" value={settings.gridSize} min={10} max={28} suffix="px" onChange={(value) => updateNumber('gridSize', value)} />
          <DesignSlider label="方格浓度" value={settings.gridOpacity} min={1} max={10} suffix="%" onChange={(value) => updateNumber('gridOpacity', value)} />
          <DesignSlider label="边框粗细" value={settings.borderWidth} min={1} max={4} suffix="px" onChange={(value) => updateNumber('borderWidth', value)} />
          <DesignSlider label="投影距离" value={settings.shadowOffset} min={0} max={10} suffix="px" onChange={(value) => updateNumber('shadowOffset', value)} />
          <DesignSlider label="圆角" value={settings.radius} min={0} max={10} suffix="px" onChange={(value) => updateNumber('radius', value)} />
          <DesignSlider label="色彩饱和" value={settings.saturation} min={40} max={115} suffix="%" onChange={(value) => updateNumber('saturation', value)} />
          <DesignSlider label="信息密度" value={settings.density} min={86} max={116} suffix="%" onChange={(value) => updateNumber('density', value)} />
        </div>

        <div className="accent-picker" aria-label="点缀色">
          {Object.entries(accentPalettes).map(([key, palette]) => (
            <button
              key={key}
              className={settings.accent === key ? 'active' : ''}
              onClick={() => setSettings((current) => ({ ...current, accent: key as AccentKey }))}
            >
              <i style={{ background: palette.main }} aria-hidden="true" />
              {palette.label}
            </button>
          ))}
        </div>

        <div className="design-lab-actions">
          <button className="secondary-button" onClick={() => setSettings(defaultDesignSettings)}>
            <RefreshCcw size={15} />
            重置
          </button>
          <button className="secondary-button" onClick={copySettings}>
            <Upload size={15} />
            复制参数
          </button>
        </div>
      </aside>

      <section className="design-lab-stage" aria-label="组件样式展板">
        <div className="design-stage-toolbar">
          <div>
            <span className="section-kicker">STYLE BOARD</span>
            <h2>组件样式展板</h2>
          </div>
          <div className="design-stage-actions">
            <button className="text-button" onClick={() => setPage('dashboard')}>看总览页 <ArrowRight size={14} /></button>
            <button className="text-button" onClick={() => setPage('approvals')}>看审批页 <ArrowRight size={14} /></button>
          </div>
        </div>

        <div className="design-preview-shell">
          <div className="design-preview-hero">
            <div>
              <span className="section-kicker">POINTS BOOK</span>
              <h3>今日积分账本</h3>
              <p>预算、审批和排期被收进一张白色方格面板。</p>
              <div className="brief-sticker-row">
                <span>预算安全区</span>
                <span>1 个待审批</span>
                <span>2 场进行中</span>
              </div>
            </div>
            <div className="brief-meter design-meter-sample">
              <span className="ledger-ticket">积分饼干罐</span>
              <div className="budget-dial"><strong>68%</strong><span>预算锁定</span></div>
            </div>
          </div>

          <div className="design-preview-metrics">
            <MetricCard icon={Sparkles} label="在线活动" value="6" unit="场" change="+2" tone="violet" />
            <MetricCard icon={Gift} label="近7天累计发放积分" value="1.284" unit="M" change="+18.2%" tone="mint" />
            <MetricCard icon={Users} label="参与客户数" value="4,827" unit="人" change="+14.7%" tone="orange" />
          </div>

          <div className="design-preview-grid">
            <article className="approval-detail-panel design-sample-panel">
              <div className="approval-detail-head">
                <div><span className="section-kicker">REQUEST #1</span><h3>A0 → A1 新手成长计划</h3><p>活动发布 · 申请人 杨翘楚</p></div>
                <span className="risk-tag high"><AlertTriangle size={13} /> 高风险</span>
              </div>
              <div className="approval-flow">
                <span className="done"><Check size={13} /> 发起申请</span>
                <i />
                <span className="current">负责人审批</span>
                <i />
                <span>按计划生效</span>
              </div>
              <div className="check-list">
                <span><CheckCircle2 size={15} /> 白名单权限校验通过</span>
                <span className="warning"><AlertTriangle size={15} /> 超过单活动默认积分阈值</span>
              </div>
            </article>

            <article className="design-sample-panel">
              <div className="panel-head">
                <div><span className="section-kicker">CONTROL SAMPLE</span><h3>按钮与标签</h3></div>
              </div>
              <div className="design-button-row">
                <button className="primary-button"><Check size={15} /> 通过并生效</button>
                <button className="secondary-button"><Settings2 size={15} /> 调整配置</button>
                <button className="reject-button"><X size={15} /> 驳回</button>
              </div>
              <div className="design-chip-row">
                <StatusTag status="进行中" />
                <StatusTag status="待审批" />
                <ActivityTypeTag type="任务类" />
                <ActivityTypeTag type="排位赛" />
              </div>
              <pre className="design-settings-output">{cssSnapshot}</pre>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}

function DesignSlider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  onChange: (value: number) => void
}) {
  return (
    <label className="design-slider">
      <span>
        <strong>{label}</strong>
        <em>{value}{suffix}</em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function Dashboard({
  activities,
  setPage,
}: {
  activities: ActivityItem[]
  setPage: (page: PageKey) => void
}) {
  const runningActivities = activities.filter((item) => item.status === '进行中')
  const approvalActivities = activities.filter((item) => item.status === '待审批')
  const nextMilestones = [
    { label: '今天', title: 'Seedance 2.0 尝鲜季第 3 批发放', meta: '960 UID · 预计 96,000 积分', tone: 'mint' },
    { label: '明天', title: '618 模型限时 8 折开始预热', meta: '活动前检查 4 项配置', tone: 'cyan' },
    { label: '本周', title: '美妆排位赛进入冲榜期', meta: 'Top 100 差距扩大到 18.4%', tone: 'orange' },
  ]

  return (
    <div className="dashboard-page page-enter">
      <section className="operation-brief" aria-label="今日积分账本">
        <article className="brief-hero">
          <div className="brief-copy">
            <div className="brief-title-row">
              <span className="section-kicker light">MAGIC LEDGER</span>
              <span className="mascot-sticker" aria-hidden="true"><i /><b>PF</b></span>
            </div>
            <h2>今日积分账本</h2>
            <p>把预算、审批和排期摊成一页小账本；先处理 1 个高风险审批，再推进本周排位赛冲榜。</p>
            <div className="brief-sticker-row" aria-label="今日关键状态">
              <span>预算安全区</span>
              <span>1 个待审批</span>
              <span>2 场进行中</span>
            </div>
            <div className="brief-action-row">
              <button className="primary-button" onClick={() => setPage('approvals')}><ShieldCheck size={16} /> 处理审批</button>
              <button className="brief-link-button" onClick={() => setPage('activities')}>查看活动节奏 <ArrowRight size={15} /></button>
            </div>
          </div>
          <div className="brief-meter" role="img" aria-label="本月积分池已锁定 68%，剩余 63.8 万积分">
            <span className="ledger-ticket" aria-hidden="true">积分饼干罐</span>
            <div className="budget-dial">
              <strong>68%</strong>
              <span>预算锁定</span>
            </div>
            <div>
              <span className="soft-label"><Activity size={14} /> 本月积分池</span>
              <h3>剩余 63.8 万</h3>
              <p>预算占用可控，新增活动需关注 30 万单活动阈值。</p>
              <div className="allocation-bars" aria-hidden="true">
                <i style={{ width: '46%' }} />
                <i style={{ width: '22%' }} />
                <i style={{ width: '32%' }} />
              </div>
            </div>
          </div>
        </article>

        <aside className="brief-queue">
          <div className="brief-queue-head">
            <span className="section-kicker">TODAY</span>
            <strong>{runningActivities.length} 场进行中</strong>
          </div>
          <div className="queue-pet-card" aria-hidden="true">
            <span>今日桌面</span>
            <strong>3 枚任务贴纸已摆好</strong>
          </div>
          <button className="brief-alert" onClick={() => setPage('approvals')}>
            <span className="summary-icon orange"><AlertTriangle size={17} /></span>
            <span><strong>{approvalActivities.length} 个配置待审批</strong><small>其中 1 个超过默认积分阈值</small></span>
            <ArrowRight size={15} />
          </button>
          <div className="milestone-list">
            {nextMilestones.map((item) => (
              <span className={`milestone ${item.tone}`} key={item.title}>
                <em>{item.label}</em>
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="metric-grid">
        <MetricCard icon={Sparkles} label="在线活动" value="6" unit="场" change="2 场近7天新增" tone="violet" />
        <MetricCard icon={Gift} label="近7天累计发放积分" value="1.284" unit="M" change="+18.2%" tone="mint" />
        <MetricCard icon={Users} label="近7天活动累计参与客户数" value="4,827" unit="人" change="+14.7%" tone="orange" />
        <MetricCard icon={Zap} label="近7天活动累计有消耗素材数" value="18,642" unit="条" change="+8.3%" tone="blue" />
      </section>

      <section className="dashboard-main-grid">
        <article className="panel activity-calendar-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">ACTIVITY PULSE</span>
              <h3>活动排期</h3>
            </div>
            <div className="calendar-actions">
              <button className="icon-button small" aria-label="查看上一周排期"><ChevronLeft size={16} /></button>
              <span>2026年 6月 22日 — 28日</span>
              <button className="icon-button small" aria-label="查看下一周排期"><ChevronRight size={16} /></button>
              <button className="text-button" onClick={() => setPage('activities')}>查看全部 <ArrowRight size={14} /></button>
            </div>
          </div>
          <ActivityCalendar />
        </article>

      </section>

      <section className="dashboard-bottom-grid">
        <article className="panel performance-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">LIVE CAMPAIGNS</span>
              <h3>进行中的活动</h3>
            </div>
            <button className="text-button" onClick={() => setPage('activities')}>管理活动 <ArrowRight size={14} /></button>
          </div>
          <div className="live-activities">
            {runningActivities.map((item) => (
              <div className="live-activity-row" key={item.id}>
                <span className={`activity-monogram ${item.accent}`}>{item.type === '排位赛' ? <Trophy size={18} /> : <WandSparkles size={18} />}</span>
                <div className="live-name"><strong>{item.name}</strong><small>{item.range}</small></div>
                <div className="live-data"><small>参与人数</small><strong>{item.people}</strong></div>
                <div className="live-data"><small>已发积分</small><strong>{item.points}</strong></div>
                <div className="progress-cell"><div><span style={{ width: `${item.progress}%` }} /></div><small>{item.progress}%</small></div>
                <button className="ghost-icon" aria-label={`${item.name} 更多操作`}><MoreHorizontal size={17} /></button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel layer-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">CUSTOMER LAYERS</span>
              <h3>分层近7天活动表现</h3>
            </div>
            <button className="ghost-icon" aria-label="分层表现更多操作"><MoreHorizontal size={18} /></button>
          </div>
          <div className="layer-matrix">
            <div className="layer-matrix-head">
              <span>层级</span>
              <span>参与率</span>
              <span>近7天活动牵引消耗</span>
              <span>近7天活动有消耗素材</span>
              <span>近7天活动有消耗素材 ARPU</span>
            </div>
            {[
              {
                layer: 'A0',
                metrics: [
                  { value: '24.6%', change: '+3.8%', trend: [16, 17, 18, 20, 21, 23, 24.6] },
                  { value: '¥328,600', change: '+23.8%', trend: [21, 22, 24, 27, 29, 31, 32.9] },
                  { value: '4,186', change: '+18.4%', trend: [29, 31, 33, 34, 37, 39, 41.9] },
                  { value: '¥78.5', change: '+9.6%', trend: [68, 69, 71, 70, 73, 75, 78.5] },
                ],
              },
              {
                layer: 'A1',
                metrics: [
                  { value: '31.8%', change: '+5.2%', trend: [22, 23, 25, 27, 28, 30, 31.8] },
                  { value: '¥512,400', change: '+31.6%', trend: [31, 33, 36, 42, 45, 48, 51.2] },
                  { value: '6,920', change: '+27.1%', trend: [44, 48, 50, 56, 61, 65, 69.2] },
                  { value: '¥74.0', change: '+4.1%', trend: [70, 69, 71, 72, 73, 72, 74] },
                ],
              },
              {
                layer: 'A2',
                metrics: [
                  { value: '18.9%', change: '+2.6%', trend: [15, 16, 15, 17, 18, 18.5, 18.9] },
                  { value: '¥430,800', change: '+16.2%', trend: [33, 34, 36, 37, 39, 41, 43.1] },
                  { value: '5,134', change: '+13.5%', trend: [39, 40, 42, 45, 46, 48, 51.3] },
                  { value: '¥83.9', change: '+7.4%', trend: [76, 77, 78, 80, 79, 82, 83.9] },
                ],
              },
              {
                layer: 'A3',
                metrics: [
                  { value: '12.4%', change: '-1.2%', trend: [14, 13.5, 13.2, 12.8, 13, 12.5, 12.4] },
                  { value: '¥298,700', change: '+8.9%', trend: [25, 26, 25, 27, 28, 29, 29.9] },
                  { value: '3,288', change: '+6.8%', trend: [29, 30, 29, 31, 31.5, 32, 32.9] },
                  { value: '¥90.8', change: '+5.7%', trend: [84, 85, 87, 86, 89, 90, 90.8] },
                ],
              },
              {
                layer: 'A4+',
                metrics: [
                  { value: '8.7%', change: '+0.8%', trend: [7.6, 7.8, 8, 8.1, 8.3, 8.4, 8.7] },
                  { value: '¥272,180', change: '+11.4%', trend: [21, 22, 24, 25, 25.5, 26, 27.2] },
                  { value: '2,106', change: '+4.2%', trend: [19, 20, 19.5, 20.2, 20.4, 20.7, 21.1] },
                  { value: '¥129.2', change: '+14.9%', trend: [101, 105, 110, 113, 119, 124, 129.2] },
                ],
              },
            ].map((row) => (
              <div className="layer-matrix-row" key={row.layer}>
                <strong>{row.layer}</strong>
                {row.metrics.map((metric, index) => (
                  <div className="layer-metric-cell" key={`${row.layer}-${index}`}>
                    <span className="layer-metric-top">
                      <b>{metric.value}</b>
                      <em className={metric.change.startsWith('-') ? 'negative' : ''}>
                        {metric.change.startsWith('-') ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                        环比 {metric.change}
                      </em>
                    </span>
                    <LayerSparkline values={metric.trend} />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="insight-note"><Sparkles size={14} /> A1 牵引消耗与素材数最高，A4+ 素材 ARPU 更高，可补一档高价值召回任务。</p>
        </article>
      </section>
    </div>
  )
}

function LayerSparkline({ values }: { values: number[] }) {
  const width = 136
  const height = 34
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const coords = values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: height - 5 - ((value - min) / range) * 24,
  }))
  const linePoints = coords.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPath = `M ${coords[0].x},${height - 4} L ${coords.map((point) => `${point.x},${point.y}`).join(' L ')} L ${coords[coords.length - 1].x},${height - 4} Z`

  return (
    <svg className="layer-sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={areaPath} />
      <polyline points={linePoints} />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.2" />
    </svg>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  change,
  tone,
}: {
  icon: typeof Activity
  label: string
  value: string
  unit: string
  change: string
  tone: string
}) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <div className={`metric-icon ${tone}`}><Icon size={18} /></div>
      <div className="metric-copy">
        <span>{label}</span>
        <div><strong>{value}</strong><small>{unit}</small></div>
      </div>
      <span className="metric-trend"><ArrowUpRight size={13} /> {change}</span>
    </article>
  )
}

function MiniLineChart() {
  return (
    <div className="mini-chart" role="img" aria-label="近30天活动牵引消耗趋势图">
      <svg viewBox="0 0 340 130" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8adff" stopOpacity=".5" />
            <stop offset="100%" stopColor="#b8adff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,106 C30,94 36,98 62,78 C86,60 100,74 126,69 C151,64 167,85 190,58 C210,35 235,49 254,39 C279,25 302,33 340,12 L340,130 L0,130 Z" fill="url(#chartFill)" />
        <path d="M0,106 C30,94 36,98 62,78 C86,60 100,74 126,69 C151,64 167,85 190,58 C210,35 235,49 254,39 C279,25 302,33 340,12" fill="none" stroke="#ded9ff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="340" cy="12" r="5" fill="#fff" stroke="#7a68ef" strokeWidth="3" />
      </svg>
      <div className="chart-labels"><span>5/25</span><span>6/2</span><span>6/10</span><span>6/18</span><span>今天</span></div>
    </div>
  )
}

function ActivityCalendar() {
  const days = [
    ['一', '22'], ['二', '23'], ['三', '24'], ['四', '25'], ['五', '26'], ['六', '27'], ['日', '28'],
  ]
  return (
    <div className="calendar-grid" role="img" aria-label="2026年6月22日至28日活动排期">
      <div className="calendar-corner">全天</div>
      {days.map(([week, date]) => <div className={`calendar-day ${date === '23' ? 'today' : ''}`} key={date}><small>周{week}</small><strong>{date}</strong></div>)}
      <div className="calendar-label">体验任务</div>
      <div className="calendar-track"><span className="calendar-event event-violet" style={{ left: '0%', width: '71%' }}><WandSparkles size={13} /><span className="calendar-event-name">Seedance 2.0 尝鲜季</span><span className="calendar-event-stat">消耗 ¥328.6k · 周环比 +23.8%</span></span></div>
      <div className="calendar-label">排位赛</div>
      <div className="calendar-track"><span className="calendar-event event-orange" style={{ left: '0%', width: '86%' }}><Trophy size={13} /><span className="calendar-event-name">美妆行业创意排位赛</span><span className="calendar-event-stat">参与 986 · 周环比 +14.7%</span></span></div>
      <div className="calendar-label">限时折扣</div>
      <div className="calendar-track"><span className="calendar-event event-cyan" style={{ left: '43%', width: '43%' }}><Zap size={13} /><span className="calendar-event-name">618 模型限时 8 折</span><span className="calendar-event-stat">素材 18,642 · 周环比 +8.3%</span></span></div>
      <div className="today-line" />
    </div>
  )
}

function ActivitiesPage({ activities, onCreate }: { activities: ActivityItem[]; onCreate: () => void }) {
  const [filter, setFilter] = useState<'全部' | ActivityStatus>('全部')
  const [search, setSearch] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)
  const shown = activities.filter(
    (item) => (filter === '全部' || item.status === filter) && item.name.toLowerCase().includes(search.toLowerCase()),
  )

  if (selectedActivity) {
    return <ActivityDetailPage activity={selectedActivity} onBack={() => setSelectedActivity(null)} />
  }

  return (
    <div className="page-enter activities-page">
      <section className="activity-summary-strip">
        <div><span className="summary-icon violet"><Activity size={18} /></span><p><small>本月活动</small><strong>12</strong><em>场</em></p></div>
        <div><span className="summary-icon mint"><Gift size={18} /></span><p><small>本月活动锁定</small><strong>92.4</strong><em>万积分</em></p></div>
        <div><span className="summary-icon orange"><Users size={18} /></span><p><small>本月活动参与用户数</small><strong>8,264</strong><em>UID</em></p></div>
        <div className="summary-pool-card"><span className="summary-icon blue"><ArrowUpRight size={18} /></span><div className="summary-pool-copy"><div><small>本月活动积分池</small><strong>68%</strong></div><i><em style={{ width: '68%' }} /></i><span>剩余 63.8 万 / 200 万</span></div></div>
      </section>
      <section className="panel activity-table-panel">
        <div className="table-toolbar">
          <div className="filter-tabs">
            {(['全部', '进行中', '待开始', '待审批', '已结束'] as const).map((item) => (
              <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}<span>{item === '全部' ? activities.length : activities.filter((a) => a.status === item).length}</span></button>
            ))}
          </div>
          <div className="table-tools">
            <label className="inline-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索活动" /></label>
            <button className="secondary-button"><Filter size={15} /> 筛选</button>
            <button className="primary-button compact" onClick={onCreate}><Plus size={16} /> 新建活动</button>
          </div>
        </div>
        <div className="data-table activity-data-table">
          <div className="data-row data-head">
            <span>活动名称</span><span>类型</span><span>活动周期</span><span>积分预算 / 发放</span><span>参与人数</span><span>状态</span><span>负责人</span><span />
          </div>
          {shown.map((item) => (
            <div
              className="data-row clickable-row"
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`查看${item.name}详情`}
              onClick={() => setSelectedActivity(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedActivity(item)
                }
              }}
            >
              <span className="activity-title-cell"><i className={`table-activity-icon ${item.accent}`}>{item.type === '排位赛' ? <Trophy size={17} /> : item.type === '任务类' ? <WandSparkles size={17} /> : <Zap size={17} />}</i><span><strong>{item.name}</strong><small>{item.goal}</small></span></span>
              <span><ActivityTypeTag type={item.type} /></span>
              <span className="muted-cell">{item.range}</span>
              <span><strong className="table-number">{item.points}</strong><small className="table-sub">积分</small></span>
              <span className="table-number">{item.people}</span>
              <span><StatusTag status={item.status} /></span>
              <span className="owner-cell"><i>{item.owner.slice(-1)}</i>{item.owner}</span>
              <span><button className="ghost-icon" aria-label="更多操作" onClick={(event) => event.stopPropagation()}><MoreHorizontal size={17} /></button></span>
            </div>
          ))}
        </div>
        <div className="table-footer"><span>共 {shown.length} 个活动</span><div><button disabled aria-label="上一页"><ChevronLeft size={15} /></button><button className="active" aria-label="第 1 页">1</button><button disabled aria-label="下一页"><ChevronRight size={15} /></button></div></div>
      </section>
    </div>
  )
}

function ActivityDetailPage({ activity, onBack }: { activity: ActivityItem; onBack: () => void }) {
  const detail = getActivityDetail(activity)
  const pointsValue = Number(activity.points.replace(/[^\d]/g, '')) || 0
  const issuedRate = activity.status === '已结束' ? 100 : activity.progress
  const issuedPoints = Math.round(pointsValue * issuedRate / 100)
  const pointsUsageRate = pointsValue ? Math.round((issuedPoints / pointsValue) * 100) : 0
  return (
    <div className="page-enter activity-detail-page">
      <button className="text-button detail-back-button" onClick={onBack}>
        <ChevronLeft size={14} /> 返回活动列表
      </button>

      <section className="activity-detail-hero">
        <div className="detail-hero-copy">
          <span className={`table-activity-icon ${activity.accent}`}>{activity.type === '排位赛' ? <Trophy size={18} /> : activity.type === '任务类' ? <WandSparkles size={18} /> : <Zap size={18} />}</span>
          <div>
            <div className="detail-title-row">
              <h2>{activity.name}</h2>
              <ActivityTypeTag type={activity.type} />
              <StatusTag status={activity.status} />
            </div>
            <p>{activity.goal}</p>
            <div className="detail-hero-meta">
              <span><CalendarDays size={14} /> {activity.range}</span>
              <span><Users size={14} /> 负责人 {activity.owner}</span>
              <span><ShieldCheck size={14} /> {detail.guardrail}</span>
            </div>
          </div>
        </div>
        <div className="detail-progress-box">
          <div className="detail-progress-top">
            <small>积分消耗进度</small>
            <button><FileBarChart size={13} /> 发放明细</button>
          </div>
          <strong>{pointsUsageRate}%</strong>
          <i><em style={{ width: `${pointsUsageRate}%` }} /></i>
          <span>已发放 {formatNumber(issuedPoints)} / 预计回发 {formatNumber(pointsValue)} 积分</span>
        </div>
      </section>

      <section className="activity-detail-metrics">
        {[
          { label: '参与人数', value: activity.people, sub: activity.people.startsWith('预计') ? '预计参与客户' : '活动参与客户', icon: Users, tone: 'orange' },
          { label: '已发放积分 UID 数', value: detail.issuedUid, sub: '已获得积分的 UID', icon: Gift, tone: 'mint' },
          { label: '近7天活动牵引消耗', value: detail.consumption, sub: `环比 ${detail.lift}`, icon: BarChart3, tone: 'blue' },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <article className="detail-metric-card" key={metric.label}>
              <span className={`summary-icon ${metric.tone}`}><Icon size={18} /></span>
              <div>
                <small>{metric.label}</small>
                <strong>{metric.value}</strong>
                <em>{metric.sub}</em>
              </div>
            </article>
          )
        })}
      </section>

      <section className="detail-content-grid">
        <article className="panel rule-detail-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">RULE CONFIG</span>
              <h3>规则配置</h3>
            </div>
            <button className="secondary-button compact">编辑规则</button>
          </div>
          <div className="detail-rule-list">
            {detail.rules.map((rule, index) => (
              <section className="detail-rule-card" key={rule.title}>
                <span>{index + 1}</span>
                <div>
                  <strong>{rule.title}</strong>
                  <p>{rule.desc}</p>
                  <div>
                    <em>{rule.metric}</em>
                    <em>{rule.reward}</em>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </article>

        <article className="panel activity-detail-data-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">ACTIVITY DATA</span>
              <h3>近7天活动数据</h3>
            </div>
            <button className="secondary-button compact"><FileBarChart size={14} /> 导出</button>
          </div>
          <ActivityDetailChart series={detail.series} />
        </article>
      </section>
    </div>
  )
}

function ActivityDetailChart({ series }: { series: ActivityDetailSeriesPoint[] }) {
  const width = 640
  const height = 188
  const metrics = [
    { key: 'consumption', wowKey: 'consumptionWow', label: '牵引消耗', color: '#6257e6', format: (value: number) => `¥${formatNumber(value)}` },
    { key: 'materials', wowKey: 'materialsWow', label: '有消耗素材数', color: '#29a6bd', format: (value: number) => `${formatNumber(value)} 条` },
    { key: 'arpu', wowKey: 'arpuWow', label: '有消耗素材 ARPU', color: '#ef9a55', format: (value: number) => `¥${value.toFixed(1)}` },
  ] as const
  const latest = series[series.length - 1]
  const buildPlot = (key: typeof metrics[number]['key']) => {
    const values = series.map((item) => item[key])
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const coords = values.map((value, index) => ({
      x: 16 + (index / (series.length - 1)) * (width - 32),
      y: 26 + (1 - (value - min) / range) * (height - 62),
    }))
    return {
      coords,
      points: coords.map((point) => `${point.x},${point.y}`).join(' '),
      areaPath: `M ${coords[0].x},${height - 18} L ${coords.map((point) => `${point.x},${point.y}`).join(' L ')} L ${coords[coords.length - 1].x},${height - 18} Z`,
    }
  }

  return (
    <div className="activity-detail-chart">
      <div className="detail-chart-legend">
        {metrics.map((metric) => (
          <span key={metric.key}>
            <i style={{ background: metric.color }} />
            <small>{metric.label}</small>
            <strong>{metric.format(latest[metric.key])}</strong>
            <em className={latest[metric.wowKey].startsWith('-') ? 'negative' : ''}>环比 {latest[metric.wowKey]}</em>
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="近7天活动牵引消耗、有消耗素材数、有消耗素材 ARPU 趋势图">
        <defs>
          <linearGradient id="detailChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#766bea" stopOpacity=".22" />
            <stop offset="100%" stopColor="#766bea" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="#eceef4" strokeWidth="1">
          {[34, 68, 102, 136, 170].map((y) => <line x1="0" y1={y} x2={width} y2={y} key={y} />)}
        </g>
        {metrics.map((metric, metricIndex) => {
          const plot = buildPlot(metric.key)
          return (
            <g key={metric.key}>
              {metricIndex === 0 && <path d={plot.areaPath} fill="url(#detailChartFill)" />}
              <polyline points={plot.points} fill="none" stroke={metric.color} strokeWidth={metricIndex === 0 ? 4 : 3} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {plot.coords.map((point, index) => <circle key={`${metric.key}-${series[index].day}`} cx={point.x} cy={point.y} r={metricIndex === 0 ? 4.5 : 3.7} fill="#fff" stroke={metric.color} strokeWidth="2.6" vectorEffect="non-scaling-stroke" />)}
            </g>
          )
        })}
      </svg>
      <div className="detail-chart-axis">
        {series.map((item) => <span key={item.day}>{item.day}</span>)}
      </div>
      <div className="detail-daily-grid">
        {series.map((item) => (
          <div key={item.day}>
            <span>{item.day}</span>
            <p><small>牵引</small><strong>¥{formatNumber(item.consumption)}</strong><em className={item.consumptionWow.startsWith('-') ? 'negative' : ''}>{item.consumptionWow}</em></p>
            <p><small>素材</small><strong>{formatNumber(item.materials)}</strong><em className={item.materialsWow.startsWith('-') ? 'negative' : ''}>{item.materialsWow}</em></p>
            <p><small>ARPU</small><strong>¥{item.arpu.toFixed(1)}</strong><em className={item.arpuWow.startsWith('-') ? 'negative' : ''}>{item.arpuWow}</em></p>
          </div>
        ))}
      </div>
    </div>
  )
}

function getActivityDetail(activity: ActivityItem) {
  if (activity.type === '排位赛') {
    return {
      audience: '美妆行业 A1-A3 客户',
      entry: '按近7天活动牵引消耗自动排名',
      rewardMode: '按名次梯度发放',
      guardrail: '排名奖励池封顶 24 万积分',
      progressNote: '榜单每小时刷新一次',
      reached: '榜单内 986 UID',
      issuedUid: '986',
      consumption: '¥512,400',
      lift: '+31.6%',
      dataScope: '榜单、发放和消耗',
      rules: [
        { title: '榜单指标', desc: '统计活动期内客户通过美妆行业模板产生的活动牵引消耗，按 UID 归因排名。', metric: '当前 Top 100 均消耗 ¥5,124', reward: 'Top 1-10 发 5,000 积分' },
        { title: '入榜门槛', desc: '至少生成 5 条素材，且活动牵引消耗不低于 800 元，低于门槛不参与奖励。', metric: '达门槛 318 UID', reward: 'Top 11-100 发 1,000 积分' },
      ],
      series: [
        { day: '6/17', consumption: 52800, consumptionWow: '+8.1%', materials: 4820, materialsWow: '+6.4%', arpu: 69.2, arpuWow: '+3.2%' },
        { day: '6/18', consumption: 61400, consumptionWow: '+12.4%', materials: 5360, materialsWow: '+8.8%', arpu: 70.6, arpuWow: '+3.8%' },
        { day: '6/19', consumption: 68600, consumptionWow: '+15.9%', materials: 5840, materialsWow: '+12.1%', arpu: 71.8, arpuWow: '+4.5%' },
        { day: '6/20', consumption: 73100, consumptionWow: '+18.8%', materials: 6120, materialsWow: '+15.6%', arpu: 72.4, arpuWow: '+5.1%' },
        { day: '6/21', consumption: 79400, consumptionWow: '+24.6%', materials: 6480, materialsWow: '+19.3%', arpu: 73.1, arpuWow: '+5.8%' },
        { day: '6/22', consumption: 82300, consumptionWow: '+28.2%', materials: 6710, materialsWow: '+22.7%', arpu: 73.5, arpuWow: '+6.2%' },
        { day: '6/23', consumption: 94700, consumptionWow: '+31.6%', materials: 6920, materialsWow: '+27.1%', arpu: 74.0, arpuWow: '+6.8%' },
      ],
    }
  }

  if (activity.type === '定价折扣') {
    return {
      audience: activity.status === '已结束' ? '一键同款活跃客户' : '618 节点潜在消耗客户',
      entry: '活动期使用指定模型或工具',
      rewardMode: '按折扣价实时扣减',
      guardrail: '折扣成本每日封顶',
      progressNote: activity.status === '已结束' ? '已完成历史数据沉淀' : '待活动开始后采集数据',
      reached: activity.status === '已结束' ? '2,106 UID' : '预计 1,200 UID',
      issuedUid: activity.status === '已结束' ? '2,106' : '0',
      consumption: activity.status === '已结束' ? '¥298,700' : '¥180,000',
      lift: activity.status === '已结束' ? '+22.4%' : '+18.5%',
      dataScope: '折扣使用、消耗和素材',
      rules: [
        { title: '折扣范围', desc: '指定模型或工具在活动期内按 8 折计费，订单扣减时自动识别活动资格。', metric: '覆盖 4 个 SKU', reward: '8 折实时生效' },
        { title: '使用上限', desc: '单 UID 活动期最多享受 20 次折扣，超出后恢复标准定价。', metric: '人均使用 6.8 次', reward: '超限自动恢复原价' },
      ],
      series: [
        { day: '6/17', consumption: 24600, consumptionWow: '+4.2%', materials: 1830, materialsWow: '+2.6%', arpu: 72.4, arpuWow: '+1.8%' },
        { day: '6/18', consumption: 28400, consumptionWow: '+6.7%', materials: 2110, materialsWow: '+4.1%', arpu: 74.2, arpuWow: '+2.4%' },
        { day: '6/19', consumption: 31800, consumptionWow: '+8.9%', materials: 2380, materialsWow: '+6.3%', arpu: 76.1, arpuWow: '+3.1%' },
        { day: '6/20', consumption: 39200, consumptionWow: '+13.4%', materials: 2920, materialsWow: '+10.5%', arpu: 78.6, arpuWow: '+4.4%' },
        { day: '6/21', consumption: 45600, consumptionWow: '+17.2%', materials: 3380, materialsWow: '+14.8%', arpu: 80.7, arpuWow: '+5.6%' },
        { day: '6/22', consumption: 51200, consumptionWow: '+20.1%', materials: 3890, materialsWow: '+18.6%', arpu: 82.3, arpuWow: '+6.3%' },
        { day: '6/23', consumption: 57800, consumptionWow: '+22.4%', materials: 4210, materialsWow: '+21.2%', arpu: 83.9, arpuWow: '+7.4%' },
      ],
    }
  }

  return {
    audience: activity.name.includes('A0') ? 'A0-A1 新客分层' : '新模型潜力客户',
    entry: '圈选客户 + UID 去重校验',
    rewardMode: '满足任一规则后按 UID 发放',
    guardrail: '单 UID 单规则仅发放一次',
    progressNote: activity.status === '待审批' ? '审批通过后开始执行' : '达标 UID 分批发放中',
    reached: activity.status === '待审批' ? '预计 3,000 UID' : '已达标 960 UID',
    issuedUid: activity.status === '待审批' ? '0' : '960',
    consumption: activity.name.includes('A0') ? '¥450,000' : '¥328,600',
    lift: activity.name.includes('A0') ? '+19.8%' : '+23.8%',
    dataScope: '任务达标、发放和消耗',
    rules: [
      { title: '规则 1 · 新客首投达标', desc: '生成素材不少于 3 条，且 AIGC 成片投放不少于 1 条。', metric: '已达标 642 UID', reward: '1,000 积分 / 人' },
      { title: '规则 2 · 新模型深度体验', desc: '使用 Seedance 2.0 不少于 2 次，或近7天活动有消耗素材不少于 5 条。', metric: '已达标 318 UID', reward: '600 积分 / 人' },
    ],
    series: [
      { day: '6/17', consumption: 38200, consumptionWow: '+7.6%', materials: 3180, materialsWow: '+5.1%', arpu: 72.6, arpuWow: '+2.8%' },
      { day: '6/18', consumption: 42100, consumptionWow: '+10.2%', materials: 3370, materialsWow: '+7.3%', arpu: 74.1, arpuWow: '+3.4%' },
      { day: '6/19', consumption: 48600, consumptionWow: '+13.7%', materials: 3610, materialsWow: '+10.8%', arpu: 76.4, arpuWow: '+5.1%' },
      { day: '6/20', consumption: 52400, consumptionWow: '+16.5%', materials: 3820, materialsWow: '+13.2%', arpu: 78.2, arpuWow: '+6.2%' },
      { day: '6/21', consumption: 58100, consumptionWow: '+19.1%', materials: 3970, materialsWow: '+15.4%', arpu: 80.4, arpuWow: '+7.8%' },
      { day: '6/22', consumption: 61400, consumptionWow: '+21.6%', materials: 4060, materialsWow: '+16.9%', arpu: 82.7, arpuWow: '+8.6%' },
      { day: '6/23', consumption: 67800, consumptionWow: '+23.8%', materials: 4186, materialsWow: '+18.4%', arpu: 84.6, arpuWow: '+9.6%' },
    ],
  }
}

function ActivityTypeTag({ type }: { type: ActivityType }) {
  return <span className={`type-tag ${type === '任务类' ? 'task' : type === '排位赛' ? 'race' : 'discount'}`}>{type}</span>
}

function StatusTag({ status }: { status: ActivityStatus }) {
  return <span className={`status-tag ${status === '进行中' ? 'running' : status === '待开始' ? 'scheduled' : status === '待审批' ? 'approval' : 'ended'}`}><i />{status}</span>
}

function RulesPage({ notify }: { notify: (message: string) => void }) {
  const [modal, setModal] = useState<'return' | 'expiry' | 'price' | null>(null)
  const [returnRate, setReturnRate] = useState('10')
  const [expiry, setExpiry] = useState('30')
  const [priceModalStep, setPriceModalStep] = useState<'select' | 'configure'>('select')
  const scopeOptions = ['AI原料生成', 'Agent成片', '数字人']
  const pricingModels = [
    { name: 'Seedance 2.0', capability: '视频生成', current: '60', previous: '—', unit: '积分 / 次', effective: '2026-06-20', status: '新上线', logo: 'm1', draft: '58', scope: ['AI原料生成', 'Agent成片'] },
    { name: 'Seedance 1.5', capability: '视频生成', current: '48', previous: '52', unit: '积分 / 次', effective: '2026-06-01', status: '生效中', logo: 'm2', draft: '46', scope: ['AI原料生成', 'Agent成片'] },
    { name: 'Seedance 1.0', capability: '视频生成', current: '36', previous: '40', unit: '积分 / 次', effective: '2026-05-12', status: '待变更', logo: 'm3', draft: '32', scope: ['AI原料生成', 'Agent成片'] },
  ]
  const [selectedPricingModel, setSelectedPricingModel] = useState<string | null>(null)
  const [priceDraft, setPriceDraft] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const activePricingModel = pricingModels.find((item) => item.name === selectedPricingModel) ?? pricingModels[0]
  const closeModal = () => {
    setModal(null)
    setPriceModalStep('select')
  }
  const openPriceModal = (modelName?: string) => {
    const model = modelName ? pricingModels.find((item) => item.name === modelName) : null
    setSelectedPricingModel(model?.name ?? null)
    setPriceDraft(model?.draft ?? '')
    setSelectedScopes(model?.scope ?? [])
    setPriceModalStep('select')
    setModal('price')
  }
  const choosePricingModel = (modelName: string) => {
    const model = pricingModels.find((item) => item.name === modelName) ?? pricingModels[0]
    setSelectedPricingModel(model.name)
    setPriceDraft(model.draft)
    setSelectedScopes(model.scope)
    setPriceModalStep('configure')
  }
  const togglePricingScope = (scope: string) => {
    setSelectedScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope])
  }
  const saveRule = () => {
    closeModal()
    notify('规则变更已提交审批，审批通过后按计划生效')
  }
  return (
    <div className="page-enter rules-page">
      <section className="rule-card-grid">
        <article className="rule-card">
          <div className="rule-card-head"><span className="rule-icon violet"><RefreshCcw size={20} /></span><span className="status-chip active">生效中</span></div>
          <p>消耗返还积分比例</p><div className="rule-value"><strong>{returnRate}</strong><span>%</span></div>
          <small>用户每消耗 100 元，返还 {returnRate} 积分</small>
          <div className="rule-meta"><span>适用：即创全产品</span><span>更新于 6月1日</span></div>
          <button onClick={() => setModal('return')}>调整规则 <ArrowRight size={15} /></button>
        </article>
        <article className="rule-card featured">
          <div className="rule-card-head"><span className="rule-icon orange"><CircleDollarSign size={20} /></span><span className="status-chip warning">1 项待审批</span></div>
          <p>产品模型定价</p><div className="rule-value"><strong>24</strong><span>个模型</span></div>
          <small>按模型 / SKU 维护单次生成积分定价</small>
          <div className="rule-meta"><span>3 个价格分组</span><span>更新于 6月18日</span></div>
          <button onClick={() => openPriceModal()}>管理定价 <ArrowRight size={15} /></button>
        </article>
        <article className="rule-card">
          <div className="rule-card-head"><span className="rule-icon mint"><Clock3 size={20} /></span><span className="status-chip active">生效中</span></div>
          <p>积分有效期</p><div className="rule-value"><strong>{expiry}</strong><span>天</span></div>
          <small>积分自到账日起计算，到期后自动失效</small>
          <div className="rule-meta"><span>到期前 3 天提醒</span><span>更新于 5月12日</span></div>
          <button onClick={() => setModal('expiry')}>调整规则 <ArrowRight size={15} /></button>
        </article>
      </section>
      <section className="panel pricing-panel">
        <div className="panel-head">
          <div><span className="section-kicker">MODEL PRICING</span><h3>模型定价一览</h3></div>
          <div className="pricing-tools"><label className="inline-search"><Search size={15} /><input aria-label="搜索模型" placeholder="搜索模型" /></label><button className="secondary-button"><History size={15} /> 变更记录</button></div>
        </div>
        <div className="data-table pricing-table">
          <div className="data-row data-head"><span>模型 / SKU</span><span>能力类型</span><span>当前定价</span><span>上一版定价</span><span>生效时间</span><span>状态</span><span /></div>
          {pricingModels.map((model) => <div className="data-row" key={model.name}><span className="model-cell"><i className={`model-logo ${model.logo}`}><Sparkles size={15} /></i><strong>{model.name}</strong></span><span className="muted-cell">{model.capability}</span><span className="table-number">{model.current} {model.unit}</span><span className="muted-cell">{model.previous === '—' ? '—' : `${model.previous} ${model.unit}`}</span><span className="muted-cell">{model.effective}</span><span><span className={`simple-status ${model.status === '待变更' ? 'pending' : model.status === '新上线' ? 'new' : ''}`}>{model.status}</span></span><span><button className="ghost-icon" aria-label={`调整${model.name}定价`} onClick={() => openPriceModal(model.name)}><MoreHorizontal size={17} /></button></span></div>)}
        </div>
      </section>
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="rule-modal" role="dialog" aria-modal="true" aria-labelledby="rule-modal-title">
            <div className="modal-header"><div><span className="section-kicker">CHANGE REQUEST</span><h2 id="rule-modal-title">{modal === 'return' ? '调整消耗返还比例' : modal === 'expiry' ? '调整积分有效期' : priceModalStep === 'select' ? '选择定价模型' : '调整模型定价'}</h2></div><button className="icon-button" aria-label="关闭规则调整弹窗" onClick={closeModal}><X size={18} /></button></div>
            <div className="rule-modal-body">
              {modal === 'price' && priceModalStep === 'select' && (
                <div className="pricing-select-step">
                  <div className="pricing-model-selector">
                    {pricingModels.map((model) => (
                      <button className={selectedPricingModel === model.name ? 'active' : ''} key={model.name} onClick={() => choosePricingModel(model.name)}>
                        <i className={`model-logo ${model.logo}`}><Sparkles size={14} /></i>
                        <span>
                          <strong>{model.name}</strong>
                          <small>{model.capability} · 当前 {model.current} {model.unit}</small>
                        </span>
                        <em>{selectedPricingModel === model.name && <Check size={13} />}</em>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {modal === 'price' && priceModalStep === 'configure' && (
                <>
                  <div className="selected-pricing-card">
                    <i className={`model-logo ${activePricingModel.logo}`}><Sparkles size={15} /></i>
                    <div>
                      <strong>{activePricingModel.name}</strong>
                      <small>当前定价：{activePricingModel.current} {activePricingModel.unit}</small>
                    </div>
                    <button onClick={() => setPriceModalStep('select')}><ChevronLeft size={13} /> 重新选择</button>
                  </div>
                  <div className="form-group"><label>{activePricingModel.name} 新定价 <em>*</em></label><div className="suffix-input"><input type="number" value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} /><span>{activePricingModel.unit}</span></div></div>
                  <div className="time-range-grid">
                    <div className="form-group"><label>生效时间</label><input className="plain-input" type="datetime-local" defaultValue="2026-06-26T00:00" /></div>
                    <div className="form-group"><label>失效时间</label><input className="plain-input" type="datetime-local" defaultValue="2026-07-26T00:00" /></div>
                  </div>
                  <div className="form-group"><label>适用范围</label><div className="scope-picker">{scopeOptions.map((scope) => <button type="button" className={selectedScopes.includes(scope) ? 'active' : ''} key={scope} onClick={() => togglePricingScope(scope)} aria-pressed={selectedScopes.includes(scope)}>{selectedScopes.includes(scope) && <Check size={12} />}{scope}</button>)}</div></div>
                  <div className="form-group"><label>变更原因</label><textarea placeholder="请说明变更背景和预期效果" defaultValue="配合新一阶段积分运营策略调整" /></div>
                </>
              )}
              {modal !== 'price' && (
                <>
                  <div className="form-group"><label>{modal === 'return' ? '新返还比例' : '新有效期'}</label><div className="suffix-input"><input type="number" value={modal === 'return' ? returnRate : expiry} onChange={(e) => modal === 'return' ? setReturnRate(e.target.value) : setExpiry(e.target.value)} /><span>{modal === 'return' ? '%' : '天'}</span></div></div>
                  <div className="impact-preview"><AlertTriangle size={18} /><div><strong>影响预估</strong><p>该规则为全局机制，变更后将影响所有新到账积分。</p></div></div>
                  <div className="form-group"><label>生效时间</label><input className="plain-input" type="datetime-local" defaultValue="2026-06-26T00:00" /></div>
                  <div className="form-group"><label>变更原因</label><textarea placeholder="请说明变更背景和预期效果" defaultValue="配合新一阶段积分运营策略调整" /></div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={closeModal}>取消</button>
              {!(modal === 'price' && priceModalStep === 'select') && <button className="primary-button" onClick={saveRule}><ShieldCheck size={16} /> 提交审批</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ApprovalsPage({ approvals, onDecision }: { approvals: Approval[]; onDecision: (id: number, status: '已通过' | '已驳回') => void }) {
  const [filter, setFilter] = useState<'待处理' | '已处理'>('待处理')
  const [selected, setSelected] = useState<number | null>(approvals.find((a) => a.status === '待处理')?.id ?? null)
  const shown = approvals.filter((item) => filter === '待处理' ? item.status === '待处理' : item.status !== '待处理')
  const active = approvals.find((item) => item.id === selected) ?? shown[0]
  return (
    <div className="page-enter approval-layout">
      <section className="panel approval-list-panel">
        <div className="approval-tabs"><button className={filter === '待处理' ? 'active' : ''} onClick={() => setFilter('待处理')} aria-pressed={filter === '待处理'}>待我审批 <span>{approvals.filter((a) => a.status === '待处理').length}</span></button><button className={filter === '已处理' ? 'active' : ''} onClick={() => setFilter('已处理')} aria-pressed={filter === '已处理'}>已处理</button></div>
        <div className="approval-items">
          {shown.map((item) => (
            <button key={item.id} className={active?.id === item.id ? 'active' : ''} onClick={() => setSelected(item.id)} aria-pressed={active?.id === item.id}>
              <div className="approval-item-top"><span className={`risk-tag ${item.risk === '高风险' ? 'high' : ''}`}>{item.risk}</span><small>{item.time}</small></div>
              <strong>{item.title}</strong>
              <p>{item.kind} · 申请人 {item.applicant}</p>
              {item.status !== '待处理' && <span className={`decision-chip ${item.status === '已通过' ? 'pass' : ''}`}>{item.status}</span>}
            </button>
          ))}
          {shown.length === 0 && <div className="empty-state"><CheckCircle2 size={30} /><strong>都处理完了</strong><span>暂时没有新的审批事项</span></div>}
        </div>
      </section>
      <section className="panel approval-detail-panel">
        {active ? (
          <>
            <div className="approval-detail-head"><div><span className="section-kicker">REQUEST #{String(active.id).slice(-4)}</span><h2>{active.title}</h2><p>{active.kind} · 由 {active.applicant} 于 {active.time} 提交</p></div><span className={`risk-tag large ${active.risk === '高风险' ? 'high' : ''}`}><AlertTriangle size={14} /> {active.risk}</span></div>
            <div className="approval-flow"><span className="done"><Check size={14} /> 发起申请</span><i /><span className={active.status === '待处理' ? 'current' : 'done'}>{active.status === '待处理' ? '2' : <Check size={14} />} 负责人审批</span><i /><span>3 按计划生效</span></div>
            <div className="approval-section"><h4>申请摘要</h4><p>{active.summary}</p></div>
            <div className="change-compare"><div><small>变更前</small><strong>{active.kind === '积分规则变更' ? '45 积分 / 次' : active.kind === '预算变更' ? '120,000 积分' : '草稿状态'}</strong></div><ArrowRight size={18} /><div className="after"><small>变更后</small><strong>{active.kind === '积分规则变更' ? '38 积分 / 次' : active.kind === '预算变更' ? '200,000 积分' : '发布并自动发放'}</strong></div></div>
            <div className="approval-section"><h4>风控检查</h4><div className="check-list"><span><CheckCircle2 size={17} /> 白名单权限校验通过</span><span><CheckCircle2 size={17} /> UID 参与范围可识别</span><span className="warning"><AlertTriangle size={17} /> {active.risk === '高风险' ? '超过单活动 30 万积分默认阈值' : '预算追加接近团队周度阈值'}</span></div></div>
            <div className="approval-section"><h4>审批意见 <em>选填</em></h4><textarea placeholder="补充审批意见，将同步给申请人" /></div>
            {active.status === '待处理' ? <div className="approval-actions"><button className="reject-button" onClick={() => onDecision(active.id, '已驳回')}><X size={16} /> 驳回</button><button className="primary-button approve" onClick={() => onDecision(active.id, '已通过')}><Check size={17} /> 通过并按计划生效</button></div> : <div className={`processed-banner ${active.status === '已通过' ? 'passed' : ''}`}>{active.status === '已通过' ? <CheckCircle2 size={18} /> : <X size={18} />}{active.status}</div>}
          </>
        ) : <div className="empty-state detail-empty"><ListChecks size={36} /><strong>选择一项审批</strong><span>查看申请详情与风控检查结果</span></div>}
      </section>
    </div>
  )
}

function RiskPage({ notify }: { notify: (message: string) => void }) {
  return (
    <div className="page-enter risk-page">
      <section className="risk-hero"><div><span className="soft-label"><ShieldCheck size={14} /> SYSTEM HEALTH</span><h2>所有护栏运行正常</h2><p>过去 30 天已拦截 7 次超阈值配置，没有发生未授权积分发放。</p></div><div className="health-orb"><ShieldCheck size={34} /><span>100<small>%</small></span></div></section>
      <section className="risk-card-grid">
        <article className="panel guardrail-card"><span className="rule-icon violet"><Users size={20} /></span><div><h3>白名单权限</h3><p>当前 18 名运营拥有配置权限，3 名负责人拥有审批权限。</p></div><button className="secondary-button" onClick={() => notify('权限成员列表已是最新状态')}>管理成员</button></article>
        <article className="panel guardrail-card"><span className="rule-icon orange"><AlertTriangle size={20} /></span><div><h3>发放阈值</h3><p>单活动 30 万、单 UID 每日 5,000 积分，超出后强制审批。</p></div><button className="secondary-button" onClick={() => notify('阈值策略变更需负责人审批')}>调整阈值</button></article>
        <article className="panel guardrail-card"><span className="rule-icon mint"><RotateCcw size={20} /></span><div><h3>配置回滚</h3><p>保留最近 30 个配置版本，积分误发支持创建冲正任务。</p></div><button className="secondary-button" onClick={() => notify('暂无需要回滚的异常配置')}>回滚记录</button></article>
      </section>
      <section className="panel audit-panel"><div className="panel-head"><div><span className="section-kicker">AUDIT LOG</span><h3>最近操作记录</h3></div><button className="secondary-button"><Filter size={15}/> 筛选</button></div><div className="audit-list">{[
        ['今天 10:42', '杨翘楚', '提交活动发布审批', 'A0 → A1 新手成长计划', '待审批'],
        ['今天 09:18', '系统', '完成活动积分发放', 'Seedance 2.0 尝鲜季 · 第 3 批', '成功'],
        ['昨天 18:20', '周予', '修改模型定价', 'Seedream 4.0 · 45 → 38', '待审批'],
        ['昨天 16:05', '林然', '导出参与 UID 清单', '美妆行业创意排位赛', '已记录'],
      ].map((row) => <div key={row[0]+row[2]}><span>{row[0]}</span><span className="owner-cell"><i>{row[1].slice(-1)}</i>{row[1]}</span><strong>{row[2]}</strong><span>{row[3]}</span><em className={row[4] === '成功' ? 'success' : ''}>{row[4]}</em></div>)}</div></section>
    </div>
  )
}

function ActivityWizard({ onClose, onSubmit }: { onClose: () => void; onSubmit: (activity: ActivityItem) => void }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState<ActivityType>('任务类')
  const [name, setName] = useState('A0 新客首投成长计划')
  const [budget, setBudget] = useState('200000')
  const [audienceMode, setAudienceMode] = useState<'圈选客户' | '上传UID名单'>('圈选客户')
  const [segments, setSegments] = useState(['A0', 'A1'])
  const configuredRules = [
    {
      name: '规则 1 · 新客首投达标',
      logic: '且',
      reward: '1,000 积分 / 人',
      conditions: [
        ['生成素材', '不少于', '3', '条'],
        ['AIGC 成片投放', '不少于', '1', '条'],
      ],
    },
    {
      name: '规则 2 · 新模型深度体验',
      logic: '或',
      reward: '600 积分 / 人',
      conditions: [
        ['使用 Seedance 2.0', '不少于', '2', '次'],
        ['近7天活动有消耗素材', '不少于', '5', '条'],
      ],
    },
  ]
  const projected = useMemo(() => Math.min(Number(budget || 0), 300000), [budget])
  const toggleSegment = (value: string) => setSegments((items) => items.includes(value) ? items.filter((x) => x !== value) : [...items, value])
  const submit = () => onSubmit({
    id: Date.now(), name: name || '未命名积分活动', type, status: '待审批', range: '7月1日 — 7月31日', points: formatNumber(Number(budget || 0)), people: '预计 2,400', owner: '杨翘楚', progress: 0, goal: type === '任务类' ? '新客完成首条素材投放' : type === '排位赛' ? '客户分层消耗拉升' : '新模型限时推广', accent: type === '任务类' ? 'violet' : type === '排位赛' ? 'orange' : 'cyan',
  })
  return (
    <div className="wizard-backdrop">
      <div className="wizard-drawer" data-testid="activity-wizard" role="dialog" aria-modal="true" aria-labelledby="activity-wizard-title">
        <header className="wizard-header"><div><span className="section-kicker">CREATE CAMPAIGN</span><h2 id="activity-wizard-title">新建积分活动</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><X size={19} /></button></header>
        <div className="wizard-stepper">{[['1','选择类型'],['2','基本信息'],['3','范围与规则'],['4','预览发布']].map(([n,label],i) => <div className={step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''} key={n}><span>{step > i + 1 ? <Check size={14}/> : n}</span><small>{label}</small>{i < 3 && <i />}</div>)}</div>
        <div className="wizard-body">
          {step === 1 && <div className="wizard-section"><div className="section-intro"><h3>这次想用什么玩法？</h3><p>选择最接近目标的活动类型，后续仍可调整具体规则。</p></div><div className="activity-type-grid">
            <button className={type === '任务类' ? 'selected' : ''} onClick={() => setType('任务类')} aria-pressed={type === '任务类'}><span className="type-art task"><WandSparkles size={24}/></span><div><strong>任务类</strong><p>完成指定动作自动发积分，适合新手、成长与功能体验。</p><small>新手任务 · 成长任务 · 体验任务</small></div><i>{type === '任务类' && <Check size={14}/>}</i></button>
            <button className={type === '排位赛' ? 'selected' : ''} onClick={() => setType('排位赛')} aria-pressed={type === '排位赛'}><span className="type-art race"><Trophy size={24}/></span><div><strong>排位赛</strong><p>按消耗、生成量或使用量排名，适合分层客户拉升。</p><small>行业赛 · 分层赛 · 创意评选</small></div><i>{type === '排位赛' && <Check size={14}/>}</i></button>
            <button className={type === '定价折扣' ? 'selected' : ''} onClick={() => setType('定价折扣')} aria-pressed={type === '定价折扣'}><span className="type-art discount"><Zap size={24}/></span><div><strong>定价折扣</strong><p>限时折扣或多倍积分，用于新模型推广与节点促销。</p><small>模型折扣 · 积分多倍</small></div><i>{type === '定价折扣' && <Check size={14}/>}</i></button>
          </div></div>}
          {step === 2 && <div className="wizard-section"><div className="section-intro"><h3>填写基本信息</h3><p>这些信息会用于活动管理、审批和自动生成通知。</p></div><div className="form-grid"><div className="form-group full"><label>活动名称 <em>*</em></label><input className="plain-input" value={name} onChange={(e)=>setName(e.target.value)} /></div><div className="form-group"><label>开始时间 <em>*</em></label><input className="plain-input" type="datetime-local" defaultValue="2026-07-01T00:00" /></div><div className="form-group"><label>结束时间 <em>*</em></label><input className="plain-input" type="datetime-local" defaultValue="2026-07-31T23:59" /></div><div className="form-group"><label>积分预算 <em>*</em></label><div className="suffix-input"><input type="number" value={budget} onChange={(e)=>setBudget(e.target.value)}/><span>积分</span></div><small className="field-hint">单活动超过 300,000 积分将标记为高风险</small></div><div className="form-group"><label>活动目标</label><select defaultValue="新客培养"><option>新客培养</option><option>客户消耗拉升</option><option>新模型推广</option><option>沉默客户唤醒</option></select></div><div className="form-group full"><label>活动说明</label><textarea defaultValue="引导 A0 新客户在 3 天内完成首条素材生成与投放，完成后自动发放成长积分。" /></div></div></div>}
          {step === 3 && <div className="wizard-section">
            <div className="section-intro"><h3>圈定人群，配置达标规则</h3><p>支持按客户分层圈选，也可以上传 UID 名单 Excel 精准指定客户。</p></div>
            <div className="audience-card">
              <div className="audience-card-head">
                <div><strong>目标人群</strong><small>选择一种或多种方式圈定本次活动参与客户</small></div>
                <div className="audience-mode-tabs">
                  {(['圈选客户', '上传UID名单'] as const).map((mode) => <button className={audienceMode === mode ? 'active' : ''} key={mode} onClick={() => setAudienceMode(mode)} aria-pressed={audienceMode === mode}>{mode}</button>)}
                </div>
              </div>
              <div className="audience-method-grid">
                <div>
                  <label>客户分层圈选</label>
                  <div className="choice-pills">{['A0','A1','A2','A3','A4+'].map(x=><button className={segments.includes(x)?'active':''} key={x} onClick={()=>toggleSegment(x)} aria-pressed={segments.includes(x)}>{x}{segments.includes(x)&&<Check size={13}/>}</button>)}</div>
                </div>
                <button className={`upload-dropzone ${audienceMode === '上传UID名单' ? 'active' : ''}`} onClick={() => setAudienceMode('上传UID名单')}>
                  <Upload size={18} />
                  <span><strong>上传 UID 名单</strong><small>支持 .xlsx / .xls，系统将按 UID 去重校验</small></span>
                </button>
              </div>
            </div>
            <div className="multi-rule-builder">
              <div className="builder-head"><span>达标规则</span><button className="secondary-button compact"><Plus size={14} /> 添加规则</button></div>
              {configuredRules.map((rule, ruleIndex) => (
                <section className="rule-config-card" key={rule.name}>
                  <div className="rule-config-head">
                    <span>{rule.name}</span>
                    <em>条件关系：{rule.logic === '且' ? '且 AND' : '或 OR'}</em>
                  </div>
                  {rule.conditions.map((condition, conditionIndex) => (
                    <div className="condition-row" key={`${rule.name}-${condition[0]}`}>
                      <span>{conditionIndex + 1}</span>
                      <select defaultValue={condition[0]}><option>{condition[0]}</option><option>生成素材</option><option>使用指定模型</option><option>AIGC 成片投放</option><option>近7天活动有消耗素材</option></select>
                      <select defaultValue={condition[1]}><option>不少于</option><option>等于</option></select>
                      <input defaultValue={condition[2]}/>
                      <select defaultValue={condition[3]}><option>条</option><option>次</option></select>
                      <button><X size={15}/></button>
                    </div>
                  ))}
                  <div className="rule-reward-row">
                    <div><span className="rule-icon mint"><Gift size={17}/></span><div><strong>对应发放积分</strong><small>满足本规则后按 UID 发放一次</small></div></div>
                    <div className="suffix-input"><input defaultValue={ruleIndex === 0 ? '1000' : '600'} /><span>积分 / 人</span></div>
                  </div>
                </section>
              ))}
            </div>
          </div>}
          {step === 4 && <div className="wizard-section preview-section"><div className="section-intro"><h3>确认无误，提交审批</h3><p>请核对活动人群、达标规则和积分发放配置，确认后提交审批。</p></div><div className="preview-hero"><div><ActivityTypeTag type={type}/><h3>{name}</h3><p>2026年7月1日 00:00 — 7月31日 23:59</p><div>{segments.map(x=><span key={x}>{x}</span>)}</div></div><span className="preview-budget"><small>积分预算</small><strong>{formatNumber(Number(budget || 0))}</strong><em>积分</em></span></div><div className="flow-preview">{[['运营配置',CheckCircle2],['负责人审批',ShieldCheck],['发布与通知',Bell],['识别并发放',Zap],['执行归档',FileBarChart]].map(([label,Icon],i)=><div key={label as string}><span><Icon size={17}/></span><small>{label as string}</small>{i<4&&<i/>}</div>)}</div><div className="config-check-card"><div className="config-check-head"><ShieldCheck size={18}/><strong>活动配置核对</strong><span>{configuredRules.length} 条规则 · 预计锁定 {formatNumber(projected)} 积分</span></div><div className="config-check-summary"><span><CheckCircle2 size={15}/> 人群方式：{audienceMode}</span><span><CheckCircle2 size={15}/> 圈选层级：{segments.join('、')}</span><span><CheckCircle2 size={15}/> UID 发放上限：每条规则每 UID 一次</span><span className={Number(budget)>300000?'warn':''}>{Number(budget)>300000?<AlertTriangle size={15}/>:<CheckCircle2 size={15}/>} 积分预算：{formatNumber(Number(budget || 0))}</span></div><div className="rule-review-list">{configuredRules.map((rule) => <section key={rule.name}><div><strong>{rule.name}</strong><em>{rule.logic === '且' ? '满足全部条件' : '满足任一条件'} · 发放 {rule.reward}</em></div><ul>{rule.conditions.map((condition) => <li key={`${rule.name}-${condition[0]}`}>{condition[0]} {condition[1]} {condition[2]} {condition[3]}</li>)}</ul></section>)}</div></div></div>}
        </div>
        <footer className="wizard-footer"><button className="secondary-button" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? '取消' : <><ChevronLeft size={16}/> 上一步</>}</button><div><span>草稿自动保存</span>{step < 4 ? <button className="primary-button" onClick={() => setStep(step + 1)}>下一步 <ChevronRight size={16}/></button> : <button className="primary-button" onClick={submit} data-testid="submit-activity"><ShieldCheck size={16}/> 提交审批</button>}</div></footer>
      </div>
    </div>
  )
}

export default App
