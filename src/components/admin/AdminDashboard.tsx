import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExtensibleSelect } from '../common/ExtensibleSelect';
import { 
  Building2, 
  Users, 
  Car, 
  FileText, 
  Send, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  PhoneCall,
  DollarSign
} from 'lucide-react';
import { JobCard, User, Branch } from '../../types';

interface AdminDashboardProps {
  activeSubTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSubTab = 'overview' }) => {
  const { 
    currentBranchId, 
    branches, 
    jobCards, 
    users, 
    vehicles, 
    invoices, 
    createJobCard, 
    finalizeJobAndInvoice, 
    generateWhatsAppLink,
    addBranch,
    addUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'floor' | 'jobs' | 'completed' | 'branches'>(
    (activeSubTab as any) || 'overview'
  );

  // Filter jobs by selected branch (or ALL)
  const filteredJobs = currentBranchId === 'ALL' 
    ? jobCards 
    : jobCards.filter(j => j.branchId === currentBranchId);

  const technicians = users.filter(u => u.role === 'TECHNICIAN');
  const completedJobs = filteredJobs.filter(j => j.status === 'COMPLETED' || j.status === 'DELIVERED');

  // Job Card Creation Modal state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custProfession, setCustProfession] = useState('Senior Petroleum Operations Engineer');
  const [custPhone, setCustPhone] = useState('+974 55');
  const [custQid, setCustQid] = useState('');
  const [qidError, setQidError] = useState('');
  
  const [vehMake, setVehMake] = useState('Porsche');
  const [vehModel, setVehModel] = useState('911 Carrera 4S');
  const [vehYear, setVehYear] = useState(2024);
  const [vehColor, setVehColor] = useState('Jet Black Metallic');
  const [plateNumber, setPlateNumber] = useState('');
  const [plateType, setPlateType] = useState('PRIVATE');
  
  const [servicePackage, setServicePackage] = useState('9H Multi-Layer Graphene-Ceramic Shield + Full Interior Steam Care');
  const [packagePrice, setPackagePrice] = useState(3800);
  const [assignedTechId, setAssignedTechId] = useState(technicians[0]?.id || '');
  const [targetBranchId, setTargetBranchId] = useState(branches[0]?.id || 'br-pearl');
  const [estimatedHours, setEstimatedHours] = useState(8);

  // New Branch Modal state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchCity, setBranchCity] = useState<'Doha' | 'Lusail' | 'The Pearl' | 'Al Wakrah' | 'Al Khor' | 'Al Rayyan'>('Doha');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('+974 44');
  const [branchManager, setBranchManager] = useState('');
  const [branchBays, setBranchBays] = useState(6);

  // New Technician Modal state
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [techName, setTechName] = useState('');
  const [techUsername, setTechUsername] = useState('');
  const [techPhone, setTechPhone] = useState('+974 66');
  const [techQid, setTechQid] = useState('');
  const [techBranchId, setTechBranchId] = useState(branches[0]?.id || '');
  const [techSpecialty, setTechSpecialty] = useState('Senior Ceramic & Detailing Specialist');

  // Completed Job Final Review & WhatsApp Modal state
  const [reviewJob, setReviewJob] = useState<JobCard | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Qatar ID validation: exactly 11 numeric digits
  const validateQid = (qid: string): boolean => {
    const clean = qid.trim();
    return /^\d{11}$/.test(clean);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateQid(custQid)) {
      setQidError('Qatar ID (QID) must be exactly 11 digits (e.g. 29463401234)');
      return;
    }
    setQidError('');

    createJobCard({
      customerName: custName,
      customerProfession: custProfession,
      customerPhone: custPhone,
      customerQid: custQid,
      vehicleMake: vehMake,
      vehicleModel: vehModel,
      vehicleYear: Number(vehYear),
      vehicleColor: vehColor,
      plateNumber: plateNumber.trim(),
      plateType,
      servicePackage,
      packagePriceQAR: Number(packagePrice),
      assignedTechnicianId: assignedTechId,
      branchId: targetBranchId,
      estimatedHours: Number(estimatedHours),
    });

    setIsJobModalOpen(false);
    // Reset form
    setCustName('');
    setCustQid('');
    setPlateNumber('');
    setActiveTab('jobs');
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    addBranch({
      name: branchName,
      code: branchCode,
      city: branchCity,
      address: branchAddress,
      phone: branchPhone,
      managerName: branchManager,
      baysCount: Number(branchBays),
    });
    setIsBranchModalOpen(false);
    setBranchName('');
    setBranchCode('');
  };

  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name: techName,
      username: techUsername.toLowerCase().trim(),
      role: 'TECHNICIAN',
      qid: techQid,
      email: `${techUsername.toLowerCase().trim()}@qplanet.qa`,
      phone: techPhone,
      branchId: techBranchId,
      profession: techSpecialty,
      avatarUrl: '/src/assets/images/avatar_technician_lead_1790933868861.jpg',
    });
    setIsTechModalOpen(false);
    setTechName('');
    setTechUsername('');
    setTechQid('');
  };

  const handleOpenReview = (job: JobCard) => {
    setReviewJob(job);
    setFinalPrice(job.finalPriceQAR || job.packagePriceQAR);
    setDiscount(job.discountQAR || 0);
    setAdminNotes(job.adminNotes || 'Inspected and certified for customer delivery.');
  };

  const handleFinalizeAndInvoice = () => {
    if (!reviewJob) return;

    finalizeJobAndInvoice({
      jobId: reviewJob.id,
      finalPriceQAR: finalPrice,
      discountQAR: discount,
      adminNotes,
      invoiceItems: [
        {
          description: reviewJob.servicePackage,
          quantity: 1,
          unitPriceQAR: reviewJob.packagePriceQAR,
          totalQAR: reviewJob.packagePriceQAR,
        },
      ],
    });

    // Update local review modal state
    setReviewJob(prev => prev ? { ...prev, reviewedByAdmin: true, status: 'DELIVERED', finalPriceQAR: finalPrice } : null);
  };

  const whatsAppData = reviewJob ? generateWhatsAppLink(reviewJob.id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Enterprise Headquarters (Doha, Qatar)
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Global Operations &amp; Workshop Floor Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Scope: <span className="font-semibold text-slate-800">{currentBranchId === 'ALL' ? 'All 4 Qatar Branches' : branches.find(b => b.id === currentBranchId)?.name}</span>
          </p>
        </div>

        {/* Action Button: Create Job Card */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsJobModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job Card</span>
          </button>
        </div>
      </div>

      {/* Admin Subtabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview &amp; Metrics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('floor')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'floor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Live Workshop Floor ({technicians.length} Active Techs)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'jobs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Job Cards ({filteredJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Completed &amp; WhatsApp Queue</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
            {completedJobs.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'branches' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Branches &amp; Technician Credentials
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Active Bays in Service</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {filteredJobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'IN_INSPECTION').length}
                </span>
                <span className="text-xs text-slate-500">of 31 Total Bays</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Across {branches.length} certified Qatar branches</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Completed Detailing</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold font-mono text-emerald-600 tabular-nums">
                  {completedJobs.length}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">100% Quality Pass</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Ready for customer WhatsApp dispatch</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Floor Technicians</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold font-mono text-blue-600 tabular-nums">
                  {technicians.length}
                </span>
                <span className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">On Floor</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Master Ceramic &amp; PPF Installers</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Invoiced Revenue</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {invoices.reduce((a, b) => a + b.totalQAR, 0).toLocaleString()} <span className="text-xs font-sans font-medium text-slate-500">QAR</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">All payments settled via QCB NAPS</p>
            </div>

          </div>

          {/* Quick Recent Activity Feed & Floor Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Detailing Operations</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All Job Cards
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-3">
                {filteredJobs.slice(0, 4).map((j) => {
                  const v = vehicles.find(x => x.id === j.vehicleId);
                  const c = users.find(x => x.id === j.customerId);
                  return (
                    <div key={j.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{j.jobNumber}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-800">{v?.year} {v?.make} {v?.model}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          Client: {c?.name} · Plate: <span className="font-mono">{v?.plateNumber}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {j.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Qatar Branch Performance Snapshot</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('branches')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Manage Branches
                </button>
              </div>

              <div className="space-y-3 mt-3">
                {branches.map((b) => {
                  const branchJobCount = jobCards.filter(j => j.branchId === b.id).length;
                  return (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.name}</span>
                        <span className="text-slate-500">{b.city} · Manager: {b.managerName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-blue-600 block">{branchJobCount} Active Jobs</span>
                        <span className="text-[11px] text-slate-400">{b.baysCount} Workshop Bays</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: LIVE WORKSHOP FLOOR */}
      {activeTab === 'floor' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Workshop Floor &amp; Technician Workstation Grid
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time visibility into active bay occupancy, technician task progress, and inspection statuses.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Live Auto-Refresh Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((tech) => {
              const assignedJob = jobCards.find(j => j.assignedTechnicianId === tech.id && j.status !== 'DELIVERED');
              const veh = assignedJob ? vehicles.find(v => v.id === assignedJob.vehicleId) : null;
              const br = branches.find(b => b.id === tech.branchId);

              return (
                <div
                  key={tech.id}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{tech.name}</h4>
                        <p className="text-[11px] text-slate-500">{tech.profession}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Floor Active
                    </span>
                  </div>

                  <div className="text-xs border-t border-slate-200/70 pt-2.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Workshop Location:</span>
                      <span className="font-medium text-slate-800">{br?.name}</span>
                    </div>

                    {assignedJob ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Assigned Vehicle:</span>
                          <span className="font-bold text-slate-900">{veh?.make} {veh?.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Plate Number:</span>
                          <span className="font-mono font-semibold text-slate-800">{veh?.plateNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Job Stage:</span>
                          <span className="font-bold text-blue-600">{assignedJob.status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Intake Documentation:</span>
                          <span className="font-medium text-slate-700">
                            {assignedJob.intakePhotos.length}/10 Photos · {assignedJob.damageMarks.length} Damage Pins
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="py-2 text-center text-slate-400 bg-white rounded border border-dashed border-slate-200">
                        Bay is currently standby / awaiting vehicle intake
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ALL JOB CARDS */}
      {activeTab === 'jobs' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enterprise Job Card Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Filter, monitor and inspect every detailing ticket in real time.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsJobModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Job Card</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-3 px-4">Job Reference</th>
                  <th className="py-3 px-4">Customer &amp; QID</th>
                  <th className="py-3 px-4">Vehicle Specification</th>
                  <th className="py-3 px-4">Assigned Technician</th>
                  <th className="py-3 px-4">Package Price (QAR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((j) => {
                  const v = vehicles.find(x => x.id === j.vehicleId);
                  const c = users.find(x => x.id === j.customerId);
                  const t = users.find(x => x.id === j.assignedTechnicianId);

                  return (
                    <tr key={j.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {j.jobNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{c?.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">QID: {c?.qid}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{v?.year} {v?.make} {v?.model}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Plate: {v?.plateNumber} ({v?.plateType})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {t?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {j.packagePriceQAR.toLocaleString()} QAR
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          j.status === 'COMPLETED' || j.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : j.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {j.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(j)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          Review &amp; WhatsApp
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLETED QUEUE & WHATSAPP AUTOMATION */}
      {activeTab === 'completed' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Completed Jobs Queue &amp; Automated WhatsApp Dispatch
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review technician completion reports, adjust final invoices, and send direct WhatsApp completion alerts with customer login credentials.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {completedJobs.length} Completed Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedJobs.map((j) => {
              const v = vehicles.find(x => x.id === j.vehicleId);
              const c = users.find(x => x.id === j.customerId);
              const wa = generateWhatsAppLink(j.id);

              return (
                <div key={j.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{j.jobNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {j.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {v?.year} {v?.make} {v?.model} (Plate: {v?.plateNumber})
                      </h4>
                      <p className="text-slate-500 text-[11px]">
                        Customer: <span className="font-semibold text-slate-800">{c?.name}</span> · QID: <span className="font-mono">{c?.qid}</span>
                      </p>
                    </div>

                    <span className="text-xs font-extrabold font-mono text-slate-900 tabular-nums">
                      {j.finalPriceQAR} QAR
                    </span>
                  </div>

                  {/* Technician Notes Preview */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Tech Summary:</span>
                    <p className="text-[11px] line-clamp-2">{j.technicianSuggestions || 'Standard 5-year ceramic warranty issued.'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(j)}
                      className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg"
                    >
                      Edit Report / Pricing
                    </button>

                    <a
                      href={wa.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Alert</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: BRANCHES & USER MANAGEMENT */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          
          {/* Branches Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Qatar Branch Network</h3>
                <p className="text-xs text-slate-500 mt-0.5">Isolated workshop databases managed centrally.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Branch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">Code: {b.code} · CR: {b.crNumber}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {b.baysCount} Detailing Bays
                    </span>
                  </div>
                  <p className="text-slate-600">{b.address}</p>
                  <div className="flex items-center justify-between text-slate-500 pt-1">
                    <span>Manager: <strong className="text-slate-800">{b.managerName}</strong></span>
                    <span>Contact: <strong className="text-slate-800">{b.phone}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technicians Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workshop Floor Technicians</h3>
                <p className="text-xs text-slate-500 mt-0.5">Admin-provisioned credentials for workshop floor mobile devices.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTechModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Technician Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {technicians.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {t.name.split(' ').map(x => x[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">User: {t.username}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px]">{t.profession}</p>
                  <p className="text-slate-400 font-mono text-[10px]">QID: {t.qid} · Phone: {t.phone}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: CREATE DETAILED JOB CARD */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Create Enterprise Job Card
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed customer registration, Qatar vehicle specifications, and technician assignment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-6">
              
              {/* Branch & Technician Assignment */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign Workshop Floor Technician <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={assignedTechId}
                    onChange={(e) => setAssignedTechId(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.profession})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  1. Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Sheikh Nasser Al-Thani"
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qatar ID (QID - 11 Digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={custQid}
                      onChange={(e) => setCustQid(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 29463401234"
                      className="w-full h-10 px-3 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {qidError && <p className="text-[11px] text-rose-600 font-semibold mt-1">{qidError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (+974 Qatar) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="+974 5512 3456"
                      className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Extensible Profession Dropdown */}
                  <div>
                    <ExtensibleSelect
                      label="Client Profession"
                      category="PROFESSION"
                      value={custProfession}
                      onChange={setCustProfession}
                      placeholder="Select profession"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  2. Vehicle Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Extensible Make */}
                  <ExtensibleSelect
                    label="Vehicle Make"
                    category="VEHICLE_MAKE"
                    value={vehMake}
                    onChange={setVehMake}
                  />

                  {/* Extensible Model (Filtered by Make) */}
                  <ExtensibleSelect
                    label="Vehicle Model"
                    category="VEHICLE_MODEL"
                    parentValue={vehMake}
                    value={vehModel}
                    onChange={setVehModel}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Model Year</label>
                    <input
                      type="number"
                      value={vehYear}
                      onChange={(e) => setVehYear(Number(e.target.value))}
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Extensible Color */}
                  <ExtensibleSelect
                    label="Exterior Paint Colour"
                    category="VEHICLE_COLOR"
                    value={vehColor}
                    onChange={setVehColor}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Qatar Number Plate <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="e.g. 524182"
                      className="w-full h-10 px-3 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plate Type</label>
                    <select
                      value={plateType}
                      onChange={(e) => setPlateType(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="PRIVATE">Private (White/Maroon)</option>
                      <option value="COMMERCIAL">Commercial (Transport)</option>
                      <option value="DIPLOMATIC">Diplomatic Corps</option>
                      <option value="POLICE">Special Service</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  3. Service Detailing Package
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <ExtensibleSelect
                      label="Service Package"
                      category="SERVICE_PACKAGE"
                      value={servicePackage}
                      onChange={setServicePackage}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Package Price (QAR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={packagePrice}
                      onChange={(e) => setPackagePrice(Number(e.target.value))}
                      className="w-full h-10 px-3 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Create &amp; Dispatch to Technician</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW BRANCH */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Provision New Qatar Branch</h3>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Facility Name *</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Al Khor Coastal Detailing Studio"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="QP-KHOR"
                    className="w-full h-10 px-3 font-mono uppercase bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Municipality / City</label>
                  <select
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value as any)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Doha">Doha</option>
                    <option value="Lusail">Lusail</option>
                    <option value="The Pearl">The Pearl</option>
                    <option value="Al Wakrah">Al Wakrah</option>
                    <option value="Al Khor">Al Khor</option>
                    <option value="Al Rayyan">Al Rayyan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Street Address *</label>
                <input
                  type="text"
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="e.g. Corniche Road, Al Khor Zone 74"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Manager</label>
                  <input
                    type="text"
                    required
                    value={branchManager}
                    onChange={(e) => setBranchManager(e.target.value)}
                    placeholder="e.g. Tariq Al-Kubaisi"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailing Bays Count</label>
                  <input
                    type="number"
                    value={branchBays}
                    onChange={(e) => setBranchBays(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Deploy Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE TECHNICIAN CREDENTIALS */}
      {isTechModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Provision Technician Credentials</h3>
              <button
                type="button"
                onClick={() => setIsTechModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technician Full Name *</label>
                <input
                  type="text"
                  required
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="e.g. Tariq Al-Marri"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Username *</label>
                  <input
                    type="text"
                    required
                    value={techUsername}
                    onChange={(e) => setTechUsername(e.target.value)}
                    placeholder="tech.tariq"
                    className="w-full h-10 px-3 font-mono bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qatar ID (11 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={techQid}
                    onChange={(e) => setTechQid(e.target.value)}
                    placeholder="29063401122"
                    className="w-full h-10 px-3 font-mono bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Workshop Branch</label>
                <select
                  value={techBranchId}
                  onChange={(e) => setTechBranchId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialty Role</label>
                <input
                  type="text"
                  value={techSpecialty}
                  onChange={(e) => setTechSpecialty(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTechModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Create Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FINAL REPORT REVIEW & WHATSAPP GENERATION */}
      {reviewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 font-mono">{reviewJob.jobNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {reviewJob.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Final Report Review, Invoice &amp; WhatsApp Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewJob(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              
              {/* Review & Edit Pricing */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Adjust Line Items &amp; Final Invoicing (QAR)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Base Package Price</label>
                    <div className="h-10 px-3 bg-white border border-slate-200 rounded-lg flex items-center font-mono font-bold">
                      {reviewJob.packagePriceQAR} QAR
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Courtesy Discount (QAR)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => {
                        const d = Number(e.target.value);
                        setDiscount(d);
                        setFinalPrice(Math.max(0, reviewJob.packagePriceQAR - d));
                      }}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Final Amount Due (QAR)</label>
                    <div className="h-10 px-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center font-mono font-bold text-blue-700 text-sm">
                      {finalPrice} QAR
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Admin Approval Notes / Recommendations</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                {!reviewJob.reviewedByAdmin && (
                  <button
                    type="button"
                    onClick={handleFinalizeAndInvoice}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Final Pricing &amp; Generate Official Invoice</span>
                  </button>
                )}
              </div>

              {/* WhatsApp Notification Center */}
              {whatsAppData && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-950 text-xs">
                          Automated WhatsApp Client Completion Message
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          Recipients: {whatsAppData.customerName} ({whatsAppData.phone})
                        </p>
                      </div>
                    </div>

                    <a
                      href={whatsAppData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Web Chat</span>
                    </a>
                  </div>

                  {/* Simulated WhatsApp Bubble */}
                  <div className="p-3.5 bg-white border border-emerald-100 rounded-xl shadow-2xs font-mono text-[11px] text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {whatsAppData.messageText}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-800 font-medium">
                      One-click credentials provided: Username is customer's 11-digit QID
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(whatsAppData.messageText);
                        setCopiedMessage(true);
                        setTimeout(() => setCopiedMessage(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
                    >
                      {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMessage ? 'Copied Message!' : 'Copy Text'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setReviewJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
