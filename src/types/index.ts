export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  qid: string; // 11-digit Qatar ID (e.g. 29463401234)
  email: string;
  phone: string; // e.g. +974 5512 3456
  branchId?: string;
  profession?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: 'Doha' | 'Lusail' | 'The Pearl' | 'Al Wakrah' | 'Al Khor' | 'Al Rayyan';
  address: string;
  phone: string;
  managerName: string;
  crNumber: string; // Qatar Commercial Registration
  active: boolean;
  baysCount: number;
}

export type PlateType = 'PRIVATE' | 'COMMERCIAL' | 'DIPLOMATIC' | 'POLICE';

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string; // e.g. "524182"
  plateType: PlateType;
  vinNumber?: string;
}

export type DamageType = 'SCRATCH' | 'DENT' | 'PAINT_CHIP' | 'CRACK' | 'SWIRL_MARK';
export type DamageSeverity = 'LOW' | 'MEDIUM' | 'SEVERE';

export interface DamageMark {
  id: string;
  xPercent: number; // 0 - 100 for responsive SVG placement
  yPercent: number; // 0 - 100
  view: 'top' | 'front' | 'rear' | 'left' | 'right';
  panel: string; // e.g. "Hood", "Front Left Door", "Rear Bumper"
  type: DamageType;
  severity: DamageSeverity;
  notes: string;
  timestamp: string;
}

export type PhotoSlotCategory = 'FUEL_METER' | 'EXTERIOR_SIDE' | 'BEFORE_DETAIL' | 'AFTER_DETAIL';

export interface PhotoDocumentation {
  id: string;
  category: PhotoSlotCategory;
  slotLabel: string;
  url: string;
  capturedAt: string;
  uploadedBy: string;
  fileName?: string;
}

export interface RegionalDiagnostics {
  acVentTempCelsius: number; // Qatar heat: normal is 6°C - 10°C
  acFilterStatus: 'CLEAN' | 'SAND_CLOGGED' | 'REPLACED';
  sandIntakeLevel: 'MINIMAL' | 'MODERATE' | 'SEVERE';
  paintDepthMicrons: {
    hood: number;
    roof: number;
    leftSide: number;
    rightSide: number;
    trunk: number;
  };
  batteryVoltage: number; // e.g. 12.6V
  undercarriageSaltSandStatus: 'CLEAR' | 'SURFACE_RESIDUE' | 'HIGH_ACCUMULATION';
}

export type JobStatus = 
  | 'ASSIGNED' 
  | 'IN_INSPECTION' 
  | 'IN_PROGRESS' 
  | 'QUALITY_CHECK' 
  | 'COMPLETED' 
  | 'DELIVERED';

export interface JobCard {
  id: string;
  jobNumber: string; // e.g. "QP-2026-0842"
  branchId: string;
  customerId: string;
  vehicleId: string;
  assignedTechnicianId: string;
  status: JobStatus;
  servicePackage: string; // e.g. "9H Nano-Ceramic Coating + Interior Detail"
  packagePriceQAR: number;
  estimatedHours: number;
  actualHours?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  // Technician Intake & Inspection
  damageMarks: DamageMark[];
  intakePhotos: PhotoDocumentation[];
  diagnostics: RegionalDiagnostics;
  
  // Technician Completion
  afterPhotos: PhotoDocumentation[];
  technicianSuggestions: string;
  complaintsFound: string;
  technicianNotes?: string;
  
  // Admin Final Review & Billing
  finalPriceQAR: number;
  discountQAR: number;
  adminNotes?: string;
  isLockedByTechnician: boolean;
  reviewedByAdmin: boolean;
  customerPasswordGenerated: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceQAR: number;
  totalQAR: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-QP-4091"
  jobCardId: string;
  branchId: string;
  customerId: string;
  date: string;
  items: InvoiceItem[];
  subtotalQAR: number;
  discountQAR: number;
  totalQAR: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentMethod?: 'CASH' | 'DEBIT_CARD' | 'QATAR_PAY_NAPS' | 'BANK_TRANSFER';
  paidAt?: string;
}

export type GlobalDropdownCategory = 
  | 'VEHICLE_MAKE' 
  | 'VEHICLE_MODEL' 
  | 'VEHICLE_COLOR' 
  | 'PROFESSION' 
  | 'SERVICE_PACKAGE';

export interface GlobalDropdownItem {
  id: string;
  category: GlobalDropdownCategory;
  value: string;
  label: string;
  parentValue?: string; // e.g. Model belonging to a Make
}
