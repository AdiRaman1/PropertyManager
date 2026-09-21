import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, Users, CheckCircle, Clock, Phone, DollarSign, Wallet } from 'lucide-react';

export default function ExpensesStaff({ propertyId, expenses, setExpenses, staff, setStaff, t }) {
  // Navigation states inside sub-tab
  const [innerTab, setInnerTab] = useState('expenses');

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Form states for Expense
  const [expCategory, setExpCategory] = useState('Electricity');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');

  // Form states for Staff
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Cook');
  const [staffSalary, setStaffSalary] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  const activeExpenses = expenses.filter(e => e.propertyId === propertyId);
  const activeStaff = staff.filter(s => s.propertyId === propertyId);

  // Calculations
  const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const staffSalaryTotal = activeStaff.reduce((sum, s) => sum + s.salary, 0);
  const paidSalaryTotal = activeStaff.filter(s => s.paidThisMonth).reduce((sum, s) => sum + s.salary, 0);
  const pendingSalaryTotal = activeStaff.filter(s => !s.paidThisMonth).reduce((sum, s) => sum + s.salary, 0);

  // Submit Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expAmount || isNaN(expAmount)) return;

    const newExpObj = {
      id: 'exp-' + Date.now(),
      propertyId,
      category: expCategory,
      amount: parseFloat(expAmount),
      date: expDate,
      description: expDesc || `${expCategory} expense`
    };

    setExpenses(prev => [newExpObj, ...prev]);
    setShowExpenseModal(false);

    // Reset
    setExpAmount('');
    setExpDesc('');
    setExpCategory('Electricity');
    setExpDate(new Date().toISOString().split('T')[0]);
  };

  // Submit Staff
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!staffName || !staffSalary || !staffPhone) return;

    const newStaffObj = {
      id: 'staff-' + Date.now(),
      propertyId,
      name: staffName,
      role: staffRole,
      salary: parseFloat(staffSalary),
      phone: staffPhone,
      paidThisMonth: false
    };

    setStaff(prev => [...prev, newStaffObj]);
    setShowStaffModal(false);

    // Reset
    setStaffName('');
    setStaffSalary('');
    setStaffPhone('');
    setStaffRole('Cook');
  };

  // Mark staff salary as paid
  const handlePaySalary = (staffMember) => {
    if (window.confirm(`Mark salary of ₹${staffMember.salary.toLocaleString('en-IN')} paid to ${staffMember.name}? This logs an automatic expense.`)) {
      setStaff(prev => prev.map(s => {
        if (s.id === staffMember.id) return { ...s, paidThisMonth: true };
        return s;
      }));

      // Log Expense automatically
      const salaryExpense = {
        id: 'exp-sal-' + Date.now(),
        propertyId,
        category: 'Staff Salary',
        amount: staffMember.salary,
        date: new Date().toISOString().split('T')[0],
        description: `Salary payout to ${staffMember.name} (${staffMember.role})`
      };

      setExpenses(prev => [salaryExpense, ...prev]);
    }
  };

  // Delete staff
  const handleDeleteStaff = (staffId) => {
    if (window.confirm('Remove this staff member from your PG roster?')) {
      setStaff(prev => prev.filter(s => s.id !== staffId));
    }
  };

  // Delete expense
  const handleDeleteExpense = (expId) => {
    if (window.confirm('Delete this expense log?')) {
      setExpenses(prev => prev.filter(e => e.id !== expId));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Unified Page Control Bar */}
      <div className="page-control-bar">
        <div className="control-group-left" role="tablist">
          <button
            role="tab"
            aria-selected={innerTab === 'expenses'}
            onClick={() => setInnerTab('expenses')}
            className={`btn btn-sm ${innerTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <CreditCard size={14} />
            <span>{t('monthlyExpenses')} ({activeExpenses.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={innerTab === 'staff'}
            onClick={() => setInnerTab('staff')}
            className={`btn btn-sm ${innerTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={14} />
            <span>{t('staffRoster')} ({activeStaff.length})</span>
          </button>
        </div>

        <div className="control-group-right">
          {innerTab === 'expenses' ? (
            <button onClick={() => setShowExpenseModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>{t('logExpense')}</span>
            </button>
          ) : (
            <button onClick={() => setShowStaffModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>{t('addStaff')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Sub Panels with Split View */}
      {innerTab === 'expenses' ? (
        <div className="split-view-container">
          {/* Main Column: Expenses Table */}
          <div className="main-column">
            <div className="table-container">
              <table className="custom-table" aria-label="Monthly Expenses Ledger">
                <thead>
                  <tr>
                    <th scope="col">{t('category')}</th>
                    <th scope="col">{t('description')}</th>
                    <th scope="col">{t('date')}</th>
                    <th scope="col">Amount</th>
                    <th scope="col" style={{ textAlign: 'right' }}>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeExpenses.length > 0 ? (
                    activeExpenses.map(exp => (
                      <tr key={exp.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {exp.category}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{exp.description}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{exp.date}</td>
                        <td style={{ fontWeight: 800, color: '#b91c1c' }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="btn-icon-only btn-sm"
                            style={{ color: '#dc2626', borderColor: 'transparent', backgroundColor: 'transparent' }}
                            title="Delete Log"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        No expenses logged for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Column: Budget Widget */}
          <div className="side-column" style={{ position: 'sticky', top: '20px' }}>
            <div className="card" style={{ backgroundColor: '#0f172a', color: '#ffffff', border: '1px solid #1e293b' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                <Wallet size={16} style={{ color: '#93c5fd' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
                  {t('cashOutflow')}
                </span>
              </div>
              <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>₹{totalExpenses.toLocaleString('en-IN')}</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '8px', lineHeight: 1.5 }}>
                Includes general utilities, broadband bills, repairs, and staff payrolls.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Staff Panel */
        <div className="split-view-container">
          {/* Main Column: Staff Roster Grid */}
          <div className="main-column">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {activeStaff.length > 0 ? (
                activeStaff.map(member => (
                  <div key={member.id} className="card flex flex-col gap-3">
                    <div className="flex justify-between items-start" style={{ width: '100%' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{member.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{member.role}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="btn-icon-only btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                        title="Remove Staff"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{member.phone}</strong>
                      </span>
                      <span className="flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>{t('salary')}:</span>
                        <strong style={{ color: 'var(--text-main)' }}>₹{member.salary.toLocaleString('en-IN')}/mo</strong>
                      </span>
                    </div>

                    <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                      <span className={`status-pill ${member.paidThisMonth ? 'status-pill-paid' : 'status-pill-unpaid'}`}>
                        {member.paidThisMonth ? <CheckCircle size={11} /> : <Clock size={11} />}
                        <span>{member.paidThisMonth ? t('salaryPaid') : t('pendingPayout')}</span>
                      </span>
                      
                      {!member.paidThisMonth && (
                        <button
                          onClick={() => handlePaySalary(member)}
                          className="btn btn-primary btn-sm"
                        >
                          {t('paySalary')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-12" style={{ color: 'var(--text-muted)', gridColumn: 'span 2' }}>
                  <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>No staff registered</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Onboard cooks, security personnel, wardens or housekeeping cleaners.</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Column: Budget Widget */}
          <div className="side-column" style={{ position: 'sticky', top: '20px' }}>
            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                {t('salaryBudget')}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{staffSalaryTotal.toLocaleString('en-IN')}
              </h3>
              <div style={{ marginTop: '14px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex justify-between p-2 rounded-md" style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <span style={{ color: '#065f46', fontWeight: 600 }}>{t('paid')}:</span> 
                  <strong style={{ color: '#047857' }}>₹{paidSalaryTotal.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-md" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <span style={{ color: '#991b1b', fontWeight: 600 }}>{t('pending')}:</span> 
                  <strong style={{ color: '#b91c1c' }}>₹{pendingSalaryTotal.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Log Monthly Expense</h2>
              <button onClick={() => setShowExpenseModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="exp-category-select">{t('category')}</label>
                    <select 
                      id="exp-category-select"
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="form-control"
                    >
                      <option value="Electricity">Electricity</option>
                      <option value="Internet">Internet (Wi-Fi)</option>
                      <option value="Food Supplies">Food Supplies</option>
                      <option value="Repairs">Repairs & Maintenance</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exp-date-input">{t('date')}</label>
                    <input 
                      id="exp-date-input"
                      type="date" 
                      required 
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="exp-amount-input">Amount (INR)</label>
                  <input 
                    id="exp-amount-input"
                    type="number" 
                    required 
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="e.g. 1500" 
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="exp-desc-input">{t('description')}</label>
                  <textarea 
                    id="exp-desc-input"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Describe payment items, service duration or repairs details..." 
                    className="form-control"
                    rows="3"
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">Log Outflow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showStaffModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Onboard Staff Member</h2>
              <button onClick={() => setShowStaffModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="staff-name-input">{t('fullName')}</label>
                  <input 
                    id="staff-name-input"
                    type="text" 
                    required 
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="E.g. Ramesh Singh" 
                    className="form-control"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="staff-role-select">{t('staffRole')}</label>
                    <select 
                      id="staff-role-select"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="form-control"
                    >
                      <option value="Cook">Cook / Kitchen Assistant</option>
                      <option value="Warden">Hostel Warden</option>
                      <option value="Housekeeper">Housekeeper / Cleaner</option>
                      <option value="Security Guard">Security Guard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="staff-salary-input">Monthly Salary (INR)</label>
                    <input 
                      id="staff-salary-input"
                      type="number" 
                      required 
                      value={staffSalary}
                      onChange={(e) => setStaffSalary(e.target.value)}
                      placeholder="e.g. 12000" 
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="staff-phone-input">{t('phone')}</label>
                  <input 
                    id="staff-phone-input"
                    type="tel" 
                    required 
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="e.g. 9812345678" 
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowStaffModal(false)} className="btn btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
