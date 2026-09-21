import React, { useState } from 'react';
import { Search, PlusCircle, FileText, CheckCircle, Clock, AlertTriangle, Printer, IndianRupee, MessageSquare, Copy, Send, Check, Banknote, Mail, Share2, Settings } from 'lucide-react';
import { interpolateTemplate, getPropertyTemplate } from '../utils/templateEngine';
import WhatsAppTemplateModal from './WhatsAppTemplateModal';

export default function RentLedger({ 
  propertyId, 
  currentProperty, 
  onUpdatePropertyTemplates, 
  tenants, 
  setTenants, 
  payments, 
  setPayments, 
  rooms, 
  t 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Property Template Customizer State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateTab, setTemplateTab] = useState('rent_reminder');

  // WhatsApp Reminder State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [activeWhatsAppTenant, setActiveWhatsAppTenant] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Offline Cash Acknowledgment State
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashTenant, setCashTenant] = useState(null);
  const [cashAmount, setCashAmount] = useState('');
  const [cashCollector, setCashCollector] = useState('Aditya Raman (Owner)');
  const [cashReceiptConfirmed, setCashReceiptConfirmed] = useState(null);
  const [copiedCashChit, setCopiedCashChit] = useState(false);

  // Form states for Recording Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const activeTenants = tenants.filter(t => t.propertyId === propertyId);

  // Helper to fetch room number and monthly rent
  const getTenantRoomInfo = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? { number: room.number, rent: room.rent } : { number: 'N/A', rent: 0 };
  };

  // Filter tenants
  const filteredTenants = activeTenants.filter(t => {
    const roomInfo = getTenantRoomInfo(t.roomId);
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          roomInfo.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && t.rentStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  // Counts for filter pills
  const paidCount = activeTenants.filter(t => t.rentStatus === 'Paid').length;
  const partialCount = activeTenants.filter(t => t.rentStatus === 'Partial').length;
  const unpaidCount = activeTenants.filter(t => t.rentStatus === 'Unpaid').length;

  // Record payment submit handler
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) return;

    const amount = parseFloat(paymentAmount);
    const roomInfo = getTenantRoomInfo(selectedTenant.roomId);
    const currentPaidTotal = (selectedTenant.amountPaid || 0) + amount;
    
    let status = 'Unpaid';
    if (currentPaidTotal >= roomInfo.rent) {
      status = 'Paid';
    } else if (currentPaidTotal > 0) {
      status = 'Partial';
    }

    // Update Tenant Rent Status
    setTenants(prev => prev.map(t => {
      if (t.id === selectedTenant.id) {
        return {
          ...t,
          rentStatus: status,
          amountPaid: currentPaidTotal
        };
      }
      return t;
    }));

    // Create payment ledger record
    const newPaymentObj = {
      id: 'pay-' + Date.now(),
      propertyId,
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      roomNumber: roomInfo.number,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      status: status === 'Paid' ? 'Full Payment' : 'Partial Payment'
    };

    setPayments(prev => [newPaymentObj, ...prev]);
    setShowPaymentModal(false);
    
    // Set active receipt for display immediately
    setActiveReceipt({
      receiptId: newPaymentObj.id,
      date: newPaymentObj.date,
      tenantName: selectedTenant.name,
      phone: selectedTenant.phone,
      roomNumber: roomInfo.number,
      rentAmount: roomInfo.rent,
      paidAmount: amount,
      remainingDues: Math.max(0, roomInfo.rent - currentPaidTotal),
      method: paymentMethod
    });
    
    setShowReceiptModal(true);

    // Reset
    setPaymentAmount('');
    setPaymentMethod('UPI');
  };

  // Open receipt directly from ledger row
  const viewReceipt = (tenant) => {
    const roomInfo = getTenantRoomInfo(tenant.roomId);
    
    const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
    const lastPayment = tenantPayments[0] || { id: 'N/A', date: new Date().toISOString().split('T')[0], amount: tenant.amountPaid, method: 'Cash' };

    setActiveReceipt({
      receiptId: lastPayment.id,
      date: lastPayment.date,
      tenantName: tenant.name,
      phone: tenant.phone,
      roomNumber: roomInfo.number,
      rentAmount: roomInfo.rent,
      paidAmount: tenant.amountPaid,
      remainingDues: Math.max(0, roomInfo.rent - tenant.amountPaid),
      method: lastPayment.method
    });
    setShowReceiptModal(true);
  };

  // Open WhatsApp Reminder Modal
  const handleOpenWhatsAppReminder = (tenant) => {
    setActiveWhatsAppTenant(tenant);
    setCopiedMessage(false);
    setShowWhatsAppModal(true);
  };

  const getWhatsAppMessageText = (tenant) => {
    if (!tenant) return '';
    const roomInfo = getTenantRoomInfo(tenant.roomId);
    const dueAmount = Math.max(0, roomInfo.rent - (tenant.amountPaid || 0));
    const effectiveProp = currentProperty || { name: 'Greenwood Heights PG', upiId: 'greenwoodpg@okhdfcbank' };
    const rawTemplate = getPropertyTemplate(effectiveProp, 'rent_reminder');

    return interpolateTemplate(rawTemplate, {
      tenant_name: tenant.name,
      room_number: roomInfo.number,
      amount_due: dueAmount.toLocaleString('en-IN'),
      due_date: '5th of this month',
      property_name: effectiveProp.name || 'Greenwood Heights PG',
      upi_id: effectiveProp.upiId || 'greenwoodpg@okhdfcbank',
      payment_link: `https://mypgmanager.com/pay/${tenant.id}`
    });
  };

  // Open Offline Cash Acknowledgment Modal
  const openCashModal = (tenant) => {
    const roomInfo = getTenantRoomInfo(tenant.roomId);
    const dues = Math.max(0, roomInfo.rent - (tenant.amountPaid || 0));
    setCashTenant(tenant);
    setCashAmount(dues);
    setCashCollector('Aditya Raman (Owner)');
    setCashReceiptConfirmed(null);
    setCopiedCashChit(false);
    setShowCashModal(true);
  };

  // Confirm Cash Payment & Generate Cash Slip
  const handleConfirmCashPayment = (e) => {
    if (e) e.preventDefault();
    if (!cashTenant) return;
    const roomInfo = getTenantRoomInfo(cashTenant.roomId);
    const payNum = Number(cashAmount);
    if (!payNum || payNum <= 0) return;

    const newAmountPaid = (cashTenant.amountPaid || 0) + payNum;
    const newRentStatus = newAmountPaid >= roomInfo.rent ? 'Paid' : 'Partial';
    const slipId = '#CASH-' + Math.floor(1000 + Math.random() * 9000);
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // 1. Update tenant record
    const updatedTenants = tenants.map(t => {
      if (t.id === cashTenant.id) {
        return {
          ...t,
          amountPaid: newAmountPaid,
          rentStatus: newRentStatus,
          lastPaymentMode: 'Cash',
          cashCollector: cashCollector,
          cashSlipId: slipId
        };
      }
      return t;
    });
    setTenants(updatedTenants);

    // 2. Add to payments log
    const newPaymentRecord = {
      id: 'pay-' + Date.now(),
      tenantId: cashTenant.id,
      tenantName: cashTenant.name,
      amount: payNum,
      date: todayStr,
      method: 'Cash',
      collector: cashCollector,
      receiptNumber: slipId
    };
    setPayments([newPaymentRecord, ...payments]);

    // 3. Set confirmed cash receipt for 1-click sharing
    const remainingBalance = Math.max(0, roomInfo.rent - newAmountPaid);
    setCashReceiptConfirmed({
      slipId: slipId,
      tenantId: cashTenant.id,
      tenantName: cashTenant.name,
      tenantPhone: cashTenant.phone,
      tenantEmail: cashTenant.email,
      roomNumber: roomInfo.number,
      amount: payNum,
      totalRent: roomInfo.rent,
      remainingDues: remainingBalance,
      collector: cashCollector,
      date: todayStr
    });
  };

  const getCashWhatsAppText = (receipt) => {
    if (!receipt) return '';
    const effectiveProp = currentProperty || { name: 'Greenwood Heights PG' };
    const rawTemplate = getPropertyTemplate(effectiveProp, 'cash_receipt');

    return interpolateTemplate(rawTemplate, {
      tenant_name: receipt.tenantName,
      room_number: receipt.roomNumber,
      amount_paid: Number(receipt.amount).toLocaleString('en-IN'),
      collector_name: receipt.collector,
      receipt_id: receipt.slipId,
      payment_date: receipt.date,
      remaining_dues: Number(receipt.remainingDues).toLocaleString('en-IN'),
      property_name: effectiveProp.name || 'Greenwood Heights PG'
    });
  };

  const getCashEmailHref = (receipt) => {
    if (!receipt) return '#';
    const subject = encodeURIComponent(`Rent Cash Payment Slip - Room ${receipt.roomNumber} (${receipt.slipId})`);
    const body = encodeURIComponent(getCashWhatsAppText(receipt));
    return `mailto:${receipt.tenantEmail || ''}?subject=${subject}&body=${body}`;
  };

  // Trigger Print Receipt Layout
  const triggerPrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rent Receipt - ${activeReceipt.tenantName}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #000; background: #fff; }
            .receipt-wrapper { max-width: 480px; margin: 0 auto; border: 2px dashed #000; padding: 24px; border-radius: 8px; }
            .receipt-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem; }
            .receipt-divider { border-top: 1px dashed #000; margin: 12px 0; }
            .receipt-total { font-weight: bold; font-size: 1.1rem; }
            .receipt-footer { text-align: center; margin-top: 24px; font-size: 0.8rem; color: #444; }
          </style>
        </head>
        <body>
          <div class="receipt-wrapper">
            <div class="receipt-header">
              <h2 style="margin: 0; font-size: 1.5rem;">MY PG MANAGER</h2>
              <p style="margin: 4px 0 0; font-size: 0.8rem; letter-spacing: 1px;">DIGITAL RENT RECEIPT</p>
            </div>
            <div class="receipt-row"><span>Receipt ID:</span><strong>${activeReceipt.receiptId}</strong></div>
            <div class="receipt-row"><span>Date:</span><span>${activeReceipt.date}</span></div>
            <div class="receipt-divider"></div>
            <div class="receipt-row"><span>Tenant Name:</span><strong>${activeReceipt.tenantName}</strong></div>
            <div class="receipt-row"><span>Phone:</span><span>${activeReceipt.phone}</span></div>
            <div class="receipt-row"><span>Room Assigned:</span><span>Room ${activeReceipt.roomNumber}</span></div>
            <div class="receipt-divider"></div>
            <div class="receipt-row"><span>Monthly Rent:</span><span>₹${activeReceipt.rentAmount.toLocaleString('en-IN')}</span></div>
            <div class="receipt-row"><span>Amount Paid:</span><strong style="color: #059669;">₹${activeReceipt.paidAmount.toLocaleString('en-IN')}</strong></div>
            <div class="receipt-row"><span>Payment Mode:</span><span>${activeReceipt.method}</span></div>
            <div class="receipt-divider"></div>
            <div class="receipt-row receipt-total"><span>Remaining Dues:</span><span>₹${activeReceipt.remainingDues.toLocaleString('en-IN')}</span></div>
            <div class="receipt-footer">
              <p>Thank you for your payment!</p>
              <p>Generated digitally via My PG Manager App</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Unified Page Control Bar */}
      <div className="page-control-bar">
        {/* Search Input */}
        <div className="control-group-left">
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="form-control"
              style={{ paddingLeft: '36px', height: '38px' }}
              aria-label="Search tenants or rooms"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="control-group-right" role="group" aria-label="Rent status filters">
          <button
            onClick={() => setStatusFilter('All')}
            className={`btn btn-sm ${statusFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('allDues')} ({activeTenants.length})
          </button>
          <button
            onClick={() => setStatusFilter('Paid')}
            className={`btn btn-sm ${statusFilter === 'Paid' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('paidDues')} ({paidCount})
          </button>
          <button
            onClick={() => setStatusFilter('Partial')}
            className={`btn btn-sm ${statusFilter === 'Partial' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('partialDues')} ({partialCount})
          </button>
          <button
            onClick={() => setStatusFilter('Unpaid')}
            className={`btn btn-sm ${statusFilter === 'Unpaid' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('unpaidDues')} ({unpaidCount})
          </button>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="table-container">
        <table className="custom-table" aria-label="Tenant Rent Ledger">
          <thead>
            <tr>
              <th scope="col">Tenant Name</th>
              <th scope="col">Room No</th>
              <th scope="col">Monthly Rent</th>
              <th scope="col">Amount Paid</th>
              <th scope="col">Remaining Dues</th>
              <th scope="col">Rent Status</th>
              <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map(tenant => {
                const roomInfo = getTenantRoomInfo(tenant.roomId);
                const rent = roomInfo.rent;
                const paid = tenant.amountPaid || 0;
                const dues = Math.max(0, rent - paid);
                
                let statusPillClass = 'status-pill-unpaid';
                let StatusIcon = AlertTriangle;
                if (tenant.rentStatus === 'Paid') {
                  statusPillClass = 'status-pill-paid';
                  StatusIcon = CheckCircle;
                } else if (tenant.rentStatus === 'Partial') {
                  statusPillClass = 'status-pill-partial';
                  StatusIcon = Clock;
                }

                return (
                  <tr key={tenant.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{tenant.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tenant.phone}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Room {roomInfo.number}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{rent.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>₹{paid.toLocaleString('en-IN')}</td>
                    <td style={{ color: dues > 0 ? '#b91c1c' : 'var(--text-muted)', fontWeight: dues > 0 ? 800 : 500 }}>
                      ₹{dues.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`status-pill ${statusPillClass}`}>
                        <StatusIcon size={12} />
                        <span>{t(tenant.rentStatus.toLowerCase() + 'Dues')}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowPaymentModal(true);
                          }}
                          disabled={tenant.rentStatus === 'Paid'}
                          className="btn btn-success btn-sm"
                          style={{ 
                            opacity: tenant.rentStatus === 'Paid' ? 0.4 : 1,
                            cursor: tenant.rentStatus === 'Paid' ? 'not-allowed' : 'pointer'
                          }}
                          title="Record Rent Payment"
                        >
                          <PlusCircle size={13} />
                          <span>{t('recordPayment')}</span>
                        </button>
                        
                        <button
                          onClick={() => viewReceipt(tenant)}
                          disabled={paid === 0}
                          className="btn btn-secondary btn-sm"
                          style={{ 
                            opacity: paid === 0 ? 0.4 : 1,
                            cursor: paid === 0 ? 'not-allowed' : 'pointer'
                          }}
                          title="View / Print Receipt"
                        >
                          <FileText size={13} />
                          <span>{t('receipt')}</span>
                        </button>

                        {tenant.rentStatus !== 'Paid' && (
                          <button
                            onClick={() => openCashModal(tenant)}
                            className="btn btn-sm btn-cash"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="Acknowledge Offline Cash Payment"
                          >
                            <Banknote size={13} />
                            <span>{t('acknowledgeCash') || 'Cash'}</span>
                          </button>
                        )}

                        {tenant.rentStatus !== 'Paid' && (
                          <button
                            onClick={() => handleOpenWhatsAppReminder(tenant)}
                            className="btn btn-sm btn-whatsapp"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            title="Send WhatsApp Rent Reminder"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  No tenants found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedTenant && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Record Payment - {selectedTenant.name}</h2>
              <button onClick={() => setShowPaymentModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div style={{ padding: '12px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '16px' }}>
                  <div className="flex justify-between" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#166534', marginBottom: '3px' }}>
                    <span>{t('baseRent')}:</span>
                    <span>₹{getTenantRoomInfo(selectedTenant.roomId).rent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803d' }}>
                    <span>{t('alreadyPaid')}:</span>
                    <span>₹{(selectedTenant.amountPaid || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="payment-amount-input">{t('amountPaid')}</label>
                  <input 
                    id="payment-amount-input"
                    type="number" 
                    required 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 8500" 
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="payment-method-select">{t('paymentMethod')}</label>
                  <select 
                    id="payment-method-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-control"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn btn-success">{t('updateLedger')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {showReceiptModal && activeReceipt && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h2>{t('digitalReceipt')}</h2>
              <button onClick={() => setShowReceiptModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div className="modal-body">
              <div className="receipt-wrapper">
                <div className="receipt-header">
                  <div className="receipt-logo">MY PG MANAGER</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '1px', fontWeight: 600 }}>OFFICIAL DIGITAL RECEIPT</div>
                </div>
                <div className="receipt-row">
                  <span>{t('receiptId')}:</span>
                  <strong>{activeReceipt.receiptId}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('dateLogged')}:</span>
                  <span>{activeReceipt.date}</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row">
                  <span>TENANT:</span>
                  <strong>{activeReceipt.tenantName}</strong>
                </div>
                <div className="receipt-row">
                  <span>PHONE:</span>
                  <span>{activeReceipt.phone}</span>
                </div>
                <div className="receipt-row">
                  <span>ROOM:</span>
                  <span>Room {activeReceipt.roomNumber}</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row">
                  <span>{t('baseRent')}:</span>
                  <span>₹{activeReceipt.rentAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="receipt-row">
                  <span>{t('totalPaid')}:</span>
                  <strong style={{ color: '#059669' }}>₹{activeReceipt.paidAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('mode')}:</span>
                  <span>{activeReceipt.method}</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row receipt-total">
                  <span>{t('dueBalance')}:</span>
                  <span>₹{activeReceipt.remainingDues.toLocaleString('en-IN')}</span>
                </div>
                <div className="receipt-footer">
                  <p>Generated digitally on behalf of PG Owner</p>
                  <p>Thank you for choosing Greenwood Heights!</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={triggerPrintReceipt} 
                className="btn btn-primary"
              >
                <Printer size={16} />
                <span>{t('printInvoice')}</span>
              </button>
              <button onClick={() => setShowReceiptModal(false)} className="btn btn-secondary">{t('close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Payment Reminder Modal */}
      {showWhatsAppModal && activeWhatsAppTenant && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#25D366', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', margin: 0 }}>WhatsApp Rent Reminder</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Property: <strong>{currentProperty?.name || 'Greenwood Heights PG'}</strong>
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setTemplateTab('rent_reminder');
                    setShowTemplateModal(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', gap: '4px', padding: '4px 8px', borderColor: '#a7f3d0', color: '#065f46', backgroundColor: '#ecfdf5' }}
                  title="Customize template wording for this property"
                >
                  <Settings size={12} />
                  <span>Customize Template</span>
                </button>
                <button onClick={() => setShowWhatsAppModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
              </div>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 10px' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Pre-formatted reminder message with dynamic placeholders for <strong>{activeWhatsAppTenant.name}</strong> ({activeWhatsAppTenant.phone}):
                </p>
                {currentProperty?.templates?.rent_reminder && (
                  <span style={{ fontSize: '0.6875rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                    Customized
                  </span>
                )}
              </div>

              <div className="whatsapp-chat-bubble">
                {getWhatsAppMessageText(activeWhatsAppTenant)}
              </div>

              <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: '#166534', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <span>✓ High-converting template with dynamic tokens</span>
                <span>Direct UPI link</span>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => {
                  navigator.clipboard?.writeText(getWhatsAppMessageText(activeWhatsAppTenant));
                  setCopiedMessage(true);
                  setTimeout(() => setCopiedMessage(false), 2500);
                }} 
                className="btn btn-secondary"
              >
                {copiedMessage ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                <span>{copiedMessage ? 'Copied to Clipboard!' : 'Copy Message'}</span>
              </button>

              <a 
                href={`https://wa.me/91${activeWhatsAppTenant.phone}?text=${encodeURIComponent(getWhatsAppMessageText(activeWhatsAppTenant))}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Send size={15} />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Offline Cash Acknowledgment Modal */}
      {showCashModal && cashTenant && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Banknote size={16} />
                </div>
                <h2>
                  {!cashReceiptConfirmed 
                    ? `Acknowledge Physical Cash - ${cashTenant.name}` 
                    : `Cash Receipt Slip Generated`}
                </h2>
              </div>
              <button onClick={() => setShowCashModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {!cashReceiptConfirmed ? (
                /* Step 1: Input Cash Amount & Collector */
                <form onSubmit={handleConfirmCashPayment}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Room Number:</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        Room {getTenantRoomInfo(cashTenant.roomId).number}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Monthly Rent:</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        ₹{getTenantRoomInfo(cashTenant.roomId).rent.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Current Pending Dues:</span>
                      <strong style={{ fontSize: '0.9375rem', color: '#dc2626' }}>
                        ₹{Math.max(0, getTenantRoomInfo(cashTenant.roomId).rent - (cashTenant.amountPaid || 0)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Fast Preset Chips */}
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                    Quick Cash Presets:
                  </label>
                  <div className="cash-chip-group">
                    <button
                      type="button"
                      className={`cash-chip ${Number(cashAmount) === Math.max(0, getTenantRoomInfo(cashTenant.roomId).rent - (cashTenant.amountPaid || 0)) ? 'active' : ''}`}
                      onClick={() => setCashAmount(Math.max(0, getTenantRoomInfo(cashTenant.roomId).rent - (cashTenant.amountPaid || 0)))}
                    >
                      Full Balance (₹{Math.max(0, getTenantRoomInfo(cashTenant.roomId).rent - (cashTenant.amountPaid || 0)).toLocaleString('en-IN')})
                    </button>
                    <button
                      type="button"
                      className={`cash-chip ${Number(cashAmount) === 5000 ? 'active' : ''}`}
                      onClick={() => setCashAmount(5000)}
                    >
                      ₹5,000
                    </button>
                    <button
                      type="button"
                      className={`cash-chip ${Number(cashAmount) === 2000 ? 'active' : ''}`}
                      onClick={() => setCashAmount(2000)}
                    >
                      ₹2,000
                    </button>
                  </div>

                  {/* Cash Amount Input */}
                  <div className="form-group mb-3">
                    <label htmlFor="cash-amount-input">Cash Amount Received (INR):</label>
                    <div style={{ position: 'relative' }}>
                      <IndianRupee size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        id="cash-amount-input"
                        type="number"
                        required
                        min="1"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '36px', fontSize: '1rem', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  {/* Received By Selector */}
                  <div className="form-group mb-3">
                    <label htmlFor="cash-collector-input">Cash Received By:</label>
                    <select
                      id="cash-collector-input"
                      value={cashCollector}
                      onChange={(e) => setCashCollector(e.target.value)}
                      className="form-control"
                    >
                      <option value="Aditya Raman (Owner)">Aditya Raman (Owner)</option>
                      <option value="Warden / Front Desk">Warden (Front Desk)</option>
                      <option value="Property Manager">Property Manager</option>
                    </select>
                  </div>

                  <div className="flex gap-2" style={{ marginTop: '16px' }}>
                    <button type="button" onClick={() => setShowCashModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-cash" style={{ flex: 2, justifyContent: 'center' }}>
                      <Check size={16} />
                      <span>Confirm Cash Received (₹{Number(cashAmount || 0).toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Confirmed Cash Chit with Zero-Cost Actions */
                <div>
                  <div className="cash-chit-box">
                    <div className="cash-stamp">RECEIVED IN CASH</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>
                      GREENWOOD HEIGHTS ACCOMMODATION
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', color: '#78350f' }}>
                      Official Cash Payment Chit
                    </h3>

                    <div style={{ fontSize: '0.8125rem', lineHeight: '1.6', color: '#1f2937' }}>
                      <div className="flex justify-between">
                        <span style={{ color: '#6b7280' }}>Receipt Ref:</span>
                        <strong>{cashReceiptConfirmed.slipId}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#6b7280' }}>Resident:</span>
                        <strong>{cashReceiptConfirmed.tenantName} (Rm {cashReceiptConfirmed.roomNumber})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#6b7280' }}>Date & Mode:</span>
                        <span>{cashReceiptConfirmed.date} • Physical Cash</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#6b7280' }}>Received By:</span>
                        <span>{cashReceiptConfirmed.collector}</span>
                      </div>
                      <div style={{ borderTop: '1px dashed #d97706', margin: '8px 0' }}></div>
                      <div className="flex justify-between" style={{ fontSize: '0.9375rem', fontWeight: 800 }}>
                        <span>Amount Received:</span>
                        <span style={{ color: '#059669' }}>₹{Number(cashReceiptConfirmed.amount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between" style={{ fontSize: '0.8125rem' }}>
                        <span style={{ color: '#6b7280' }}>Remaining Dues:</span>
                        <strong style={{ color: cashReceiptConfirmed.remainingDues === 0 ? '#16a34a' : '#dc2626' }}>
                          ₹{Number(cashReceiptConfirmed.remainingDues).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 10px', padding: '0 4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Zero SMS/WhatsApp API charges: Uses personal deep-link directly.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateTab('cash_receipt');
                        setShowTemplateModal(true);
                      }}
                      style={{ fontSize: '0.75rem', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      ⚙️ Customize Chit
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* 1. Share via WhatsApp (0-cost) */}
                    <a
                      href={`https://wa.me/91${cashReceiptConfirmed.tenantPhone}?text=${encodeURIComponent(getCashWhatsAppText(cashReceiptConfirmed))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ justifyContent: 'center', width: '100%' }}
                    >
                      <MessageSquare size={16} />
                      <span>Share Cash Receipt on WhatsApp (₹0 Cost)</span>
                    </a>

                    <div className="flex gap-2">
                      {/* 2. Email Receipt (0-cost) */}
                      <a
                        href={getCashEmailHref(cashReceiptConfirmed)}
                        className="btn btn-secondary"
                        style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}
                      >
                        <Mail size={15} />
                        <span>Email Chit</span>
                      </a>

                      {/* 3. Copy Text */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(getCashWhatsAppText(cashReceiptConfirmed));
                          setCopiedCashChit(true);
                          setTimeout(() => setCopiedCashChit(false), 2500);
                        }}
                        className="btn btn-secondary"
                        style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}
                      >
                        {copiedCashChit ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                        <span>{copiedCashChit ? 'Copied!' : 'Copy Text'}</span>
                      </button>

                      {/* 4. Done button */}
                      <button
                        type="button"
                        onClick={() => setShowCashModal(false)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Property-Level WhatsApp Template Studio Modal */}
      {showTemplateModal && (
        <WhatsAppTemplateModal
          property={currentProperty || { id: propertyId, name: 'Greenwood Heights PG' }}
          onSaveTemplates={onUpdatePropertyTemplates || (() => {})}
          onClose={() => setShowTemplateModal(false)}
          initialTab={templateTab}
        />
      )}
    </div>
  );
}
