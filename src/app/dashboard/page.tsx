"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Funnel,
  CheckCircle,
  Clock,
  Eye,
  User,
  Phone,
  Shield,
  FileText,
  Plus,
  Warning,
  Trash,
  MagnifyingGlass,
  Download,
  X,
  ArrowClockwise,
  FileArrowDown,
  Users,
  MapPin,
  Camera,
  Robot,
  DeviceMobile,
} from "@phosphor-icons/react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "valid" | "pending" | "fraud";

interface FraudFlag {
  flag: string;
  reason: string;
  category: string;
}

interface Submission {
  id: string;
  submission_code: string;
  sales_name: string;
  pic_name: string;
  campaign_name: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_masked?: string;
  customer_email: string;
  status: string;
  created_at: string;
  device_info: string;
  gps_lat: number;
  gps_lng: number;
  ip_address: string;
  fraud_flags: string;
  fraud_reasons: string;
  qc_notes: string;
}

const FRAUD_CATEGORIES: Record<string, { icon: any; color: string; label: string }> = {
  evidence: { icon: Camera, color: "blue", label: "Evidence" },
  location: { icon: MapPin, color: "purple", label: "Location" },
  behavior: { icon: Robot, color: "amber", label: "Behavior" },
  device: { icon: DeviceMobile, color: "rose", label: "Device/IP" },
};

const parseFraudFlags = (flagsJson: string | FraudFlag[]): FraudFlag[] => {
  if (Array.isArray(flagsJson)) return flagsJson;
  if (!flagsJson) return [];
  try {
    return JSON.parse(flagsJson);
  } catch {
    return [];
  }
};

