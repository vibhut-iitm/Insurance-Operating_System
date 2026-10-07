const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:4000/api" : undefined);

function apiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("The backend API is not connected in this demo deployment.");
  }
  return `${API_URL}${path}`;
}

export type DashboardData = {
  metrics: {
    totalCustomers: number;
    newLeads: number;
    pendingQuotes: number;
    activePolicies: number;
    renewalsDue: number;
    overdueRenewals: number;
    openClaims: number;
    overdueTasks: number;
  };
  actionable: {
    tasks: Array<{ id: string; title: string; dueDate: string; priority: string; customer: { fullName: string } | null }>;
    recentActivity: Array<{ id: string; type: string; description: string; createdAt: string; customer: { fullName: string } }>;
  };
};

export async function getDashboardSummary(): Promise<DashboardData> {
  const response = await fetch(apiUrl("/dashboard/summary"), { cache: "no-store", credentials: "include" });
  if (!response.ok) throw new Error("Unable to load dashboard data");
  return response.json() as Promise<DashboardData>;
}

export type CurrentUser = { id: string; name: string; email: string; role: string };

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await fetch(apiUrl("/auth/me"), { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unauthenticated");
  return response.json() as Promise<CurrentUser>;
}

export async function login(email: string, password: string): Promise<CurrentUser> {
  const response = await fetch(apiUrl("/auth/login"), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error("Invalid email or password");
  const data = (await response.json()) as { user: CurrentUser };
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(apiUrl("/auth/logout"), { method: "POST", credentials: "include" });
}

export async function submitPublicLead(input: {
  fullName: string;
  phone: string;
  email?: string;
  category: string;
  requirement: string;
}): Promise<void> {
  const response = await fetch(apiUrl("/public/leads"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("We have received several requests recently. Please wait a moment and try again.");
    throw new Error("We could not send your enquiry. Please try again.");
  }
}