import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Utensils, 
  Wrench, 
  ShieldCheck, 
  Phone, 
  Sparkles, 
  AlertCircle, 
  ListChecks, 
  Calendar,
  Building2
} from 'lucide-react';

export default function StaffPortal({ 
  currentUser, 
  staff, 
  setStaff, 
  complaints, 
  setComplaints, 
  foodMenus, 
  properties, 
  tenants, 
  rooms, 
  t 
}) {
  const staffMember = staff.find(s => s.id === currentUser.staffId) || staff[0];
  const property = properties.find(p => p.id === staffMember.propertyId);

  // Attendance state
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('08:15 AM');

  // Interactive task checklists
  const isCook = staffMember.role.toLowerCase().includes('cook');
  const isHousekeeper = staffMember.role.toLowerCase().includes('housekeeper') || staffMember.role.toLowerCase().includes('clean');
  
  const [tasks, setTasks] = useState([
    { id: 1, text: isCook ? 'Morning breakfast preparation & tea service' : 'Floor 1 & 2 corridor sweeping and mopping', done: true },
    { id: 2, text: isCook ? 'Lunch preparation (Thali & Dal Fry)' : 'Common washroom sanitization & soap refill', done: true },
    { id: 3, text: isCook ? 'Evening tea & snacks prep' : 'Garbage disposal & bin bag replacement', done: false },
    { id: 4, text: isCook ? 'Dinner cooking & kitchen cleaning' : 'Evening lights & main entrance security check', done: false }
  ]);

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, done: !task.done } : task));
  };

  // Property occupancy stats
  const activeTenantsCount = tenants.filter(t => t.propertyId === staffMember.propertyId).length;
  
  // Property maintenance complaints
  const propertyComplaints = complaints.filter(c => c.propertyId === staffMember.propertyId);

  // Food menu for Cook
  const currentMenu = foodMenus.find(m => m.propertyId === staffMember.propertyId)?.schedule || {};
  const todayDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayMeals = currentMenu[todayDayName] || currentMenu['Monday'] || {};

  // Status transitions for tickets
  const handleUpdateTicketStatus = (ticketId, nextStatus) => {
    setComplaints(prev => prev.map(c => c.id === ticketId ? { ...c, status: nextStatus } : c));
  };

  const handlePunchIn = () => {
    setIsCheckedIn(true);
    setCheckInTime(new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
  };

  return (
    <div>
      {/* Staff Hero Banner */}
      <div className="portal-hero-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <span className="badge" style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none' }}>
                Staff Operations Portal
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{property?.name}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Welcome, {staffMember.name}!
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9375rem', marginTop: '6px' }}>
              Role: <strong>{staffMember.role}</strong> • Shift: <strong>08:00 AM – 05:00 PM</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Daily Attendance
            </div>
            {isCheckedIn ? (
              <div className="flex items-center gap-2" style={{ marginTop: '4px', justifyContent: 'flex-end' }}>
                <span className="badge" style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '0.875rem' }}>
                  ✓ Checked In ({checkInTime})
                </span>
              </div>
            ) : (
              <button 
                onClick={handlePunchIn}
                className="btn btn-primary btn-sm" 
                style={{ marginTop: '4px' }}
              >
                <Clock size={14} />
                <span>Mark Attendance</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staff Stats Overview */}
      <div className="portal-stat-grid">
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Monthly Salary
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            ₹{staffMember.salary.toLocaleString('en-IN')}/mo
          </h3>
          <div style={{ marginTop: '6px' }}>
            <span className={`status-pill ${staffMember.paidThisMonth ? 'status-pill-paid' : 'status-pill-unpaid'}`}>
              {staffMember.paidThisMonth ? <CheckCircle2 size={12} /> : <Clock size={12} />}
              <span>{staffMember.paidThisMonth ? 'September Paid' : 'Pending Payout'}</span>
            </span>
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Headcount Served
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            {activeTenantsCount} Residents
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Active occupants in {property?.name}
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Open Service Tickets
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {propertyComplaints.filter(c => c.status !== 'Resolved').length} Active
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {propertyComplaints.filter(c => c.status === 'Resolved').length} resolved this month
          </p>
        </div>
      </div>

      {/* Main Column Split: Tasks vs Kitchen/Maintenance */}
      <div className="split-view-container">
        {/* Left Column: Daily Checklist */}
        <div className="main-column flex flex-col gap-6">
          <div className="card">
            <div className="card-title">
              <div className="flex items-center gap-2">
                <ListChecks size={18} style={{ color: 'var(--primary)' }} />
                <span>Today's Work Checklist ({tasks.filter(t => t.done).length}/{tasks.length} Completed)</span>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`checklist-item ${task.done ? 'done' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  role="button"
                  tabIndex={0}
                >
                  <input 
                    type="checkbox" 
                    checked={task.done} 
                    onChange={() => toggleTask(task.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9375rem', color: 'var(--text-main)', fontWeight: task.done ? 500 : 600 }}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Kitchen Meal Schedule if Cook */}
          {isCook && (
            <div className="card" style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                <Utensils size={18} style={{ color: '#d97706' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
                  Today's Kitchen Menu ({todayDayName}) — {activeTenantsCount} Servings
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Breakfast</span>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '4px 0 0' }}>{todayMeals.Breakfast}</p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Lunch</span>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '4px 0 0' }}>{todayMeals.Lunch}</p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Snacks</span>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '4px 0 0' }}>{todayMeals.Snacks}</p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Dinner</span>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '4px 0 0' }}>{todayMeals.Dinner}</p>
                </div>
              </div>
            </div>
          )}

          {/* Service Requests Board */}
          <div className="card">
            <div className="card-title">
              <span>Property Maintenance Tickets</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {propertyComplaints.map(ticket => (
                <div key={ticket.id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.6875rem' }}>
                        Room {ticket.roomNumber} • {ticket.category}
                      </span>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                        {ticket.title}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {ticket.description}
                      </p>
                    </div>

                    <div>
                      {ticket.status === 'Open' && (
                        <button 
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'In Progress')}
                          className="btn btn-secondary btn-sm"
                        >
                          Start Work
                        </button>
                      )}
                      {ticket.status === 'In Progress' && (
                        <button 
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'Resolved')}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: '#16a34a', borderColor: '#15803d' }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Resolve</span>
                        </button>
                      )}
                      {ticket.status === 'Resolved' && (
                        <span className="badge badge-paid">Resolved</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Column: Manager Contact & Property Info */}
        <div className="side-column" style={{ position: 'sticky', top: '20px' }}>
          <div className="card">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Hostel Property
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {property?.name}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Operated & Managed via My PG Manager Cloud.
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Manager Contact
              </span>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Aditya Raman (Owner)
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                +91 98765 00000
              </div>

              <a 
                href="tel:9876500000"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                <Phone size={14} />
                <span>Call Owner</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
