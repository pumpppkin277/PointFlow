import { useMemo, useState } from 'react'
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
  Target,
  Trophy,
  Users,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'

type PageKey = 'dashboard' | 'activities' | 'rules' | 'approvals' | 'reports' | 'risk'
type ActivityStatus = '进行中' | '待开始' | '待审批' | '已结束'
type ActivityType = '任务类' | '排位赛' | '定价折扣'

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

const navItems: { key: PageKey; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { key: 'dashboard', label: '运营总览', icon: LayoutDashboard },
  { key: 'activities', label: '活动管理', icon: Sparkles },
  { key: 'rules', label: '积分规则', icon: CircleDollarSign },
  { key: 'approvals', label: '审批中心', icon: ListChecks, badge: '3' },
  { key: 'reports', label: '复盘报告', icon: FileBarChart },
]

const pageMeta: Record<PageKey, { eyebrow: string; title: string; desc: string }> = {
  dashboard: { eyebrow: 'OPERATION OVERVIEW', title: '今天，也让积分花得更值', desc: '所有活动、积分池与客户增长信号都在这里。' },
  activities: { eyebrow: 'ACTIVITY STUDIO', title: '活动管理', desc: '从配置、审批到执行与复盘，管理每一场积分活动。' },
  rules: { eyebrow: 'POINTS ENGINE', title: '积分规则', desc: '管理返还比例、模型定价和积分有效期等底层机制。' },
  approvals: { eyebrow: 'APPROVAL CENTER', title: '审批中心', desc: '在规则或积分真正生效前，拦住风险，也放行好主意。' },
  reports: { eyebrow: 'INSIGHT & REVIEW', title: '复盘报告', desc: '连接积分、使用和投放数据，回答活动究竟带来了什么。' },
  risk: { eyebrow: 'GUARDRAILS', title: '风控与权限', desc: '用权限、阈值与回滚记录守住运营安全边界。' },
}

const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(value)

