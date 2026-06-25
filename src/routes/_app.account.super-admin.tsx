import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { can, getStoredRole } from "@/lib/permissions";
import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Key,
  Users,
  Trash2,
  Edit2,
  Plus,
  X,
  Check,
  Lock,
  Layers,
  FileText,
  AlertTriangle,
  FolderClosed,
  UserCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/frontend/store/store";
import { toast } from "./_app";
import { PageHeader } from "./_app.projects";
import {
  checkSuperAdminStatus,
  verifySuperAdminCredentials,
  getGlobalAdminData,
  mutateGlobalEntity,
  updateProjectRoles,
  whitelistSuperAdmin,
  removeSuperAdminFromWhitelist,
  getActivePasswordResetRequest,
  createPasswordResetRequest,
  approvePasswordResetRequest,
} from "@/backend/api/super-admin.functions";

export const Route = createFileRoute("/_app/account/super-admin")({
  beforeLoad: () => {
    const role = getStoredRole();
    if (!can(role, "superadmin:access")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Super Admin Portal — QAMind AI" }] }),
  component: SuperAdminPage,
});

type TabType = "projects" | "test_plans" | "suites" | "bugs" | "whitelist" | "security";

function SuperAdminPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Auth gate states
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("super_admin_verified") === "true";
    }
    return false;
  });

  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Platform Data states
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [loadingData, setLoadingData] = useState(true);
  const [adminData, setAdminData] = useState<{
    projects: any[];
    testPlans: any[];
    suites: any[];
    bugs: any[];
    users: any[];
    sprints: any[];
    superAdmins: any[];
  } | null>(null);

  // Modal / Action states
  const [editEntity, setEditEntity] = useState<{ table: string; id?: string; data: any } | null>(
    null,
  );
  const [showRoleModal, setShowRoleModal] = useState<{
    type: "project" | "sprint";
    item: any;
  } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // Whitelisting input
  const [newWhitelistEmail, setNewWhitelistEmail] = useState("");

  // Role Manager selections
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedDevs, setSelectedDevs] = useState<string[]>([]);
  const [selectedTesters, setSelectedTesters] = useState<string[]>([]);

  // Multi-Sig password requests
  const [pendingRequest, setPendingRequest] = useState<any | null>(null);

  // 1. Initial Gatekeeper Whitelist Check
  useEffect(() => {
    if (auth.loading) return;
    if (!auth.session) {
      navigate({ to: "/auth" });
      return;
    }

    checkSuperAdminStatus({ data: { accessToken: auth.session.access_token } })
      .then((res) => {
        setIsWhitelisted(res.isSuperAdmin);
        if (res.isSuperAdmin && !verifyEmail) {
          setVerifyEmail(res.email);
        }
      })
      .catch((err) => {
        console.error("Failed to check super admin status:", err);
        setIsWhitelisted(false);
      });
  }, [auth.session, auth.loading]);

  // 2. Fetch Data once verified
  const fetchData = async () => {
    if (!auth.session || !isVerified) return;
    setLoadingData(true);
    try {
      const token = auth.session.access_token;
      const [dataRes, reqRes] = await Promise.all([
        getGlobalAdminData({ data: { accessToken: token } }),
        getActivePasswordResetRequest({ data: { accessToken: token } }),
      ]);
      setAdminData(dataRes);
      setPendingRequest(reqRes.request);
    } catch (err: any) {
      toast.error(`Error loading platform data: ${err.message || String(err)}`);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isVerified, auth.session]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.session) return;
    setIsVerifying(true);
    try {
      const res = await verifySuperAdminCredentials({
        data: {
          accessToken: auth.session.access_token,
          email: verifyEmail,
          passwordPlain: verifyPassword,
        },
      });

      if (res.success) {
        setIsVerified(true);
        sessionStorage.setItem("super_admin_verified", "true");
        toast.success("Super Admin session verified.");
      } else {
        toast.error(res.error || "Authentication failed.");
      }
    } catch (err: any) {
      toast.error(`Verification error: ${err.message || String(err)}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // 3. Generic Entity CRUD Execution
  const handleSaveEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.session || !editEntity || !adminData) return;

    const token = auth.session.access_token;
    const isNew = !editEntity.id;
    const action = isNew ? ("insert" as const) : ("update" as const);

    try {
      const res = await mutateGlobalEntity({
        data: {
          accessToken: token,
          table: editEntity.table as any,
          action,
          id: editEntity.id,
          data: editEntity.data,
        },
      });

      if (res.success) {
        toast.success(`${editEntity.table.replace("_", " ")} saved successfully.`);
        setEditEntity(null);
        fetchData();
      } else {
        toast.error(res.error || "Operation failed.");
      }
    } catch (err: any) {
      toast.error(`Mutation error: ${err.message || String(err)}`);
    }
  };

  const handleDeleteEntity = async (
    table: "projects" | "test_plans" | "suites" | "bugs",
    id: string,
  ) => {
    if (!auth.session) return;
    if (
      !confirm(
        `Are you absolutely sure you want to delete this entry from ${table}? This action is irreversible.`,
      )
    ) {
      return;
    }

    try {
      const res = await mutateGlobalEntity({
        data: {
          accessToken: auth.session.access_token,
          table,
          action: "delete",
          id,
        },
      });

      if (res.success) {
        toast.success("Entry removed successfully.");
        fetchData();
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    } catch (err: any) {
      toast.error(`Delete error: ${err.message || String(err)}`);
    }
  };

  // 4. Role Override mutations
  const handleRoleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.session || !showRoleModal) return;

    try {
      const res = await updateProjectRoles({
        data: {
          accessToken: auth.session.access_token,
          targetType: showRoleModal.type,
          targetId: showRoleModal.item.id,
          leadId: selectedLeadId || null,
          members: selectedMembers,
          developers: selectedDevs,
          testers: selectedTesters,
        },
      });

      if (res.success) {
        toast.success("Roles updated successfully.");
        setShowRoleModal(null);
        fetchData();
      } else {
        toast.error(res.error || "Override roles failed.");
      }
    } catch (err: any) {
      toast.error(`Error updating roles: ${err.message || String(err)}`);
    }
  };

  // 5. Super Admin Whitelisting
  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.session || !newWhitelistEmail.trim()) return;

    try {
      const res = await whitelistSuperAdmin({
        data: {
          accessToken: auth.session.access_token,
          email: newWhitelistEmail.trim(),
        },
      });

      if (res.success) {
        toast.success(`${newWhitelistEmail.trim()} whitelisted successfully.`);
        setNewWhitelistEmail("");
        fetchData();
      } else {
        toast.error(res.error || "Failed to whitelist email.");
      }
    } catch (err: any) {
      toast.error(`Error whitelisting: ${err.message || String(err)}`);
    }
  };

  const handleRemoveWhitelist = async (email: string) => {
    if (!auth.session) return;
    if (!confirm(`Remove ${email} from Super Admin whitelist?`)) return;

    try {
      const res = await removeSuperAdminFromWhitelist({
        data: {
          accessToken: auth.session.access_token,
          email,
        },
      });

      if (res.success) {
        toast.success("Super admin removed.");
        fetchData();
      } else {
        toast.error(res.error || "Failed to remove.");
      }
    } catch (err: any) {
      toast.error(`Error removing from whitelist: ${err.message || String(err)}`);
    }
  };

  // 6. Multi-Sig reset handlers
  const handleCreateResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.session || !newPasswordInput.trim()) return;

    try {
      const res = await createPasswordResetRequest({
        data: {
          accessToken: auth.session.access_token,
          newPasswordPlain: newPasswordInput.trim(),
        },
      });

      if (res.success) {
        toast.success(
          res.isExecuted
            ? "Consensus met! Master password updated."
            : "Reset request initiated. Pending consensus approval.",
        );
        setShowResetModal(false);
        setNewPasswordInput("");
        fetchData();
      } else {
        toast.error(res.error || "Failed to initiate reset request.");
      }
    } catch (err: any) {
      toast.error(`Request error: ${err.message || String(err)}`);
    }
  };

  const handleApproveResetRequest = async (requestId: string) => {
    if (!auth.session) return;

    try {
      const res = await approvePasswordResetRequest({
        data: {
          accessToken: auth.session.access_token,
          requestId,
        },
      });

      if (res.success) {
        toast.success(
          res.isExecuted
            ? "100% consensus reached! Master password hash updated successfully."
            : "Approval registered.",
        );
        fetchData();
      } else {
        toast.error(res.error || "Failed to register approval.");
      }
    } catch (err: any) {
      toast.error(`Approval error: ${err.message || String(err)}`);
    }
  };

  // --- RENDERS ---

  // Loading Whitelist resolution
  if (isWhitelisted === null) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-[var(--c-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--c-border)] border-t-[var(--c-accent)]" />
      </div>
    );
  }

  // Not whitelisted -> Block access
  if (isWhitelisted === false) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(196,85,26,0.1)] border border-[var(--c-fail)]">
          <ShieldAlert className="h-8 w-8 text-[var(--c-fail)]" />
        </div>
        <h2 className="font-display text-3xl font-bold text-[var(--c-text)]">Access Restricted</h2>
        <p className="text-[14px] text-[var(--c-text-muted)] leading-relaxed">
          Your authenticated email{" "}
          <span className="font-mono text-white">({auth.user?.email})</span> is not whitelisted in
          the super admin access control policies. If this is a mistake, contact your platform
          administrator.
        </p>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="rounded-[8px] bg-[var(--c-text)] px-6 py-2.5 text-[13px] font-medium text-[var(--c-bg)] hover:opacity-90 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Secondary verification gate
  if (!isVerified) {
    return (
      <div className="mx-auto max-w-md py-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="rounded-[16px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-8 space-y-6 shadow-[var(--shadow-lg)] relative">
          <div className="flex items-center gap-3 border-b border-[var(--c-border)] pb-4">
            <Lock className="h-6 w-6 text-[var(--c-accent)]" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--c-accent)] font-bold">
                Verification Required
              </p>
              <h3 className="font-display text-[22px] text-[var(--c-text)] font-semibold mt-0.5">
                Super Admin Auth
              </h3>
            </div>
          </div>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                Whitelisted Email
              </label>
              <input
                type="email"
                disabled
                value={verifyEmail}
                className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)]/50 px-[12px] py-[8px] text-[13px] text-[var(--c-text-dim)] outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                Super Admin Master Password
              </label>
              <input
                type="password"
                required
                autoFocus
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="Enter master password..."
                className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none focus:border-[var(--c-accent)]"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full inline-flex justify-center items-center gap-2 rounded-[8px] bg-[var(--c-text)] py-2.5 text-[13px] font-medium text-[var(--c-bg)] hover:opacity-90 disabled:opacity-40"
            >
              {isVerifying ? "Verifying..." : "Access God Mode"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active verified Super Admin dashboard
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        section="§ Security & RBAC"
        title="Super Admin Portal"
        subtitle="Global God-Mode view bypassing Row-Level Security. Perform mutations across all assets."
      />

      {/* Multi-Sig consensus notification warning */}
      {pendingRequest && (
        <div className="flex items-start gap-4 rounded-[12px] border border-[var(--c-accent)] bg-[var(--c-accent-soft)] p-5 animate-pulse-slow">
          <AlertTriangle className="h-6 w-6 text-[var(--c-accent)] shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="text-[14px] font-bold text-white">
              Pending Master Password Reset Request
            </h4>
            <p className="text-[12px] text-[var(--c-text-muted)]">
              Initiated by{" "}
              <span className="font-mono font-semibold text-white">
                {pendingRequest.requested_by}
              </span>
              . This change requires 100% approval from all whitelisted super admins to execute.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="font-mono text-[11px] bg-white/10 px-2.5 py-0.5 rounded text-white font-semibold">
                Approvals: {pendingRequest.approvals?.length || 0} /{" "}
                {adminData?.superAdmins?.length || 1} (
                {Math.round(
                  ((pendingRequest.approvals?.length || 0) /
                    (adminData?.superAdmins?.length || 1)) *
                    100,
                )}
                %)
              </span>
              {!pendingRequest.approvals?.includes(auth.user?.email || "") ? (
                <button
                  onClick={() => handleApproveResetRequest(pendingRequest.id)}
                  className="rounded bg-white text-black font-semibold text-[11px] px-3 py-1 hover:bg-white/90 transition-all"
                >
                  ✓ Approve request
                </button>
              ) : (
                <span className="text-[11px] text-[var(--c-pass)] font-semibold font-mono flex items-center gap-1">
                  <Check className="h-3 w-3" /> Already Approved
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation Tabs (Sidebar Layout inside portal) */}
        <div className="lg:col-span-1 rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-4 flex flex-col gap-1.5 h-fit">
          <p className="px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--c-text-dim)] mb-2">
            Control Views
          </p>
          {(
            [
              { id: "projects", label: "Projects", icon: FolderClosed },
              { id: "test_plans", label: "Test Plans", icon: FileText },
              { id: "suites", label: "Test Suites", icon: Layers },
              { id: "bugs", label: "Bugs (Global)", icon: ShieldAlert },
              { id: "whitelist", label: "Whitelist RBAC", icon: Users },
              { id: "security", label: "Reset Security", icon: Key },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-[8px] rounded-[6px] px-[12px] py-2 text-[13px] transition-all w-full text-left ${
                activeTab === tab.id
                  ? "bg-[var(--c-accent-soft)] text-[var(--c-accent)] font-medium"
                  : "text-[var(--c-text-muted)] hover:bg-[var(--c-bg-hover)] hover:text-[var(--c-text)]"
              }`}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Central Dashboard Data Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loadingData ? (
            <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-20 flex justify-center items-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--c-border)] border-t-[var(--c-accent)]" />
            </div>
          ) : !adminData ? (
            <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-20 text-center text-[var(--c-text-muted)]">
              Failed to resolve platform metrics.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tab 1: Projects Grid */}
              {activeTab === "projects" && (
                <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
                    <h3 className="font-display text-[20px] text-white">Global Projects</h3>
                    <button
                      onClick={() =>
                        setEditEntity({
                          table: "projects",
                          data: { name: "", description: "", status: "active", priority: "medium" },
                        })
                      }
                      className="inline-flex items-center gap-1 rounded bg-[var(--c-accent-soft)] px-2.5 py-1 text-[11px] font-mono text-[var(--c-accent)] hover:opacity-90"
                    >
                      <Plus className="h-3 w-3" /> New Project
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--c-border)] font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
                          <th className="py-2.5">Project Name</th>
                          <th className="py-2.5">Lead / Members</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5">Priority</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--c-border)]/50 text-[13px]">
                        {adminData.projects.map((p) => {
                          const leadUser = adminData.users.find((u) => u.id === p.team_lead_id);
                          const memberCount = Array.isArray(p.team_members)
                            ? p.team_members.length
                            : 0;
                          return (
                            <tr key={p.id} className="hover:bg-[var(--c-bg-hover)]/25">
                              <td className="py-3 font-semibold text-white">
                                {p.name}
                                <span className="block font-mono text-[10px] text-[var(--c-text-muted)] font-normal truncate max-w-[200px]">
                                  {p.description || "No description."}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className="block font-medium">
                                  {leadUser ? leadUser.name : "Unassigned"}
                                </span>
                                <span className="block font-mono text-[10px] text-[var(--c-text-muted)]">
                                  {memberCount} team members
                                </span>
                              </td>
                              <td className="py-3">
                                <span className="inline-flex items-center rounded-sm bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold">
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider badge-${p.priority}`}
                                >
                                  {p.priority}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setSelectedLeadId(p.team_lead_id || "");
                                      setSelectedMembers(p.team_members || []);
                                      setShowRoleModal({ type: "project", item: p });
                                    }}
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-white"
                                    title="Role Management"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setEditEntity({ table: "projects", id: p.id, data: p })
                                    }
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-accent)]"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntity("projects", p.id)}
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-fail)]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Test Plans */}
              {activeTab === "test_plans" && (
                <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
                    <h3 className="font-display text-[20px] text-white">Global Test Plans</h3>
                    <button
                      onClick={() =>
                        setEditEntity({
                          table: "test_plans",
                          data: {
                            project_id: adminData.projects[0]?.id || "",
                            title: "",
                            content: { modules: [] },
                          },
                        })
                      }
                      className="inline-flex items-center gap-1 rounded bg-[var(--c-accent-soft)] px-2.5 py-1 text-[11px] font-mono text-[var(--c-accent)] hover:opacity-90"
                      disabled={adminData.projects.length === 0}
                    >
                      <Plus className="h-3 w-3" /> New Test Plan
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--c-border)] font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
                          <th className="py-2.5">Test Plan Title</th>
                          <th className="py-2.5">Project</th>
                          <th className="py-2.5">Modules parsed</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--c-border)]/50 text-[13px]">
                        {adminData.testPlans.map((plan) => {
                          const proj = adminData.projects.find((p) => p.id === plan.project_id);
                          const content =
                            plan.content && typeof plan.content === "string"
                              ? JSON.parse(plan.content)
                              : plan.content;
                          const modCount = Array.isArray(content?.modules)
                            ? content.modules.length
                            : 0;
                          return (
                            <tr key={plan.id} className="hover:bg-[var(--c-bg-hover)]/25">
                              <td className="py-3 font-semibold text-white">{plan.title}</td>
                              <td className="py-3 text-[var(--c-text-muted)]">
                                {proj ? proj.name : "Unknown Project"}
                              </td>
                              <td className="py-3 font-mono text-[11px]">
                                {modCount} Modules defined
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() =>
                                      setEditEntity({
                                        table: "test_plans",
                                        id: plan.id,
                                        data: plan,
                                      })
                                    }
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-accent)]"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntity("test_plans", plan.id)}
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-fail)]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Suites */}
              {activeTab === "suites" && (
                <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
                    <h3 className="font-display text-[20px] text-white">Global Test Suites</h3>
                    <button
                      onClick={() =>
                        setEditEntity({
                          table: "suites",
                          data: { project_id: adminData.projects[0]?.id || "", name: "" },
                        })
                      }
                      className="inline-flex items-center gap-1 rounded bg-[var(--c-accent-soft)] px-2.5 py-1 text-[11px] font-mono text-[var(--c-accent)] hover:opacity-90"
                      disabled={adminData.projects.length === 0}
                    >
                      <Plus className="h-3 w-3" /> New Suite
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--c-border)] font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
                          <th className="py-2.5">Suite Name</th>
                          <th className="py-2.5">Project</th>
                          <th className="py-2.5">Created At</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--c-border)]/50 text-[13px]">
                        {adminData.suites.map((s) => {
                          const proj = adminData.projects.find((p) => p.id === s.project_id);
                          return (
                            <tr key={s.id} className="hover:bg-[var(--c-bg-hover)]/25">
                              <td className="py-3 font-semibold text-white">{s.name}</td>
                              <td className="py-3 text-[var(--c-text-muted)]">
                                {proj ? proj.name : "Unknown Project"}
                              </td>
                              <td className="py-3 font-mono text-[11px]">
                                {new Date(s.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() =>
                                      setEditEntity({ table: "suites", id: s.id, data: s })
                                    }
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-accent)]"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntity("suites", s.id)}
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-fail)]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Bugs */}
              {activeTab === "bugs" && (
                <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
                    <h3 className="font-display text-[20px] text-white">Global Bugs</h3>
                    <button
                      onClick={() =>
                        setEditEntity({
                          table: "bugs",
                          data: {
                            project_id: adminData.projects[0]?.id || "",
                            test_case_title: "",
                            error_message: "",
                            code_snippet: "",
                            is_resolved: false,
                          },
                        })
                      }
                      className="inline-flex items-center gap-1 rounded bg-[var(--c-accent-soft)] px-2.5 py-1 text-[11px] font-mono text-[var(--c-accent)] hover:opacity-90"
                      disabled={adminData.projects.length === 0}
                    >
                      <Plus className="h-3 w-3" /> Report Bug
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--c-border)] font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
                          <th className="py-2.5">Bug Summary</th>
                          <th className="py-2.5">Project</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5">Logged At</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--c-border)]/50 text-[13px]">
                        {adminData.bugs.map((b) => {
                          const proj = adminData.projects.find((p) => p.id === b.project_id);
                          return (
                            <tr key={b.id} className="hover:bg-[var(--c-bg-hover)]/25">
                              <td className="py-3 font-semibold text-white">
                                {b.test_case_title}
                                <span className="block font-mono text-[10px] text-[var(--c-text-muted)] font-normal truncate max-w-[260px]">
                                  {b.error_message || "No stack trace details."}
                                </span>
                              </td>
                              <td className="py-3 text-[var(--c-text-muted)]">
                                {proj ? proj.name : "Unknown Project"}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                                    b.is_resolved
                                      ? "bg-[var(--c-pass-soft)] text-[var(--c-pass)] border border-[var(--c-pass)]/20"
                                      : "bg-[var(--c-fail)]/15 text-[var(--c-fail)] border border-[var(--c-fail)]/20"
                                  }`}
                                >
                                  {b.is_resolved ? "RESOLVED" : "ACTIVE"}
                                </span>
                              </td>
                              <td className="py-3 font-mono text-[11px]">
                                {new Date(b.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() =>
                                      setEditEntity({ table: "bugs", id: b.id, data: b })
                                    }
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-accent)]"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntity("bugs", b.id)}
                                    className="p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-fail)]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Whitelist Management */}
              {activeTab === "whitelist" && (
                <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 space-y-6">
                  <div>
                    <h3 className="font-display text-[20px] text-white">Super Admin Whitelist</h3>
                    <p className="text-[12px] text-[var(--c-text-muted)] mt-1">
                      Emails configured here have authorization to pass the Super Admin auth gate.
                    </p>
                  </div>

                  <form onSubmit={handleAddWhitelist} className="flex gap-3 max-w-md">
                    <input
                      type="email"
                      required
                      value={newWhitelistEmail}
                      onChange={(e) => setNewWhitelistEmail(e.target.value)}
                      placeholder="Add admin email..."
                      className="flex-1 rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none focus:border-[var(--c-accent)]"
                    />
                    <button
                      type="submit"
                      className="rounded-[8px] bg-[var(--c-accent)] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[var(--c-accent-dark)]"
                    >
                      + Add Admin
                    </button>
                  </form>

                  <div className="space-y-2 border-t border-[var(--c-border)] pt-4 max-w-xl">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)] font-bold mb-2">
                      Active Whitelist
                    </p>
                    {adminData.superAdmins.map((admin) => {
                      const isSelf = admin.email === auth.user?.email;
                      return (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between bg-[var(--c-bg-input)]/10 border border-[var(--c-border)]/50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <UserCheck className="h-4 w-4 text-[var(--c-accent)]" />
                            <span className="text-[13px] font-semibold text-white font-mono">
                              {admin.email}
                              {isSelf && (
                                <span className="ml-1.5 text-[9px] text-[var(--c-text-muted)]">
                                  (you)
                                </span>
                              )}
                            </span>
                          </div>
                          {!isSelf && (
                            <button
                              onClick={() => handleRemoveWhitelist(admin.email)}
                              className="text-[var(--c-text-muted)] hover:text-[var(--c-fail)] transition-colors p-1"
                              title="Revoke Whitelist Status"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 6: Password Reset Console */}
              {activeTab === "security" && (
                <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-6 space-y-6">
                  <div>
                    <h3 className="font-display text-[20px] text-white">Super Admin Credentials</h3>
                    <p className="text-[12px] text-[var(--c-text-muted)] mt-1">
                      Initiate a Multi-Sig request to update the platform master password. Requires
                      100% consensus.
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-bg-input)]/25 p-5 space-y-4 max-w-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[14px] font-bold text-white">Reset Policy Status</p>
                        <p className="text-[11px] text-[var(--c-text-muted)]">
                          Required approvals: {adminData.superAdmins.length} of{" "}
                          {adminData.superAdmins.length} admins.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowResetModal(true)}
                        className="rounded-lg bg-[var(--c-text)] px-4 py-2 text-[12px] font-bold text-[var(--c-bg)] hover:opacity-90 transition-all flex items-center gap-1.5"
                      >
                        <Key className="h-3.5 w-3.5" /> Request Password Change
                      </button>
                    </div>

                    {pendingRequest ? (
                      <div className="border-t border-[var(--c-border)] pt-4 space-y-3">
                        <div className="flex items-center gap-2 text-[var(--c-accent)] text-[13px] font-semibold">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Active Request Pending Approvals</span>
                        </div>
                        <div className="font-mono text-[12px] text-[var(--c-text-muted)] space-y-1 bg-black/20 p-3 rounded">
                          <p>Requested by: {pendingRequest.requested_by}</p>
                          <p>Created: {new Date(pendingRequest.created_at).toLocaleString()}</p>
                          <div className="pt-2">
                            <p className="font-bold text-white mb-1">Approvals List:</p>
                            <ul className="list-disc list-inside pl-1 space-y-1">
                              {adminData.superAdmins.map((a) => {
                                const approved = pendingRequest.approvals?.includes(a.email);
                                return (
                                  <li
                                    key={a.email}
                                    className={
                                      approved ? "text-[var(--c-pass)] font-semibold" : "text-[var(--c-text-dim)]"
                                    }
                                  >
                                    {a.email} — {approved ? "Approved" : "Pending Approval"}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        {!pendingRequest.approvals?.includes(auth.user?.email || "") && (
                          <button
                            onClick={() => handleApproveResetRequest(pendingRequest.id)}
                            className="w-full inline-flex justify-center items-center gap-1.5 rounded-[8px] bg-[var(--c-accent)] py-2 text-[12px] font-bold text-white hover:bg-[var(--c-accent-dark)]"
                          >
                            ✓ Approve Request and Sign Change
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-[12px] text-[var(--c-text-muted)] italic pt-2 border-t border-[var(--c-border)]/50">
                        No pending password reset requests. Master credentials are secure.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: Generic CRUD Creator/Editor Dialog --- */}
      {editEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,23,20,0.6)] p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-lg rounded-[16px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-[28px] shadow-[var(--shadow-lg)]">
            <div className="mb-[24px] flex items-center justify-between border-b border-[var(--c-border)] pb-3">
              <h3 className="font-display text-[22px] text-white">
                {editEntity.id ? "Edit Entity" : "Create Entity"} — {editEntity.table}
              </h3>
              <button
                onClick={() => setEditEntity(null)}
                className="rounded-full p-1.5 text-[var(--c-text-muted)] hover:bg-[var(--c-bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntity} className="space-y-4">
              {/* Table specific fields */}
              {editEntity.table === "projects" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editEntity.data.name || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, name: e.target.value },
                        })
                      }
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Description
                    </label>
                    <textarea
                      value={editEntity.data.description || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, description: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                        Status
                      </label>
                      <select
                        value={editEntity.data.status || "active"}
                        onChange={(e) =>
                          setEditEntity({
                            ...editEntity,
                            data: { ...editEntity.data, status: e.target.value },
                          })
                        }
                        className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] p-[8px] text-[13px] outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="planning">Planning</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                        Priority
                      </label>
                      <select
                        value={editEntity.data.priority || "medium"}
                        onChange={(e) =>
                          setEditEntity({
                            ...editEntity,
                            data: { ...editEntity.data, priority: e.target.value },
                          })
                        }
                        className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] p-[8px] text-[13px] outline-none"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {editEntity.table === "test_plans" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Project
                    </label>
                    <select
                      value={editEntity.data.project_id || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, project_id: e.target.value },
                        })
                      }
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] p-[8px] text-[13px] outline-none"
                    >
                      {(adminData?.projects || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Test Plan Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editEntity.data.title || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, title: e.target.value },
                        })
                      }
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Modules Content (JSON list)
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={
                        typeof editEntity.data.content === "string"
                          ? editEntity.data.content
                          : JSON.stringify(editEntity.data.content, null, 2)
                      }
                      onChange={(e) => {
                        let parsed = editEntity.data.content;
                        try {
                          parsed = JSON.parse(e.target.value);
                        } catch {
                          parsed = e.target.value; // Keep as string until validate
                        }
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, content: parsed },
                        });
                      }}
                      className="w-full font-mono text-[11px] rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] outline-none"
                    />
                  </div>
                </div>
              )}

              {editEntity.table === "suites" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Project
                    </label>
                    <select
                      value={editEntity.data.project_id || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, project_id: e.target.value },
                        })
                      }
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] p-[8px] text-[13px] outline-none"
                    >
                      {(adminData?.projects || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Suite Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editEntity.data.name || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, name: e.target.value },
                        })
                      }
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none"
                    />
                  </div>
                </div>
              )}

              {editEntity.table === "bugs" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Project
                    </label>
                    <select
                      value={editEntity.data.project_id || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, project_id: e.target.value },
                        })
                      }
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] p-[8px] text-[13px] outline-none"
                    >
                      {(adminData?.projects || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Failed Test Summary / Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editEntity.data.test_case_title || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, test_case_title: e.target.value },
                        })
                      }
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Error details
                    </label>
                    <textarea
                      value={editEntity.data.error_message || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, error_message: e.target.value },
                        })
                      }
                      rows={2}
                      className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                      Console / Log Snippet
                    </label>
                    <textarea
                      value={editEntity.data.code_snippet || ""}
                      onChange={(e) =>
                        setEditEntity({
                          ...editEntity,
                          data: { ...editEntity.data, code_snippet: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full font-mono text-[11px] rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 rounded-[8px] border border-[var(--c-border)] bg-[var(--c-bg-input)]/25 p-4 mt-2">
                    <div className="space-y-0.5 flex-1">
                      <p className="text-[13px] font-medium text-[var(--c-text)]">
                        Mark Bug as Resolved
                      </p>
                      <p className="text-[11px] text-[var(--c-text-muted)]">
                        Bypasses standard workflow statuses.
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={editEntity.data.is_resolved || false}
                        onChange={(e) =>
                          setEditEntity({
                            ...editEntity,
                            data: {
                              ...editEntity.data,
                              is_resolved: e.target.checked,
                              resolved_at: e.target.checked ? new Date().toISOString() : null,
                            },
                          })
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-[var(--c-border-strong)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--c-accent)] peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2 border-t border-[var(--c-border)]/50 pt-4">
                <button
                  type="button"
                  onClick={() => setEditEntity(null)}
                  className="rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all hover:bg-[var(--c-bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[var(--c-accent)] px-[16px] py-[8px] text-[13px] font-medium text-white transition-all hover:bg-[var(--c-accent-dark)]"
                >
                  Save Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: User Role & Membership Manager --- */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,23,20,0.6)] p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-lg rounded-[16px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-[28px] shadow-[var(--shadow-lg)]">
            <div className="mb-[24px] flex items-center justify-between border-b border-[var(--c-border)] pb-3">
              <h3 className="font-display text-[22px] text-white">
                Override Project Membership Roles
              </h3>
              <button
                onClick={() => setShowRoleModal(null)}
                className="rounded-full p-1.5 text-[var(--c-text-muted)] hover:bg-[var(--c-bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRoleSave} className="space-y-4">
              <p className="text-[13px] text-[var(--c-text-muted)]">
                Target Project:{" "}
                <span className="font-semibold text-white">{showRoleModal.item.name}</span>
              </p>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                  Force Team Lead Assignment
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] p-[8px] text-[13px] outline-none"
                >
                  <option value="">Unassigned</option>
                  {(adminData?.users || []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                  Override Member Whitelist (Multiple Selection)
                </label>
                <div className="max-h-40 overflow-y-auto border border-[var(--c-border)] rounded-md bg-[var(--c-bg-input)] p-3 space-y-2">
                  {(adminData?.users || []).map((u) => {
                    const checked = selectedMembers.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 cursor-pointer text-[13px]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, u.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter((id) => id !== u.id));
                            }
                          }}
                          className="rounded border-[var(--c-border)] text-[var(--c-accent)] focus:ring-[var(--c-accent)]"
                        />
                        <span>
                          {u.name}{" "}
                          <span className="text-[11px] text-[var(--c-text-muted)] font-mono">
                            ({u.email})
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-[var(--c-border)]/50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(null)}
                  className="rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all hover:bg-[var(--c-bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[var(--c-accent)] px-[16px] py-[8px] text-[13px] font-medium text-white transition-all hover:bg-[var(--c-accent-dark)]"
                >
                  Apply Role Overrides
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Reset Master Password Request Creator --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,23,20,0.6)] p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-md rounded-[16px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-[28px] shadow-[var(--shadow-lg)]">
            <div className="mb-[24px] flex items-center justify-between border-b border-[var(--c-border)] pb-3">
              <h3 className="font-display text-[22px] text-white">Request Master Password Reset</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="rounded-full p-1.5 text-[var(--c-text-muted)] hover:bg-[var(--c-bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResetRequest} className="space-y-4">
              <p className="text-[12px] text-[var(--c-text-muted)] leading-relaxed">
                Provide the new master credentials. This will create a pending request that other
                super admin accounts must approve before it goes active.
              </p>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                  New Master Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="w-full rounded-[6px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-[12px] py-[8px] text-[13px] outline-none focus:border-[var(--c-accent)]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-[var(--c-border)]/50 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setNewPasswordInput("");
                  }}
                  className="rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all hover:bg-[var(--c-bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-[var(--c-accent)] px-[16px] py-[8px] text-[13px] font-semibold text-white hover:bg-[var(--c-accent-dark)]"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
