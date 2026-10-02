import React, { useState, useRef } from 'react';
import { DamageMark, DamageType, DamageSeverity } from '../../types';
import { Plus, Trash2, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VehicleBlueprintProps {
  marks: DamageMark[];
  onAddMark?: (mark: Omit<DamageMark, 'id' | 'timestamp'>) => void;
  onRemoveMark?: (markId: string) => void;
  readOnly?: boolean;
}

export const VehicleBlueprint: React.FC<VehicleBlueprintProps> = ({
  marks,
  onAddMark,
  onRemoveMark,
  readOnly = false,
}) => {
  const [activeView, setActiveView] = useState<'top' | 'sides' | 'front_rear'>('top');
  const [pendingCoords, setPendingCoords] = useState<{ xPercent: number; yPercent: number } | null>(null);
  const [selectedMark, setSelectedMark] = useState<DamageMark | null>(null);
  
  // Marker form state
  const [damageType, setDamageType] = useState<DamageType>('SCRATCH');
  const [severity, setSeverity] = useState<DamageSeverity>('MEDIUM');
  const [panelName, setPanelName] = useState('Hood / Bonnet');
  const [notes, setNotes] = useState('');

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !onAddMark) return;

    if (!svgContainerRef.current) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Approximate panel based on coordinates and active view
    let suggestedPanel = 'Chassis Surface';
    if (activeView === 'top') {
      if (y < 35) suggestedPanel = 'Hood / Front Bonnet';
      else if (y < 65) suggestedPanel = 'Roof & Sunroof Area';
      else suggestedPanel = 'Trunk & Rear Decklid';
    } else if (activeView === 'sides') {
      if (y < 50) suggestedPanel = 'Driver Side Front Door';
      else suggestedPanel = 'Passenger Side Rear Door';
    } else {
      if (y < 50) suggestedPanel = 'Front Bumper / Grille';
      else suggestedPanel = 'Rear Bumper Diffuser';
    }

    setPanelName(suggestedPanel);
    setPendingCoords({
      xPercent: Math.round(x * 10) / 10,
      yPercent: Math.round(y * 10) / 10,
    });
    setNotes('');
  };

  const handleSaveMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCoords || !onAddMark) return;

    onAddMark({
      xPercent: pendingCoords.xPercent,
      yPercent: pendingCoords.yPercent,
      view: activeView === 'sides' ? 'left' : activeView === 'front_rear' ? 'front' : 'top',
      panel: panelName,
      type: damageType,
      severity,
      notes: notes.trim() || 'Identified during intake detailing inspection',
    });

    setPendingCoords(null);
  };

  const getTypeBadge = (type: DamageType) => {
    switch (type) {
      case 'SCRATCH':
        return { label: 'Scratch', bg: 'bg-amber-100 text-amber-800 border-amber-300', symbol: 'S' };
      case 'DENT':
        return { label: 'Dent', bg: 'bg-rose-100 text-rose-800 border-rose-300', symbol: 'D' };
      case 'PAINT_CHIP':
        return { label: 'Stone Chip', bg: 'bg-blue-100 text-blue-800 border-blue-300', symbol: 'C' };
      case 'CRACK':
        return { label: 'Glass Crack', bg: 'bg-purple-100 text-purple-800 border-purple-300', symbol: 'W' };
      case 'SWIRL_MARK':
        return { label: 'Swirl Mark', bg: 'bg-slate-100 text-slate-800 border-slate-300', symbol: 'H' };
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Vehicle Damage &amp; Inspection Blueprint
            </h3>
            <span className="text-xs text-slate-500">
              · {marks.length} recorded {marks.length === 1 ? 'flaw' : 'flaws'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {readOnly 
              ? 'Official intake condition recorded by workshop technician prior to detailing'
              : 'Click directly on the vehicle diagram below to pin existing scratches, dents, or chips'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('top')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeView === 'top'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top View (Full Body)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('sides')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeView === 'sides'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side Profiles
          </button>
          <button
            type="button"
            onClick={() => setActiveView('front_rear')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeView === 'front_rear'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Front &amp; Rear Fascia
          </button>
        </div>
      </div>

      {/* Blueprint Visual Canvas */}
      <div className="p-4 bg-slate-50/30 flex flex-col items-center">
        <div
          ref={svgContainerRef}
          onClick={handleSvgClick}
          className={`relative w-full max-w-2xl bg-white border border-slate-200 rounded-lg p-6 shadow-2xs select-none ${
            readOnly ? 'cursor-default' : 'cursor-crosshair hover:border-blue-400'
          }`}
          style={{ minHeight: '340px' }}
        >
          {/* Subtle blueprint grid watermark */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-lg"
            style={{
              backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* SVG Vehicle Diagrams */}
          {activeView === 'top' && (
            <svg viewBox="0 0 400 600" className="w-full h-80 mx-auto text-slate-700">
              {/* Car Body Outer Shell */}
              <path
                d="M 130 50 
                   C 140 20, 260 20, 270 50 
                   C 290 80, 295 140, 290 200 
                   C 305 230, 310 320, 305 400 
                   C 300 480, 295 530, 280 560 
                   C 265 580, 135 580, 120 560 
                   C 105 530, 100 480, 95 400 
                   C 90 320, 95 230, 110 200 
                   C 105 140, 110 80, 130 50 Z"
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="2.5"
              />

              {/* Front Windshield */}
              <path
                d="M 135 170 C 150 145, 250 145, 265 170 C 275 220, 275 220, 270 230 C 255 240, 145 240, 130 230 C 125 220, 125 220, 135 170 Z"
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />

              {/* Roof Area */}
              <rect x="135" y="245" width="130" height="150" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />

              {/* Sunroof */}
              <rect x="155" y="260" width="90" height="70" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

              {/* Rear Windshield */}
              <path
                d="M 135 410 C 145 400, 255 400, 265 410 C 270 440, 260 460, 255 470 C 245 475, 155 475, 145 470 C 140 460, 130 440, 135 410 Z"
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />

              {/* Side Mirrors */}
              <path d="M 98 185 C 80 185, 80 205, 95 208 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
              <path d="M 302 185 C 320 185, 320 205, 305 208 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />

              {/* Hood Lines */}
              <path d="M 155 70 C 158 110, 155 140, 150 155" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M 245 70 C 242 110, 245 140, 250 155" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Headlights */}
              <path d="M 130 60 C 140 50, 160 55, 160 65 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 270 60 C 260 50, 240 55, 240 65 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

              {/* Taillights */}
              <path d="M 125 550 C 135 565, 165 565, 165 555 Z" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1.5" />
              <path d="M 275 550 C 265 565, 235 565, 235 555 Z" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1.5" />

              {/* Section Labels */}
              <text x="200" y="115" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">HOOD / BONNET</text>
              <text x="200" y="325" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">ROOF</text>
              <text x="200" y="515" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">TRUNK</text>
              <text x="60" y="320" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="500">LEFT</text>
              <text x="340" y="320" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="500">RIGHT</text>
            </svg>
          )}

          {activeView === 'sides' && (
            <svg viewBox="0 0 600 320" className="w-full h-80 mx-auto text-slate-700">
              {/* Driver Side View */}
              <g transform="translate(20, 20)">
                <text x="280" y="20" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700">LEFT PROFILE (DRIVER SIDE)</text>
                <path
                  d="M 50 110 
                     C 80 110, 110 80, 180 75 
                     C 220 70, 320 70, 380 80 
                     C 440 90, 480 95, 520 110 
                     C 530 115, 530 135, 510 140 
                     C 480 140, 480 140, 460 140 
                     C 450 120, 410 120, 400 140 
                     L 160 140 
                     C 150 120, 110 120, 100 140 
                     L 40 140 
                     C 30 135, 30 115, 50 110 Z"
                  fill="#f8fafc"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                {/* Windows */}
                <path d="M 180 82 L 270 82 L 270 110 L 170 110 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 278 82 L 365 85 L 355 110 L 278 110 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                {/* Wheels */}
                <circle cx="130" cy="140" r="22" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="130" cy="140" r="10" fill="#e2e8f0" />
                <circle cx="430" cy="140" r="22" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="430" cy="140" r="10" fill="#e2e8f0" />
              </g>

              {/* Passenger Side View */}
              <g transform="translate(20, 160)">
                <text x="280" y="20" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700">RIGHT PROFILE (PASSENGER SIDE)</text>
                <path
                  d="M 520 110 
                     C 490 110, 460 80, 390 75 
                     C 350 70, 250 70, 190 80 
                     C 130 90, 90 95, 50 110 
                     C 40 115, 40 135, 60 140 
                     C 90 140, 90 140, 110 140 
                     C 120 120, 160 120, 170 140 
                     L 410 140 
                     C 420 120, 460 120, 470 140 
                     L 530 140 
                     C 540 135, 540 115, 520 110 Z"
                  fill="#f8fafc"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                {/* Windows */}
                <path d="M 390 82 L 300 82 L 300 110 L 400 110 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 292 82 L 205 85 L 215 110 L 292 110 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                {/* Wheels */}
                <circle cx="440" cy="140" r="22" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="440" cy="140" r="10" fill="#e2e8f0" />
                <circle cx="140" cy="140" r="22" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="140" cy="140" r="10" fill="#e2e8f0" />
              </g>
            </svg>
          )}

          {activeView === 'front_rear' && (
            <div className="grid grid-cols-2 gap-4 h-80 items-center">
              {/* Front Fascia */}
              <div className="text-center">
                <p className="text-xs font-bold text-slate-600 mb-2">FRONT FASCIA &amp; GRILLE</p>
                <svg viewBox="0 0 240 180" className="w-full h-56 mx-auto">
                  <path d="M 40 60 C 70 30, 170 30, 200 60 C 220 80, 220 130, 210 145 C 190 155, 50 155, 30 145 C 20 130, 20 80, 40 60 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                  <path d="M 50 70 C 80 50, 160 50, 190 70 L 180 90 L 60 90 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="70" y="105" width="100" height="30" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
                  <rect x="85" y="112" width="70" height="15" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                  <text x="120" y="123" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">QATAR 524182</text>
                  <circle cx="45" cy="85" r="10" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
                  <circle cx="195" cy="85" r="10" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
                </svg>
              </div>

              {/* Rear Fascia */}
              <div className="text-center">
                <p className="text-xs font-bold text-slate-600 mb-2">REAR BUMPER &amp; DIFFUSER</p>
                <svg viewBox="0 0 240 180" className="w-full h-56 mx-auto">
                  <path d="M 40 50 C 70 40, 170 40, 200 50 C 220 70, 220 130, 210 145 C 190 155, 50 155, 30 145 C 20 130, 20 70, 40 50 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                  <path d="M 60 60 C 80 55, 160 55, 180 60 L 175 80 L 65 80 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="70" y="100" width="100" height="30" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="85" y="108" width="70" height="15" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                  <text x="120" y="119" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">QATAR 524182</text>
                  <path d="M 35 75 C 50 75, 55 90, 40 90 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1" />
                  <path d="M 205 75 C 190 75, 185 90, 200 90 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1" />
                </svg>
              </div>
            </div>
          )}

          {/* Render Active Damage Markers */}
          {marks.map((mark) => {
            const badge = getTypeBadge(mark.type);
            return (
              <button
                key={mark.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMark(mark);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md border transition-transform hover:scale-125 focus:outline-none ${badge.bg}`}
                style={{
                  left: `${mark.xPercent}%`,
                  top: `${mark.yPercent}%`,
                }}
                title={`${badge.label}: ${mark.panel} - ${mark.notes}`}
              >
                {badge.symbol}
              </button>
            );
          })}

          {/* Pending Placement Ripple */}
          {pendingCoords && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600/20 border-2 border-blue-600 animate-ping pointer-events-none"
              style={{
                left: `${pendingCoords.xPercent}%`,
                top: `${pendingCoords.yPercent}%`,
              }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-[10px] font-bold">S</span>
            <span>Scratch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center text-[10px] font-bold">D</span>
            <span>Dent / Ding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center text-[10px] font-bold">C</span>
            <span>Stone Chip</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center justify-center text-[10px] font-bold">W</span>
            <span>Glass Crack</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center text-[10px] font-bold">H</span>
            <span>Swirl Hologram</span>
          </div>
        </div>
      </div>

      {/* Detail List & Actions */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <h4 className="text-xs font-bold text-slate-700 mb-2">
          Recorded Inspection Points ({marks.length})
        </h4>

        {marks.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            No existing damage marks logged. {readOnly ? 'Vehicle surface was intact at intake.' : 'Click on the car diagram above to record any body flaw.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {marks.map((mark) => {
              const badge = getTypeBadge(mark.type);
              return (
                <div
                  key={mark.id}
                  className="flex items-start justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border ${badge.bg}`}>
                      {badge.symbol}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{mark.panel}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[11px] font-medium text-slate-600">{badge.label}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5 text-[11px]">{mark.notes}</p>
                    </div>
                  </div>

                  {!readOnly && onRemoveMark && (
                    <button
                      type="button"
                      onClick={() => onRemoveMark(mark.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-200/50 transition-colors shrink-0"
                      title="Remove mark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Mark Popover Modal */}
      {pendingCoords && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Log Body Damage Point
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pin at ({pendingCoords.xPercent}%, {pendingCoords.yPercent}%)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingCoords(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMark} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identified Panel Area <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  placeholder="e.g. Hood / Bonnet, Driver Door, Front Bumper"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Damage Type
                  </label>
                  <select
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value as DamageType)}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="SCRATCH">Surface Scratch</option>
                    <option value="DENT">Body Dent / Ding</option>
                    <option value="PAINT_CHIP">Stone Chip / Flake</option>
                    <option value="CRACK">Glass / Lens Crack</option>
                    <option value="SWIRL_MARK">Swirl / Hologram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as DamageSeverity)}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="LOW">Low (Clear coat only)</option>
                    <option value="MEDIUM">Medium (Visible depth)</option>
                    <option value="SEVERE">Severe (Primer / Bare metal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspection Observation &amp; Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 3cm key scratch, does not catch fingernail, polishable during stage 2 compounding"
                  className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPendingCoords(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Confirm &amp; Place Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Mark Detail Modal (for readOnly inspection view) */}
      {selectedMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                Inspection Point Inspection
              </span>
              <button
                type="button"
                onClick={() => setSelectedMark(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Panel Location:</span>
                <span className="font-bold text-slate-900">{selectedMark.panel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Damage Classification:</span>
                <span className="font-semibold text-slate-800">{selectedMark.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity:</span>
                <span className="font-semibold text-slate-800">{selectedMark.severity}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Technician Notes:</span>
                <p className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-700">
                  {selectedMark.notes}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMark(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100"
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
