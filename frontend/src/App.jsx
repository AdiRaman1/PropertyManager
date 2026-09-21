import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  IndianRupee, 
  Receipt, 
  Wrench, 
  Utensils, 
  Users, 
  ShieldCheck, 
  Menu, 
  X, 
  Languages,
  LogOut,
  ArrowLeftRight,
  UserCheck,
  HardDrive
} from 'lucide-react';
import { TRANSLATIONS } from './translations';
import Dashboard from './components/Dashboard';
import RoomsTenants from './components/RoomsTenants';
import RentLedger from './components/RentLedger';
import ExpensesStaff from './components/ExpensesStaff';
import ComplaintsFood from './components/ComplaintsFood';
import AuthModal from './components/AuthModal';
import TenantPortal from './components/TenantPortal';
import StaffPortal from './components/StaffPortal';
import StorageVaultModal from './components/StorageVaultModal';
import WhatsAppTemplateModal from './components/WhatsAppTemplateModal';
import { MessageSquare as MessageSquareIcon } from 'lucide-react';

// Initial Mock Data Seeding
const DEFAULT_PROPERTIES = [
  { id: 'prop-1', name: 'Greenwood Heights PG' },
  { id: 'prop-2', name: 'Sunrise Student Hostel' }
];

const DEFAULT_ROOMS = [
  { id: 'r101', propertyId: 'prop-1', number: '101', floor: '1st Floor', type: 'Double Sharing', rent: 8500, totalBeds: 2 },
  { id: 'r102', propertyId: 'prop-1', number: '102', floor: '1st Floor', type: 'Single Sharing', rent: 14000, totalBeds: 1 },
  { id: 'r201', propertyId: 'prop-1', number: '201', floor: '2nd Floor', type: 'Triple Sharing', rent: 6000, totalBeds: 3 },
  { id: 'r202', propertyId: 'prop-1', number: '202', floor: '2nd Floor', type: 'Double Sharing', rent: 8000, totalBeds: 2 },
  { id: 'r301', propertyId: 'prop-1', number: '301', floor: '3rd Floor', type: 'Double Sharing', rent: 7500, totalBeds: 2 },
  
  { id: 'rh101', propertyId: 'prop-2', number: 'H-101', floor: 'Ground Floor', type: 'Triple Sharing', rent: 5500, totalBeds: 3 },
  { id: 'rh102', propertyId: 'prop-2', number: 'H-102', floor: 'Ground Floor', type: 'Double Sharing', rent: 7000, totalBeds: 2 }
];

