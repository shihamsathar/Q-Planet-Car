import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Branch, 
  Vehicle, 
  JobCard, 
  Invoice, 
  GlobalDropdownItem, 
  GlobalDropdownCategory,
  UserRole,
  DamageMark,
  PhotoDocumentation,
  RegionalDiagnostics,
  InvoiceItem
} from '../types';
import { 
  initialBranches, 
  initialUsers, 
  initialVehicles, 
  initialJobCards, 
  initialInvoices, 
  initialDropdownItems 
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  currentBranchId: string; // 'ALL' or branch id
  branches: Branch[];
  users: User[];
  vehicles: Vehicle[];
  jobCards: JobCard[];
  invoices: Invoice[];
  dropdownItems: GlobalDropdownItem[];
  
  // Auth
  login: (credential: string, password?: string) => { success: boolean; message?: string; role?: UserRole };
  logout: () => void;
  switchPersona: (role: UserRole, specificUserId?: string) => void;
  
  // Branch Management
  setCurrentBranchId: (id: string) => void;
  addBranch: (branch: Omit<Branch, 'id' | 'crNumber' | 'active'> & { crNumber?: string }) => void;
  
  // User Management
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  
  // Vehicle Management
  addVehicle: (vehicleData: Omit<Vehicle, 'id'>) => Vehicle;
  
  // Job Card Operations
  createJobCard: (params: {
    customerName: string;
    customerProfession: string;
    customerPhone: string;
    customerQid: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehicleColor: string;
    plateNumber: string;
    plateType: any;
    servicePackage: string;
    packagePriceQAR: number;
    assignedTechnicianId: string;
    branchId: string;
    estimatedHours: number;
  }) => JobCard;
  
  updateJobCard: (jobId: string, updates: Partial<JobCard>) => void;
  startJob: (jobId: string) => void;
  addDamageMark: (jobId: string, mark: Omit<DamageMark, 'id' | 'timestamp'>) => void;
  removeDamageMark: (jobId: string, markId: string) => void;
  addIntakePhoto: (jobId: string, photo: Omit<PhotoDocumentation, 'id' | 'capturedAt'>) => void;
  removeIntakePhoto: (jobId: string, photoId: string) => void;
  updateDiagnostics: (jobId: string, diagnostics: Partial<RegionalDiagnostics>) => void;
  addAfterPhoto: (jobId: string, photo: Omit<PhotoDocumentation, 'id' | 'capturedAt'>) => void;
  removeAfterPhoto: (jobId: string, photoId: string) => void;
  
  // Floor Technician Completion
  completeJobByTechnician: (params: {
    jobId: string;
    technicianSuggestions: string;
    complaintsFound: string;
    afterPhotos: PhotoDocumentation[];
  }) => void;
  
  // Admin Review & WhatsApp
  finalizeJobAndInvoice: (params: {
    jobId: string;
    finalPriceQAR: number;
    discountQAR: number;
    adminNotes?: string;
    invoiceItems: Omit<InvoiceItem, 'id'>[];
  }) => Invoice;
  
  generateWhatsAppLink: (jobId: string) => {
    url: string;
    messageText: string;
    phone: string;
    customerName: string;
  };
  
  // Extensible Dropdowns (Add New)
  addDropdownItem: (category: GlobalDropdownCategory, value: string, label?: string, parentValue?: string) => void;
  getDropdownItems: (category: GlobalDropdownCategory, parentValue?: string) => GlobalDropdownItem[];
  
  // Reset demo data
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'qplanet_car_care_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage fallback
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default to admin for immediate exploration
    return initialUsers[0];
  });

  const [currentBranchId, setCurrentBranchId] = useState<string>('ALL');

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_branches`);
    return saved ? JSON.parse(saved) : initialBranches;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_jobCards`);
    return saved ? JSON.parse(saved) : initialJobCards;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [dropdownItems, setDropdownItems] = useState<GlobalDropdownItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dropdownItems`);
    return saved ? JSON.parse(saved) : initialDropdownItems;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_jobCards`, JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dropdownItems`, JSON.stringify(dropdownItems));
  }, [dropdownItems]);

  // Login handler
  const login = (credential: string, _password?: string) => {
    const cleanCred = credential.trim();
    if (!cleanCred) {
      return { success: false, message: 'Please enter your Qatar ID, username, or email.' };
    }
    const normalizedDigits = cleanCred.replace(/[^0-9]/g, '');

    // Try matching username, QID, email, or phone number
    const matched = users.find(u => {
      const uDigits = u.qid.replace(/[^0-9]/g, '');
      const uPhoneDigits = u.phone.replace(/[^0-9]/g, '');

      return (
        u.username.toLowerCase() === cleanCred.toLowerCase() ||
        u.email.toLowerCase() === cleanCred.toLowerCase() ||
        u.qid === cleanCred ||
        (normalizedDigits.length >= 8 && uDigits === normalizedDigits) ||
        (normalizedDigits.length >= 8 && uPhoneDigits.endsWith(normalizedDigits))
      );
    });

    if (matched) {
      setCurrentUser(matched);
      return { success: true, role: matched.role };
    }

    return { 
      success: false, 
      message: 'Invalid credentials. Enter your registered Qatar ID (QID), Technician ID, or Admin Email.' 
    };
  };

  const logout = () => {
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    setCurrentUser(null);
  };

  const switchPersona = (role: UserRole, specificUserId?: string) => {
    if (specificUserId) {
      const u = users.find(x => x.id === specificUserId);
      if (u) {
        setCurrentUser(u);
        return;
      }
    }
    const candidate = users.find(u => u.role === role);
    if (candidate) {
      setCurrentUser(candidate);
    }
  };

  const addBranch = (branchData: Omit<Branch, 'id' | 'crNumber' | 'active'> & { crNumber?: string }) => {
    const newBranch: Branch = {
      id: `br-${Date.now()}`,
      name: branchData.name,
      code: branchData.code.toUpperCase(),
      city: branchData.city,
      address: branchData.address,
      phone: branchData.phone,
      managerName: branchData.managerName,
      crNumber: branchData.crNumber || `CR-104928/0${branches.length + 1}`,
      active: true,
      baysCount: branchData.baysCount || 6,
    };
    setBranches(prev => [...prev, newBranch]);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  const createJobCard = (params: {
    customerName: string;
    customerProfession: string;
    customerPhone: string;
    customerQid: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehicleColor: string;
    plateNumber: string;
    plateType: any;
    servicePackage: string;
    packagePriceQAR: number;
    assignedTechnicianId: string;
    branchId: string;
    estimatedHours: number;
  }): JobCard => {
    // 1. Find or create customer
    let customer = users.find(u => u.qid === params.customerQid);
    if (!customer) {
      customer = {
        id: `usr-cust-${Date.now()}`,
        username: params.customerQid, // QID is username
        name: params.customerName,
        role: 'CUSTOMER',
        qid: params.customerQid,
        email: `${params.customerName.toLowerCase().replace(/\s+/g, '.')}@client.qplanet.qa`,
        phone: params.customerPhone,
        branchId: params.branchId,
        profession: params.customerProfession,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, customer!]);
    }

    // 2. Find or create vehicle
    let vehicle = vehicles.find(v => v.plateNumber === params.plateNumber);
    if (!vehicle) {
      vehicle = {
        id: `veh-${Date.now()}`,
        customerId: customer.id,
        make: params.vehicleMake,
        model: params.vehicleModel,
        year: params.vehicleYear,
        color: params.vehicleColor,
        plateNumber: params.plateNumber,
        plateType: params.plateType || 'PRIVATE',
      };
      setVehicles(prev => [...prev, vehicle!]);
    }

    // 3. Generate job card
    const jobCount = jobCards.length + 1;
    const jobNumber = `QP-2026-${String(840 + jobCount).padStart(4, '0')}`;
    const generatedPassword = `QP#${Math.floor(1000 + Math.random() * 9000)}`;

    const newJob: JobCard = {
      id: `job-${Date.now()}`,
      jobNumber,
      branchId: params.branchId,
      customerId: customer.id,
      vehicleId: vehicle.id,
      assignedTechnicianId: params.assignedTechnicianId,
      status: 'ASSIGNED',
      servicePackage: params.servicePackage,
      packagePriceQAR: params.packagePriceQAR,
      estimatedHours: params.estimatedHours,
      createdAt: new Date().toISOString(),
      damageMarks: [],
      intakePhotos: [],
      diagnostics: {
        acVentTempCelsius: 8.0,
        acFilterStatus: 'CLEAN',
        sandIntakeLevel: 'MINIMAL',
        paintDepthMicrons: {
          hood: 120,
          roof: 125,
          leftSide: 118,
          rightSide: 118,
          trunk: 122,
        },
        batteryVoltage: 12.6,
        undercarriageSaltSandStatus: 'CLEAR',
      },
      afterPhotos: [],
      technicianSuggestions: '',
      complaintsFound: '',
      finalPriceQAR: params.packagePriceQAR,
      discountQAR: 0,
      isLockedByTechnician: false,
      reviewedByAdmin: false,
      customerPasswordGenerated: generatedPassword,
    };

    setJobCards(prev => [newJob, ...prev]);
    return newJob;
  };

  const updateJobCard = (jobId: string, updates: Partial<JobCard>) => {
    setJobCards(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j));
  };

  const startJob = (jobId: string) => {
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'IN_INSPECTION',
          startedAt: j.startedAt || new Date().toISOString(),
        };
      }
      return j;
    }));
  };

  const addDamageMark = (jobId: string, mark: Omit<DamageMark, 'id' | 'timestamp'>) => {
    const newMark: DamageMark = {
      ...mark,
      id: `dm-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          damageMarks: [...j.damageMarks, newMark],
        };
      }
      return j;
    }));
  };

  const removeDamageMark = (jobId: string, markId: string) => {
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          damageMarks: j.damageMarks.filter(m => m.id !== markId),
        };
      }
      return j;
    }));
  };

  const addIntakePhoto = (jobId: string, photo: Omit<PhotoDocumentation, 'id' | 'capturedAt'>) => {
    const newPhoto: PhotoDocumentation = {
      ...photo,
      id: `p-in-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      capturedAt: new Date().toISOString(),
    };
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        // Replace slot if already exists or append
        const filtered = j.intakePhotos.filter(p => p.slotLabel !== photo.slotLabel);
        return {
          ...j,
          intakePhotos: [...filtered, newPhoto],
        };
      }
      return j;
    }));
  };

  const removeIntakePhoto = (jobId: string, photoId: string) => {
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          intakePhotos: j.intakePhotos.filter(p => p.id !== photoId),
        };
      }
      return j;
    }));
  };

  const updateDiagnostics = (jobId: string, diagnostics: Partial<RegionalDiagnostics>) => {
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          diagnostics: {
            ...j.diagnostics,
            ...diagnostics,
          },
        };
      }
      return j;
    }));
  };

  const addAfterPhoto = (jobId: string, photo: Omit<PhotoDocumentation, 'id' | 'capturedAt'>) => {
    const newPhoto: PhotoDocumentation = {
      ...photo,
      id: `p-af-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      capturedAt: new Date().toISOString(),
    };
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        const filtered = j.afterPhotos.filter(p => p.slotLabel !== photo.slotLabel);
        return {
          ...j,
          afterPhotos: [...filtered, newPhoto],
        };
      }
      return j;
    }));
  };

  const removeAfterPhoto = (jobId: string, photoId: string) => {
    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          afterPhotos: j.afterPhotos.filter(p => p.id !== photoId),
        };
      }
      return j;
    }));
  };

  const completeJobByTechnician = (params: {
    jobId: string;
    technicianSuggestions: string;
    complaintsFound: string;
    afterPhotos: PhotoDocumentation[];
  }) => {
    setJobCards(prev => prev.map(j => {
      if (j.id === params.jobId) {
        return {
          ...j,
          status: 'COMPLETED',
          isLockedByTechnician: true,
          completedAt: new Date().toISOString(),
          technicianSuggestions: params.technicianSuggestions,
          complaintsFound: params.complaintsFound,
          afterPhotos: params.afterPhotos.length > 0 ? params.afterPhotos : j.afterPhotos,
        };
      }
      return j;
    }));
  };

  const finalizeJobAndInvoice = (params: {
    jobId: string;
    finalPriceQAR: number;
    discountQAR: number;
    adminNotes?: string;
    invoiceItems: Omit<InvoiceItem, 'id'>[];
  }): Invoice => {
    const job = jobCards.find(j => j.id === params.jobId);
    if (!job) throw new Error('Job not found');

    const subtotal = params.invoiceItems.reduce((acc, curr) => acc + curr.totalQAR, 0);
    const total = Math.max(0, subtotal - params.discountQAR);

    const invoiceNumber = `INV-QP-${Math.floor(4000 + invoices.length + 1)}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      jobCardId: job.id,
      branchId: job.branchId,
      customerId: job.customerId,
      date: new Date().toISOString().split('T')[0],
      items: params.invoiceItems.map((item, idx) => ({ ...item, id: `item-${idx + 1}` })),
      subtotalQAR: subtotal,
      discountQAR: params.discountQAR,
      totalQAR: total,
      paymentStatus: 'PAID',
      paymentMethod: 'QATAR_PAY_NAPS',
      paidAt: new Date().toISOString(),
    };

    setInvoices(prev => [newInvoice, ...prev]);

    setJobCards(prev => prev.map(j => {
      if (j.id === params.jobId) {
        return {
          ...j,
          status: 'DELIVERED',
          reviewedByAdmin: true,
          finalPriceQAR: total,
          discountQAR: params.discountQAR,
          adminNotes: params.adminNotes,
        };
      }
      return j;
    }));

    return newInvoice;
  };

  const generateWhatsAppLink = (jobId: string) => {
    const job = jobCards.find(j => j.id === jobId);
    if (!job) return { url: '', messageText: '', phone: '', customerName: '' };

    const customer = users.find(u => u.id === job.customerId);
    const vehicle = vehicles.find(v => v.id === job.vehicleId);
    const branch = branches.find(b => b.id === job.branchId);

    const customerName = customer ? customer.name : 'Valued Customer';
    const cleanPhone = (customer?.phone || '+974 5500 0000').replace(/[^0-9]/g, '');
    const vehicleDesc = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (Plate: ${vehicle.plateNumber})` : 'Vehicle';
    const branchName = branch ? branch.name : 'Q Planet Detailing';

    const portalUrl = window.location.origin;

    const messageText = 
`✨ *Q PLANET CAR CARE & DETAILING - SERVICE COMPLETED* ✨

Dear ${customerName},

We are pleased to inform you that your vehicle detailing service has been meticulously completed and verified by our Quality Assurance team at *${branchName}*.

🚘 *Vehicle:* ${vehicleDesc}
💎 *Package:* ${job.servicePackage}
📑 *Job Reference:* ${job.jobNumber}
💰 *Total Amount:* ${job.finalPriceQAR} QAR

---------------------------------------------------
📲 *ACCESS YOUR DIGITAL REPORT & INVOICE:*
View your before/after inspection photos, interactive vehicle scratch map, and official tax invoice at our secure Client Portal:
🔗 ${portalUrl}

*YOUR SECURE LOGIN CREDENTIALS:*
👤 *Username (QID):* ${customer?.qid || 'Your Qatar ID'}
🔑 *Password:* ${job.customerPasswordGenerated}
---------------------------------------------------

Thank you for choosing Q Planet Qatar. For assistance or vehicle pickup concierge, please reply directly to this chat.`;

    const encodedText = encodeURIComponent(messageText);
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    return {
      url,
      messageText,
      phone: customer?.phone || '+974 5500 0000',
      customerName,
    };
  };

  const addDropdownItem = (category: GlobalDropdownCategory, value: string, label?: string, parentValue?: string) => {
    const trimmedVal = value.trim();
    if (!trimmedVal) return;
    
    // Check if duplicate exists
    const exists = dropdownItems.some(item => 
      item.category === category && 
      item.value.toLowerCase() === trimmedVal.toLowerCase() &&
      (!parentValue || item.parentValue === parentValue)
    );
    if (exists) return;

    const newItem: GlobalDropdownItem = {
      id: `dd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category,
      value: trimmedVal,
      label: label?.trim() || trimmedVal,
      parentValue,
    };

    setDropdownItems(prev => [...prev, newItem]);
  };

  const getDropdownItems = (category: GlobalDropdownCategory, parentValue?: string) => {
    return dropdownItems.filter(item => {
      if (item.category !== category) return false;
      if (parentValue && item.parentValue && item.parentValue !== parentValue) return false;
      return true;
    });
  };

  const resetToDefaults = () => {
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    localStorage.removeItem(`${STORAGE_KEY}_branches`);
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_vehicles`);
    localStorage.removeItem(`${STORAGE_KEY}_jobCards`);
    localStorage.removeItem(`${STORAGE_KEY}_invoices`);
    localStorage.removeItem(`${STORAGE_KEY}_dropdownItems`);

    setCurrentUser(initialUsers[0]);
    setCurrentBranchId('ALL');
    setBranches(initialBranches);
    setUsers(initialUsers);
    setVehicles(initialVehicles);
    setJobCards(initialJobCards);
    setInvoices(initialInvoices);
    setDropdownItems(initialDropdownItems);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentBranchId,
        branches,
        users,
        vehicles,
        jobCards,
        invoices,
        dropdownItems,
        login,
        logout,
        switchPersona,
        setCurrentBranchId,
        addBranch,
        addUser,
        addVehicle,
        createJobCard,
        updateJobCard,
        startJob,
        addDamageMark,
        removeDamageMark,
        addIntakePhoto,
        removeIntakePhoto,
        updateDiagnostics,
        addAfterPhoto,
        removeAfterPhoto,
        completeJobByTechnician,
        finalizeJobAndInvoice,
        generateWhatsAppLink,
        addDropdownItem,
        getDropdownItems,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
