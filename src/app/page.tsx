"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Bell, Bot, Boxes, BriefcaseBusiness,
  Check, CheckCheck, ChevronDown, CircleHelp, Clock3, Command, FileCheck2, FileText, Filter, Gauge,
  GitBranch, LayoutDashboard, ListTodo, LoaderCircle, LockKeyhole, Menu, MoreHorizontal, Plus,
  Search, Send, Settings2, ShieldCheck, Sparkles, Users, X,
} from "lucide-react";

type Task = { id: number; title: string; project: string; owner: string; initials: string; color: string; due: string; status: "In progress" | "In review" | "Queued" | "Done"; priority: "High" | "Medium" | "Low" };
type Approval = { id: number; title: string; by: string; kind: string; time: string };
type Report = { role: string; content: string };
type Agent = { id: string; name: string; title: string; initials: string; color: string; tasks: number; state: string; focus: string };

const navigation = [
  { label: "Command center", icon: LayoutDashboard, section: "WORKSPACE" },
  { label: "AI employees", icon: Users, section: "WORKSPACE" },
  { label: "Tasks & projects", icon: ListTodo, section: "WORKSPACE" },
  { label: "Workflows", icon: GitBranch, section: "WORKSPACE" },
  { label: "Approvals", icon: FileCheck2, section: "WORKSPACE", badge: "3" },
  { label: "Deliverables", icon: FileText, section: "WORKSPACE" },
  { label: "Knowledge base", icon: Boxes, section: "MANAGE" },
  { label: "Integrations", icon: Command, section: "MANAGE" },
  { label: "Analytics", icon: Gauge, section: "MANAGE" },
];

const initialTasks: Task[] = [
  { id: 1, title: "Map customer portal requirements", project: "Customer portal", owner: "Ava Chen", initials: "AC", color: "coral", due: "Today", status: "In progress", priority: "High" },
  { id: 2, title: "Draft order tracking API contract", project: "Customer portal", owner: "Leo Park", initials: "LP", color: "blue", due: "Today", status: "In review", priority: "High" },
  { id: 3, title: "Review support ticket journeys", project: "Customer portal", owner: "Mia Brooks", initials: "MB", color: "lilac", due: "Oct 31", status: "Queued", priority: "Medium" },
  { id: 4, title: "Prepare Q4 campaign outline", project: "Q4 launch", owner: "Noah Williams", initials: "NW", color: "green", due: "Nov 1", status: "Done", priority: "Low" },
];
const initialApprovals: Approval[] = [
  { id: 1, title: "Customer portal: requirements brief", by: "Ava Chen · Product Manager", kind: "Project deliverable", time: "12 min ago" },
  { id: 2, title: "Q4 launch email sequence", by: "Noah Williams · Marketing", kind: "External communication", time: "38 min ago" },
  { id: 3, title: "New customer record updates (12)", by: "Sam Rivera · Sales", kind: "Customer data changes", time: "1 hr ago" },
];
const employees = [
  { id: "product-manager", name: "Ava Chen", title: "Product Manager", initials: "AC", color: "coral", tasks: 8, state: "Working", focus: "Requirements, roadmaps, and prioritization" },
  { id: "software-engineer", name: "Leo Park", title: "Software Engineer", initials: "LP", color: "blue", tasks: 5, state: "Working", focus: "Implementation plans and technical decisions" },
  { id: "qa-engineer", name: "Mia Brooks", title: "QA Engineer", initials: "MB", color: "lilac", tasks: 4, state: "Available", focus: "Test plans, acceptance, and edge cases" },
  { id: "business-analyst", name: "Sam Rivera", title: "Business Analyst", initials: "SR", color: "amber", tasks: 6, state: "Available", focus: "Business needs, research, and success measures" },
  { id: "marketing-manager", name: "Noah Williams", title: "Marketing Manager", initials: "NW", color: "green", tasks: 3, state: "Available", focus: "Campaigns, positioning, and content plans" },
  { id: "project-manager", name: "Olivia James", title: "Project Manager", initials: "OJ", color: "rose", tasks: 7, state: "Coordinating", focus: "Project plans, milestones, and handoffs" },
  { id: "customer-support", name: "Grace Park", title: "Customer Support", initials: "GP", color: "blue", tasks: 2, state: "Available", focus: "Customer inquiries and escalation plans" },
  { id: "sales-representative", name: "Ethan Cole", title: "Sales Representative", initials: "EC", color: "amber", tasks: 4, state: "Available", focus: "Lead research and sales enablement" },
] satisfies Agent[];
const defaultEnabledAgents = ["product-manager", "business-analyst", "software-engineer", "qa-engineer"];

