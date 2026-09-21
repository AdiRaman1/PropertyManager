import React from 'react';
import { 
  Home, 
  Users, 
  IndianRupee, 
  AlertCircle, 
  TrendingUp, 
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function Dashboard({ propertyId, rooms, tenants, payments, expenses, complaints, t }) {
  // Filter items matching active propertyId
  const propRooms = rooms.filter(r => r.propertyId === propertyId);
  const propTenants = tenants.filter(t => t.propertyId === propertyId);
  const propPayments = payments.filter(p => p.propertyId === propertyId);
  const propExpenses = expenses.filter(e => e.propertyId === propertyId);
  const propComplaints = complaints.filter(c => c.propertyId === propertyId);

  // Calculations
  const totalRooms = propRooms.length;
  const totalBeds = propRooms.reduce((acc, r) => acc + r.totalBeds, 0);
  const occupiedBeds = propTenants.length;
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Rent dues & collection metrics
  const totalCollectedRent = propPayments.reduce((acc, p) => acc + p.amount, 0);
  
  // Calculate total expected rent
  const totalExpectedRent = propTenants.reduce((acc, t) => {
    const room = propRooms.find(r => r.id === t.roomId);
    return acc + (room ? room.rent : 0);
  }, 0);
  const totalDues = Math.max(0, totalExpectedRent - totalCollectedRent);

  // Total expenses
  const totalExpenses = propExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netEarnings = totalCollectedRent - totalExpenses;

  // Open complaints
  const openComplaintsCount = propComplaints.filter(c => c.status !== 'Resolved').length;

  // Activity list mock-up based on real data
  const activities = [
    ...propPayments.map(p => ({
      type: 'payment',
      text: `${p.tenantName} paid ₹${p.amount.toLocaleString('en-IN')} via ${p.method}`,
      time: p.date,
      dotColor: '#059669'
    })),
    ...propTenants.map(t => ({
      type: 'onboarding',
      text: `New tenant ${t.name} assigned to Room ${rooms.find(r => r.id === t.roomId)?.number || ''}`,
      time: t.joiningDate,
      dotColor: '#2563eb'
    })),
    ...propComplaints.map(c => ({
      type: 'complaint',
      text: `Complaint logged: "${c.title}" for Room ${c.roomNumber}`,
      time: c.dateLogged,
      dotColor: c.status === 'Resolved' ? '#64748b' : '#d97706'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  // Category-wise Expenses Breakdown
  const expenseCategories = ['Electricity', 'Internet', 'Food Supplies', 'Repairs', 'Water Supply', 'Staff Salary', 'Miscellaneous'];
  const expenseSummary = expenseCategories
    .map(cat => {
      const total = propExpenses
        .filter(e => e.category.toLowerCase() === cat.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);
      return { category: cat, amount: total };
    })
    .filter(item => item.amount > 0);

  const maxExpense = Math.max(...expenseSummary.map(e => e.amount), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Stat Cards */}
      <section className="stats-grid" aria-label="Key Performance Indicators">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Home size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">{t('totalRooms')}</span>
            <span className="stat-value">{totalRooms}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">{t('occupiedBeds')}</span>
            <span className="stat-value">
              {occupiedBeds} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalBeds}</span>
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <IndianRupee size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">{t('collectedRent')}</span>
            <span className="stat-value" style={{ color: '#15803d' }}>
              ₹{totalCollectedRent.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">{t('activeDues')}</span>
            <span className="stat-value" style={{ color: totalDues > 0 ? '#b91c1c' : 'inherit' }}>
              ₹{totalDues.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </section>

      {/* Main Analytics Grid */}
      <section className="dashboard-metrics-grid">
        {/* Left Column: Rent Collection & Financials overview */}
        <div className="flex flex-col gap-6">
          <div className="card flex-1">
            <div className="card-title">
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              <span>{t('financialStatement')}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', margin: '18px 0' }}>
              <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  {t('totalIncome')}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14532d' }}>
                  ₹{totalCollectedRent.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  {t('totalExpenses')}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7f1d1d' }}>
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: netEarnings >= 0 ? '#eff6ff' : '#fff1f2', border: `1px solid ${netEarnings >= 0 ? '#bfdbfe' : '#fecdd3'}`, textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: netEarnings >= 0 ? '#1d4ed8' : '#be123c', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  {t('netEarnings')}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: netEarnings >= 0 ? '#1e3a8a' : '#881337' }}>
                  {netEarnings < 0 ? '-' : ''}₹{Math.abs(netEarnings).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Accessible Expense Distribution List */}
            <div style={{ marginTop: '24px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t('expenseDistribution')}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Total: ₹{totalExpenses.toLocaleString('en-IN')}
                </span>
              </div>

              {expenseSummary.length > 0 ? (
                <div className="expense-progress-list">
                  {expenseSummary.map((item, idx) => {
                    const percent = Math.round((item.amount / (totalExpenses || 1)) * 100);
                    return (
                      <div key={idx} className="expense-progress-item">
                        <div className="expense-progress-header">
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.category}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                            ₹{item.amount.toLocaleString('en-IN')} <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>({percent}%)</span>
                          </span>
                        </div>
                        <div className="expense-progress-bar-bg">
                          <div 
                            className="expense-progress-bar-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                  No expenses logged for this property yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Circular occupancy progress & Recent alerts */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-title">
              <span>{t('occupancyEfficiency')}</span>
            </div>
            
            <div className="gauge-wrapper">
              <svg className="gauge-circle" width="160" height="160" aria-label={`Occupancy rate: ${occupancyRate}%`}>
                <circle 
                  cx="80" 
                  cy="80" 
                  r="65" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="12" 
                />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="65" 
                  fill="none" 
                  stroke="#2563eb" 
                  strokeWidth="12" 
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 408.4,
                    strokeDashoffset: 408.4 - (408.4 * occupancyRate) / 100,
                    transition: 'stroke-dashoffset 0.6s ease'
                  }}
                />
              </svg>
              <div className="gauge-text">
                <span className="gauge-val">{occupancyRate}%</span>
                <span className="gauge-lbl">{occupiedBeds} {t('bedsFull')}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', display: 'block' }}>
                  {t('vacantBeds')}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', marginTop: '2px', display: 'block' }}>
                  {vacantBeds} {t('available')}
                </span>
              </div>

              <div style={{ padding: '12px', backgroundColor: openComplaintsCount > 0 ? '#fffbeb' : '#f8fafc', borderRadius: '8px', border: `1px solid ${openComplaintsCount > 0 ? '#fde68a' : '#e2e8f0'}`, textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: openComplaintsCount > 0 ? '#b45309' : 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  {t('openComplaints')}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: openComplaintsCount > 0 ? '#92400e' : 'var(--text-main)', marginTop: '2px', display: 'block' }}>
                  {openComplaintsCount} {t('pending')}
                </span>
              </div>
            </div>
          </div>

          <div className="card flex-1">
            <div className="card-title">
              <span>{t('recentActivity')}</span>
            </div>
            <div className="activity-list">
              {activities.length > 0 ? (
                activities.map((act, idx) => (
                  <div key={idx} className="activity-item">
                    <span 
                      className="activity-dot" 
                      style={{ backgroundColor: act.dotColor }}
                    />
                    <div>
                      <p className="activity-desc">{act.text}</p>
                      <span className="activity-time">
                        {new Date(act.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {t('noActivity')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