function App() {
  const [page, setPage] = useState<PageKey>('dashboard')
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [showWizard, setShowWizard] = useState(false)
  const [toast, setToast] = useState('')

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
      <Sidebar page={page} setPage={setPage} pendingCount={pendingCount} />
      <main className="main-shell">
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
          {page === 'reports' && <ReportsPage />}
          {page === 'risk' && <RiskPage notify={notify} />}
        </div>
      </main>
      {showWizard && <ActivityWizard onClose={() => setShowWizard(false)} onSubmit={createActivity} />}
      {toast && (
        <div className="toast" role="status">
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
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.key === 'approvals' && pendingCount > 0 && <em>{pendingCount}</em>}
            </button>
          )
        })}
        <p className="nav-caption nav-caption-spaced">系统</p>
        <button className={page === 'risk' ? 'active' : ''} onClick={() => setPage('risk')}>
          <ShieldCheck size={18} strokeWidth={1.8} />
          <span>风控与权限</span>
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

      <button className="user-card">
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
  return (
    <header className="topbar">
      <div className="page-heading">
        <span>{meta.eyebrow}</span>
        <div>
          <h1>{meta.title}</h1>
          <p>{meta.desc}</p>
        </div>
      </div>
      {page !== 'dashboard' && (
        <div className="topbar-actions">
          <label className="global-search">
            <Search size={16} />
            <input aria-label="全局搜索" placeholder="搜索活动、规则或 UID" />
            <kbd>⌘ K</kbd>
          </label>
          <button className="icon-button notification-button" aria-label="通知">
            <Bell size={19} />
            <span />
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

function Dashboard({
  activities,
  setPage,
}: {
  activities: ActivityItem[]
  setPage: (page: PageKey) => void
}) {
  return (
    <div className="dashboard-page page-enter">
      <section className="hero-grid">
        <article className="north-star-card">
          <div className="north-star-head">
            <span className="soft-label"><Target size={14} /> 北极星指标</span>
            <button>近 30 天 <ChevronDown size={14} /></button>
          </div>
          <div className="north-star-main">
            <div>
              <p>活动牵引消耗</p>
              <h2>¥ 1,842,680</h2>
              <span className="metric-change positive"><ArrowUpRight size={14} /> 23.8% 较上周期</span>
            </div>
            <MiniLineChart />
          </div>
          <div className="formula-row">
            <div><small>参与客户</small><strong>4,827</strong><span>×</span></div>
            <div><small>客均生成量</small><strong>86.4</strong><span>×</span></div>
            <div><small>投放提升</small><strong>+12.6%</strong></div>
          </div>
        </article>

      </section>

      <section className="metric-grid">
        <MetricCard icon={Sparkles} label="在线活动" value="6" unit="场" change="2 场本周新增" tone="violet" />
        <MetricCard icon={Gift} label="累计发放积分" value="1.284" unit="M" change="+18.2%" tone="mint" />
        <MetricCard icon={Users} label="活动参与人数" value="4,827" unit="人" change="+620 本周" tone="orange" />
        <MetricCard icon={Zap} label="目标完成率" value="76.4" unit="%" change="+8.3 pp" tone="blue" />
      </section>

      <section className="dashboard-main-grid">
        <article className="panel activity-calendar-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">ACTIVITY PULSE</span>
              <h3>活动排期</h3>
            </div>
            <div className="calendar-actions">
              <button className="icon-button small"><ChevronLeft size={16} /></button>
              <span>2026年 6月 22日 — 28日</span>
              <button className="icon-button small"><ChevronRight size={16} /></button>
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
            {activities.filter((item) => item.status === '进行中').map((item) => (
              <div className="live-activity-row" key={item.id}>
                <span className={`activity-monogram ${item.accent}`}>{item.type === '排位赛' ? <Trophy size={18} /> : <WandSparkles size={18} />}</span>
                <div className="live-name"><strong>{item.name}</strong><small>{item.range}</small></div>
                <div className="live-data"><small>参与人数</small><strong>{item.people}</strong></div>
                <div className="live-data"><small>已发积分</small><strong>{item.points}</strong></div>
                <div className="progress-cell"><div><span style={{ width: `${item.progress}%` }} /></div><small>{item.progress}%</small></div>
                <button className="ghost-icon"><MoreHorizontal size={17} /></button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel layer-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">CUSTOMER LAYERS</span>
              <h3>分层参与表现</h3>
            </div>
            <button className="ghost-icon"><MoreHorizontal size={18} /></button>
          </div>
          <div className="layer-bars">
            {[
              ['A0', 72, '1,284'], ['A1', 88, '1,562'], ['A2', 61, '906'], ['A3', 45, '624'], ['A4+', 29, '451'],
            ].map(([label, width, value]) => (
              <div className="layer-row" key={label}>
                <span>{label}</span>
                <div><i style={{ width: `${width}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="insight-note"><Sparkles size={14} /> A1 客户参与最积极，建议下一期加大成长任务曝光。</p>
        </article>
      </section>
    </div>
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
    <article className="metric-card">
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
    <div className="mini-chart" aria-label="近30天活动牵引消耗趋势图">
      <svg viewBox="0 0 340 130" preserveAspectRatio="none">
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
    <div className="calendar-grid">
      <div className="calendar-corner">全天</div>
      {days.map(([week, date]) => <div className={`calendar-day ${date === '23' ? 'today' : ''}`} key={date}><small>周{week}</small><strong>{date}</strong></div>)}
      <div className="calendar-label">体验任务</div>
      <div className="calendar-track"><span className="calendar-event event-violet" style={{ left: '0%', width: '71%' }}><WandSparkles size={13} /> Seedance 2.0 尝鲜季</span></div>
      <div className="calendar-label">排位赛</div>
      <div className="calendar-track"><span className="calendar-event event-orange" style={{ left: '0%', width: '86%' }}><Trophy size={13} /> 美妆行业创意排位赛</span></div>
      <div className="calendar-label">限时折扣</div>
      <div className="calendar-track"><span className="calendar-event event-cyan" style={{ left: '43%', width: '43%' }}><Zap size={13} /> 618 模型限时 8 折</span></div>
      <div className="today-line" />
    </div>
  )
}

function ActivitiesPage({ activities, onCreate }: { activities: ActivityItem[]; onCreate: () => void }) {
  const [filter, setFilter] = useState<'全部' | ActivityStatus>('全部')
  const [search, setSearch] = useState('')
  const shown = activities.filter(
    (item) => (filter === '全部' || item.status === filter) && item.name.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div className="page-enter activities-page">
      <section className="activity-summary-strip">
        <div><span className="summary-icon violet"><Activity size={18} /></span><p><small>本月活动</small><strong>12</strong><em>场</em></p></div>
        <div><span className="summary-icon mint"><Gift size={18} /></span><p><small>预算锁定</small><strong>92.4</strong><em>万积分</em></p></div>
        <div><span className="summary-icon orange"><Users size={18} /></span><p><small>覆盖客户</small><strong>8,264</strong><em>UID</em></p></div>
        <div><span className="summary-icon blue"><ArrowUpRight size={18} /></span><p><small>消耗拉动</small><strong>+23.8</strong><em>%</em></p></div>
      </section>
      <section className="panel activity-table-panel">
        <div className="table-toolbar">
          <div className="filter-tabs">
            {(['全部', '进行中', '待开始', '待审批', '已结束'] as const).map((item) => (
              <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}<span>{item === '全部' ? activities.length : activities.filter((a) => a.status === item).length}</span></button>
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
            <div className="data-row" key={item.id}>
              <span className="activity-title-cell"><i className={`table-activity-icon ${item.accent}`}>{item.type === '排位赛' ? <Trophy size={17} /> : item.type === '任务类' ? <WandSparkles size={17} /> : <Zap size={17} />}</i><span><strong>{item.name}</strong><small>{item.goal}</small></span></span>
              <span><ActivityTypeTag type={item.type} /></span>
              <span className="muted-cell">{item.range}</span>
              <span><strong className="table-number">{item.points}</strong><small className="table-sub">积分</small></span>
              <span className="table-number">{item.people}</span>
              <span><StatusTag status={item.status} /></span>
              <span className="owner-cell"><i>{item.owner.slice(-1)}</i>{item.owner}</span>
              <span><button className="ghost-icon"><MoreHorizontal size={17} /></button></span>
            </div>
          ))}
        </div>
        <div className="table-footer"><span>共 {shown.length} 个活动</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button disabled><ChevronRight size={15} /></button></div></div>
      </section>
    </div>
  )
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
  const saveRule = () => {
    setModal(null)
    notify('规则变更已提交审批，审批通过后按计划生效')
  }
  return (
    <div className="page-enter rules-page">
      <div className="rule-notice"><ShieldCheck size={18} /><div><strong>规则变更受审批保护</strong><span>所有改动都会先生成变更记录，通过运营负责人审批后再按生效时间发布。</span></div><button>查看审批规范 <ArrowRight size={14} /></button></div>
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
          <button onClick={() => setModal('price')}>管理定价 <ArrowRight size={15} /></button>
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
          <div className="pricing-tools"><label className="inline-search"><Search size={15} /><input placeholder="搜索模型" /></label><button className="secondary-button"><History size={15} /> 变更记录</button></div>
        </div>
        <div className="data-table pricing-table">
          <div className="data-row data-head"><span>模型 / SKU</span><span>能力类型</span><span>当前定价</span><span>上一版定价</span><span>生效时间</span><span>状态</span><span /></div>
          {[
            ['Seedance 2.0 Pro', '视频生成', '60 积分 / 次', '—', '2026-06-20', '新上线'],
            ['Seedance 1.5 Pro', '视频生成', '48 积分 / 次', '52 积分 / 次', '2026-06-01', '生效中'],
            ['Seedream 4.0', '图片生成', '45 积分 / 次', '45 积分 / 次', '2026-05-12', '待变更'],
            ['数字人 Pro', '视频工具', '80 积分 / 分钟', '80 积分 / 分钟', '2026-04-18', '生效中'],
          ].map((row, index) => <div className="data-row" key={row[0]}><span className="model-cell"><i className={`model-logo m${index + 1}`}><Sparkles size={15} /></i><strong>{row[0]}</strong></span><span className="muted-cell">{row[1]}</span><span className="table-number">{row[2]}</span><span className="muted-cell">{row[3]}</span><span className="muted-cell">{row[4]}</span><span><span className={`simple-status ${row[5] === '待变更' ? 'pending' : row[5] === '新上线' ? 'new' : ''}`}>{row[5]}</span></span><span><button className="ghost-icon" onClick={() => setModal('price')}><MoreHorizontal size={17} /></button></span></div>)}
        </div>
      </section>
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="rule-modal">
            <div className="modal-header"><div><span className="section-kicker">CHANGE REQUEST</span><h2>{modal === 'return' ? '调整消耗返还比例' : modal === 'expiry' ? '调整积分有效期' : '调整模型定价'}</h2></div><button className="icon-button" onClick={() => setModal(null)}><X size={18} /></button></div>
            <div className="rule-modal-body">
              <div className="form-group"><label>{modal === 'return' ? '新返还比例' : modal === 'expiry' ? '新有效期' : 'Seedream 4.0 新定价'}</label><div className="suffix-input"><input type="number" value={modal === 'return' ? returnRate : modal === 'expiry' ? expiry : '38'} onChange={(e) => modal === 'return' ? setReturnRate(e.target.value) : modal === 'expiry' ? setExpiry(e.target.value) : undefined} /><span>{modal === 'return' ? '%' : modal === 'expiry' ? '天' : '积分 / 次'}</span></div></div>
              <div className="impact-preview"><AlertTriangle size={18} /><div><strong>影响预估</strong><p>{modal === 'price' ? '该变更将影响全部客户，预计日均少消耗 7.2 万积分。' : '该规则为全局机制，变更后将影响所有新到账积分。'}</p></div></div>
              <div className="form-group"><label>生效时间</label><input className="plain-input" type="datetime-local" defaultValue="2026-06-26T00:00" /></div>
              <div className="form-group"><label>变更原因</label><textarea placeholder="请说明变更背景和预期效果" defaultValue="配合新一阶段积分运营策略调整" /></div>
            </div>
            <div className="modal-footer"><button className="secondary-button" onClick={() => setModal(null)}>取消</button><button className="primary-button" onClick={saveRule}><ShieldCheck size={16} /> 提交审批</button></div>
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
        <div className="approval-tabs"><button className={filter === '待处理' ? 'active' : ''} onClick={() => setFilter('待处理')}>待我审批 <span>{approvals.filter((a) => a.status === '待处理').length}</span></button><button className={filter === '已处理' ? 'active' : ''} onClick={() => setFilter('已处理')}>已处理</button></div>
        <div className="approval-items">
          {shown.map((item) => (
            <button key={item.id} className={active?.id === item.id ? 'active' : ''} onClick={() => setSelected(item.id)}>
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

function ReportsPage() {
  const [selected, setSelected] = useState(0)
  const reports = [
    { name: '一键同款积分加倍周', type: '定价折扣', score: 88, date: '6月2日 — 6月8日', lift: '+31.6%', people: '2,106' },
    { name: 'AIGC 成片投放挑战', type: '任务类', score: 81, date: '5月15日 — 5月29日', lift: '+24.8%', people: '1,642' },
    { name: '游戏行业创意排位赛', type: '排位赛', score: 74, date: '5月1日 — 5月14日', lift: '+18.2%', people: '836' },
  ]
  const report = reports[selected]
  return (
    <div className="page-enter reports-page">
      <section className="report-list">
        <div className="report-list-head"><span>已生成报告</span><strong>{reports.length}</strong></div>
        {reports.map((item, i) => <button className={selected === i ? 'active' : ''} key={item.name} onClick={() => setSelected(i)}><div><strong>{item.name}</strong><small>{item.type} · {item.date}</small></div><span>{item.score}<small>分</small></span></button>)}
      </section>
      <section className="panel report-detail">
        <div className="report-cover">
          <div><span className="section-kicker light">AUTO REVIEW · NO. 026</span><h2>{report.name}</h2><p>{report.date} · 系统于活动结束后自动生成</p></div>
          <div className="report-score"><strong>{report.score}</strong><span>综合评分</span></div>
        </div>
        <div className="report-metrics"><div><small>参与 UID</small><strong>{report.people}</strong><span className="positive"><ArrowUpRight size={13} /> 19.4%</span></div><div><small>累计发放积分</small><strong>168,400</strong><span>预算使用率 84.2%</span></div><div><small>活动期消耗拉动</small><strong>{report.lift}</strong><span className="positive">高于预期 8.6 pp</span></div><div><small>首周留存</small><strong>62.8%</strong><span className="negative"><ArrowDownRight size={13} /> 2.1 pp</span></div></div>
        <div className="report-content-grid">
          <div className="report-chart-card"><div className="card-title-row"><div><span className="section-kicker">CONSUMPTION LIFT</span><h3>活动前后消耗趋势</h3></div><span className="legend"><i /> 活动客户 <i /> 对照组</span></div><ReportChart /></div>
          <div className="report-insights"><span className="section-kicker">AI INSIGHTS</span><h3>本期洞察</h3><div className="insight-card good"><span><Sparkles size={16} /></span><p><strong>A1 客户转化显著</strong>该分层贡献 42% 的增量消耗，完成任务后的次周留存达到 71%。</p></div><div className="insight-card watch"><span><AlertTriangle size={16} /></span><p><strong>A2 客户 NPS 下滑</strong>负向反馈集中在“奖励到账延迟”，建议发放 SLA 缩短至 10 分钟。</p></div><button>查看完整归因分析 <ArrowRight size={15} /></button></div>
        </div>
      </section>
    </div>
  )
}

function ReportChart() {
  return <div className="report-chart"><div className="chart-y-labels"><span>40万</span><span>30万</span><span>20万</span><span>10万</span><span>0</span></div><svg viewBox="0 0 720 230" preserveAspectRatio="none"><g stroke="#e8e9f0" strokeWidth="1"><line x1="0" y1="10" x2="720" y2="10"/><line x1="0" y1="65" x2="720" y2="65"/><line x1="0" y1="120" x2="720" y2="120"/><line x1="0" y1="175" x2="720" y2="175"/><line x1="0" y1="229" x2="720" y2="229"/></g><path d="M0 180 C80 175 112 154 170 160 S270 150 330 130 S430 70 500 58 S630 46 720 25" fill="none" stroke="#5c52e7" strokeWidth="4" strokeLinecap="round"/><path d="M0 190 C70 188 110 177 180 180 S300 170 370 165 S480 151 555 145 S660 138 720 132" fill="none" stroke="#aeb4c5" strokeWidth="3" strokeDasharray="7 8" strokeLinecap="round"/><line x1="310" y1="0" x2="310" y2="230" stroke="#f09c57" strokeDasharray="4 5"/><text x="320" y="18" fill="#a66031" fontSize="12">活动开始</text></svg><div className="chart-x-labels"><span>5/19</span><span>5/26</span><span>6/2</span><span>6/9</span><span>6/16</span></div></div>
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
  const [logic, setLogic] = useState<'且' | '或'>('且')
  const [segments, setSegments] = useState(['A0', 'A1'])
  const projected = useMemo(() => Math.min(Number(budget || 0), 300000), [budget])
  const toggleSegment = (value: string) => setSegments((items) => items.includes(value) ? items.filter((x) => x !== value) : [...items, value])
  const submit = () => onSubmit({
    id: Date.now(), name: name || '未命名积分活动', type, status: '待审批', range: '7月1日 — 7月31日', points: formatNumber(Number(budget || 0)), people: '预计 2,400', owner: '杨翘楚', progress: 0, goal: type === '任务类' ? '新客完成首条素材投放' : type === '排位赛' ? '客户分层消耗拉升' : '新模型限时推广', accent: type === '任务类' ? 'violet' : type === '排位赛' ? 'orange' : 'cyan',
  })
  return (
    <div className="wizard-backdrop">
      <div className="wizard-drawer" data-testid="activity-wizard">
        <header className="wizard-header"><div><span className="section-kicker">CREATE CAMPAIGN</span><h2>新建积分活动</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><X size={19} /></button></header>
        <div className="wizard-stepper">{[['1','选择类型'],['2','基本信息'],['3','范围与规则'],['4','预览发布']].map(([n,label],i) => <div className={step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''} key={n}><span>{step > i + 1 ? <Check size={14}/> : n}</span><small>{label}</small>{i < 3 && <i />}</div>)}</div>
        <div className="wizard-body">
          {step === 1 && <div className="wizard-section"><div className="section-intro"><h3>这次想用什么玩法？</h3><p>选择最接近目标的活动类型，后续仍可调整具体规则。</p></div><div className="activity-type-grid">
            <button className={type === '任务类' ? 'selected' : ''} onClick={() => setType('任务类')}><span className="type-art task"><WandSparkles size={24}/></span><div><strong>任务类</strong><p>完成指定动作自动发积分，适合新手、成长与功能体验。</p><small>新手任务 · 成长任务 · 体验任务</small></div><i>{type === '任务类' && <Check size={14}/>}</i></button>
            <button className={type === '排位赛' ? 'selected' : ''} onClick={() => setType('排位赛')}><span className="type-art race"><Trophy size={24}/></span><div><strong>排位赛</strong><p>按消耗、生成量或使用量排名，适合分层客户拉升。</p><small>行业赛 · 分层赛 · 创意评选</small></div><i>{type === '排位赛' && <Check size={14}/>}</i></button>
            <button className={type === '定价折扣' ? 'selected' : ''} onClick={() => setType('定价折扣')}><span className="type-art discount"><Zap size={24}/></span><div><strong>定价折扣</strong><p>限时折扣或多倍积分，用于新模型推广与节点促销。</p><small>模型折扣 · 积分多倍</small></div><i>{type === '定价折扣' && <Check size={14}/>}</i></button>
          </div></div>}
          {step === 2 && <div className="wizard-section"><div className="section-intro"><h3>填写基本信息</h3><p>这些信息会用于活动管理、审批和自动生成通知。</p></div><div className="form-grid"><div className="form-group full"><label>活动名称 <em>*</em></label><input className="plain-input" value={name} onChange={(e)=>setName(e.target.value)} /></div><div className="form-group"><label>开始时间 <em>*</em></label><input className="plain-input" type="datetime-local" defaultValue="2026-07-01T00:00" /></div><div className="form-group"><label>结束时间 <em>*</em></label><input className="plain-input" type="datetime-local" defaultValue="2026-07-31T23:59" /></div><div className="form-group"><label>积分预算 <em>*</em></label><div className="suffix-input"><input type="number" value={budget} onChange={(e)=>setBudget(e.target.value)}/><span>积分</span></div><small className="field-hint">单活动超过 300,000 积分将标记为高风险</small></div><div className="form-group"><label>活动目标</label><select defaultValue="新客培养"><option>新客培养</option><option>客户消耗拉升</option><option>新模型推广</option><option>沉默客户唤醒</option></select></div><div className="form-group full"><label>活动说明</label><textarea defaultValue="引导 A0 新客户在 3 天内完成首条素材生成与投放，完成后自动发放成长积分。" /></div></div></div>}
          {step === 3 && <div className="wizard-section"><div className="section-intro"><h3>圈定人群，配置达标规则</h3><p>系统将基于 UID 身份与行为数据实时识别达标客户。</p></div><div className="form-group"><label>客户分层</label><div className="choice-pills">{['A0','A1','A2','A3','A4+'].map(x=><button className={segments.includes(x)?'active':''} key={x} onClick={()=>toggleSegment(x)}>{x}{segments.includes(x)&&<Check size={13}/>}</button>)}</div></div><div className="rule-builder"><div className="builder-head"><span>达标条件</span><div><small>条件关系</small><button className={logic==='且'?'active':''} onClick={()=>setLogic('且')}>且 AND</button><button className={logic==='或'?'active':''} onClick={()=>setLogic('或')}>或 OR</button></div></div><div className="condition-row"><span>1</span><select defaultValue="生成素材"><option>生成素材</option><option>使用指定模型</option><option>AIGC 成片投放</option></select><select defaultValue="不少于"><option>不少于</option><option>等于</option></select><input defaultValue="3"/><select defaultValue="条"><option>条</option><option>次</option></select><button><X size={15}/></button></div><div className="logic-divider"><span>{logic}</span></div><div className="condition-row"><span>2</span><select defaultValue="AIGC 成片投放"><option>AIGC 成片投放</option><option>使用指定模型</option><option>生成素材</option></select><select defaultValue="不少于"><option>不少于</option><option>等于</option></select><input defaultValue="1"/><select defaultValue="条"><option>条</option><option>次</option></select><button><X size={15}/></button></div><button className="add-condition"><Plus size={15}/> 添加条件</button></div><div className="reward-box"><div><span className="rule-icon mint"><Gift size={18}/></span><div><strong>达标奖励</strong><small>每个 UID 每个活动仅发放一次</small></div></div><div className="suffix-input"><input defaultValue="1000"/><span>积分 / 人</span></div></div></div>}
          {step === 4 && <div className="wizard-section preview-section"><div className="section-intro"><h3>确认无误，提交审批</h3><p>系统已完成配置检查，并为你生成发布后的执行链路。</p></div><div className="preview-hero"><div><ActivityTypeTag type={type}/><h3>{name}</h3><p>2026年7月1日 00:00 — 7月31日 23:59</p><div>{segments.map(x=><span key={x}>{x}</span>)}</div></div><span className="preview-budget"><small>积分预算</small><strong>{formatNumber(Number(budget || 0))}</strong><em>积分</em></span></div><div className="flow-preview">{[['运营配置',CheckCircle2],['负责人审批',ShieldCheck],['发布与通知',Bell],['识别并发放',Zap],['自动复盘',FileBarChart]].map(([label,Icon],i)=><div key={label as string}><span><Icon size={17}/></span><small>{label as string}</small>{i<4&&<i/>}</div>)}</div><div className="risk-check-card"><div className="risk-check-head"><ShieldCheck size={18}/><strong>发布前检查</strong><span>4 项通过 · {Number(budget)>300000?'1 项需关注':'无风险项'}</span></div><ul><li><CheckCircle2 size={15}/> 参与范围可识别：{segments.join('、')} 客户</li><li><CheckCircle2 size={15}/> 奖励发放已设置单 UID 上限</li><li><CheckCircle2 size={15}/> 对客通知将在发布后自动生成</li><li className={Number(budget)>300000?'warn':''}>{Number(budget)>300000?<AlertTriangle size={15}/>:<CheckCircle2 size={15}/>} 预计锁定 {formatNumber(projected)} 积分{Number(budget)>300000?'，超过默认审批阈值':'，在可用积分池范围内'}</li></ul></div></div>}
        </div>
        <footer className="wizard-footer"><button className="secondary-button" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? '取消' : <><ChevronLeft size={16}/> 上一步</>}</button><div><span>草稿自动保存</span>{step < 4 ? <button className="primary-button" onClick={() => setStep(step + 1)}>下一步 <ChevronRight size={16}/></button> : <button className="primary-button" onClick={submit} data-testid="submit-activity"><ShieldCheck size={16}/> 提交审批</button>}</div></footer>
      </div>
    </div>
  )
}

export default App
