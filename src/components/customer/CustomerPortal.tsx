import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleBlueprint } from '../common/VehicleBlueprint';
import { 
  CheckCircle2, 
  Printer, 
  FileText, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Building2, 
  SlidersHorizontal, 
  Sparkles, 
  Thermometer, 
  Wind,
  Layers,
  Calendar,
  CreditCard
} from 'lucide-react';

interface CustomerPortalProps {
  activeSubTab?: string;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ activeSubTab = 'status' }) => {
  const { currentUser, jobCards, vehicles, branches, invoices } = useApp();

  // Find customer's job
  const myJob = jobCards.find(j => j.customerId === currentUser?.id) || jobCards[0];
  const myVehicle = vehicles.find(v => v.id === myJob?.vehicleId);
  const myBranch = branches.find(b => b.id === myJob?.branchId);
  const myInvoice = invoices.find(inv => inv.jobCardId === myJob?.id) || invoices[0];

  const [activeView, setActiveView] = useState<'status' | 'blueprint' | 'comparison' | 'invoice'>(
    (activeSubTab as any) || 'status'
  );

  // Before & After comparison slider state (0 to 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Sample before and after images
  const beforePhoto = myJob?.intakePhotos[0]?.url || '/src/assets/images/detailing_before_intake_1790933847161.jpg';
  const afterPhoto = myJob?.afterPhotos[0]?.url || '/src/assets/images/detailing_after_gloss_1790933858271.jpg';

  const handlePrintInvoice = () => {
    window.print();
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 1;
      case 'IN_INSPECTION': return 2;
      case 'IN_PROGRESS': return 3;
      case 'QUALITY_CHECK': return 4;
      case 'COMPLETED':
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  const currentStep = getStatusStep(myJob?.status || 'ASSIGNED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Customer Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              Client Portal
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">
              QID: {currentUser?.qid || '29463401234'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome, {currentUser?.name || 'Khalid Al-Sulaiti'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Service Report for <span className="font-semibold text-slate-800">{myVehicle?.year} {myVehicle?.make} {myVehicle?.model}</span> (Plate: {myVehicle?.plateNumber})
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('status')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeView === 'status' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveView('comparison')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeView === 'comparison' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Before &amp; After
          </button>
          <button
            type="button"
            onClick={() => setActiveView('blueprint')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeView === 'blueprint' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Damage Map
          </button>
          <button
            type="button"
            onClick={() => setActiveView('invoice')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeView === 'invoice' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Digital Invoice
          </button>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW & STATUS TIMELINE */}
      {activeView === 'status' && (
        <div className="space-y-6 no-print">
          
          {/* Real-Time Live Status Tracker */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Detailing Progression</h3>
                <p className="text-xs text-slate-500 mt-0.5">Job Reference: <span className="font-mono font-semibold">{myJob?.jobNumber}</span></p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {myJob?.status === 'COMPLETED' || myJob?.status === 'DELIVERED' ? 'Ready for Delivery / Inspection' : 'Service in Progress'}
              </span>
            </div>

            {/* Stepper Bar */}
            <div className="mt-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />

              <div className="relative z-10 flex justify-between">
                {[
                  { step: 1, label: 'Intake Accepted', desc: 'Registered in Bay' },
                  { step: 2, label: 'Body Inspection', desc: 'Blueprint & Photos' },
                  { step: 3, label: 'Precision Detailing', desc: 'Compound & Polish' },
                  { step: 4, label: 'Quality Verification', desc: 'Paint & Gloss Audit' },
                  { step: 5, label: 'Ready for Pickup', desc: 'Finalized & Cleaned' },
                ].map((s) => {
                  const isDone = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center text-center max-w-[100px]">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'bg-white border-2 border-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                      </div>
                      <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-blue-600' : 'text-slate-800'}`}>
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                        {s.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch Concierge Location Box */}
            <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">{myBranch?.name}</span>
                  <span className="text-slate-500">{myBranch?.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Workshop Concierge</span>
                  <span className="text-slate-500">{myBranch?.phone} (Direct WhatsApp)</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">5-Year Ceramic Warranty</span>
                  <span className="text-slate-500">Includes complimentary 6-month inspection booster</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Advice & Regional Diagnostics Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Technician Advice */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Technician Maintenance Advice for Qatar Conditions
                </h3>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {myJob?.technicianSuggestions || 
                  '• Apply Graphene ceramic booster spray every 6 months to sustain 110° hydrophobic contact angle.\n' +
                  '• Avoid automatic gas-station roller brush washes; use touchless pH-neutral shampoo only.\n' +
                  '• Cabin AC micro-filter inspected and cleaned to resist desert sand ingestion.'}
              </div>
              {myJob?.complaintsFound && (
                <div className="text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Workshop Observations Handled:</span>
                  <p className="text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {myJob.complaintsFound}
                  </p>
                </div>
              )}
            </div>

            {/* Qatar Environmental Diagnostic Readouts */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Vehicle Environmental Diagnostics
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">AC Vent Airflow Temp</span>
                  <span className="text-base font-bold font-mono text-blue-600">
                    {myJob?.diagnostics.acVentTempCelsius || 7.2}°C
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Optimal Cooling</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">Desert Sand Ingress</span>
                  <span className="text-base font-bold text-slate-900">
                    {myJob?.diagnostics.sandIntakeLevel || 'MINIMAL'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Intake Cleaned</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">Average Paint Depth</span>
                  <span className="text-base font-bold font-mono text-purple-600">
                    {myJob?.diagnostics.paintDepthMicrons.hood || 118} µm
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Factory Clear-Coat Safe</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-medium">Battery Voltage</span>
                  <span className="text-base font-bold font-mono text-emerald-600">
                    {myJob?.diagnostics.batteryVoltage || 12.6} V
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Healthy Resting Level</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: INTERACTIVE BEFORE & AFTER COMPARISON */}
      {activeView === 'comparison' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-6 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Before &amp; After Detailing Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag the interactive slider below to inspect swirl removal and ceramic mirror reflection.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              High-Resolution Detailing Inspection
            </span>
          </div>

          {/* Interactive Split View Slider */}
          <div className="relative w-full max-w-4xl mx-auto aspect-16/9 bg-slate-900 rounded-xl overflow-hidden select-none shadow-md">
            {/* After Image (Full background) */}
            <img
              src={afterPhoto}
              alt="After Detailing Finish"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-emerald-600/90 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-xs pointer-events-none">
              AFTER: 9H Mirror Ceramic Finish
            </div>

            {/* Before Image (Clipped by slider position) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforePhoto}
                alt="Before Detailing Condition"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-xs pointer-events-none">
                BEFORE: Desert Dust &amp; Swirl Marks
              </div>
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-slate-700 shadow-md flex items-center justify-center">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-800" />
              </div>
            </div>

            {/* Invisible Range Input for Draggable Scrubbing */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              aria-label="Before and after comparison slider"
            />
          </div>

          <div className="text-center text-xs text-slate-500">
            Slide horizontally across the image to reveal 100% paint correction and high-gloss water repellency.
          </div>

          {/* Before & After Photo Gallery */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-3">All Intake vs. Completion Documentation Photos</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {myJob?.intakePhotos.slice(0, 4).map((p) => (
                <div key={p.id} className="group relative rounded-lg overflow-hidden border border-slate-200">
                  <img src={p.url} alt={p.slotLabel} className="aspect-4/3 w-full object-cover" />
                  <div className="p-2 bg-white text-[11px]">
                    <span className="font-bold text-slate-800 block truncate">{p.slotLabel}</span>
                    <span className="text-slate-400">Intake Inspection</span>
                  </div>
                </div>
              ))}
              {myJob?.afterPhotos.slice(0, 4).map((p) => (
                <div key={p.id} className="group relative rounded-lg overflow-hidden border border-emerald-200">
                  <img src={p.url} alt={p.slotLabel} className="aspect-4/3 w-full object-cover" />
                  <div className="p-2 bg-emerald-50/50 text-[11px]">
                    <span className="font-bold text-emerald-900 block truncate">{p.slotLabel}</span>
                    <span className="text-emerald-700 font-semibold">After Detailing</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: DAMAGE BLUEPRINT MAP */}
      {activeView === 'blueprint' && (
        <div className="space-y-4 no-print">
          <VehicleBlueprint marks={myJob?.damageMarks || []} readOnly={true} />
        </div>
      )}

      {/* VIEW 4: DIGITAL QATAR TAX INVOICE */}
      {activeView === 'invoice' && (
        <div className="space-y-4">
          
          {/* Print Action Bar */}
          <div className="flex items-center justify-between no-print">
            <p className="text-xs text-slate-500">
              Official Digital Tax Invoice issued by Q Planet Car Care W.L.L. (State of Qatar)
            </p>
            <button
              type="button"
              onClick={handlePrintInvoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Print Official Invoice / Save PDF</span>
            </button>
          </div>

          {/* Printable Invoice Container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm max-w-3xl mx-auto print:border-none print:shadow-none print:p-0">
            
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-8 border-b border-slate-200 gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Q PLANET</h1>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                  Automotive Detailing &amp; Ceramic Technology W.L.L.
                </p>
                <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                  <p>{myBranch?.name}</p>
                  <p>{myBranch?.address}</p>
                  <p>State of Qatar · Tel: {myBranch?.phone}</p>
                  <p className="font-mono text-slate-500">CR No: {myBranch?.crNumber}</p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs font-bold px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wide inline-block mb-2">
                  TAX INVOICE / PAID
                </span>
                <p className="text-sm font-bold font-mono text-slate-900">
                  {myInvoice?.invoiceNumber || 'INV-QP-4091'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Date: {myInvoice?.date || '2026-03-28'}</p>
                <p className="text-xs text-slate-500 font-mono">Job Ref: {myJob?.jobNumber}</p>
              </div>
            </div>

            {/* Bill To & Vehicle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Bill To Client</span>
                <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-slate-600">{currentUser?.profession}</p>
                <p className="font-mono text-slate-600 mt-0.5">Qatar ID: {currentUser?.qid}</p>
                <p className="font-mono text-slate-600">Mobile: {currentUser?.phone}</p>
              </div>

              <div className="sm:text-right">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Vehicle Specification</span>
                <p className="text-sm font-bold text-slate-900">{myVehicle?.year} {myVehicle?.make} {myVehicle?.model}</p>
                <p className="text-slate-600">Colour: {myVehicle?.color}</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  Qatar Plate: {myVehicle?.plateNumber} ({myVehicle?.plateType})
                </p>
                <p className="font-mono text-slate-400 text-[11px]">VIN: {myVehicle?.vinNumber || 'WP0AB2A99PS129481'}</p>
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="py-6">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px]">
                    <th className="py-2.5">Service Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price (QAR)</th>
                    <th className="py-2.5 text-right">Total (QAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myInvoice?.items.map((item) => (
                    <tr key={item.id} className="text-slate-800">
                      <td className="py-3 font-medium">{item.description}</td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono tabular-nums">{item.unitPriceQAR.toLocaleString()}</td>
                      <td className="py-3 text-right font-bold font-mono tabular-nums">{item.totalQAR.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-xs">
              <div className="space-y-1 text-slate-500 max-w-sm">
                <p className="font-semibold text-slate-800">Payment Information:</p>
                <p>Settled via Qatar Central Bank NAPS Gateway · Card Auth Code #840921</p>
                <p className="text-[11px]">All detailing coatings backed by Q Planet 5-Year Nationwide Warranty.</p>
              </div>

              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium tabular-nums">{myInvoice?.subtotalQAR.toLocaleString()} QAR</span>
                </div>
                {myInvoice?.discountQAR > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Loyalty Courtesy Discount:</span>
                    <span className="font-mono tabular-nums">-{myInvoice.discountQAR.toLocaleString()} QAR</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Applicable Qatar Tax / VAT:</span>
                  <span className="font-mono">0.00 QAR (0%)</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-blue-600 tabular-nums">{myInvoice?.totalQAR.toLocaleString()} QAR</span>
                </div>
              </div>
            </div>

            {/* Official Stamp & QR Code representation */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex items-center justify-center p-1 text-[8px] font-mono text-center">
                  [QATAR TAX DIGITAL QR]
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Electronically Verified Tax Document</p>
                  <p>Ministry of Commerce &amp; Industry (State of Qatar)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">Q Planet Auto Care W.L.L.</p>
                <p>Authorized Quality Seal</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
