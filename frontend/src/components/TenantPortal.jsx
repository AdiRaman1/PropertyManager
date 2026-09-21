import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  IndianRupee, 
  AlertCircle, 
  Utensils, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Download, 
  Plus, 
  Sparkles, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Wifi, 
  Zap, 
  Droplet,
  Calendar
} from 'lucide-react';

export default function TenantPortal({ 
  currentUser, 
  tenants, 
  setTenants, 
  rooms, 
  payments, 
  setPayments, 
  complaints, 
  setComplaints, 
  foodMenus, 
  properties, 
  t 
}) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'rent' | 'complaints' | 'mess'
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);

  // New Complaint Form
  const [newComplaintTitle, setNewComplaintTitle] = useState('');
  const [newComplaintCategory, setNewComplaintCategory] = useState('Internet');
  const [newComplaintUrgency, setNewComplaintUrgency] = useState('High');
  const [newComplaintDesc, setNewComplaintDesc] = useState('');

  // Find tenant data
  const tenant = tenants.find(t => t.id === currentUser.tenantId) || tenants[0];
  const room = rooms.find(r => r.id === tenant.roomId);
  const property = properties.find(p => p.id === tenant.propertyId);
  
  // Find roommates in the same room (excluding current tenant)
  const roommates = tenants.filter(t => t.roomId === tenant.roomId && t.id !== tenant.id);
  
  // Find tenant complaints
  const myComplaints = complaints.filter(c => c.roomNumber === room?.number || c.propertyId === tenant.propertyId);

  // Find tenant payment history
  const myPayments = payments.filter(p => p.tenantId === tenant.id || p.tenantName?.toLowerCase() === tenant.name.toLowerCase());

  // Meal schedule for property
  const currentMenu = foodMenus.find(m => m.propertyId === tenant.propertyId)?.schedule || {};
  const todayDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayMeals = currentMenu[todayDayName] || currentMenu['Monday'] || {};

  // Rent status calculations
  const monthlyRent = room?.rent || 8500;
  const isPaid = tenant.rentStatus === 'Paid';
  const remainingDue = isPaid ? 0 : (tenant.rentStatus === 'Partial' ? monthlyRent - (tenant.amountPaid || 0) : monthlyRent);

  // Handle Pay via UPI
  const handleConfirmUpiPayment = () => {
    const newPayment = {
      id: 'pay-' + Date.now(),
      propertyId: tenant.propertyId,
      tenantId: tenant.id,
      tenantName: tenant.name,
      roomNumber: room?.number || '101',
      amount: remainingDue,
      date: new Date().toISOString().split('T')[0],
      method: 'UPI Online (Google Pay)',
      status: 'Full Payment'
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update tenant's rent status
    setTenants(prev => prev.map(tItem => {
      if (tItem.id === tenant.id) {
        return { ...tItem, rentStatus: 'Paid', amountPaid: monthlyRent };
      }
      return tItem;
    }));

    setShowUpiModal(false);
    setSelectedReceipt(newPayment);
    setShowReceiptModal(true);
  };

  // Handle Submit Complaint
  const handleRaiseComplaint = (e) => {
    e.preventDefault();
    if (!newComplaintTitle) return;

    const newComp = {
      id: 'comp-' + Date.now(),
      propertyId: tenant.propertyId,
      title: newComplaintTitle,
      roomNumber: room?.number || '101',
      urgency: newComplaintUrgency,
      category: newComplaintCategory,
      status: 'Open',
      dateLogged: new Date().toISOString().split('T')[0],
      description: newComplaintDesc || 'Reported by resident'
    };

    setComplaints(prev => [newComp, ...prev]);
    setShowNewComplaintModal(false);
    setNewComplaintTitle('');
    setNewComplaintDesc('');
  };

  return (
    <div>
      {/* Resident Hero Banner */}
      <div className="portal-hero-card">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <span className="badge" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none' }}>
                Resident Portal
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{property?.name}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Welcome back, {tenant.name}!
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9375rem', marginTop: '6px' }}>
              Room <strong>{room?.number}</strong> • {room?.floor} • {room?.type}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Monthly Rent Status
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: isPaid ? '#4ade80' : '#f87171' }}>
              {isPaid ? '✓ All Settled' : `₹${remainingDue.toLocaleString('en-IN')} Due`}
            </div>
          </div>
        </div>

        {/* Quick Tabs Bar */}
        <div className="flex gap-2" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveSubTab('overview')}
            className={`btn btn-sm ${activeSubTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeSubTab !== 'overview' ? { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' } : {}}
          >
            <Home size={15} />
            <span>My Room & Roommates</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('rent')}
            className={`btn btn-sm ${activeSubTab === 'rent' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeSubTab !== 'rent' ? { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' } : {}}
          >
            <IndianRupee size={15} />
            <span>Rent & Receipts</span>
            {!isPaid && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />}
          </button>

          <button 
            onClick={() => setActiveSubTab('complaints')}
            className={`btn btn-sm ${activeSubTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeSubTab !== 'complaints' ? { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' } : {}}
          >
            <AlertCircle size={15} />
            <span>Service Complaints ({myComplaints.filter(c => c.status !== 'Resolved').length})</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('mess')}
            className={`btn btn-sm ${activeSubTab === 'mess' ? 'btn-primary' : 'btn-secondary'}`}
            style={activeSubTab !== 'mess' ? { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' } : {}}
          >
            <Utensils size={15} />
            <span>Today's Food Menu</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: ROOM & ROOMMATES */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="portal-stat-grid">
            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Room</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>Room {room?.number}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{room?.floor} • {room?.type}</p>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Rent</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>₹{monthlyRent.toLocaleString('en-IN')}/mo</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Includes electricity, Wi-Fi & 3 meals</p>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security Deposit</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>₹{tenant.deposit.toLocaleString('en-IN')}</h3>
              <p style={{ fontSize: '0.8125rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>✓ Paid & Refundable</p>
            </div>
          </div>

          {/* Roommates Card */}
          <div className="card">
            <div className="card-title">
              <span>My Roommates (Room {room?.number})</span>
            </div>

            {roommates.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginTop: '12px' }}>
                {roommates.map(rm => (
                  <div key={rm.id} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)' }}>
                    <div className="flex items-center gap-3">
                      <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '0.9375rem' }}>
                        {rm.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)', display: 'block' }}>{rm.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joined {rm.joiningDate}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="flex items-center gap-2"><Phone size={13} style={{ color: 'var(--text-muted)' }} /> {rm.phone}</span>
                      <span className="flex items-center gap-2"><Mail size={13} style={{ color: 'var(--text-muted)' }} /> {rm.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                You currently have no roommates in this room.
              </div>
            )}
          </div>

          {/* Room Amenities */}
          <div className="card">
            <div className="card-title">
              <span>Included Room & Hostel Amenities</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginTop: '12px' }}>
              <div className="flex items-center gap-2.5 p-3 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
                <Wifi size={18} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>High-Speed 5G Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
                <Droplet size={18} style={{ color: '#0284c7' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>24x7 Geyser Hot Water</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
                <Utensils size={18} style={{ color: '#d97706' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>3 Meals Daily + Tea</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
                <ShieldCheck size={18} style={{ color: '#16a34a' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>CCTV & Guard Security</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RENT & ONLINE UPI PAY */}
      {activeSubTab === 'rent' && (
        <div className="flex flex-col gap-6">
          <div className="card" style={{ borderLeft: isPaid ? '4px solid #16a34a' : '4px solid #dc2626' }}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <span className={`status-pill ${isPaid ? 'status-pill-paid' : 'status-pill-unpaid'}`}>
                  {isPaid ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                  <span>
                    {isPaid 
                      ? (tenant.lastPaymentMode === 'Cash' 
                          ? `Paid in Cash (${tenant.cashCollector || 'Warden'})` 
                          : 'Paid via UPI')
                      : 'Pending Rent Payout'}
                  </span>
                </span>
                <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                  {isPaid ? `₹${monthlyRent.toLocaleString('en-IN')} Paid` : `₹${remainingDue.toLocaleString('en-IN')} Due`}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Due by 5th of every month. Automatic receipt issued upon payment.
                </p>
              </div>

              <div>
                {!isPaid ? (
                  <button 
                    onClick={() => setShowUpiModal(true)}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '0.9375rem' }}
                  >
                    <QrCode size={18} />
                    <span>Pay ₹{remainingDue.toLocaleString('en-IN')} via UPI</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedReceipt(myPayments[0] || {
                        id: 'pay-recent',
                        tenantName: tenant.name,
                        roomNumber: room?.number,
                        amount: monthlyRent,
                        date: '2026-09-01',
                        method: 'UPI Online',
                        status: 'Full Payment'
                      });
                      setShowReceiptModal(true);
                    }}
                    className="btn btn-secondary"
                  >
                    <Download size={15} />
                    <span>Download Latest Receipt</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="card">
            <div className="card-title">
              <span>Payment Receipts History</span>
            </div>
            <div className="table-wrapper" style={{ marginTop: '12px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Receipt ID</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayments.length > 0 ? (
                    myPayments.map(pay => (
                      <tr key={pay.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{pay.id}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{pay.date}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {pay.method === 'Cash' ? (
                            <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                              💵 Cash ({pay.collector || 'Warden'})
                            </span>
                          ) : (
                            <span>{pay.method}</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 800, color: '#166534' }}>₹{pay.amount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className="badge badge-paid">Settled</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              setSelectedReceipt(pay);
                              setShowReceiptModal(true);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <Receipt size={13} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: COMPLAINTS */}
      {activeSubTab === 'complaints' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                My Maintenance & Service Requests
              </h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Raise requests for room repairs, plumbing, electrical or Wi-Fi fixes.
              </span>
            </div>

            <button 
              onClick={() => setShowNewComplaintModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Raise New Complaint</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {myComplaints.length > 0 ? (
              myComplaints.map(comp => (
                <div key={comp.id} className="card flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', fontSize: '0.6875rem' }}>
                        {comp.category}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
                        {comp.title}
                      </h4>
                    </div>
                    <span className={`status-pill ${
                      comp.status === 'Resolved' ? 'status-pill-paid' :
                      comp.status === 'In Progress' ? 'status-pill-partial' : 'status-pill-unpaid'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {comp.description}
                  </p>

                  <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Logged on: {comp.dateLogged}</span>
                    <span>Urgency: <strong>{comp.urgency}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No active complaints logged. Everything in your room is operating smoothly!
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: MESS FOOD MENU */}
      {activeSubTab === 'mess' && (
        <div className="flex flex-col gap-6">
          <div className="card" style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
              <Utensils size={18} style={{ color: '#ca8a04' }} />
              <strong style={{ fontSize: '1.1rem', color: '#854d0e' }}>
                Today's Menu ({todayDayName})
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '10px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #fde047' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a16207', textTransform: 'uppercase' }}>Breakfast (8am - 10am)</span>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{todayMeals.Breakfast || 'Idli Sambar & Tea'}</p>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #fde047' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a16207', textTransform: 'uppercase' }}>Lunch (1pm - 3pm)</span>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{todayMeals.Lunch || 'Veg Thali, Rice & Roti'}</p>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #fde047' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a16207', textTransform: 'uppercase' }}>Snacks (5pm - 6pm)</span>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{todayMeals.Snacks || 'Tea & Samosa'}</p>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #fde047' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a16207', textTransform: 'uppercase' }}>Dinner (8pm - 10pm)</span>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{todayMeals.Dinner || 'Paneer Curry, Dal & Rice'}</p>
              </div>
            </div>
          </div>

          {/* Full Weekly Planner */}
          <div className="card">
            <div className="card-title">
              <span>Full 7-Day Food Schedule</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '12px' }}>
              {Object.entries(currentMenu).map(([day, meals]) => (
                <div key={day} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: day === todayDayName ? '#f0fdf4' : 'var(--bg-subtle)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.9375rem', color: day === todayDayName ? '#15803d' : 'var(--text-main)' }}>
                      {day} {day === todayDayName && '(Today)'}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>🍳 <strong>B'fast:</strong> {meals.Breakfast}</span>
                    <span>🍛 <strong>Lunch:</strong> {meals.Lunch}</span>
                    <span>☕ <strong>Snacks:</strong> {meals.Snacks}</span>
                    <span>🍲 <strong>Dinner:</strong> {meals.Dinner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UPI Online Payment Simulation Modal */}
      {showUpiModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2>Pay Rent Online via UPI</h2>
              <button onClick={() => setShowUpiModal(false)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block' }}>Paying To:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{property?.name} Operations</strong>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb', marginTop: '8px' }}>
                  ₹{remainingDue.toLocaleString('en-IN')}
                </h3>
              </div>

              {/* Simulated QR Box */}
              <div style={{ width: '180px', height: '180px', margin: '0 auto 16px', border: '2px dashed #93c5fd', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' }}>
                <QrCode size={90} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#1e40af', marginTop: '6px' }}>Scan with any UPI App</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="badge" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}>GPay</span>
                <span className="badge" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}>PhonePe</span>
                <span className="badge" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}>Paytm</span>
                <span className="badge" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}>BHIM UPI</span>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowUpiModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="button" onClick={handleConfirmUpiPayment} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
                <span>Simulate Successful Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Official Rent Payment Receipt</h2>
              <button onClick={() => setShowReceiptModal(false)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff' }}>
                <div className="flex justify-between items-start" style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{property?.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Paying Guest Accommodation Receipt</span>
                  </div>
                  <span className="badge badge-paid">PAID IN FULL</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8125rem', marginBottom: '16px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Receipt Ref:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedReceipt.id}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Date Issued:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedReceipt.date}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Resident:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedReceipt.tenantName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Room:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>Room {selectedReceipt.roomNumber}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', position: 'relative' }}>
                  {selectedReceipt.method === 'Cash' && (
                    <div className="cash-stamp" style={{ top: '8px', right: '12px' }}>
                      RECEIVED IN CASH
                    </div>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Amount Settled:</span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', margin: '2px 0' }}>
                    ₹{selectedReceipt.amount.toLocaleString('en-IN')}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                    Payment Mode: {selectedReceipt.method} {selectedReceipt.collector ? `• Collected by ${selectedReceipt.collector}` : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowReceiptModal(false)} className="btn btn-secondary">Close</button>
              <button type="button" onClick={() => window.print()} className="btn btn-primary">
                <Download size={15} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Complaint Modal */}
      {showNewComplaintModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Raise Service / Maintenance Request</h2>
              <button onClick={() => setShowNewComplaintModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleRaiseComplaint}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="complaint-title-input">Issue / Problem Title</label>
                  <input 
                    id="complaint-title-input"
                    type="text" 
                    required 
                    value={newComplaintTitle}
                    onChange={(e) => setNewComplaintTitle(e.target.value)}
                    placeholder="e.g. Wi-Fi router keeps disconnecting" 
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="complaint-category-select">Category</label>
                    <select 
                      id="complaint-category-select"
                      value={newComplaintCategory}
                      onChange={(e) => setNewComplaintCategory(e.target.value)}
                      className="form-control"
                    >
                      <option value="Internet">Internet / Wi-Fi</option>
                      <option value="Plumbing">Plumbing / Washroom</option>
                      <option value="Electrical">Electrical / Geyser</option>
                      <option value="Cleaning">Room Cleaning / Housekeeping</option>
                      <option value="Food">Food / Mess Quality</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="complaint-urgency-select">Urgency</label>
                    <select 
                      id="complaint-urgency-select"
                      value={newComplaintUrgency}
                      onChange={(e) => setNewComplaintUrgency(e.target.value)}
                      className="form-control"
                    >
                      <option value="Low">Low (Can wait 24-48h)</option>
                      <option value="High">High (Needs same day fix)</option>
                      <option value="Critical">Critical (Emergency)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="complaint-desc-input">Description Details</label>
                  <textarea 
                    id="complaint-desc-input"
                    rows={3}
                    value={newComplaintDesc}
                    onChange={(e) => setNewComplaintDesc(e.target.value)}
                    placeholder="Provide any specific details so the warden or staff can resolve it faster..."
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewComplaintModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
