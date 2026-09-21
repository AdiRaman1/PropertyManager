import React, { useState } from 'react';
import { Plus, Check, Play, Edit, AlertOctagon, Utensils, Wrench, Calendar } from 'lucide-react';

export default function ComplaintsFood({ propertyId, complaints, setComplaints, foodMenus, setFoodMenus, t }) {
  // Navigation states inside sub-tab
  const [innerTab, setInnerTab] = useState('complaints');

  // Modals state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingDay, setEditingDay] = useState('Monday');

  // Form states for Complaint
  const [compTitle, setCompTitle] = useState('');
  const [compRoom, setCompRoom] = useState('');
  const [compCategory, setCompCategory] = useState('Plumbing');
  const [compUrgency, setCompUrgency] = useState('Medium');
  const [compDesc, setCompDesc] = useState('');

  // Form states for Food Edit
  const [foodBreakfast, setFoodBreakfast] = useState('');
  const [foodLunch, setFoodLunch] = useState('');
  const [foodSnacks, setFoodSnacks] = useState('');
  const [foodDinner, setFoodDinner] = useState('');

  const activeComplaints = complaints.filter(c => c.propertyId === propertyId);
  const propertyFood = foodMenus.find(f => f.propertyId === propertyId) || { schedule: {} };

  // Status handlers
  const handleUpdateStatus = (complaintId, nextStatus) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) return { ...c, status: nextStatus };
      return c;
    }));
  };

  // Submit Complaint
  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!compTitle || !compRoom) return;

    const newCompObj = {
      id: 'comp-' + Date.now(),
      propertyId,
      title: compTitle,
      roomNumber: compRoom,
      urgency: compUrgency,
      category: compCategory,
      status: 'Open',
      dateLogged: new Date().toISOString().split('T')[0],
      description: compDesc
    };

    setComplaints(prev => [newCompObj, ...prev]);
    setShowComplaintModal(false);

    // Reset
    setCompTitle('');
    setCompRoom('');
    setCompDesc('');
    setCompCategory('Plumbing');
    setCompUrgency('Medium');
  };

  // Open Food edit modal
  const openFoodEdit = (day) => {
    setEditingDay(day);
    const dayMenu = propertyFood.schedule[day] || { Breakfast: '', Lunch: '', Snacks: '', Dinner: '' };
    setFoodBreakfast(dayMenu.Breakfast);
    setFoodLunch(dayMenu.Lunch);
    setFoodSnacks(dayMenu.Snacks);
    setFoodDinner(dayMenu.Dinner);
    setShowFoodModal(true);
  };

  // Save Food edit
  const handleSaveFoodMenu = (e) => {
    e.preventDefault();
    
    const updatedMenus = foodMenus.map(menu => {
      if (menu.propertyId === propertyId) {
        return {
          ...menu,
          schedule: {
            ...menu.schedule,
            [editingDay]: {
              Breakfast: foodBreakfast,
              Lunch: foodLunch,
              Snacks: foodSnacks,
              Dinner: foodDinner
            }
          }
        };
      }
      return menu;
    });

    setFoodMenus(updatedMenus);
    setShowFoodModal(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex flex-col gap-5">
      {/* Unified Page Control Bar */}
      <div className="page-control-bar">
        <div className="control-group-left" role="tablist">
          <button
            role="tab"
            aria-selected={innerTab === 'complaints'}
            onClick={() => setInnerTab('complaints')}
            className={`btn btn-sm ${innerTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Wrench size={14} />
            <span>{t('complaintBox')} ({activeComplaints.filter(c => c.status !== 'Resolved').length} Active)</span>
          </button>
          <button
            role="tab"
            aria-selected={innerTab === 'food'}
            onClick={() => setInnerTab('food')}
            className={`btn btn-sm ${innerTab === 'food' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Utensils size={14} />
            <span>{t('messSchedule')} (7 Days)</span>
          </button>
        </div>

        <div className="control-group-right">
          {innerTab === 'complaints' && (
            <button onClick={() => setShowComplaintModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>{t('fileComplaint')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Panels */}
      {innerTab === 'complaints' ? (
        <div className="flex flex-col gap-4">
          <div className="complaint-list">
            {activeComplaints.length > 0 ? (
              activeComplaints.map(comp => {
                let priorityClass = 'priority-low';
                if (comp.urgency === 'Critical') priorityClass = 'priority-high';
                else if (comp.urgency === 'High') priorityClass = 'priority-medium';

                return (
                  <div key={comp.id} className="complaint-card">
                    <div className="complaint-header">
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                          Room {comp.roomNumber} • {comp.category}
                        </span>
                        <h4 className="complaint-title" style={{ marginTop: '2px' }}>{comp.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <span className={`priority-badge ${priorityClass}`}>{comp.urgency}</span>
                        <span className={`status-pill ${comp.status === 'Resolved' ? 'status-pill-paid' : comp.status === 'In Progress' ? 'status-pill-partial' : 'status-pill-unpaid'}`}>
                          <span>{comp.status}</span>
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {comp.description}
                    </p>
                    
                    <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Logged On: {comp.dateLogged}
                      </span>

                      {comp.status !== 'Resolved' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {comp.status === 'Open' && (
                            <button
                              onClick={() => handleUpdateStatus(comp.id, 'In Progress')}
                              className="btn btn-secondary btn-sm"
                            >
                              <Play size={12} style={{ color: '#d97706' }} />
                              <span>{t('startWork')}</span>
                            </button>
                          )}
                          {comp.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateStatus(comp.id, 'Resolved')}
                              className="btn btn-success btn-sm"
                            >
                              <Check size={12} />
                              <span>{t('markResolved')}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card text-center py-12" style={{ color: 'var(--text-muted)' }}>
                <AlertOctagon size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>All clear! No active complaints</p>
                <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Tenant issues regarding Wi-Fi, food, housekeeping or plumbing will show here.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Food Menu Weekly Grid */
        <div className="food-grid">
          {daysOfWeek.map(day => {
            const dayMenu = propertyFood.schedule[day] || { Breakfast: 'N/A', Lunch: 'N/A', Snacks: 'N/A', Dinner: 'N/A' };
            return (
              <div key={day} className="food-day-card">
                <div className="food-day-title">
                  <span>{day}</span>
                  <button
                    onClick={() => openFoodEdit(day)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--primary)', height: '28px', padding: '0 8px', fontSize: '0.75rem' }}
                    title={`Edit ${day} Menu`}
                  >
                    <Edit size={11} />
                    <span>{t('editMenu')}</span>
                  </button>
                </div>
                
                <div className="food-meal">
                  <span className="food-meal-label">{t('breakfast')}</span>
                  <span className="food-meal-desc">{dayMenu.Breakfast || 'Not Scheduled'}</span>
                </div>
                
                <div className="food-meal">
                  <span className="food-meal-label">{t('lunch')}</span>
                  <span className="food-meal-desc">{dayMenu.Lunch || 'Not Scheduled'}</span>
                </div>

                <div className="food-meal">
                  <span className="food-meal-label">{t('snacks')}</span>
                  <span className="food-meal-desc">{dayMenu.Snacks || 'Not Scheduled'}</span>
                </div>

                <div className="food-meal">
                  <span className="food-meal-label">{t('dinner')}</span>
                  <span className="food-meal-desc">{dayMenu.Dinner || 'Not Scheduled'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File Complaint Modal */}
      {showComplaintModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>File Maintenance Ticket</h2>
              <button onClick={() => setShowComplaintModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <form onSubmit={handleAddComplaint}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="comp-title-input">{t('complaintTitle')}</label>
                  <input 
                    id="comp-title-input"
                    type="text" 
                    required 
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    placeholder="e.g. Wi-Fi router keeps rebooting" 
                    className="form-control"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="comp-room-input">Room Number</label>
                    <input 
                      id="comp-room-input"
                      type="text" 
                      required 
                      value={compRoom}
                      onChange={(e) => setCompRoom(e.target.value)}
                      placeholder="e.g. 101, 203" 
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="comp-cat-select">Category</label>
                    <select 
                      id="comp-cat-select"
                      value={compCategory}
                      onChange={(e) => setCompCategory(e.target.value)}
                      className="form-control"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Internet">Internet & Wi-Fi</option>
                      <option value="Food & Mess">Food & Mess</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comp-urgency-select">{t('urgencyLevel')}</label>
                  <select 
                    id="comp-urgency-select"
                    value={compUrgency}
                    onChange={(e) => setCompUrgency(e.target.value)}
                    className="form-control"
                  >
                    <option value="Low">Low (General suggestion)</option>
                    <option value="Medium">Medium (Attention required)</option>
                    <option value="High">High (Immediate inspection)</option>
                    <option value="Critical">Critical (Breakdown / Hazard)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comp-desc-textarea">{t('details')}</label>
                  <textarea 
                    id="comp-desc-textarea"
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="Provide details like specific sockets, water colors, or times of failure..." 
                    className="form-control"
                    rows="3"
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowComplaintModal(false)} className="btn btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">File Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Menu Modal */}
      {showFoodModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Menu - {editingDay}</h2>
              <button onClick={() => setShowFoodModal(false)} className="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <form onSubmit={handleSaveFoodMenu}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="food-breakfast-input">{t('breakfast')}</label>
                  <input 
                    id="food-breakfast-input"
                    type="text" 
                    value={foodBreakfast}
                    onChange={(e) => setFoodBreakfast(e.target.value)}
                    placeholder="Breakfast item description" 
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="food-lunch-input">{t('lunch')}</label>
                  <input 
                    id="food-lunch-input"
                    type="text" 
                    value={foodLunch}
                    onChange={(e) => setFoodLunch(e.target.value)}
                    placeholder="Lunch item description" 
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="food-snacks-input">{t('snacks')}</label>
                  <input 
                    id="food-snacks-input"
                    type="text" 
                    value={foodSnacks}
                    onChange={(e) => setFoodSnacks(e.target.value)}
                    placeholder="Snacks item description" 
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="food-dinner-input">{t('dinner')}</label>
                  <input 
                    id="food-dinner-input"
                    type="text" 
                    value={foodDinner}
                    onChange={(e) => setFoodDinner(e.target.value)}
                    placeholder="Dinner item description" 
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowFoodModal(false)} className="btn btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