const exportToCSV = (submissions: Submission[]) => {
  const headers = ["Kode", "Sales", "PIC", "Campaign", "Customer", "Phone", "Status", "Fraud Reasons", "Created"];
  const rows = submissions.map((sub) => [
    sub.submission_code,
    sub.sales_name,
    sub.pic_name,
    sub.campaign_name,
    sub.customer_name,
    sub.customer_phone,
    sub.status,
    parseFraudFlags(sub.fraud_flags).map((f) => `${f.flag}: ${f.reason}`).join(" | "),
    sub.created_at,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `submissions_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [salesFilter, setSalesFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null);
  const [view, setView] = React.useState<"submissions" | "sales">("submissions");
  const [isLoading, setIsLoading] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [salesStats, setSalesStats] = React.useState<
    { name: string; total: number; valid: number; fraud: number; rate: number }[]
  >([]);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/submissions?limit=1000");
      const result = await response.json();

      if (result.data) {
        setSubmissions(result.data);

        const salesMap = new Map<string, { total: number; valid: number; fraud: number }>();
        result.data.forEach((sub: Submission) => {
          const salesName = sub.sales_name || "Unknown";
          const current = salesMap.get(salesName) || { total: 0, valid: 0, fraud: 0 };
          current.total++;
          if (sub.status === "valid") current.valid++;
          else if (sub.status === "fraud") current.fraud++;
          salesMap.set(salesName, current);
        });

        const stats = Array.from(salesMap.entries())
          .map(([name, data]) => ({
            name,
            total: data.total,
            valid: data.valid,
            fraud: data.fraud,
            rate: data.total > 0 ? Math.round((data.valid / data.total) * 100) : 0,
          }))
          .sort((a, b) => b.total - a.total);

        setSalesStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSubmissions = submissions.filter(
    (sub) =>
      (statusFilter === "all" || sub.status === statusFilter) &&
      (salesFilter === "all" || sub.sales_name === salesFilter) &&
      (!searchQuery ||
        sub.submission_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.sales_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: submissions.length,
    valid: submissions.filter((s) => s.status === "valid").length,
    pending: submissions.filter((s) => s.status === "pending").length,
    fraud: submissions.filter((s) => s.status === "fraud").length,
  };

  const validRate = stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0;

  const deleteSubmission = async (id: string) => {
    try {
      await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-32 sm:w-40">
                <Image
                  src="/Logo Rectoverso.png"
                  alt="RECTOVERSO"
                  width={160}
                  height={64}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="hidden sm:block pl-4 border-l border-slate-200">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xs text-slate-500">Monitoring & QC System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData()}
                className="border-slate-300"
              >
                <ArrowClockwise size={16} className="mr-2" /> Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(filteredSubmissions)}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <FileArrowDown size={16} className="mr-2" /> Export CSV
              </Button>
              <Link href="/submit">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                  <Plus size={18} className="mr-2" /> New Submission
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid - 3 cards only */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Total */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mb-3">
                <FileText size={28} className="text-white" />
              </div>
              <p className="text-4xl font-bold">{stats.total}</p>
              <p className="text-sm text-white/80 mt-1">Total</p>
            </CardContent>
          </Card>

          {/* Valid */}
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mb-3">
                <CheckCircle size={28} weight="fill" className="text-white" />
              </div>
              <p className="text-4xl font-bold">{stats.valid}</p>
              <p className="text-sm text-white/80 mt-1">Valid ({validRate}%)</p>
            </CardContent>
          </Card>

          {/* Fraud */}
          <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mb-3">
                <Shield size={28} weight="fill" className="text-white" />
              </div>
              <p className="text-4xl font-bold">{stats.fraud}</p>
              <p className="text-sm text-white/80 mt-1">Fraud</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm">
            <button
              onClick={() => setView("submissions")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm",
                view === "submissions"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <FileText size={16} /> Submissions
            </button>
            <button
              onClick={() => setView("sales")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm",
                view === "sales"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/30"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Users size={16} /> Per Sales
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Funnel size={16} /> Filter:
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "valid", "pending", "fraud"] as StatusFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm",
                      statusFilter === filter
                        ? filter === "valid"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30"
                          : filter === "fraud"
                          ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-rose-500/30"
                          : filter === "pending"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30"
                          : "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-500/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {filter === "all" ? "Semua" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <select
                value={salesFilter}
                onChange={(e) => setSalesFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              >
                <option value="all">Semua Sales</option>
                {salesStats.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div className="ml-auto text-sm text-slate-500">
                {filteredSubmissions.length} of {submissions.length} submissions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        {view === "submissions" && (
          <Card className="bg-white border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <p className="text-slate-500 font-medium">Loading...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                            <FileText size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-semibold text-lg">Tidak ada submission</p>
                          <Link href="/submit">
                            <Button className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                              <Plus size={16} className="mr-1" /> Buat Submission Baru
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const flags = parseFraudFlags(sub.fraud_flags);
                      return (
                        <tr
                          key={sub.submission_code}
                          onClick={() => setSelectedSubmission(sub)}
                          className={cn(
                            "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 cursor-pointer",
                            sub.status === "fraud" && "bg-red-50/30"
                          )}
                        >
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-2.5 py-1 rounded-lg border border-blue-200/50 shadow-sm">
                              {sub.submission_code}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                {sub.sales_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <span className="text-sm font-semibold text-slate-900 hidden sm:block">
                                {sub.sales_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <p className="text-sm font-semibold text-slate-900">{sub.customer_name}</p>
                            <p className="text-xs text-slate-500">{sub.customer_phone_masked || sub.customer_phone}</p>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <p className="text-sm text-slate-700">
                              {new Date(sub.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(sub.created_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            {sub.status === "valid" && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm">
                                <CheckCircle size={12} className="mr-1" /> Valid
                              </Badge>
                            )}
                            {sub.status === "pending" && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                                <Clock size={12} className="mr-1" /> Pending
                              </Badge>
                            )}
                            {sub.status === "fraud" && (
                              <Badge className="bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-sm">
                                <Shield size={12} className="mr-1" /> Fraud
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubmission(sub);
                                }}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                title="View Detail"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Hapus submission ini?")) deleteSubmission(sub.id);
                                }}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                title="Hapus"
                              >
                                <Trash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Per Sales Table */}
        {view === "sales" && (
          <Card className="bg-white border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">
                      Sales
                    </th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">
                      Total
                    </th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">
                      Valid
                    </th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">
                      Fraud
                    </th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">
                      Rate
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesStats.map((sales) => (
                    <tr
                      key={sales.name}
                      onClick={() => {
                        setSalesFilter(sales.name);
                        setView("submissions");
                      }}
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 cursor-pointer transition-all"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {sales.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-900">{sales.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900">{sales.total}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{sales.valid}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn("font-bold", sales.fraud > 0 ? "text-rose-600" : "text-slate-400")}>
                          {sales.fraud}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm",
                            sales.rate >= 90
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                              : sales.rate >= 80
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              : sales.rate >= 70
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                              : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                          )}
                        >
                          {sales.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-32 shadow-inner">
                          <div
                            className={cn(
                              "h-2.5 rounded-full transition-all shadow-sm",
                              sales.rate >= 90
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                : sales.rate >= 80
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : sales.rate >= 70
                                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                : "bg-gradient-to-r from-red-500 to-red-600"
                            )}
                            style={{ width: `${Math.max(sales.rate, 10)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-600 font-semibold">{selectedSubmission.submission_code}</span>
                {selectedSubmission.status === "valid" && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <CheckCircle size={12} className="mr-1" /> Valid
                  </Badge>
                )}
                {selectedSubmission.status === "fraud" && (
                  <Badge className="bg-gradient-to-r from-rose-600 to-rose-700 text-white">
                    <Shield size={12} className="mr-1" /> Fraud
                  </Badge>
                )}
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-medium">{selectedSubmission.customer_name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedSubmission.customer_phone_masked || selectedSubmission.customer_phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sales</p>
                  <p className="font-medium">{selectedSubmission.sales_name || "-"}</p>
                  <p className="text-sm text-slate-500">{selectedSubmission.campaign_name}</p>
                </div>
              </div>

              {selectedSubmission.fraud_flags && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm font-semibold text-rose-700 mb-2">Alasan Fraud:</p>
                  {parseFraudFlags(selectedSubmission.fraud_flags).map((flag: FraudFlag, i: number) => (
                    <div key={i} className="text-sm text-rose-600 mb-1">
                      • {flag.reason}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={16} />
                {formatDate(selectedSubmission.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
