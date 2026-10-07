"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CurrentUser, DashboardData, getCurrentUser, getDashboardSummary, logout } from "@/lib/api";

const navigation = [
  { label: "Overview", target: "#overview", number: "01" },
  { label: "Priority tasks", target: "#tasks", number: "02" },
  { label: "Portfolio", target: "#portfolio", number: "03" },
  { label: "Recent activity", target: "#activity", number: "04" },
];

export default function WorkspacePage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        return getDashboardSummary().then(setDashboard);
      })
      .catch(() => {
        setError("Your workspace is unavailable right now. Please sign in again.");
        router.replace("/login");
      });
  }, [router]);

  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const metrics = dashboard ? [
    { label: "Overdue tasks", value: dashboard.metrics.overdueTasks, note: "Needs attention", tone: "metric-coral" },
    { label: "Renewals due", value: dashboard.metrics.renewalsDue, note: "Due today", tone: "metric-brown" },
    { label: "New leads", value: dashboard.metrics.newLeads, note: "This week", tone: "metric-green" },
    { label: "Open claims", value: dashboard.metrics.openClaims, note: "In progress", tone: "metric-green" },
  ] : [];

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link className="brand workspace-brand" href="/" aria-label="Insurance-Operating_System home">
          <span className="brand-mark brand-mark-placeholder" role="img" aria-label="Blank logo image placeholder" />
          <span><strong>Insurance-Operating_System</strong><small>Sample workspace</small></span>
        </Link>
        <p className="workspace-label">YOUR WORKSPACE</p>
        <nav className="workspace-nav" aria-label="Workspace navigation">
          {navigation.map((item, index) => (
            <a href={item.target} key={item.label} className={index === 0 ? "workspace-nav-link is-active" : "workspace-nav-link"}>
              <span className="workspace-nav-number">{item.number}</span>{item.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>Good decisions start with a clear picture.</p>
          <Link href="/" className="sidebar-home">Visit sample site <span aria-hidden="true">↗</span></Link>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-topbar">
          <div><p className="workspace-date">{today}</p><h1>Good to see you, {user?.name?.split(" ")[0] ?? "again"}.</h1></div>
          <div className="workspace-user">
            <span className="user-avatar">{user?.name?.slice(0, 1).toUpperCase() ?? "N"}</span>
            <span className="user-meta"><strong>{user?.name ?? "Your account"}</strong><small>{user?.role ?? "Team member"}</small></span>
            <button className="logout-button" onClick={handleLogout}>Sign out</button>
          </div>
        </header>
        <div className="workspace-content" id="overview">
          <section className="workspace-intro">
            <div><p className="eyebrow">Your daily overview</p><h2>Keep the important<br /><em>things in focus.</em></h2><p>A quick view of the people and work that need your attention today.</p></div>
            <Link href="#tasks" className="button button-coral">View priority tasks <span aria-hidden="true">↗</span></Link>
          </section>
          <section className="workspace-metrics" aria-label="Key metrics">
            {metrics.map((metric) => <article className="workspace-metric" key={metric.label}><div><span>{metric.label}</span><span className={`metric-mark ${metric.tone}`} aria-hidden="true" /></div><strong>{metric.value}</strong><small>{metric.note}</small></article>)}
            {!dashboard && <div className="workspace-loading" role="status">{error ?? "Loading your latest workspace data..."}</div>}
          </section>
          <section className="workspace-panels">
            <article className="workspace-panel task-panel" id="tasks">
              <div className="panel-heading"><div><p className="eyebrow">The next best actions</p><h3>Priority tasks</h3></div><span className="panel-count">{dashboard?.actionable.tasks.length ?? "—"} OPEN</span></div>
              <div className="workspace-task-list">
                {dashboard?.actionable.tasks.map((task, index) => <div className="workspace-task" key={task.id}><span className="task-index">{String(index + 1).padStart(2, "0")}</span><div className="task-info"><strong>{task.title}</strong><small>{task.customer?.fullName ?? "No customer linked"}</small></div><div className="task-meta"><span>{new Date(task.dueDate).toLocaleDateString()}</span><span className="priority-chip">{task.priority}</span></div></div>)}
                {dashboard && dashboard.actionable.tasks.length === 0 && <p className="workspace-empty">No open tasks. You are all caught up.</p>}
                {!dashboard && !error && <p className="workspace-empty">Loading priority tasks...</p>}
              </div>
            </article>
            <article className="workspace-panel portfolio-panel" id="portfolio">
              <div className="portfolio-top"><div><p className="eyebrow">Policy portfolio</p><strong>{dashboard?.metrics.activePolicies ?? "—"}</strong><small>Active policies under care</small></div><span className="live-indicator"><i /> LIVE DATA</span></div>
              <div className="portfolio-stats">
                <div><span>Renewals due today</span><strong>{dashboard?.metrics.renewalsDue ?? "—"}</strong></div>
                <div><span>Overdue renewals</span><strong>{dashboard?.metrics.overdueRenewals ?? "—"}</strong></div>
                <div><span>Pending quotes</span><strong>{dashboard?.metrics.pendingQuotes ?? "—"}</strong></div>
              </div>
              <p className="portfolio-footnote">Keep upcoming dates visible and follow up before they become urgent.</p>
            </article>
          </section>
          <section className="workspace-panel activity-panel" id="activity">
            <div className="panel-heading"><div><p className="eyebrow">Customer file updates</p><h3>Recent activity</h3></div><span className="panel-count">LATEST</span></div>
            <div className="workspace-activity-list">
              {dashboard?.actionable.recentActivity.slice(0, 5).map((activity) => <article key={activity.id}><span className="activity-marker" /><div><strong>{activity.type.replaceAll("_", " ")}</strong><p>{activity.customer.fullName} · {activity.description}</p></div><time>{new Date(activity.createdAt).toLocaleString()}</time></article>)}
              {dashboard && dashboard.actionable.recentActivity.length === 0 && <p className="workspace-empty">No activity recorded yet.</p>}
              {!dashboard && !error && <p className="workspace-empty">Loading recent activity...</p>}
            </div>
          </section>
          <footer className="workspace-footer"><span>Insurance-Operating_System · Sample</span><Link href="/">Back to sample site</Link></footer>
        </div>
      </main>
    </div>
  );
}
