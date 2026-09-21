import React, { useState } from 'react';
import { Plus, Trash2, UserPlus, UserMinus, Phone, Mail, FileText, Calendar, Home, X, BedDouble } from 'lucide-react';

export default function RoomsTenants({ propertyId, rooms, setRooms, tenants, setTenants, setPayments, t }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAssignTenantModal, setShowAssignTenantModal] = useState(false);

  // Form states for Add Room
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('1st Floor');
  const [isCustomFloor, setIsCustomFloor] = useState(false);
  const [customFloorNumber, setCustomFloorNumber] = useState('');

  const [newRoomType, setNewRoomType] = useState('Double Sharing');
  const [isCustomType, setIsCustomType] = useState(false);
  const [customBedCount, setCustomBedCount] = useState('');

  const [newRoomRent, setNewRoomRent] = useState('');

  // Form states for Assign Tenant
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantDeposit, setTenantDeposit] = useState('');
  const [tenantIdProof, setTenantIdProof] = useState('');

  const activeRooms = rooms.filter(r => r.propertyId === propertyId);
  const activeTenants = tenants.filter(t => t.propertyId === propertyId);

  // Helper to format floor display nicely
  const getFloorDisplay = (num) => {
    if (num === '' || num === null || num === undefined) return 'Custom Floor';
    const n = parseInt(num, 10);
    if (isNaN(n)) return 'Custom Floor';
    if (n === 0) return 'Ground Floor';
    const j = n % 10, k = n % 100;
    let suffix = 'th';
    if (j === 1 && k !== 11) suffix = 'st';
    else if (j === 2 && k !== 12) suffix = 'nd';
    else if (j === 3 && k !== 13) suffix = 'rd';
    return `${n}${suffix} Floor`;
  };

  // Helper to format sharing display
  const getSharingDisplay = (count) => {
    const n = parseInt(count, 10);
    if (isNaN(n) || n < 1) return 'Custom Sharing';
    if (n === 1) return 'Single Sharing';
    if (n === 2) return 'Double Sharing';
    if (n === 3) return 'Triple Sharing';
    if (n === 4) return 'Quad Sharing';
    return `${n} Sharing (${n} beds)`;
  };

  // Helper to sort floors numerically
  const getFloorOrder = (floorStr) => {
    if (!floorStr) return 999;
    const lower = floorStr.toLowerCase();
    if (lower.includes('ground') || lower.includes('basement')) return 0;
    const match = lower.match(/\d+/);
    return match ? parseInt(match[0], 10) : 99;
  };

  // Standard predefined floors
  const defaultFloors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];

  // Dynamically group rooms by all present floors in sorted order
  const allFloorsSet = new Set(defaultFloors);
  activeRooms.forEach(r => {
    if (r.floor) allFloorsSet.add(r.floor);
  });
  const sortedFloors = Array.from(allFloorsSet).sort((a, b) => getFloorOrder(a) - getFloorOrder(b));

  const groupedRooms = sortedFloors.reduce((acc, floor) => {
    const floorRooms = activeRooms.filter(r => r.floor.toLowerCase() === floor.toLowerCase());
    if (floorRooms.length > 0) acc[floor] = floorRooms;
    return acc;
  }, {});

  // Total bed counts
  const totalBeds = activeRooms.reduce((sum, r) => sum + r.totalBeds, 0);
  const occupiedBeds = activeTenants.length;
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);

  // Add a new Room
  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoomNumber || !newRoomRent) return;

    let finalFloor = newRoomFloor;
    if (isCustomFloor) {
      if (customFloorNumber === '') {
        alert('Please enter a floor number');
        return;
      }
      finalFloor = getFloorDisplay(customFloorNumber);
    }

    let bedCount = 1;
    let finalType = newRoomType;
    if (isCustomType) {
      if (!customBedCount || parseInt(customBedCount, 10) < 1) {
        alert('Please enter a valid number of beds (at least 1)');
        return;
      }
      bedCount = parseInt(customBedCount, 10);
      finalType = getSharingDisplay(bedCount);
    } else {
      if (newRoomType === 'Single Sharing') bedCount = 1;
      else if (newRoomType === 'Double Sharing') bedCount = 2;
      else if (newRoomType === 'Triple Sharing') bedCount = 3;
      else if (newRoomType === 'Quad Sharing') bedCount = 4;
    }

    const newRoomObj = {
      id: 'room-' + Date.now(),
      propertyId,
      number: newRoomNumber,
      floor: finalFloor,
      type: finalType,
      rent: parseFloat(newRoomRent),
      totalBeds: bedCount
    };

    setRooms(prev => [...prev, newRoomObj]);
    setShowAddRoomModal(false);
    
    // Reset inputs
    setNewRoomNumber('');
    setNewRoomRent('');
    setNewRoomFloor('1st Floor');
    setNewRoomType('Double Sharing');
    setIsCustomFloor(false);
    setCustomFloorNumber('');
    setIsCustomType(false);
    setCustomBedCount('');
  };

  // Delete a room
  const handleDeleteRoom = (roomId) => {
    const hasTenants = tenants.some(t => t.roomId === roomId);
    if (hasTenants) {
      alert('Cannot delete room. Please check-out all tenants from this room first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this room?')) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      setSelectedRoom(null);
    }
  };

  // Assign tenant to a room
  const handleAssignTenant = (e) => {
    e.preventDefault();
    if (!tenantName || !tenantPhone || !tenantDeposit) return;

    const roomTenants = tenants.filter(t => t.roomId === selectedRoom.id);
    if (roomTenants.length >= selectedRoom.totalBeds) {
      alert('This room is already fully occupied!');
      return;
    }

    const newTenantObj = {
      id: 'tenant-' + Date.now(),
      propertyId,
      roomId: selectedRoom.id,
      name: tenantName,
      phone: tenantPhone,
      email: tenantEmail || 'N/A',
      joiningDate: new Date().toISOString().split('T')[0],
      deposit: parseFloat(tenantDeposit),
      idProof: tenantIdProof || 'Aadhaar Verified',
      rentStatus: 'Unpaid',
      amountPaid: 0
    };

    setTenants(prev => [...prev, newTenantObj]);
    setShowAssignTenantModal(false);

    // Reset Inputs
    setTenantName('');
    setTenantPhone('');
    setTenantEmail('');
    setTenantDeposit('');
    setTenantIdProof('');
  };

  // Check out tenant
  const handleCheckOutTenant = (tenantId, tenantName) => {
    if (window.confirm(`Are you sure you want to check-out ${tenantName}? This will clear their bed allocation.`)) {
      setTenants(prev => prev.filter(t => t.id !== tenantId));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Unified Page Control Bar */}
      <div className="page-control-bar">
        <div className="control-group-left">
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {t('occupancyGrid')}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            ({activeRooms.length} Rooms • {occupiedBeds}/{totalBeds} Beds Occupied • <strong style={{ color: '#059669' }}>{vacantBeds} Vacant</strong>)
          </span>
        </div>
        <div className="control-group-right">
          <button 
            onClick={() => setShowAddRoomModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>{t('addRoom')}</span>
          </button>
        </div>
      </div>

      {/* Responsive Split View Container */}
      <div className={selectedRoom ? 'split-view-container' : ''}>
        
        {/* Main Column: Rooms grouped by Floor */}
        <div className="main-column">
          {Object.keys(groupedRooms).length > 0 ? (
            Object.entries(groupedRooms).map(([floor, floorRooms]) => (
              <div key={floor} className="floor-section">
                <div className="floor-header">{floor}</div>
                <div className="rooms-grid">
                  {floorRooms.map(room => {
                    const roomTenants = activeTenants.filter(t => t.roomId === room.id);
                    const occupantCount = roomTenants.length;
                    
                    let badgeClass = 'badge-empty';
                    let statusLabel = t('vacant');
                    if (occupantCount === room.totalBeds) {
                      badgeClass = 'badge-full';
                      statusLabel = t('full');
                    } else if (occupantCount > 0) {
                      badgeClass = 'badge-partial';
                      statusLabel = `${occupantCount}/${room.totalBeds}`;
                    }

                    const isSelected = selectedRoom?.id === room.id;

                    return (
                      <div 
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`room-card ${isSelected ? 'selected' : ''}`}
                        role="button"
                        tabIndex="0"
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedRoom(room)}
                      >
                        <div className="room-header-row">
                          <span className="room-number">Room {room.number}</span>
                          <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                        </div>
                        <div className="room-details-info">
                          <span>{room.type}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            ₹{room.rent.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                        <div className="room-beds-container" aria-label={`${occupantCount} of ${room.totalBeds} beds occupied`}>
                          {Array.from({ length: room.totalBeds }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`bed-dot ${i < occupantCount ? 'occupied' : ''}`} 
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Home size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>No rooms added yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Get started by clicking the "Add Room" button above.</p>
            </div>
          )}
        </div>

        {/* Side Column: Active Room Detail Panel */}
        {selectedRoom && (
          <div className="side-column" style={{ position: 'sticky', top: '20px' }}>
            <div className="card">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Room {selectedRoom.number}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {selectedRoom.floor} • {selectedRoom.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleDeleteRoom(selectedRoom.id)}
                    className="btn-icon-only btn-sm"
                    style={{ color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                    title="Delete Room"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="btn-icon-only btn-sm"
                    title="Close Details"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Rent:</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{selectedRoom.rent.toLocaleString('en-IN')}/mo
                  </span>
                </div>

                {/* Tenants inside room */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {t('currentBeds')} ({activeTenants.filter(t => t.roomId === selectedRoom.id).length}/{selectedRoom.totalBeds})
                    </span>
                    {activeTenants.filter(t => t.roomId === selectedRoom.id).length < selectedRoom.totalBeds && (
                      <button 
                        onClick={() => setShowAssignTenantModal(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)', backgroundColor: 'var(--primary-light)' }}
                      >
                        <UserPlus size={13} />
                        <span>{t('onboardTenant')}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {activeTenants.filter(t => t.roomId === selectedRoom.id).map(tenant => (
                      <div 
                        key={tenant.id} 
                        className="p-3 rounded-lg flex flex-col gap-2"
                        style={{ border: '1px solid var(--border-color)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xs)' }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{tenant.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Joined: {tenant.joiningDate}</span>
                          </div>
                          <button
                            onClick={() => handleCheckOutTenant(tenant.id, tenant.name)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                          >
                            <UserMinus size={12} />
                            <span>{t('checkOut')}</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <div className="flex items-center gap-2">
                            <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                            <span>{tenant.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                            <span>{tenant.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                            <span>Deposit: <strong>₹{tenant.deposit.toLocaleString('en-IN')}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activeTenants.filter(t => t.roomId === selectedRoom.id).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '18px', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        No tenants checked in. Click "{t('onboardTenant')}" above.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Room</h2>
              <button onClick={() => setShowAddRoomModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <form onSubmit={handleAddRoom}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="room-number-input">{t('roomNumber')}</label>
                  <input 
                    id="room-number-input"
                    type="text" 
                    required 
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="e.g. 104, 302B" 
                    className="form-control"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="room-floor-select">{t('floor')}</label>
                    <select 
                      id="room-floor-select"
                      value={isCustomFloor ? 'CUSTOM' : newRoomFloor} 
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustomFloor(true);
                        } else {
                          setIsCustomFloor(false);
                          setNewRoomFloor(e.target.value);
                        }
                      }}
                      className="form-control"
                    >
                      {defaultFloors.map(f => <option key={f} value={f}>{f}</option>)}
                      <option value="CUSTOM">⚙️ {t('custom') || 'Custom (Enter floor number...)'}</option>
                    </select>

                    {isCustomFloor && (
                      <div style={{ marginTop: '8px' }}>
                        <label htmlFor="custom-floor-input" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                          {t('enterFloorNumber') || 'Enter floor number'}:
                        </label>
                        <input 
                          id="custom-floor-input"
                          type="number"
                          min="0"
                          max="150"
                          required
                          value={customFloorNumber}
                          onChange={(e) => setCustomFloorNumber(e.target.value)}
                          placeholder="e.g. 5, 6, 12 (0 for Ground)"
                          className="form-control"
                          style={{ borderColor: 'var(--primary)', backgroundColor: '#f8fafc' }}
                          autoFocus
                        />
                        {customFloorNumber !== '' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            Display: <strong style={{ color: 'var(--primary)' }}>{getFloorDisplay(customFloorNumber)}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="room-type-select">{t('sharingType')}</label>
                    <select 
                      id="room-type-select"
                      value={isCustomType ? 'CUSTOM' : newRoomType} 
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustomType(true);
                        } else {
                          setIsCustomType(false);
                          setNewRoomType(e.target.value);
                        }
                      }}
                      className="form-control"
                    >
                      <option value="Single Sharing">Single Sharing (1 bed)</option>
                      <option value="Double Sharing">Double Sharing (2 beds)</option>
                      <option value="Triple Sharing">Triple Sharing (3 beds)</option>
                      <option value="Quad Sharing">Quad Sharing (4 beds)</option>
                      <option value="CUSTOM">⚙️ {t('custom') || 'Custom (Enter beds...)'}</option>
                    </select>

                    {isCustomType && (
                      <div style={{ marginTop: '8px' }}>
                        <label htmlFor="custom-bed-input" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                          {t('enterBedCount') || 'Enter number of beds'}:
                        </label>
                        <input 
                          id="custom-bed-input"
                          type="number"
                          min="1"
                          max="50"
                          required
                          value={customBedCount}
                          onChange={(e) => setCustomBedCount(e.target.value)}
                          placeholder="e.g. 5, 6, 8"
                          className="form-control"
                          style={{ borderColor: 'var(--primary)', backgroundColor: '#f8fafc' }}
                          autoFocus
                        />
                        {customBedCount !== '' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            Capacity: <strong style={{ color: 'var(--primary)' }}>{parseInt(customBedCount, 10) || 1} beds</strong> ({getSharingDisplay(customBedCount)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="room-rent-input">{t('monthlyRentPerBed')}</label>
                  <input 
                    id="room-rent-input"
                    type="number" 
                    required 
                    value={newRoomRent}
                    onChange={(e) => setNewRoomRent(e.target.value)}
                    placeholder="e.g. 7500" 
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddRoomModal(false)} className="btn btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Tenant Modal */}
      {showAssignTenantModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Onboard Tenant - Room {selectedRoom?.number}</h2>
              <button onClick={() => setShowAssignTenantModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <form onSubmit={handleAssignTenant}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="tenant-name-input">{t('fullName')}</label>
                  <input 
                    id="tenant-name-input"
                    type="text" 
                    required 
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Rahul Sharma" 
                    className="form-control"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tenant-phone-input">{t('phone')}</label>
                    <input 
                      id="tenant-phone-input"
                      type="tel" 
                      required 
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="9876543210" 
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tenant-email-input">{t('email')}</label>
                    <input 
                      id="tenant-email-input"
                      type="email" 
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      placeholder="rahul@example.com" 
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="tenant-deposit-input">{t('deposit')} (Refundable)</label>
                  <input 
                    id="tenant-deposit-input"
                    type="number" 
                    required 
                    value={tenantDeposit}
                    onChange={(e) => setTenantDeposit(e.target.value)}
                    placeholder="e.g. 10000" 
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tenant-id-input">{t('idProof')}</label>
                  <input 
                    id="tenant-id-input"
                    type="text" 
                    value={tenantIdProof}
                    onChange={(e) => setTenantIdProof(e.target.value)}
                    placeholder="Aadhaar ID / Driving License" 
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAssignTenantModal(false)} className="btn btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('checkIn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