function Avatar({ initials, color, small = false }: { initials: string; color: string; small?: boolean }) {
  return <span className={`avatar ${color} ${small ? "avatar-small" : ""}`} aria-hidden="true">{initials}</span>;
}

export default function Home() {
  const [active, setActive] = useState("Command center");
  const [tasks, setTasks] = useState(initialTasks);
  const [enabledAgents, setEnabledAgents] = useState<string[]>(defaultEnabledAgents);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(defaultEnabledAgents);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [taskModal, setTaskModal] = useState(false);
  const [objective, setObjective] = useState("");
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [workflowError, setWorkflowError] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("workforceai-tasks");
    if (saved) { try { setTasks(JSON.parse(saved) as Task[]); } catch { localStorage.removeItem("workforceai-tasks"); } }
    const savedAgents = localStorage.getItem("workforceai-enabled-agents");
    if (savedAgents) {
      try {
        const parsed = JSON.parse(savedAgents) as unknown;
        if (Array.isArray(parsed)) setEnabledAgents(parsed.filter((id): id is string => typeof id === "string" && employees.some(agent => agent.id === id)));
      } catch { localStorage.removeItem("workforceai-enabled-agents"); }
    }
    setSettingsLoaded(true);
  }, []);
  useEffect(() => { localStorage.setItem("workforceai-tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { if (settingsLoaded) localStorage.setItem("workforceai-enabled-agents", JSON.stringify(enabledAgents)); }, [enabledAgents, settingsLoaded]);
  const visibleTasks = useMemo(() => tasks.filter(t => `${t.title} ${t.project} ${t.owner}`.toLowerCase().includes(search.toLowerCase())), [tasks, search]);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  function decideApproval(id: number, decision: string) {
    const item = approvals.find(a => a.id === id);
    setApprovals(current => current.filter(a => a.id !== id));
    notify(`${decision} “${item?.title ?? "request"}”`);
  }
  function toggleAgent(agentId: string) {
    const next = enabledAgents.includes(agentId) ? enabledAgents.filter(id => id !== agentId) : [...enabledAgents, agentId];
    setEnabledAgents(next);
    setSelectedAgents(selected => selected.filter(id => next.includes(id)));
  }
  function toggleWorkflowAgent(agentId: string) {
    setSelectedAgents(current => current.includes(agentId) ? current.filter(id => id !== agentId) : [...current, agentId]);
  }
  function startWorkflow() {
    setSelectedAgents(enabledAgents);
    setReports([]); setWorkflowError(""); setWorkflowOpen(true);
  }
  async function runWorkflow(event: React.FormEvent) {
    event.preventDefault(); setRunning(true); setWorkflowError(""); setReports([]);
    try {
      const response = await fetch("/api/workflows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ objective, selectedAgents }) });
      const result = await response.json() as { reports?: Report[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Workflow could not be started.");
      setReports(result.reports || []);
    } catch (error) { setWorkflowError(error instanceof Error ? error.message : "Workflow could not be started."); }
    finally { setRunning(false); }
  }
  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") || "").trim();
    if (!title) return;
    setTasks(current => [{ id: Date.now(), title, project: String(form.get("project") || "General"), owner: "Olivia James", initials: "OJ", color: "rose", due: "No date", status: "Queued", priority: "Medium" }, ...current]);
    setTaskModal(false); notify("Task added to the workforce queue.");
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><span className="brand-mark"><Command size={19} strokeWidth={2.2} /></span><span>workforce<span className="brand-ai">ai</span></span><button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="workspace-switch"><span className="workspace-avatar">N</span><span className="workspace-meta"><strong>Northstar Studio</strong><small>Free workspace</small></span><ChevronDown size={15} /></button>
      <div className="nav-list">{["WORKSPACE", "MANAGE"].map(section => <div key={section}><p className="nav-label">{section}</p>{navigation.filter(item => item.section === section).map(item => <button key={item.label} className={`nav-item ${active === item.label ? "nav-active" : ""}`} onClick={() => { setActive(item.label); setMobileNav(false); }}><item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.badge && approvals.length > 0 && <span className="nav-badge">{Math.min(approvals.length, 9)}</span>}</button>)}</div>)}</div>
      <div className="sidebar-spacer" />
      <div className="usage-card"><div className="usage-heading"><span>Monthly usage</span><span>68%</span></div><div className="usage-meter"><span /></div><small>68,400 of 100,000 credits</small><button onClick={() => notify("Plans are coming soon.")}>View plans <ArrowRight size={13} /></button></div>
      <button className="nav-item settings-link" onClick={() => setActive("Settings")}><Settings2 size={17} /><span>Settings</span></button>
      <div className="profile-row"><Avatar initials="SK" color="navy" /><span className="profile-meta"><strong>Shaqib Khan</strong><small>Owner</small></span><MoreHorizontal size={17} className="muted-icon" /></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="breadcrumbs"><span>Northstar Studio</span><span className="crumb-slash">/</span><strong>{active}</strong></div><div className="top-actions"><label className="search-box"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></label><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You’re all caught up.")}><Bell size={18} /><i /></button><button className="help-button" onClick={() => notify("Help center is coming soon.")}><CircleHelp size={17} /></button></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> THURSDAY, OCTOBER 30, 2026</div><h1>{active === "Command center" ? "Good morning, Shaqib" : active}</h1><p>{active === "Command center" ? "Choose which specialists are on your team and what they should work on." : `Keep your ${active.toLowerCase()} moving with your AI team.`}</p></div><div className="heading-actions"><button className="button button-secondary" onClick={startWorkflow}><Sparkles size={16} /> New workflow</button><button className="button button-primary" onClick={() => setTaskModal(true)}><Plus size={17} /> Create task</button></div></div>
        <div className="demo-notice"><span className="notice-icon"><LockKeyhole size={15} /></span><span><strong>Workspace preview</strong> · Your changes are saved in this browser. Connect Supabase to enable secure accounts and shared workspace data.</span><button onClick={() => notify("See README for Supabase setup.")}>Setup guide <ArrowRight size={13} /></button></div>
        {active === "Command center" && <>
          <section className="metric-grid" aria-label="Workforce metrics">
            <Metric icon={<Bot size={17} />} label="Active employees" value={`${enabledAgents.length} / ${employees.length}`} change="Choose who can take work" color="mint" />
            <Metric icon={<ListTodo size={17} />} label="Tasks in progress" value={String(tasks.filter(t => t.status === "In progress" || t.status === "In review").length + 8)} change="↑ 3 from yesterday" color="blue" trend />
            <Metric icon={<FileCheck2 size={17} />} label="Awaiting your review" value={String(approvals.length)} change={approvals.length ? "Needs your attention" : "All caught up"} color="peach" />
            <Metric icon={<Activity size={17} />} label="Workforce health" value="94%" change="↑ 4% this week" color="lilac" trend />
          </section>
          <section className="overview-grid">
            <div className="panel focus-panel"><div className="panel-heading"><div><div className="section-kicker">IN MOTION</div><h2>Workforce focus</h2></div><button className="text-button" onClick={() => setActive("Tasks & projects")}>View all <ArrowRight size={14} /></button></div><div className="focus-project"><div className="project-icon"><BriefcaseBusiness size={18} /></div><div className="project-copy"><strong>Customer portal</strong><span>Project · Started Oct 28</span></div><span className="project-progress-label">62%</span></div><div className="progress-track"><span style={{ width: "62%" }} /></div><div className="focus-meta"><span>4 of 7 tasks complete</span><span className="avatar-stack"><Avatar initials="OJ" color="rose" small /><Avatar initials="AC" color="coral" small /><Avatar initials="LP" color="blue" small /><Avatar initials="MB" color="lilac" small /><span className="stack-extra">+1</span></span></div><div className="divider"/><div className="workflow-line"><span className="workflow-icon"><GitBranch size={15} /></span><div className="workflow-copy"><strong>Portal build · 4-agent workflow</strong><span>Product → Engineering → QA → Review</span></div><span className="running-pill"><i /> Running</span><button className="icon-button row-chevron" aria-label="View workflow details" onClick={() => setWorkflowOpen(true)}><ArrowRight size={16} /></button></div><div className="workflow-steps"><span className="step-done"><Check size={12} /> Brief</span><span className="step-active"><i /> Requirements</span><span><i /> Build</span><span><i /> QA</span></div></div>
            <div className="panel team-panel"><div className="panel-heading"><div><div className="section-kicker">YOUR AI TEAM</div><h2>Choose your specialists</h2></div><button className="text-button" onClick={() => setActive("AI employees")}>Manage <ArrowRight size={14} /></button></div><div className="quick-agent-list">{employees.slice(0, 4).map(person => <AgentToggleRow key={person.id} agent={person} enabled={enabledAgents.includes(person.id)} onToggle={toggleAgent} compact />)}</div><button className="team-footer" onClick={() => setActive("AI employees")}>View all {employees.length} agents <ArrowRight size={14} /></button></div>
          </section>
          <section className="panel tasks-panel"><div className="panel-heading"><div><div className="section-kicker">THE WORK QUEUE</div><h2>Priority tasks</h2></div><div className="panel-tools"><button className="filter-button" onClick={() => notify("Showing all task priorities.")}><Filter size={14} /> Filter</button><button className="text-button" onClick={() => setActive("Tasks & projects")}>All tasks <ArrowRight size={14} /></button></div></div><TaskTable tasks={visibleTasks.slice(0, 4)} /></section>
          <section className="panel approvals-panel"><div className="panel-heading"><div><div className="section-kicker">HUMAN IN THE LOOP</div><h2>Needs your approval <span className="count-pill">{approvals.length}</span></h2></div><button className="text-button" onClick={() => setActive("Approvals")}>Review queue <ArrowRight size={14} /></button></div>{approvals.length === 0 ? <div className="empty-state"><BadgeCheck size={20} /><span>All caught up. Nothing needs your approval.</span></div> : <div className="approval-list">{approvals.slice(0, 2).map(item => <div className="approval-row" key={item.id}><span className="approval-doc"><FileText size={17} /></span><span className="approval-info"><strong>{item.title}</strong><small>{item.by} <span>·</span> {item.time}</small></span><span className="approval-kind">{item.kind}</span><div className="approval-actions"><button className="approve-button" onClick={() => decideApproval(item.id, "Approved")}><Check size={14} /> Approve</button><button className="review-button" onClick={() => decideApproval(item.id, "Sent back for changes")}>Review</button></div></div>)}</div>}</section>
          <div className="bottom-row"><div className="bottom-note"><ShieldCheck size={16} /><span>External actions always wait for your approval.</span><button onClick={() => notify("Governance settings are coming soon.")}>Review governance <ArrowRight size={13} /></button></div><div className="updated-note"><Clock3 size={14} /> Updated just now</div></div>
        </>}
        {active !== "Command center" && <SectionView active={active} tasks={visibleTasks} approvals={approvals} enabledAgents={enabledAgents} onToggleAgent={toggleAgent} onCreate={() => setTaskModal(true)} onApprove={decideApproval} onWorkflow={startWorkflow} onNotify={notify} />}
      </div>
    </main>
    {taskModal && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setTaskModal(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-title"><div className="modal-heading"><div><span className="section-kicker">WORKFORCE QUEUE</span><h2 id="task-title">Create a task</h2><p>Give your team a clear outcome to work toward.</p></div><button className="icon-button" onClick={() => setTaskModal(false)} aria-label="Close"><X size={18} /></button></div><form onSubmit={addTask}><label>Task name<input name="title" required maxLength={140} placeholder="e.g. Research competitor onboarding" autoFocus /></label><label>Project<select name="project"><option>Customer portal</option><option>Q4 launch</option><option>General</option></select></label><div className="modal-footer"><button type="button" className="button button-secondary" onClick={() => setTaskModal(false)}>Cancel</button><button className="button button-primary" type="submit"><Plus size={16} /> Add task</button></div></form></section></div>}
    {workflowOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) { setWorkflowOpen(false); setReports([]); setWorkflowError(""); } }}><section className="modal workflow-modal" role="dialog" aria-modal="true" aria-labelledby="workflow-title"><div className="modal-heading"><div><span className="section-kicker">{selectedAgents.length} AGENTS · HUMAN REVIEW REQUIRED</span><h2 id="workflow-title">Start a workflow</h2><p>Choose the specialists for this objective. They will pass drafts to the next agent.</p></div><button className="icon-button" onClick={() => { setWorkflowOpen(false); setReports([]); setWorkflowError(""); }} aria-label="Close"><X size={18} /></button></div><form onSubmit={runWorkflow}><label>What outcome do you need?<textarea value={objective} onChange={e => setObjective(e.target.value)} minLength={8} maxLength={1200} required placeholder="Describe the business outcome. For example: Plan a customer portal where customers can sign in, track orders, and contact support." /></label><div className="agent-picker-heading"><strong>Agents on this workflow</strong><span>{selectedAgents.length} selected</span></div><div className="workflow-agent-picker">{employees.map(agent => <AgentToggleRow key={agent.id} agent={agent} enabled={enabledAgents.includes(agent.id)} selected={selectedAgents.includes(agent.id)} onToggle={toggleWorkflowAgent} disabled={!enabledAgents.includes(agent.id)} />)}</div>{selectedAgents.length === 0 && <p className="form-error" role="alert">Select at least one active agent to run this workflow.</p>}{workflowError && <p className="form-error" role="alert">{workflowError}</p>}{running && <div className="running-state" role="status"><LoaderCircle size={17} className="spin" /> Agents are working through your objective…</div>}{reports.length > 0 && <div className="report-list"><div className="report-banner"><ShieldCheck size={15} /> Draft deliverables · Review before acting</div>{reports.map(report => <article key={report.role}><h3>{report.role}</h3><p>{report.content}</p></article>)}</div>}<div className="modal-footer"><span className="cost-note"><LockKeyhole size={13} /> External actions are disabled</span><button type="submit" className="button button-primary" disabled={running || objective.trim().length < 8 || selectedAgents.length === 0}>{running ? <><LoaderCircle size={15} className="spin" /> Working…</> : <><Sparkles size={15} /> Run workflow <Send size={14} /></>}</button></div></form></section></div>}
    {toast && <div className="toast" role="status"><CheckCheck size={16} />{toast}</div>}
  </div>;
}

function Metric({ icon, label, value, change, color, trend = false }: { icon: React.ReactNode; label: string; value: string; change: string; color: string; trend?: boolean }) {
  return <article className="metric-card"><span className={`metric-icon ${color}`}>{icon}</span><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className={`metric-change ${trend ? "positive" : ""}`}>{trend && <ArrowUpRight size={13} />}{change}</span></article>;
}

function AgentToggleRow({ agent, enabled, selected, onToggle, disabled = false, compact = false }: { agent: Agent; enabled: boolean; selected?: boolean; onToggle: (id: string) => void; disabled?: boolean; compact?: boolean }) {
  const checked = selected === undefined ? enabled : selected;
  return <div className={`agent-toggle-row ${compact ? "agent-toggle-compact" : ""} ${disabled ? "agent-toggle-disabled" : ""}`}>
    <Avatar initials={agent.initials} color={agent.color} small={compact} />
    <span className="agent-toggle-copy"><strong>{agent.title}</strong>{!compact && <small>{agent.focus}</small>}</span>
    <span className={`agent-toggle-state ${enabled ? "agent-on" : ""}`}>{enabled ? (compact ? "On" : "Active") : "Off"}</span>
    <button type="button" className={`switch ${checked ? "switch-on" : ""}`} role="switch" aria-checked={checked} aria-label={`${selected === undefined ? "Enable" : "Include"} ${agent.title}${selected === undefined ? " for this workspace" : " in this workflow"}`} disabled={disabled} onClick={() => onToggle(agent.id)}><span /></button>
  </div>;
}

function TaskTable({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <div className="empty-state"><Search size={18} /><span>No tasks match this search.</span></div>;
  return <div className="table-wrap"><table><thead><tr><th>Task</th><th>Assigned to</th><th>Priority</th><th>Status</th><th>Due date</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{tasks.map(task => <tr key={task.id}><td><span className="task-title">{task.title}</span><small className="task-project">{task.project}</small></td><td><span className="assigned-person"><Avatar initials={task.initials} color={task.color} small />{task.owner}</span></td><td><span className={`priority-dot priority-${task.priority.toLowerCase()}`} />{task.priority}</td><td><span className={`status-pill status-${task.status.toLowerCase().replaceAll(" ", "-")}`}><i />{task.status}</span></td><td className="due-cell">{task.due}</td><td><button className="icon-button table-more" aria-label={`More options for ${task.title}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div>;
}

function SectionView({ active, tasks, approvals, enabledAgents, onToggleAgent, onCreate, onApprove, onWorkflow, onNotify }: { active: string; tasks: Task[]; approvals: Approval[]; enabledAgents: string[]; onToggleAgent: (id: string) => void; onCreate: () => void; onApprove: (id: number, decision: string) => void; onWorkflow: () => void; onNotify: (message: string) => void }) {
  if (active === "AI employees") return <><div className="section-intro"><div><p>Turn specialists on for your workspace, then pick the right team for each workflow.</p><span className="active-agent-summary"><span className="live-dot" /> {enabledAgents.length} of {employees.length} agents enabled</span></div><button className="button button-secondary" onClick={onWorkflow}><Sparkles size={15} /> Build a workflow</button></div><div className="employee-grid">{employees.map(person => <article className={`employee-card ${enabledAgents.includes(person.id) ? "employee-card-enabled" : "employee-card-disabled"}`} key={person.id}><div className="employee-card-top"><Avatar initials={person.initials} color={person.color} /><span className="agent-status-label">{enabledAgents.includes(person.id) ? "Enabled" : "Paused"}</span></div><h3>{person.name}</h3><p>{person.title}</p><span className="employee-focus">{person.focus}</span><div className="employee-stats"><span>{person.tasks} assigned tasks</span><span className={`availability ${person.state !== "Available" ? "is-working" : ""}`}><i />{person.state}</span></div><div className="employee-toggle-footer"><span>{enabledAgents.includes(person.id) ? "Available for workflows" : "Not assigned new work"}</span><AgentToggleRow agent={person} enabled={enabledAgents.includes(person.id)} onToggle={onToggleAgent} compact /></div></article>)}</div></>;
  if (active === "Tasks & projects") return <><div className="section-intro"><p>Assignments, handoffs, and progress across your AI workforce.</p><button className="button button-primary" onClick={onCreate}><Plus size={16} /> Create task</button></div><div className="panel tasks-panel"><TaskTable tasks={tasks} /></div><div className="project-summary"><div><span className="project-icon"><BriefcaseBusiness size={17} /></span><strong>Customer portal</strong><span> · 4 agents · due Nov 4</span></div><div className="progress-track"><span style={{ width: "62%" }} /></div></div></>;
  if (active === "Approvals") return <><div className="section-intro"><p>Review the external or sensitive actions your employees have prepared.</p><span className="governance-chip"><ShieldCheck size={14} /> Human approval is on</span></div><div className="panel approvals-panel">{approvals.length ? <div className="approval-list">{approvals.map(item => <div className="approval-row" key={item.id}><span className="approval-doc"><FileText size={17} /></span><span className="approval-info"><strong>{item.title}</strong><small>{item.by} <span>·</span> {item.time}</small></span><span className="approval-kind">{item.kind}</span><div className="approval-actions"><button className="approve-button" onClick={() => onApprove(item.id, "Approved")}><Check size={14} /> Approve</button><button className="review-button" onClick={() => onApprove(item.id, "Sent back for changes")}>Review</button></div></div>)}</div> : <div className="empty-state"><BadgeCheck size={20} />All requests reviewed.</div>}</div></>;
  if (active === "Workflows") return <><div className="section-intro"><p>Reusable playbooks bring the right specialists together around an outcome.</p><button className="button button-primary" onClick={onWorkflow}><Plus size={16} /> Start a workflow</button></div><div className="workflow-card"><div className="workflow-card-icon"><GitBranch size={20} /></div><div><span className="section-kicker">FEATURED PLAYBOOK</span><h2>Product feature delivery</h2><p>Product Manager → Business Analyst → Software Engineer → QA Engineer</p><span className="workflow-stat"><Activity size={13} /> 4 steps <span>·</span> Human review before delivery</span></div><button className="button button-secondary" onClick={onWorkflow}>Run playbook <ArrowRight size={14} /></button></div></>;
  if (active === "Deliverables") return <><div className="section-intro"><p>Work products generated by your team, ready to review and share.</p><button className="filter-button" onClick={() => onNotify("Deliverables are filtered to the current workspace.")}><Filter size={14} /> Filter</button></div><div className="panel deliverable-list">{[{name:"Customer portal · product requirements", by:"Ava Chen · Product Manager", date:"Today, 10:42 AM", type:"Requirements"},{name:"Order tracking API · draft contract",by:"Leo Park · Software Engineer",date:"Today, 9:18 AM",type:"Technical plan"},{name:"Q4 launch · campaign outline",by:"Noah Williams · Marketing Manager",date:"Yesterday, 4:06 PM",type:"Campaign"}].map((d,i)=><div className="deliverable-row" key={d.name}><span className={`approval-doc deliverable-icon-${i}`}><FileText size={17}/></span><span className="approval-info"><strong>{d.name}</strong><small>{d.by} · {d.date}</small></span><span className="approval-kind">{d.type}</span><button className="text-button" onClick={() => onNotify("Open a deliverable to review its draft.")}>Open <ArrowRight size={14}/></button></div>)}</div></>;
  return <SectionPlaceholder active={active} onNotify={onNotify} />;
}

function SectionPlaceholder({ active, onNotify }: { active: string; onNotify: (message: string) => void }) {
  const descriptions: Record<string, string> = {
    "Knowledge base": "Give your AI employees trusted company context and shared reference material.",
    Integrations: "Connect the tools your team already uses. External actions stay approval-gated.",
    Analytics: "Understand task throughput, completion quality, escalations, and AI costs.",
    Settings: "Manage workspace members, access policies, AI providers, and organization preferences.",
  };
  return <div className="placeholder-panel"><div className="placeholder-icon"><Boxes size={22}/></div><span className="section-kicker">WORKSPACE SETUP</span><h2>{active} is ready for your team</h2><p>{descriptions[active] || "Configure this part of your AI workforce."}</p><button className="button button-secondary" onClick={() => onNotify("Workspace setup guide is in the README.")}>Explore setup <ArrowRight size={14}/></button><div className="placeholder-foot"><ShieldCheck size={15}/> Company data stays isolated by organization when Supabase is configured.</div></div>;
}