const DEFAULT_TENANTS = [
  { id: 't1', propertyId: 'prop-1', roomId: 'r101', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@gmail.com', joiningDate: '2026-01-10', deposit: 10000, idProof: 'Aadhaar: **** **** 1234', rentStatus: 'Paid', amountPaid: 8500 },
  { id: 't2', propertyId: 'prop-1', roomId: 'r101', name: 'Aditi Verma', phone: '9812345678', email: 'aditi@gmail.com', joiningDate: '2026-03-15', deposit: 10000, idProof: 'Aadhaar: **** **** 5678', rentStatus: 'Paid', amountPaid: 8500 },
  { id: 't3', propertyId: 'prop-1', roomId: 'r201', name: 'Rohan Roy', phone: '9988776655', email: 'rohan@gmail.com', joiningDate: '2026-05-01', deposit: 8000, idProof: 'PAN: ABCDE1234F', rentStatus: 'Unpaid', amountPaid: 0 },
  { id: 't4', propertyId: 'prop-1', roomId: 'r202', name: 'Priya Nair', phone: '9765432109', email: 'priya@gmail.com', joiningDate: '2026-04-12', deposit: 9000, idProof: 'Aadhaar: **** **** 9012', rentStatus: 'Partial', amountPaid: 4000 },
  
  { id: 't5', propertyId: 'prop-2', roomId: 'rh101', name: 'Kabir Singh', phone: '9555667788', email: 'kabir@gmail.com', joiningDate: '2026-02-20', deposit: 6000, idProof: 'Aadhaar: **** **** 4321', rentStatus: 'Paid', amountPaid: 5500 }
];

const DEFAULT_PAYMENTS = [
  { id: 'pay-1', propertyId: 'prop-1', tenantId: 't1', tenantName: 'Rahul Sharma', roomNumber: '101', amount: 8500, date: '2026-08-01', method: 'UPI', status: 'Full Payment' },
  { id: 'pay-2', propertyId: 'prop-1', tenantId: 't2', tenantName: 'Aditi Verma', roomNumber: '101', amount: 8500, date: '2026-08-02', method: 'UPI', status: 'Full Payment' },
  { id: 'pay-3', propertyId: 'prop-1', tenantId: 't4', tenantName: 'Priya Nair', roomNumber: '202', amount: 4000, date: '2026-08-05', method: 'Cash', status: 'Partial Payment' },
  
  { id: 'pay-4', propertyId: 'prop-2', tenantId: 't5', tenantName: 'Kabir Singh', roomNumber: 'H-101', amount: 5500, date: '2026-08-03', method: 'Bank Transfer', status: 'Full Payment' }
];

const DEFAULT_EXPENSES = [
  { id: 'exp-1', propertyId: 'prop-1', category: 'Electricity', amount: 4500, date: '2026-08-10', description: 'Main meter bill for July' },
  { id: 'exp-2', propertyId: 'prop-1', category: 'Internet', amount: 1500, date: '2026-08-01', description: 'Airtel broadband renewal' },
  { id: 'exp-3', propertyId: 'prop-1', category: 'Food Supplies', amount: 12000, date: '2026-08-15', description: 'Vegetables & monthly groceries' },
  { id: 'exp-4', propertyId: 'prop-1', category: 'Repairs', amount: 1200, date: '2026-08-18', description: 'Plumbing work on 2nd Floor' },
  
  { id: 'exp-5', propertyId: 'prop-2', category: 'Water Supply', amount: 3000, date: '2026-08-08', description: 'Water tanker' }
];

const DEFAULT_STAFF = [
  { id: 'st-1', propertyId: 'prop-1', name: 'Ramesh Singh', role: 'Cook', salary: 15000, phone: '9123456780', paidThisMonth: true },
  { id: 'st-2', propertyId: 'prop-1', name: 'Sunita Devi', role: 'Housekeeper', salary: 8000, phone: '9234567891', paidThisMonth: true },
  { id: 'st-3', propertyId: 'prop-1', name: 'Vikram Prasad', role: 'Security Guard', salary: 12000, phone: '9345678902', paidThisMonth: false },
  
  { id: 'st-4', propertyId: 'prop-2', name: 'Manish Kumar', role: 'Warden', salary: 18000, phone: '9456789013', paidThisMonth: false }
];

const DEFAULT_COMPLAINTS = [
  { id: 'comp-1', propertyId: 'prop-1', title: 'Wi-Fi connectivity issue', roomNumber: '201', urgency: 'Critical', category: 'Internet', status: 'Open', dateLogged: '2026-08-20', description: 'Signal drops completely in floor corner rooms.' },
  { id: 'comp-2', propertyId: 'prop-1', title: 'Toilet flush leakage', roomNumber: '202', urgency: 'High', category: 'Plumbing', status: 'In Progress', dateLogged: '2026-08-21', description: 'Water tank overflows constantly.' },
  { id: 'comp-3', propertyId: 'prop-1', title: 'Ceiling fan makes noise', roomNumber: '101', urgency: 'Low', category: 'Electrical', status: 'Resolved', dateLogged: '2026-08-15', description: 'Rattling sound at speed 4 or 5. Fixed regulator & bearing.' },
  
  { id: 'comp-4', propertyId: 'prop-2', title: 'Geyser not heating', roomNumber: 'H-102', urgency: 'High', category: 'Electrical', status: 'Open', dateLogged: '2026-08-22', description: 'Indicator light turns on but water stays cold.' }
];

const DEFAULT_FOOD_MENUS = [
  {
    propertyId: 'prop-1',
    schedule: {
      Monday: { Breakfast: 'Idli Sambar', Lunch: 'Veg Thali (Dal, Rice, Roti, Aloo Gobhi)', Snacks: 'Tea & Samosa', Dinner: 'Roti, Paneer Masala, Rice & Tadka' },
      Tuesday: { Breakfast: 'Poha', Lunch: 'Rajma Chawal, Roti, Curd', Snacks: 'Tea & Biscuits', Dinner: 'Aloo Paratha, Pickle & Raita' },
      Wednesday: { Breakfast: 'Upma & Chutney', Lunch: 'Egg Curry / Veg Paneer, Rice, Roti', Snacks: 'Tea & Bread Pakora', Dinner: 'Roti, Mix Veg, Dal Fry, Rice' },
      Thursday: { Breakfast: 'Aloo Poori', Lunch: 'Chole Chawal, Roti, Salad', Snacks: 'Coffee & Biscuits', Dinner: 'Roti, Dal Makhani, Jeera Rice' },
      Friday: { Breakfast: 'Masala Dosa', Lunch: 'Veg Biryani, Raita & Papad', Snacks: 'Tea & Samosa', Dinner: 'Butter Naan, Kadai Paneer, Rice' },
      Saturday: { Breakfast: 'Paneer Paratha', Lunch: 'Khichdi, Papad, Pickle & Curd', Snacks: 'Tea & Onion Pakora', Dinner: 'Veg Pulao, Kadhi, Roti & Aloo Capsicum' },
      Sunday: { Breakfast: 'Chola Bhatura', Lunch: 'Chicken Biryani / Paneer Biryani, Raita', Snacks: 'Tea & Kachori', Dinner: 'Roti, Chicken Curry / Dal Makhani, Rice' }
    }
  },
  {
    propertyId: 'prop-2',
    schedule: {
      Monday: { Breakfast: 'Bread Butter & Milk', Lunch: 'Dal, Chawal, Roti & Mix Veg', Snacks: 'Tea & Biscuits', Dinner: 'Roti, Kadai Paneer & Rice' },
      Tuesday: { Breakfast: 'Aloo Paratha', Lunch: 'Kadi Chawal, Roti, Salad', Snacks: 'Tea & Samosa', Dinner: 'Roti, Dal Fry & Mix Aloo' },
      Wednesday: { Breakfast: 'Poha & Jalebi', Lunch: 'Rajma Chawal, Salad', Snacks: 'Tea & Biscuits', Dinner: 'Roti, Paneer Bhurji & Rice' },
      Thursday: { Breakfast: 'Idli Sambar', Lunch: 'Veg Pulao, Salad, Curd', Snacks: 'Coffee & Pakora', Dinner: 'Roti, Dal Makhani & Roti' },
      Friday: { Breakfast: 'Dosa & Coconut Chutney', Lunch: 'Dal, Chawal, Roti, Bhindi Masala', Snacks: 'Tea & Samosa', Dinner: 'Veg Biryani & Raita' },
      Saturday: { Breakfast: 'Poori Bhaji', Lunch: 'Jeera Aloo, Roti, Curd', Snacks: 'Tea & Pakora', Dinner: 'Roti, Egg Curry / Paneer, Rice' },
      Sunday: { Breakfast: 'Veg Sandwich & Tea', Lunch: 'Chole Bhature & Kheer', Snacks: 'Tea & Biscuits', Dinner: 'Roti, Chicken Curry / Paneer Masala, Rice' }
    }
  }
];

export default function App() {
  const [properties, setProperties] = useState(() => {
    const local = localStorage.getItem('pg_properties');
    return local ? JSON.parse(local) : DEFAULT_PROPERTIES;
  });

  const [currentPropertyId, setCurrentPropertyId] = useState(() => {
    const local = localStorage.getItem('pg_current_property');
    return local || 'prop-1';
  });

  const [rooms, setRooms] = useState(() => {
    const local = localStorage.getItem('pg_rooms');
    return local ? JSON.parse(local) : DEFAULT_ROOMS;
  });

  const [tenants, setTenants] = useState(() => {
    const local = localStorage.getItem('pg_tenants');
    return local ? JSON.parse(local) : DEFAULT_TENANTS;
  });

  const [payments, setPayments] = useState(() => {
    const local = localStorage.getItem('pg_payments');
    return local ? JSON.parse(local) : DEFAULT_PAYMENTS;
  });

  const [expenses, setExpenses] = useState(() => {
    const local = localStorage.getItem('pg_expenses');
    return local ? JSON.parse(local) : DEFAULT_EXPENSES;
  });

  const [staff, setStaff] = useState(() => {
    const local = localStorage.getItem('pg_staff');
    return local ? JSON.parse(local) : DEFAULT_STAFF;
  });

  const [complaints, setComplaints] = useState(() => {
    const local = localStorage.getItem('pg_complaints');
    return local ? JSON.parse(local) : DEFAULT_COMPLAINTS;
  });

  const [foodMenus, setFoodMenus] = useState(() => {
    const local = localStorage.getItem('pg_food_menus');
    return local ? JSON.parse(local) : DEFAULT_FOOD_MENUS;
  });

  // Language Locale State
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('pg_language') || 'en';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('pg_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('pg_current_property', currentPropertyId);
  }, [currentPropertyId]);

  useEffect(() => {
    localStorage.setItem('pg_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('pg_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('pg_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('pg_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pg_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('pg_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('pg_food_menus', JSON.stringify(foodMenus));
  }, [foodMenus]);

  useEffect(() => {
    localStorage.setItem('pg_language', lang);
  }, [lang]);

  // Current Authenticated User & Role State
  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('pg_current_user');
    return local ? JSON.parse(local) : null;
  });
  const [showStorageVaultModal, setShowStorageVaultModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateModalTab, setTemplateModalTab] = useState('rent_reminder');

  // Handle updating property templates (per-property storage)
  const handleUpdatePropertyTemplates = (propertyId, updatedTemplates) => {
    setProperties(prev => {
      const updated = prev.map(p => {
        if (p.id === propertyId) {
          return {
            ...p,
            templates: updatedTemplates
          };
        }
        return p;
      });
      localStorage.setItem('pg_properties', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pg_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pg_current_user');
    }
  }, [currentUser]);

  // Translate helper method
  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  const handlePropertyChange = (e) => {
    setCurrentPropertyId(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLang(e.target.value);
  };

  // Register New PG Owner & Provision Property Workspace
  const handleRegisterNewPG = (newPGData) => {
    const newPropId = 'prop-' + Date.now();
    const newProperty = {
      id: newPropId,
      name: newPGData.pgName || 'New PG Organization',
      address: newPGData.address || '',
      city: newPGData.city || 'Bengaluru',
      upiId: newPGData.upiId || 'owner@okhdfcbank'
    };

    const floorsCount = parseInt(newPGData.floorsCount || 3, 10);
    const roomsPerFloor = parseInt(newPGData.roomsPerFloor || 2, 10);
    const baseRent = parseInt(newPGData.baseRent || 8000, 10);

    const generatedRooms = [];
    for (let f = 1; f <= floorsCount; f++) {
      const floorName = f === 1 ? '1st Floor' : f === 2 ? '2nd Floor' : f === 3 ? '3rd Floor' : `${f}th Floor`;
      for (let r = 1; r <= roomsPerFloor; r++) {
        const roomNum = `${f}0${r}`;
        generatedRooms.push({
          id: `r_${newPropId}_${roomNum}`,
          propertyId: newPropId,
          number: roomNum,
          floor: floorName,
          type: r % 2 === 1 ? 'Double Sharing' : 'Single Sharing',
          rent: r % 2 === 1 ? baseRent : Math.round(baseRent * 1.4),
          totalBeds: r % 2 === 1 ? 2 : 1
        });
      }
    }

    const newMenu = {
      propertyId: newPropId,
      schedule: {
        Monday: { Breakfast: 'Idli Sambar & Chutney', Lunch: 'Veg Thali (Dal, Rice, Roti, Sabji)', Snacks: 'Tea & Biscuits', Dinner: 'Roti, Paneer Masala, Rice & Tadka' },
        Tuesday: { Breakfast: 'Poha & Jalebi', Lunch: 'Rajma Chawal, Roti, Curd', Snacks: 'Tea & Samosa', Dinner: 'Aloo Paratha, Pickle & Raita' },
        Wednesday: { Breakfast: 'Upma & Chutney', Lunch: 'Egg Curry / Veg Paneer, Rice, Roti', Snacks: 'Tea & Bread Pakora', Dinner: 'Roti, Mix Veg, Dal Fry, Rice' },
        Thursday: { Breakfast: 'Aloo Poori', Lunch: 'Chole Chawal, Roti, Salad', Snacks: 'Coffee & Biscuits', Dinner: 'Roti, Dal Makhani, Jeera Rice' },
        Friday: { Breakfast: 'Masala Dosa', Lunch: 'Veg Biryani, Raita & Papad', Snacks: 'Tea & Samosa', Dinner: 'Butter Naan, Kadai Paneer, Rice' },
        Saturday: { Breakfast: 'Paneer Paratha', Lunch: 'Khichdi, Papad, Pickle & Curd', Snacks: 'Tea & Onion Pakora', Dinner: 'Veg Pulao, Kadhi, Roti & Sabji' },
        Sunday: { Breakfast: 'Chola Bhatura', Lunch: 'Chicken Biryani / Paneer Biryani, Raita', Snacks: 'Tea & Kachori', Dinner: 'Roti, Dal Makhani, Rice & Dessert' }
      }
    };

    setProperties(prev => [newProperty, ...prev]);
    setRooms(prev => [...generatedRooms, ...prev]);
    setFoodMenus(prev => [newMenu, ...prev]);
    setCurrentPropertyId(newPropId);

    const newOwnerUser = {
      role: 'owner',
      name: newPGData.ownerName || 'New PG Owner',
      phone: newPGData.ownerPhone || '',
      email: newPGData.ownerEmail || 'owner@newpg.com',
      avatarText: (newPGData.ownerName || 'Owner').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      badge: `${newPGData.pgName} (Owner)`,
      propertyId: newPropId
    };

    setCurrentUser(newOwnerUser);
  };

  // 1. If not authenticated, render the Role-Selection Auth Screen
  if (!currentUser) {
    return (
      <AuthModal 
        onLogin={(userObj) => setCurrentUser(userObj)}
        onRegisterNewPG={handleRegisterNewPG}
        t={t}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        tenants={tenants}
        staff={staff}
        properties={properties}
      />
    );
  }

  // 2. If authenticated as Tenant / Resident
  if (currentUser.role === 'tenant') {
    return (
      <div className="app-container" style={{ display: 'block', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <header className="content-header" style={{ padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)', margin: 0, position: 'sticky', top: 0, zIndex: 30 }}>
          <div className="flex items-center gap-3">
            <div className="logo-icon">M</div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>My PG Resident Portal</h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Greenwood Heights Accommodation</span>
            </div>
          </div>

          <div className="header-actions">
            <select
              value={lang}
              onChange={handleLanguageChange}
              className="ui-select"
              aria-label="Select Interface Language"
            >
              <option value="en">🌐 English</option>
              <option value="hi">🌐 हिन्दी (Hindi)</option>
              <option value="te">🌐 తెలుగు (Telugu)</option>
              <option value="ta">🌐 தமிழ் (Tamil)</option>
              <option value="kn">🌐 ಕನ್ನಡ (Kannada)</option>
              <option value="ml">🌐 മലയാളം (Malayalam)</option>
              <option value="mr">🌐 मराठी (Marathi)</option>
              <option value="bn">🌐 বাংলা (Bengali)</option>
              <option value="or">🌐 ଓଡ଼ିଆ (Odia)</option>
              <option value="pa">🌐 ਪੰਜਾਬੀ (Punjabi)</option>
            </select>

            <div className="user-profile-strip">
              <div className="user-avatar">{currentUser.avatarText || 'R'}</div>
              <div className="flex flex-col text-left">
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
                  {currentUser.badge}
                </span>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="btn btn-secondary btn-sm"
                title="Switch Role or Sign Out"
                style={{ padding: '4px 8px', fontSize: '0.75rem', marginLeft: '4px' }}
              >
                <LogOut size={12} />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="main-content" style={{ marginLeft: 0, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <TenantPortal 
            currentUser={currentUser}
            tenants={tenants}
            setTenants={setTenants}
            rooms={rooms}
            payments={payments}
            setPayments={setPayments}
            complaints={complaints}
            setComplaints={setComplaints}
            foodMenus={foodMenus}
            properties={properties}
            t={t}
          />
        </main>
      </div>
    );
  }

  // 3. If authenticated as Staff / Employee
  if (currentUser.role === 'staff') {
    return (
      <div className="app-container" style={{ display: 'block', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <header className="content-header" style={{ padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)', margin: 0, position: 'sticky', top: 0, zIndex: 30 }}>
          <div className="flex items-center gap-3">
            <div className="logo-icon">M</div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Staff Operations Portal</h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Shift, Tasks & Attendance</span>
            </div>
          </div>

          <div className="header-actions">
            <select
              value={lang}
              onChange={handleLanguageChange}
              className="ui-select"
              aria-label="Select Interface Language"
            >
              <option value="en">🌐 English</option>
              <option value="hi">🌐 हिन्दी (Hindi)</option>
              <option value="te">🌐 తెలుగు (Telugu)</option>
              <option value="ta">🌐 தமிழ் (Tamil)</option>
              <option value="kn">🌐 ಕನ್ನಡ (Kannada)</option>
              <option value="ml">🌐 മലയാളം (Malayalam)</option>
              <option value="mr">🌐 मराठी (Marathi)</option>
              <option value="bn">🌐 বাংলা (Bengali)</option>
              <option value="or">🌐 ଓଡ଼ିଆ (Odia)</option>
              <option value="pa">🌐 ਪੰਜਾਬੀ (Punjabi)</option>
            </select>

            <div className="user-profile-strip">
              <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>{currentUser.avatarText || 'S'}</div>
              <div className="flex flex-col text-left">
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#d97706', fontWeight: 600 }}>
                  {currentUser.badge}
                </span>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="btn btn-secondary btn-sm"
                title="Switch Role or Sign Out"
                style={{ padding: '4px 8px', fontSize: '0.75rem', marginLeft: '4px' }}
              >
                <LogOut size={12} />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="main-content" style={{ marginLeft: 0, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <StaffPortal 
            currentUser={currentUser}
            staff={staff}
            setStaff={setStaff}
            complaints={complaints}
            setComplaints={setComplaints}
            foodMenus={foodMenus}
            properties={properties}
            tenants={tenants}
            rooms={rooms}
            t={t}
          />
        </main>
      </div>
    );
  }

  // 4. Default: PG Owner / Admin Dashboard View
  // Render Page Panels depending on current tab selection
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            propertyId={currentPropertyId}
            rooms={rooms}
            tenants={tenants}
            payments={payments}
            expenses={expenses}
            complaints={complaints}
            t={t}
          />
        );
      case 'rooms-tenants':
        return (
          <RoomsTenants 
            propertyId={currentPropertyId}
            rooms={rooms}
            setRooms={setRooms}
            tenants={tenants}
            setTenants={setTenants}
            setPayments={setPayments}
            t={t}
          />
        );
      case 'rent-ledger':
        return (
          <RentLedger 
            propertyId={currentPropertyId}
            currentProperty={properties.find(p => p.id === currentPropertyId)}
            onUpdatePropertyTemplates={handleUpdatePropertyTemplates}
            tenants={tenants}
            setTenants={setTenants}
            payments={payments}
            setPayments={setPayments}
            rooms={rooms}
            t={t}
          />
        );
      case 'expenses-staff':
        return (
          <ExpensesStaff 
            propertyId={currentPropertyId}
            expenses={expenses}
            setExpenses={setExpenses}
            staff={staff}
            setStaff={setStaff}
            t={t}
          />
        );
      case 'complaints-food':
        return (
          <ComplaintsFood 
            propertyId={currentPropertyId}
            complaints={complaints}
            setComplaints={setComplaints}
            foodMenus={foodMenus}
            setFoodMenus={setFoodMenus}
            t={t}
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  const navItems = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { id: 'rooms-tenants', labelKey: 'roomsTenants', icon: Home },
    { id: 'rent-ledger', labelKey: 'rentLedger', icon: IndianRupee },
    { id: 'expenses-staff', labelKey: 'expensesStaff', icon: Users },
    { id: 'complaints-food', labelKey: 'complaintsFood', icon: Utensils }
  ];

  return (
    <div className="app-container">
      {/* Mobile Sidebar Toggle Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white h-16 px-4 flex items-center justify-between z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="logo-icon w-8 h-8 rounded-md font-bold flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white">M</div>
          <span className="font-extrabold text-sm tracking-tight text-white">My PG Manager</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-md"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 45
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <div className="sidebar-logo">
          <div className="logo-icon" aria-hidden="true">M</div>
          <div className="logo-text">
            <span>PG Manager</span>
            <span className="logo-sub">{t('trialLabel')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="partner-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{t('premiumOwner')}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '4px', fontWeight: 600 }}>
            My PG Manager v3.1.0 (2026)
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <main className="main-content">
        {/* Content Header */}
        <header className="content-header">
          <div className="header-title-section">
            <h1>{t(navItems.find(n => n.id === activeTab)?.labelKey)}</h1>
            <p className="text-slate-500">Manage, track and optimize your Paying Guest accommodation operations</p>
          </div>

          <div className="header-actions">
            {/* Language Selector Dropdown */}
            <select
              value={lang}
              onChange={handleLanguageChange}
              className="ui-select"
              aria-label="Select Interface Language"
            >
              <option value="en">🌐 English</option>
              <option value="hi">🌐 हिन्दी (Hindi)</option>
              <option value="te">🌐 తెలుగు (Telugu)</option>
              <option value="ta">🌐 தமிழ் (Tamil)</option>
              <option value="kn">🌐 ಕನ್ನಡ (Kannada)</option>
              <option value="ml">🌐 മലയാളം (Malayalam)</option>
              <option value="mr">🌐 मराठी (Marathi)</option>
              <option value="bn">🌐 বাংলা (Bengali)</option>
              <option value="or">🌐 ଓଡ଼ିଆ (Odia)</option>
              <option value="pa">🌐 ਪੰਜਾਬੀ (Punjabi)</option>
            </select>

            {/* Property Selector Dropdown */}
            <select 
              value={currentPropertyId} 
              onChange={handlePropertyChange}
              className="ui-select"
              aria-label="Select Property"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>🏢 {p.name}</option>
              ))}
            </select>

            {/* WhatsApp Message Templates Trigger */}
            <button
              onClick={() => {
                setTemplateModalTab('rent_reminder');
                setShowTemplateModal(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', fontSize: '0.8125rem', padding: '6px 10px', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5', color: '#065f46' }}
              title="Customize WhatsApp Message Templates for this Property"
            >
              <MessageSquareIcon size={14} color="#059669" />
              <span className="hidden lg:inline">WhatsApp Templates</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#d1fae5', padding: '1px 5px', borderRadius: '4px' }}>
                ₹0 API
              </span>
            </button>

            {/* Free-Tier Storage & KYC Vault Trigger */}
            <button
              onClick={() => setShowStorageVaultModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', fontSize: '0.8125rem', padding: '6px 10px', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', color: '#166534' }}
              title="View Cloudflare R2 / Supabase Free-Tier Storage & Document Vault"
            >
              <HardDrive size={14} color="#16a34a" />
              <span className="hidden lg:inline">{t('storageVault') || 'Storage & KYC Vault'}</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                10GB Free
              </span>
            </button>

            <div className="header-badge-date hidden sm:inline-flex">
              📅 {new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : lang, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>

            <div className="user-profile-strip">
              <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>{currentUser.avatarText || 'AR'}</div>
              <div className="hidden md:flex flex-col text-left" style={{ gap: '2px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {currentUser.badge}
                </span>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="btn btn-secondary btn-sm"
                title="Switch Role or Sign Out"
                style={{ padding: '4px 8px', fontSize: '0.75rem', marginLeft: '4px' }}
              >
                <LogOut size={12} />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab View */}
        {renderActiveTab()}

        {/* Free-Tier Storage & KYC Vault Modal */}
        {showStorageVaultModal && (
          <StorageVaultModal 
            onClose={() => setShowStorageVaultModal(false)}
            t={t}
            tenants={tenants}
          />
        )}

        {/* WhatsApp Message Template Studio Modal */}
        {showTemplateModal && (
          <WhatsAppTemplateModal 
            property={properties.find(p => p.id === currentPropertyId)}
            onSaveTemplates={handleUpdatePropertyTemplates}
            onClose={() => setShowTemplateModal(false)}
            initialTab={templateModalTab}
          />
        )}
      </main>
    </div>
  );
}
