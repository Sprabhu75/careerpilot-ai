/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  IndianRupee,
  Link2,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  Upload,
  RefreshCw,
  X,
  FileText,
  Layers,
  Table,
  Kanban,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  JobApplication,
  ApplicationStatus,
  TrackerStats,
  getStoredApplications,
  saveStoredApplications,
  calculateTrackerStats,
  addStoredApplication,
  updateStoredApplication,
  deleteStoredApplication,
  INITIAL_DEMO_APPLICATIONS,
} from '../utils/career-pilot-logic.ts';

interface ApplicationTrackerScreenProps {
  onBackToHome: () => void;
  onNavigateToMatchReport: () => void;
}

const STATUS_COLUMNS: { status: ApplicationStatus; label: string; color: string; badgeBg: string }[] = [
  { status: 'Saved', label: 'Saved / Wishlist', color: 'border-slate-700 text-slate-300', badgeBg: 'bg-slate-800 text-slate-300' },
  { status: 'Applied', label: 'Applied', color: 'border-cyan-800/80 text-cyan-400', badgeBg: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60' },
  { status: 'Interview', label: 'Interview / OA', color: 'border-amber-800/80 text-amber-400', badgeBg: 'bg-amber-950/60 text-amber-300 border border-amber-800/60' },
  { status: 'Offer', label: 'Offer Received', color: 'border-emerald-800/80 text-emerald-400', badgeBg: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' },
  { status: 'Rejected', label: 'Rejected / Archived', color: 'border-rose-900/60 text-rose-400', badgeBg: 'bg-rose-950/50 text-rose-300 border border-rose-900/50' },
];

export const ApplicationTrackerScreen: React.FC<ApplicationTrackerScreenProps> = ({
  onBackToHome,
  onNavigateToMatchReport,
}) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  
  // Delete Confirmation Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'Applied' as ApplicationStatus,
    nextActionDate: '',
    notes: '',
    matchScore: 75,
    location: '',
    ctcOrStipend: '',
    portal: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = getStoredApplications();
    setApplications(loaded);
  }, []);

  const stats: TrackerStats = useMemo(() => {
    return calculateTrackerStats(applications);
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.location || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === 'all' || app.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, selectedStatusFilter]);

  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setFormData({
      company: '',
      role: '',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'Applied',
      nextActionDate: '',
      notes: '',
      matchScore: 80,
      location: 'Bengaluru / Hybrid',
      ctcOrStipend: '',
      portal: 'LinkedIn / Referral',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: JobApplication) => {
    setEditingApplication(app);
    setFormData({
      company: app.company,
      role: app.role,
      dateApplied: app.dateApplied,
      status: app.status,
      nextActionDate: app.nextActionDate || '',
      notes: app.notes || '',
      matchScore: app.matchScore || 75,
      location: app.location || '',
      ctcOrStipend: app.ctcOrStipend || '',
      portal: app.portal || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) return;

    if (editingApplication) {
      const updated = updateStoredApplication(editingApplication.id, {
        company: formData.company.trim(),
        role: formData.role.trim(),
        dateApplied: formData.dateApplied,
        status: formData.status,
        nextActionDate: formData.nextActionDate || undefined,
        notes: formData.notes.trim() || undefined,
        matchScore: Number(formData.matchScore) || undefined,
        location: formData.location.trim() || undefined,
        ctcOrStipend: formData.ctcOrStipend.trim() || undefined,
        portal: formData.portal.trim() || undefined,
      });
      setApplications(updated);
    } else {
      const updated = addStoredApplication({
        company: formData.company.trim(),
        role: formData.role.trim(),
        dateApplied: formData.dateApplied,
        status: formData.status,
        nextActionDate: formData.nextActionDate || undefined,
        notes: formData.notes.trim() || undefined,
        matchScore: Number(formData.matchScore) || undefined,
        location: formData.location.trim() || undefined,
        ctcOrStipend: formData.ctcOrStipend.trim() || undefined,
        portal: formData.portal.trim() || undefined,
      });
      setApplications(updated);
    }

    setIsModalOpen(false);
  };

  const handleQuickStatusChange = (id: string, newStatus: ApplicationStatus) => {
    const updated = updateStoredApplication(id, { status: newStatus });
    setApplications(updated);
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    const updated = deleteStoredApplication(deleteId);
    setApplications(updated);
    setDeleteId(null);
  };

  const handleRestoreDemoApplications = () => {
    saveStoredApplications(INITIAL_DEMO_APPLICATIONS);
    setApplications(INITIAL_DEMO_APPLICATIONS);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = ['Company', 'Role', 'Status', 'Date Applied', 'Next Action Date', 'CTC / Stipend', 'Location', 'Portal', 'Match Score', 'Notes'];
    const rows = applications.map((a) => [
      `"${a.company.replace(/"/g, '""')}"`,
      `"${a.role.replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.dateApplied}"`,
      `"${a.nextActionDate || ''}"`,
      `"${(a.ctcOrStipend || '').replace(/"/g, '""')}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.portal || '').replace(/"/g, '""')}"`,
      `"${a.matchScore || ''}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CareerPilot_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Screen 5: Fresher Application Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
            Placement & Job Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your on-campus and off-campus tech applications across India with local browser persistence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            title="Export tracking data to CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tracked</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active candidates pipeline</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saved / Wishlist</div>
          <div className="text-2xl font-bold text-slate-300 mt-1 font-mono">{stats.saved}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Referrals to request</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Applied</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{stats.applied}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Portals & campus tests</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Interview / OA</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{stats.interview}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active technical rounds</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Offers</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{stats.offer}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Offers / PPOs in hand</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">Upcoming Deadlines</div>
          <div className="text-2xl font-bold text-teal-400 mt-1 font-mono">{stats.upcomingActionsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pending action dates</div>
        </div>
      </div>

      {/* Upcoming Action Alert Banner if actions pending */}
      {stats.upcomingActionsCount > 0 && (
        <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/60 flex items-center justify-between gap-3 text-xs text-teal-200">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              You have <strong>{stats.upcomingActionsCount} upcoming test/interview deadlines</strong> scheduled. Prepare your capstone code walk-through and check your email alerts.
            </span>
          </div>
          <button
            onClick={() => setSelectedStatusFilter('Interview')}
            className="text-[11px] font-bold text-teal-300 hover:text-white underline cursor-pointer shrink-0"
          >
            View Active Interviews
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Status Filter, View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role, location, or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filters and View Switch */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Select */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Statuses ({applications.length})</option>
              <option value="Saved">Saved ({stats.saved})</option>
              <option value="Applied">Applied ({stats.applied})</option>
              <option value="Interview">Interview ({stats.interview})</option>
              <option value="Offer">Offer ({stats.offer})</option>
              <option value="Rejected">Rejected ({stats.rejected})</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {applications.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-lg font-bold text-white">No Applications Logged Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add your active job applications to track hiring rounds, OA test deadlines, and referral notes with local browser persistence.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add Your First Application</span>
            </button>
            <button
              onClick={handleRestoreDemoApplications}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Load Indian Fresher Demo Jobs</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const colApps = filteredApplications.filter((a) => a.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col min-h-[420px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      col.status === 'Offer' ? 'bg-emerald-400' :
                      col.status === 'Interview' ? 'bg-amber-400' :
                      col.status === 'Applied' ? 'bg-cyan-400' :
                      col.status === 'Rejected' ? 'bg-rose-400' : 'bg-slate-400'
                    }`} />
                    <span className="font-bold text-xs text-white">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-slate-950 border border-slate-800 hover:border-teal-500/40 rounded-xl p-3.5 space-y-3 shadow-xs transition-all group"
                    >
                      {/* Top Row: Company & Match Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">
                            {app.company}
                          </h4>
                          <div className="text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">
                            {app.role}
                          </div>
                        </div>

                        {app.matchScore && (
                          <span
                            title="Estimated Match Score"
                            className="shrink-0 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60"
                          >
                            {app.matchScore}%
                          </span>
                        )}
                      </div>

                      {/* Meta Tags: Location, CTC, Portal */}
                      <div className="space-y-1 text-[11px] text-slate-400">
                        {app.location && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{app.location}</span>
                          </div>
                        )}
                        {app.ctcOrStipend && (
                          <div className="flex items-center gap-1.5 text-emerald-400/90 font-mono">
                            <IndianRupee className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{app.ctcOrStipend}</span>
                          </div>
                        )}
                        {app.portal && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Link2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{app.portal}</span>
                          </div>
                        )}
                      </div>

                      {/* Next Action Date Alert */}
                      {app.nextActionDate && (
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Action: {app.nextActionDate}</span>
                        </div>
                      )}

                      {/* Notes snippet */}
                      {app.notes && (
                        <div className="text-[11px] text-slate-400 line-clamp-2 bg-slate-900/40 p-2 rounded border border-slate-800/50">
                          {app.notes}
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        {/* Quick stage switch */}
                        <select
                          value={app.status}
                          onChange={(e) => handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="text-[10px] bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none focus:border-teal-500 cursor-pointer"
                        >
                          <option value="Saved">Move: Saved</option>
                          <option value="Applied">Move: Applied</option>
                          <option value="Interview">Move: Interview</option>
                          <option value="Offer">Move: Offer</option>
                          <option value="Rejected">Move: Rejected</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer"
                            title="Edit application"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(app.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="h-28 rounded-lg border border-dashed border-slate-800/80 flex items-center justify-center text-[11px] text-slate-600">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Company & Role</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Applied Date</th>
                  <th className="py-3.5 px-3">Next Action</th>
                  <th className="py-3.5 px-3">CTC / Stipend</th>
                  <th className="py-3.5 px-3">Location & Portal</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Company & Role */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{app.company}</div>
                      <div className="text-[11px] text-slate-300 font-medium">{app.role}</div>
                      {app.matchScore && (
                        <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                          {app.matchScore}% Match
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'Offer' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        app.status === 'Interview' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        app.status === 'Applied' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        app.status === 'Rejected' ? 'bg-rose-950 text-rose-300 border border-rose-900' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                      {app.dateApplied}
                    </td>

                    {/* Next Action Date */}
                    <td className="py-3 px-3">
                      {app.nextActionDate ? (
                        <span className="font-mono text-[11px] text-amber-400 font-medium">
                          {app.nextActionDate}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* CTC / Stipend */}
                    <td className="py-3 px-3 text-[11px] font-mono text-emerald-400">
                      {app.ctcOrStipend || '—'}
                    </td>

                    {/* Location & Portal */}
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      <div>{app.location || '—'}</div>
                      <div className="text-slate-500">{app.portal || ''}</div>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-[11px] text-slate-300 max-w-xs truncate">
                      {app.notes || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(app)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(app.id)}
                          className="p-1.5 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-400" />
                <span>{editingApplication ? 'Edit Job Application' : 'Add New Application'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Razorpay, Swiggy, TCS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Role Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. SDE-1 (Frontend), ASE"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hiring Stage Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Saved">Saved / Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview / OA</option>
                    <option value="Offer">Offer Received</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Date Applied */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    value={formData.dateApplied}
                    onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Next Action Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Next Action Date (OA/Interview)
                  </label>
                  <input
                    type="date"
                    value={formData.nextActionDate}
                    onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                {/* Match Score */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Match (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.matchScore}
                    onChange={(e) => setFormData({ ...formData, matchScore: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, Hyderabad, Pune, Remote"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* CTC or Stipend */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CTC / Stipend
                  </label>
                  <input
                    type="text"
                    value={formData.ctcOrStipend}
                    onChange={(e) => setFormData({ ...formData, ctcOrStipend: e.target.value })}
                    placeholder="e.g. 14 LPA or ₹40,000/month"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Portal / Source */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Source / Portal
                </label>
                <input
                  type="text"
                  value={formData.portal}
                  onChange={(e) => setFormData({ ...formData, portal: e.target.value })}
                  placeholder="e.g. LinkedIn Referral, Instahyre, Naukri, Campus TPO"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Interview Round Notes & Follow-ups
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. HackerRank test cleared with 2/2 solved. Technical Round 1 scheduled with Senior SDE. Review React concurrency and LeetCode trees..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm cursor-pointer"
                >
                  {editingApplication ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-bold text-white">Delete Job Application?</h3>
              <p className="text-xs text-slate-400">
                This will remove the application from your tracker records. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Keep Record
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
