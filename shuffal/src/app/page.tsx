"use client";

import { useEffect, useState } from "react";
import { DashboardData, getCurrentUser, getDashboardSummary, logout } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then(() => getDashboardSummary().then(setDashboard))
      .catch(() => {
        setError("Dashboard data is unavailable. Check that the backend is running.");
        router.replace("/login");
      });
  }, [router]);

  const metricCards = dashboard ? [
    [dashboard.metrics.overdueTasks, "Overdue tasks", "Needs attention", "text-[#b85b43]"],
    [dashboard.metrics.renewalsDue, "Renewals due", "Today", "text-[#9a6b3d]"],
    [dashboard.metrics.newLeads, "New leads", "This week", "text-[#3b7560]"],
    [dashboard.metrics.openClaims, "Open claims", "In progress", "text-[#647c9f]"],
  ] : [];

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-[#17352d]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#d9e3dd] bg-[#17352d] px-6 py-7 text-[#f4f7f1] lg:flex">
        <div className="mb-12 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#d9e86c] text-lg font-bold text-[#17352d]">N</div>
          <div><p className="text-lg font-semibold tracking-tight">Nivara</p><p className="text-xs text-[#a9c1b5]">Insurance OS</p></div>
        </div>
        <nav className="space-y-2 text-sm">
          {['Overview', 'Customers', 'Leads', 'Policies', 'Renewals', 'Claims', 'Tasks', 'Documents'].map((item, index) => (
            <a key={item} href="#" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${index === 0 ? 'bg-[#315448] text-[#d9e86c]' : 'text-[#b5c9c0] hover:bg-[#26483d] hover:text-white'}`}>
              <span className="w-5 text-center text-xs">{['⌂', '◉', '↗', '▣', '↻', '✦', '✓', '□'][index]}</span>{item}
            </a>
          ))}
        </nav>
        <div className="mt-auto border-t border-[#315448] pt-5 text-sm text-[#b5c9c0]"><a href="#" className="block py-2">Reports</a><a href="#" className="block py-2">Settings</a></div>
      </aside>
      <main className="lg:ml-64">
        <header className="flex items-center justify-between border-b border-[#d9e3dd] bg-[#f5f7f4]/90 px-6 py-5 backdrop-blur md:px-10">
          <div><p className="text-sm font-medium text-[#668074]">Monday, September 14, 2026</p><h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Good morning, Arjun</h1></div>
          <div className="flex items-center gap-3"><button aria-label="Search" className="hidden size-10 rounded-lg border border-[#d9e3dd] bg-white text-[#668074] md:block">⌕</button><button className="rounded-lg bg-[#d9e86c] px-4 py-2.5 text-sm font-semibold text-[#17352d] shadow-sm">+ Add record</button><button onClick={() => logout().then(() => router.replace("/login"))} className="grid size-10 place-items-center rounded-full bg-[#c9ddd2] text-sm font-semibold" aria-label="Log out">AS</button></div>
        </header>
        <div className="px-6 py-8 md:px-10">
          <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#9a6b3d]">Action center</p><h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Your business, in focus.</h2><p className="mt-2 max-w-xl text-[#668074]">Here is what needs your attention today across customers, policies, and claims.</p></div><a href="#tasks" className="text-sm font-semibold text-[#3b7560] hover:underline">View all tasks →</a></section>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(([number, label, detail, tone]) => <article key={label} className="rounded-xl border border-[#d9e3dd] bg-white p-5 shadow-[0_6px_18px_rgba(23,53,45,0.04)]"><div className="flex items-start justify-between"><p className="text-sm text-[#668074]">{label}</p><span className={`text-xl ${tone}`}>↗</span></div><p className="mt-5 text-4xl font-semibold tracking-tight">{number}</p><p className="mt-1 text-xs font-medium text-[#668074]">{detail}</p></article>)}
            {!dashboard && <div className="col-span-full rounded-xl border border-[#d9e3dd] bg-white p-5 text-sm text-[#668074]">{error ?? "Loading live dashboard data..."}</div>}
          </section>
          <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <article id="tasks" className="rounded-xl border border-[#d9e3dd] bg-white p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-semibold">Priority tasks</h3><p className="mt-1 text-sm text-[#668074]">The next best actions for your team</p></div><button className="text-sm font-semibold text-[#3b7560]">See all</button></div><div className="divide-y divide-[#edf1ee]">{dashboard?.actionable.tasks.map((task) => <div key={task.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="mt-1 size-2 rounded-full bg-[#d9e86c]"/><div><p className="text-sm font-semibold">{task.title}</p><p className="mt-1 text-xs text-[#668074]">{task.customer?.fullName ?? "Unassigned customer"}</p></div></div><div className="flex items-center gap-4 pl-5 sm:pl-0"><span className="text-xs text-[#668074]">{new Date(task.dueDate).toLocaleDateString()}</span><span className="rounded-full bg-[#e6f0ea] px-2.5 py-1 text-[11px] font-semibold text-[#3b7560]">{task.priority}</span></div></div>)}{dashboard && dashboard.actionable.tasks.length === 0 && <p className="py-4 text-sm text-[#668074]">No open tasks.</p>}</div></article>
            <article className="rounded-xl border border-[#d9e3dd] bg-[#e7eee8] p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-[#668074]">Policy portfolio</p><p className="mt-2 text-3xl font-semibold">{dashboard?.metrics.activePolicies ?? "-"}</p><p className="mt-1 text-xs text-[#668074]">Active policies under care</p></div><span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3b7560]">Live</span></div><div className="mt-8 space-y-4"><div className="flex justify-between text-sm"><span>Renewals due today</span><span className="font-semibold">{dashboard?.metrics.renewalsDue ?? "-"}</span></div><div className="flex justify-between text-sm"><span>Overdue renewals</span><span className="font-semibold">{dashboard?.metrics.overdueRenewals ?? "-"}</span></div><div className="flex justify-between text-sm"><span>Pending quotes</span><span className="font-semibold">{dashboard?.metrics.pendingQuotes ?? "-"}</span></div></div><a href="#" className="mt-8 block text-sm font-semibold text-[#3b7560]">Open portfolio report →</a></article>
          </section>
          <section className="mt-8 rounded-xl border border-[#d9e3dd] bg-white p-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">Recent activity</h3><p className="mt-1 text-sm text-[#668074]">Latest changes across your customer files</p></div><button className="text-sm font-semibold text-[#3b7560]">View timeline</button></div><div className="mt-5 grid gap-4 md:grid-cols-3">{dashboard?.actionable.recentActivity.slice(0, 3).map((activity) => <div key={activity.id} className="rounded-lg bg-[#f5f7f4] p-4"><p className="text-sm font-semibold">{activity.type}</p><p className="mt-2 text-xs text-[#668074]">{activity.customer.fullName} · {activity.description}</p><p className="mt-3 text-[11px] text-[#9a6b3d]">{new Date(activity.createdAt).toLocaleString()}</p></div>)}{dashboard && dashboard.actionable.recentActivity.length === 0 && <p className="text-sm text-[#668074]">No activity recorded yet.</p>}</div></section>
        </div>
      </main>
    </div>
  );
}
