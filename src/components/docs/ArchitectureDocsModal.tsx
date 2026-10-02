import React, { useState } from 'react';
import { Database, Layout, Globe, Code2, X, Copy, Check } from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'architecture' | 'api' | 'sample'>('schema');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const prismaSchemaCode = `// Q Planet - Relational Database Schema (Prisma ORM & PostgreSQL DDL)

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  ADMIN
  TECHNICIAN
  CUSTOMER
}

enum PlateType {
  PRIVATE
  COMMERCIAL
  DIPLOMATIC
  POLICE
}

enum JobStatus {
  ASSIGNED
  IN_INSPECTION
  IN_PROGRESS
  QUALITY_CHECK
  COMPLETED
  DELIVERED
}

enum DamageType {
  SCRATCH
  DENT
  PAINT_CHIP
  CRACK
  SWIRL_MARK
}

enum DamageSeverity {
  LOW
  MEDIUM
  SEVERE
}

enum PhotoCategory {
  FUEL_METER
  EXTERIOR_SIDE
  BEFORE_DETAIL
  AFTER_DETAIL
}

model Branch {
  id          String    @id @default(uuid())
  name        String
  code        String    @unique // e.g. "QP-PRL"
  city        String    // Doha, Lusail, The Pearl, Al Wakrah
  address     String
  phone       String
  managerName String
  crNumber    String    // Qatar Commercial Registration
  active      Boolean   @default(true)
  baysCount   Int       @default(6)
  createdAt   DateTime  @default(now())

  users       User[]
  jobCards    JobCard[]
  invoices    Invoice[]

  @@map("branches")
}

model User {
  id            String    @id @default(uuid())
  username      String    @unique
  passwordHash  String
  role          UserRole  @default(CUSTOMER)
  name          String
  qid           String    @unique // Qatar ID: 11 digits validation
  email         String    @unique
  phone         String    // +974 XXXXXXXX
  profession    String?
  avatarUrl     String?
  branchId      String?
  branch        Branch?   @relation(fields: [branchId], references: [id])
  createdAt     DateTime  @default(now())

  ownedVehicles Vehicle[]
  assignedJobs  JobCard[] @relation("TechnicianJobs")
  customerJobs  JobCard[] @relation("CustomerJobs")
  invoices      Invoice[]

  @@index([qid])
  @@index([role])
  @@map("users")
}

model Vehicle {
  id          String     @id @default(uuid())
  customerId  String
  customer    User       @relation(fields: [customerId], references: [id])
  make        String     // Extensible lookup
  model       String     // Extensible lookup
  year        Int
  color       String     // Extensible lookup
  plateNumber String     @unique // e.g. "524182"
  plateType   PlateType  @default(PRIVATE)
  vinNumber   String?
  createdAt   DateTime   @default(now())

  jobCards    JobCard[]

  @@index([plateNumber])
  @@map("vehicles")
}

model JobCard {
  id                     String      @id @default(uuid())
  jobNumber              String      @unique // e.g. "QP-2026-0842"
  branchId               String
  branch                 Branch      @relation(fields: [branchId], references: [id])
  customerId             String
  customer               User        @relation("CustomerJobs", fields: [customerId], references: [id])
  vehicleId              String
  vehicle                Vehicle     @relation(fields: [vehicleId], references: [id])
  assignedTechnicianId   String
  technician             User        @relation("TechnicianJobs", fields: [assignedTechnicianId], references: [id])
  status                 JobStatus   @default(ASSIGNED)
  
  servicePackage         String
  packagePriceQAR        Decimal     @db.Decimal(10, 2)
  estimatedHours         Int
  actualHours            Decimal?    @db.Decimal(4, 2)
  
  // Qatar Regional Diagnostics
  acVentTempCelsius      Decimal?    @db.Decimal(4, 1)
  acFilterStatus         String?     // CLEAN, SAND_CLOGGED, REPLACED
  sandIntakeLevel        String?     // MINIMAL, MODERATE, SEVERE
  batteryVoltage         Decimal?    @db.Decimal(4, 1)
  paintDepthHood         Int?        // Microns (µm)
  paintDepthRoof         Int?
  paintDepthSides        Int?
  
  // Floor Notes & Completion
  technicianSuggestions  String?     @db.Text
  complaintsFound        String?     @db.Text
  isLockedByTechnician   Boolean     @default(false)
  reviewedByAdmin        Boolean     @default(false)
  
  // Billing
  finalPriceQAR          Decimal     @db.Decimal(10, 2)
  discountQAR            Decimal     @default(0) @db.Decimal(10, 2)
  adminNotes             String?     @db.Text
  customerPasswordToken  String?

  createdAt              DateTime    @default(now())
  startedAt              DateTime?
  completedAt            DateTime?

  damageMarks            DamageMark[]
  photos                 MediaPhoto[]
  invoices               Invoice[]

  @@index([status])
  @@index([branchId])
  @@map("job_cards")
}

model DamageMark {
  id          String          @id @default(uuid())
  jobCardId   String
  jobCard     JobCard         @relation(fields: [jobCardId], references: [id], onDelete: Cascade)
  xPercent    Decimal         @db.Decimal(5, 2)
  yPercent    Decimal         @db.Decimal(5, 2)
  view        String          // top, sides, front_rear
  panel       String          // Hood, Front Bumper, Driver Door
  type        DamageType
  severity    DamageSeverity  @default(MEDIUM)
  notes       String?
  timestamp   DateTime        @default(now())

  @@map("damage_marks")
}

model MediaPhoto {
  id          String        @id @default(uuid())
  jobCardId   String
  jobCard     JobCard       @relation(fields: [jobCardId], references: [id], onDelete: Cascade)
  category    PhotoCategory
  slotLabel   String
  url         String
  uploadedBy  String
  capturedAt  DateTime      @default(now())

  @@map("media_photos")
}

model Invoice {
  id            String       @id @default(uuid())
  invoiceNumber String       @unique // e.g. "INV-QP-4091"
  jobCardId     String
  jobCard       JobCard      @relation(fields: [jobCardId], references: [id])
  branchId      String
  branch        Branch       @relation(fields: [branchId], references: [id])
  customerId    String
  customer      User         @relation(fields: [customerId], references: [id])
  date          DateTime     @default(now())
  subtotalQAR   Decimal      @db.Decimal(10, 2)
  discountQAR   Decimal      @default(0) @db.Decimal(10, 2)
  totalQAR      Decimal      @db.Decimal(10, 2)
  paymentStatus String       @default("PAID")
  paymentMethod String       @default("QATAR_PAY_NAPS")
  paidAt        DateTime?

  items         InvoiceItem[]

  @@map("invoices")
}

model InvoiceItem {
  id           String   @id @default(uuid())
  invoiceId    String
  invoice      Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description  String
  quantity     Int      @default(1)
  unitPriceQAR Decimal  @db.Decimal(10, 2)
  totalQAR     Decimal  @db.Decimal(10, 2)

  @@map("invoice_items")
}

model GlobalDropdownItem {
  id          String   @id @default(uuid())
  category    String   // VEHICLE_MAKE, VEHICLE_MODEL, VEHICLE_COLOR, PROFESSION, SERVICE_PACKAGE
  value       String
  label       String
  parentValue String?
  createdAt   DateTime @default(now())

  @@unique([category, value, parentValue])
  @@map("global_dropdown_items")
}`;

  const frontendArchitectureText = `Q Planet SaaS Component & State Architecture (React + Tailwind CSS)

├── src/
│   ├── main.tsx                         # Client application entry point
│   ├── index.css                        # Tailwind CSS v4, Plus Jakarta Sans, print styles
│   ├── types/
│   │   └── index.ts                     # Relational models, enums (QID, Roles, Diagnostics, JobCards)
│   ├── data/
│   │   └── mockData.ts                  # Qatar branch datasets (The Pearl, Lusail, Al Wakrah, Industrial Area)
│   ├── context/
│   │   └── AppContext.tsx               # State engine: Multi-tenant branch scope, auth, job workflow, WhatsApp link generator
│   └── components/
│       ├── auth/
│       │   └── LoginView.tsx            # Universal SSO portal with automated role routing (Admin / Tech / Customer)
│       ├── common/
│       │   ├── Navbar.tsx               # 3-Zone contract Top Bar, branch switcher & persona switcher
│       │   ├── ExtensibleSelect.tsx     # Reusable dynamic dropdown with '+' Add New dialog (updates global DB)
│       │   └── VehicleBlueprint.tsx     # Interactive SVG damage mapping canvas (Top, Sides, Front/Rear)
│       ├── admin/
│       │   └── AdminDashboard.tsx       # Branch management, live floor monitoring, 11-digit QID validation, WhatsApp automation
│       ├── technician/
│       │   └── TechnicianDashboard.tsx  # Mobile/tablet floor workflow (10 intake photos, Qatar diagnostics, 5 after photos)
│       ├── customer/
│       │   └── CustomerPortal.tsx       # Client portal with split Before & After slider, damage blueprint, printable tax invoice
│       └── docs/
│           └── ArchitectureDocsModal.tsx# Complete Database DDL, REST API endpoints, and Technical Architecture reference`;

  const apiEndpointsText = `Essential REST API Endpoints Specification:

1. Authentication & Role Routing
   POST /api/auth/login
     Body: { credential: string, passwordHash?: string }
     Desc: Authenticates by 11-digit Qatar ID (Customer), username (Tech), or email (Admin).
     Response: { token, user: { id, name, role, qid, branchId } }

2. Branch Management
   GET  /api/branches
   POST /api/branches/create
     Body: { name, code, city, address, phone, managerName, crNumber, baysCount }
   GET  /api/branches/:branchId/metrics
     Desc: Real-time bay occupancy, active technicians, and revenue.

3. Job Card Lifecycle
   POST /api/jobs/create
     Body: { customerName, customerProfession, customerPhone, customerQid, vehicleMake, vehicleModel, year, color, plateNumber, plateType, servicePackage, assignedTechnicianId, branchId }
     Desc: Validates 11-digit QID, creates/links vehicle and customer, dispatches to technician bay.
   GET  /api/jobs/branch/:branchId?status=ACTIVE
   GET  /api/jobs/:id

4. Technician Workshop Floor Workflow
   POST /api/technician/jobs/:id/start
     Desc: Technician accepts job and timestamps Bay start time.
   POST /api/technician/damage-marks
     Body: { jobCardId, xPercent, yPercent, view, panel, type, severity, notes }
   POST /api/technician/upload-photos
     Body: Multipart form (files) with { jobCardId, category: 'FUEL_METER'|'EXTERIOR_SIDE'|'BEFORE_DETAIL'|'AFTER_DETAIL', slotLabel }
   PUT  /api/technician/diagnostics/:jobId
     Body: { acVentTempCelsius, acFilterStatus, sandIntakeLevel, paintDepthMicrons, batteryVoltage }
   POST /api/technician/jobs/:id/complete
     Body: { technicianSuggestions, complaintsFound, afterPhotos }
     Desc: Locks job card from further technician edits; pushes to Admin review queue.

5. Admin Final Review & Automated WhatsApp Dispatch
   PUT  /api/admin/jobs/:id/finalize
     Body: { finalPriceQAR, discountQAR, adminNotes, invoiceItems }
     Desc: Generates official Tax Invoice and QR verification record.
   POST /api/admin/whatsapp-notify
     Body: { jobId }
     Response: { whatsappUrl, messageText, customerPhone, recipientQid, generatedPassword }

6. Dynamic Extensible Dropdowns (Global DB Registry)
   GET  /api/dropdowns?category=VEHICLE_MAKE
   POST /api/dropdowns/create
     Body: { category, value, label, parentValue }
     Desc: Extends global vehicle and profession registry on the fly.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Q Planet Architecture &amp; Database Specifications
              </h2>
              <p className="text-xs text-slate-500">
                Relational schema, Component hierarchy, and REST API specification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Relational Database Schema (Prisma/SQL)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>2. Frontend Architecture Tree</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. REST API Endpoints</span>
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs">
          
          <div className="flex justify-end pb-3">
            <button
              type="button"
              onClick={() => {
                const text = 
                  activeTab === 'schema' ? prismaSchemaCode :
                  activeTab === 'architecture' ? frontendArchitectureText :
                  apiEndpointsText;
                copyToClipboard(text, activeTab);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            >
              {copied === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Specification</span>
                </>
              )}
            </button>
          </div>

          {activeTab === 'schema' && (
            <pre className="whitespace-pre-wrap leading-relaxed text-emerald-300 font-mono">
              {prismaSchemaCode}
            </pre>
          )}

          {activeTab === 'architecture' && (
            <pre className="whitespace-pre-wrap leading-relaxed text-blue-300 font-mono">
              {frontendArchitectureText}
            </pre>
          )}

          {activeTab === 'api' && (
            <pre className="whitespace-pre-wrap leading-relaxed text-amber-200 font-mono">
              {apiEndpointsText}
            </pre>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Enterprise Q Planet Architecture Documentation · Qatar SaaS Platform</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
