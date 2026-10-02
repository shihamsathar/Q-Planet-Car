import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobCard, PhotoDocumentation, RegionalDiagnostics } from '../../types';
import { VehicleBlueprint } from '../common/VehicleBlueprint';
import { 
  CheckCircle2, 
  Camera, 
  Upload, 
  Trash2, 
  Thermometer, 
  Wind, 
  Layers, 
  BatteryCharging, 
  AlertCircle, 
  Lock, 
  Play, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  FileCheck
} from 'lucide-react';

interface TechnicianDashboardProps {
  activeSubTab?: string;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ activeSubTab = 'queue' }) => {
  const { 
    currentUser, 
    jobCards, 
    vehicles, 
    users, 
    branches,
    startJob,
    addDamageMark,
    removeDamageMark,
    addIntakePhoto,
    removeIntakePhoto,
    updateDiagnostics,
    addAfterPhoto,
    removeAfterPhoto,
    completeJobByTechnician 
  } = useApp();

  // Filter jobs for current technician (or show all pearl jobs if demo)
  const myJobs = jobCards.filter(j => 
    !currentUser || currentUser.role !== 'TECHNICIAN' || j.assignedTechnicianId === currentUser.id
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    // Prefer in-progress or in-inspection job, else first
    const active = myJobs.find(j => j.status === 'IN_INSPECTION' || j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED');
    return active ? active.id : (myJobs[0]?.id || '');
  });

  const [workflowStep, setWorkflowStep] = useState<'intake' | 'diagnostics' | 'completion'>('intake');

  // Completion form state
  const [techSuggestions, setTechSuggestions] = useState('');
  const [complaintsFound, setComplaintsFound] = useState('');
  const [completionSuccess, setCompletionSuccess] = useState(false);

  const selectedJob = jobCards.find(j => j.id === selectedJobId);
  const currentVehicle = vehicles.find(v => v.id === selectedJob?.vehicleId);
  const currentCustomer = users.find(u => u.id === selectedJob?.customerId);
  const currentBranch = branches.find(b => b.id === selectedJob?.branchId);

  // Sync completion form if job already has data
  React.useEffect(() => {
    if (selectedJob) {
      setTechSuggestions(selectedJob.technicianSuggestions || '');
      setComplaintsFound(selectedJob.complaintsFound || '');
    }
  }, [selectedJobId]);

  // Intake Photo Slots Configuration (1 Fuel + 4 Exterior + 5 Before Details = 10 slots)
  const mandatoryIntakeSlots = [
    { key: 'fuel', label: '1. Fuel Meter & Dashboard Odometer', category: 'FUEL_METER' as const },
    { key: 'ext_fl', label: '2. Front-Left 45° Side Exterior', category: 'EXTERIOR_SIDE' as const },
    { key: 'ext_fr', label: '3. Front-Right 45° Side Exterior', category: 'EXTERIOR_SIDE' as const },
    { key: 'ext_rl', label: '4. Rear-Left Quarter Side Profile', category: 'EXTERIOR_SIDE' as const },
    { key: 'ext_rr', label: '5. Rear-Right Quarter Side Profile', category: 'EXTERIOR_SIDE' as const },
    { key: 'bef_paint', label: '6. Hood Swirl Marks & Clear-Coat Micro-Scratches', category: 'BEFORE_DETAIL' as const },
    { key: 'bef_rims', label: '7. Wheel Rims, Calipers & Brake Dust Ingress', category: 'BEFORE_DETAIL' as const },
    { key: 'bef_leather', label: '8. Interior Leather Seats & Stitching Condition', category: 'BEFORE_DETAIL' as const },
    { key: 'bef_engine', label: '9. Engine Bay & Desert Sand Intrusion Check', category: 'BEFORE_DETAIL' as const },
    { key: 'bef_glass', label: '10. Windshield Water Marks & Glass Etching', category: 'BEFORE_DETAIL' as const },
  ];

  // After Detailing Photo Slots Configuration (5 Mandatory slots)
  const mandatoryAfterSlots = [
    { key: 'aft_mirror', label: '1. High-Gloss Mirror Bonnet Reflection', category: 'AFTER_DETAIL' as const },
    { key: 'aft_bead', label: '2. Hydrophobic Ceramic Water Beading Demonstration', category: 'AFTER_DETAIL' as const },
    { key: 'aft_side', label: '3. Full Vehicle Side Deep Gloss Profile', category: 'AFTER_DETAIL' as const },
    { key: 'aft_interior', label: '4. Deep Cleaned & Nourished Leather Cabin', category: 'AFTER_DETAIL' as const },
    { key: 'aft_rims', label: '5. Restored & Ceramic Coated Wheel Barrels', category: 'AFTER_DETAIL' as const },
  ];

  // Helper to simulate capture with real detailing photography
  const handleSimulateCapture = (slotLabel: string, category: 'FUEL_METER' | 'EXTERIOR_SIDE' | 'BEFORE_DETAIL' | 'AFTER_DETAIL') => {
    if (!selectedJob) return;

    let sampleUrl = '/src/assets/images/detailing_before_intake_1790933847161.jpg';
    if (category === 'AFTER_DETAIL') {
      sampleUrl = '/src/assets/images/detailing_after_gloss_1790933858271.jpg';
    } else if (category === 'FUEL_METER' || slotLabel.includes('Side Profile')) {
      sampleUrl = '/src/assets/images/hero_detailing_luxury_1790933834692.jpg';
    }

    if (category === 'AFTER_DETAIL') {
      addAfterPhoto(selectedJob.id, {
        category,
        slotLabel,
        url: sampleUrl,
        uploadedBy: currentUser?.name || 'Technician',
        fileName: `${slotLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
      });
    } else {
      addIntakePhoto(selectedJob.id, {
        category,
        slotLabel,
        url: sampleUrl,
        uploadedBy: currentUser?.name || 'Technician',
        fileName: `${slotLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
      });
    }
  };

  const handleSimulateAllIntakeCaptures = () => {
    if (!selectedJob) return;
    mandatoryIntakeSlots.forEach((slot) => {
      handleSimulateCapture(slot.label, slot.category);
    });
  };

  const handleSimulateAllAfterCaptures = () => {
    if (!selectedJob) return;
    mandatoryAfterSlots.forEach((slot) => {
      handleSimulateCapture(slot.label, slot.category);
    });
  };

  const handleStartJob = () => {
    if (!selectedJob) return;
    startJob(selectedJob.id);
  };

  const handleCompleteJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    completeJobByTechnician({
      jobId: selectedJob.id,
      technicianSuggestions: techSuggestions,
      complaintsFound: complaintsFound,
      afterPhotos: selectedJob.afterPhotos,
    });

    setCompletionSuccess(true);
    setTimeout(() => setCompletionSuccess(false), 4000);
  };

  const intakeCount = selectedJob?.intakePhotos.length || 0;
  const afterCount = selectedJob?.afterPhotos.length || 0;
  const isLocked = selectedJob?.isLockedByTechnician;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Workshop Floor Persona */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Tech" className="w-full h-full rounded-lg object-cover" />
            ) : (
              'FT'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {currentUser?.name || 'Fahad Al-Marri'}
              </h2>
              <span className="text-[11px] font-medium text-slate-500">
                · {currentUser?.profession || 'Master Detailing Technician'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Workshop Floor Mobile Console · Bay Station #04 · {currentBranch?.name || 'The Pearl Branch'}
            </p>
          </div>
        </div>

        {/* Job selector pill for quick bay switching */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Bay Job:
          </span>
          <div className="flex items-center gap-1.5">
            {myJobs.map((j) => {
              const v = vehicles.find(x => x.id === j.vehicleId);
              const isSel = j.id === selectedJobId;
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setSelectedJobId(j.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0 ${
                    isSel
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-mono">{j.jobNumber}</span> · {v?.make}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* If no jobs assigned */}
      {!selectedJob ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">No active job cards found in your queue.</p>
          <p className="text-xs text-slate-400 mt-1">Please check with workshop admin for vehicle intake assignment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Job Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {selectedJob.jobNumber}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                    {selectedJob.status.replace('_', ' ')}
                  </span>
                  {isLocked && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked &amp; Submitted to Admin
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {currentVehicle?.year} {currentVehicle?.make} {currentVehicle?.model}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Package: <span className="font-semibold text-slate-800">{selectedJob.servicePackage}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedJob.status === 'ASSIGNED' && (
                  <button
                    type="button"
                    onClick={handleStartJob}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Accept &amp; Start Inspection</span>
                  </button>
                )}

                <div className="text-right text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Qatar Plate</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {currentVehicle?.plateNumber} ({currentVehicle?.plateType})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Vehicle & Client Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Client Name</span>
                <span className="font-semibold text-slate-900">{currentCustomer?.name}</span>
                <span className="text-[11px] text-slate-500 block truncate">{currentCustomer?.profession}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Customer QID</span>
                <span className="font-mono font-semibold text-slate-900">{currentCustomer?.qid}</span>
                <span className="text-[11px] text-slate-500 block font-mono">{currentCustomer?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Vehicle Colour</span>
                <span className="font-semibold text-slate-900">{currentVehicle?.color}</span>
                <span className="text-[11px] text-slate-500 block font-mono">VIN: {currentVehicle?.vinNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Intake Progress</span>
                <span className="font-bold text-blue-600">
                  {intakeCount}/10 Photos · {selectedJob.damageMarks.length} Damage Pins
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Est. Detailing: {selectedJob.estimatedHours} Hours
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Stage Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setWorkflowStep('intake')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                workflowStep === 'intake'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>1. Vehicle Intake &amp; Damage Map ({intakeCount}/10 Photos)</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkflowStep('diagnostics')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                workflowStep === 'diagnostics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span>2. Regional Qatar Diagnostics (AC &amp; Sand Check)</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkflowStep('completion')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                workflowStep === 'completion'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Completion &amp; After Photos ({afterCount}/5 Photos)</span>
            </button>
          </div>

          {/* STEP 1: INTAKE & DAMAGE BLUEPRINT */}
          {workflowStep === 'intake' && (
            <div className="space-y-6">
              
              {/* Interactive Vehicle Blueprint */}
              <VehicleBlueprint
                marks={selectedJob.damageMarks}
                onAddMark={isLocked ? undefined : (mark) => addDamageMark(selectedJob.id, mark)}
                onRemoveMark={isLocked ? undefined : (markId) => removeDamageMark(selectedJob.id, markId)}
                readOnly={isLocked}
              />

              {/* Mandatory Intake Photos (1 Fuel + 4 Sides + 5 Details = 10) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Mandatory Workshop Intake Photo Documentation (10 Mandatory Slots)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Qatar Auto Standard: 1 Fuel Meter, 4 Side Exterior Angles, and 5 Detailed Before-Repair points.
                    </p>
                  </div>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={handleSimulateAllIntakeCaptures}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulate Full Intake Inspection Photos (Demo)</span>
                    </button>
                  )}
                </div>

                {/* 10 Photo Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
                  {mandatoryIntakeSlots.map((slot) => {
                    const uploaded = selectedJob.intakePhotos.find(p => p.slotLabel === slot.label);
                    return (
                      <div
                        key={slot.key}
                        className={`group relative flex flex-col justify-between p-3 rounded-xl border text-xs transition-all ${
                          uploaded 
                            ? 'bg-slate-50/70 border-slate-200' 
                            : 'bg-white border-dashed border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="font-bold text-slate-900 line-clamp-1" title={slot.label}>
                              {slot.label}
                            </span>
                            {uploaded ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                                Uploaded
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                                Required
                              </span>
                            )}
                          </div>

                          {/* Image preview or upload placeholder */}
                          <div className="aspect-4/3 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
                            {uploaded ? (
                              <img
                                src={uploaded.url}
                                alt={uploaded.slotLabel}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="text-center p-3 text-slate-400">
                                <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                <span className="text-[11px] block">No photo taken</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Slot controls */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          {uploaded ? (
                            <>
                              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                                {uploaded.fileName || 'intake.jpg'}
                              </span>
                              {!isLocked && (
                                <button
                                  type="button"
                                  onClick={() => removeIntakePhoto(selectedJob.id, uploaded.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                  title="Delete photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            !isLocked && (
                              <button
                                type="button"
                                onClick={() => handleSimulateCapture(slot.label, slot.category)}
                                className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-md text-[11px] flex items-center justify-center gap-1 transition-colors"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Capture / Upload</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: REGIONAL QATAR DIAGNOSTICS */}
          {workflowStep === 'diagnostics' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Regional Climate &amp; Environmental Diagnostics (Qatar Standards)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed diagnostics for extreme ambient temperatures, fine desert sand ingestion, and clear-coat paint thickness.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. AC Cooling Performance */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">AC Cooling Performance</h4>
                      <p className="text-[11px] text-slate-500">Cabin vent digital probe reading</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vent Airflow Temperature (°C)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        disabled={isLocked}
                        value={selectedJob.diagnostics.acVentTempCelsius}
                        onChange={(e) => updateDiagnostics(selectedJob.id, { acVentTempCelsius: parseFloat(e.target.value) || 0 })}
                        className="w-24 h-10 px-3 text-sm font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-500">°C (Standard: 6.0°C – 10.0°C)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cabin Micro-Filter Status
                    </label>
                    <select
                      disabled={isLocked}
                      value={selectedJob.diagnostics.acFilterStatus}
                      onChange={(e) => updateDiagnostics(selectedJob.id, { acFilterStatus: e.target.value as any })}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="CLEAN">Clean / Factory Nominal</option>
                      <option value="SAND_CLOGGED">Desert Sand Clogged (Requires Service)</option>
                      <option value="REPLACED">Replaced with New OEM Filter</option>
                    </select>
                  </div>
                </div>

                {/* 2. Desert Dust & Sand Accumulation */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Desert Sand &amp; Dust Ingress</h4>
                      <p className="text-[11px] text-slate-500">Engine air intake &amp; underbody</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Intake Chamber Sand Level
                    </label>
                    <select
                      disabled={isLocked}
                      value={selectedJob.diagnostics.sandIntakeLevel}
                      onChange={(e) => updateDiagnostics(selectedJob.id, { sandIntakeLevel: e.target.value as any })}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="MINIMAL">Minimal (Normal City Driving)</option>
                      <option value="MODERATE">Moderate (Sealine / Dune Dust)</option>
                      <option value="SEVERE">Severe (Full Extraction Required)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chassis Undercarriage Salt/Sand
                    </label>
                    <select
                      disabled={isLocked}
                      value={selectedJob.diagnostics.undercarriageSaltSandStatus}
                      onChange={(e) => updateDiagnostics(selectedJob.id, { undercarriageSaltSandStatus: e.target.value as any })}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="CLEAR">Clear (Nominal)</option>
                      <option value="SURFACE_RESIDUE">Surface Coastal Salt &amp; Sand Residue</option>
                      <option value="HIGH_ACCUMULATION">High Accumulation (Requires Pressure Jet Wash)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Battery Voltage & Electrical Health */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Electrical &amp; Battery Test</h4>
                      <p className="text-[11px] text-slate-500">Heat load resistance test</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Resting Voltage (V)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        disabled={isLocked}
                        value={selectedJob.diagnostics.batteryVoltage}
                        onChange={(e) => updateDiagnostics(selectedJob.id, { batteryVoltage: parseFloat(e.target.value) || 0 })}
                        className="w-24 h-10 px-3 text-sm font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-500">Volts (Healthy: 12.4V – 12.8V)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold block mb-0.5">Summer Heat Advisory:</span>
                    Vehicles operating in Qatar summer ambient temperatures (&gt;45°C) require battery electrolyte and cooling fan inspection.
                  </div>
                </div>

              </div>

              {/* 4. Digital Ultrasonic Paint Depth Gauge (Microns) */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Digital Paint Depth Gauge Readings (Microns - µm)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Essential measurement before rotary compounding to avoid burning clear-coat
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Hood / Bonnet</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        disabled={isLocked}
                        value={selectedJob.diagnostics.paintDepthMicrons.hood}
                        onChange={(e) => updateDiagnostics(selectedJob.id, {
                          paintDepthMicrons: { ...selectedJob.diagnostics.paintDepthMicrons, hood: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full h-9 px-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md"
                      />
                      <span className="text-[10px] text-slate-400">µm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Roof</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        disabled={isLocked}
                        value={selectedJob.diagnostics.paintDepthMicrons.roof}
                        onChange={(e) => updateDiagnostics(selectedJob.id, {
                          paintDepthMicrons: { ...selectedJob.diagnostics.paintDepthMicrons, roof: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full h-9 px-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md"
                      />
                      <span className="text-[10px] text-slate-400">µm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Left Panels</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        disabled={isLocked}
                        value={selectedJob.diagnostics.paintDepthMicrons.leftSide}
                        onChange={(e) => updateDiagnostics(selectedJob.id, {
                          paintDepthMicrons: { ...selectedJob.diagnostics.paintDepthMicrons, leftSide: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full h-9 px-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md"
                      />
                      <span className="text-[10px] text-slate-400">µm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Right Panels</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        disabled={isLocked}
                        value={selectedJob.diagnostics.paintDepthMicrons.rightSide}
                        onChange={(e) => updateDiagnostics(selectedJob.id, {
                          paintDepthMicrons: { ...selectedJob.diagnostics.paintDepthMicrons, rightSide: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full h-9 px-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md"
                      />
                      <span className="text-[10px] text-slate-400">µm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Trunk Decklid</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        disabled={isLocked}
                        value={selectedJob.diagnostics.paintDepthMicrons.trunk}
                        onChange={(e) => updateDiagnostics(selectedJob.id, {
                          paintDepthMicrons: { ...selectedJob.diagnostics.paintDepthMicrons, trunk: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full h-9 px-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md"
                      />
                      <span className="text-[10px] text-slate-400">µm</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: COMPLETION & AFTER PHOTOS */}
          {workflowStep === 'completion' && (
            <form onSubmit={handleCompleteJob} className="space-y-6">
              
              {/* Mandatory 5 After Photos */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Mandatory "After Repair" Completion Photos (5 Slots)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showcase mirror reflection, hydrophobic water-bead tests, interior leather condition, and wheel ceramic finish.
                    </p>
                  </div>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={handleSimulateAllAfterCaptures}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulate 5 "After Detailing" Photos (Demo)</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
                  {mandatoryAfterSlots.map((slot) => {
                    const uploaded = selectedJob.afterPhotos.find(p => p.slotLabel === slot.label);
                    return (
                      <div
                        key={slot.key}
                        className={`group relative flex flex-col justify-between p-3 rounded-xl border text-xs transition-all ${
                          uploaded 
                            ? 'bg-emerald-50/20 border-emerald-200' 
                            : 'bg-white border-dashed border-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="font-bold text-slate-900 line-clamp-1" title={slot.label}>
                              {slot.label}
                            </span>
                            {uploaded ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                                Required
                              </span>
                            )}
                          </div>

                          <div className="aspect-4/3 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
                            {uploaded ? (
                              <img
                                src={uploaded.url}
                                alt={uploaded.slotLabel}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="text-center p-3 text-slate-400">
                                <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                <span className="text-[11px] block">No photo taken</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          {uploaded ? (
                            <>
                              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                                {uploaded.fileName || 'after.jpg'}
                              </span>
                              {!isLocked && (
                                <button
                                  type="button"
                                  onClick={() => removeAfterPhoto(selectedJob.id, uploaded.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                  title="Delete photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            !isLocked && (
                              <button
                                type="button"
                                onClick={() => handleSimulateCapture(slot.label, slot.category)}
                                className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-md text-[11px] flex items-center justify-center gap-1 transition-colors"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Upload Result</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technician Feedback & Suggestions Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Technician Workshop Notes &amp; Client Advice
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Technician Suggestions &amp; Maintenance Recommendations <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      disabled={isLocked}
                      value={techSuggestions}
                      onChange={(e) => setTechSuggestions(e.target.value)}
                      placeholder="e.g. Advise customer to wash vehicle using two-bucket method with grit guards. Reapply Graphene booster in 6 months to maintain hydrophobic contact angle."
                      className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Complaints / Issues Identified During Service
                    </label>
                    <textarea
                      rows={4}
                      disabled={isLocked}
                      value={complaintsFound}
                      onChange={(e) => setComplaintsFound(e.target.value)}
                      placeholder="e.g. Deep stone chip on passenger side door was filled with OEM code paint; slight clear-coat etching remains on glass due to mineral hardness."
                      className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {completionSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Job successfully completed and locked! Data has been pushed to the Admin Final Review &amp; WhatsApp Queue.</span>
                  </div>
                )}

                {/* Final Completion Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Once marked complete, the job record locks instantly and transfers to Admin for invoicing and WhatsApp dispatch.</span>
                  </div>

                  {!isLocked ? (
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600/30 cursor-pointer shrink-0"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Mark as Complete &amp; Lock Job</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg text-xs flex items-center gap-1.5 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Job Locked &amp; Submitted to Review</span>
                    </div>
                  )}
                </div>

              </div>

            </form>
          )}

        </div>
      )}
    </div>
  );
};
