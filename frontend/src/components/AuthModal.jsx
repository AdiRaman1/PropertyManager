import React, { useState } from 'react';
import { 
  Building2, 
  BedDouble, 
  Wrench, 
  CheckCircle2, 
  Smartphone, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Globe2,
  ShieldCheck,
  UserCheck,
  Building,
  MapPin,
  QrCode,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function AuthModal({ 
  onLogin, 
  onRegisterNewPG, 
  t, 
  lang, 
  onLanguageChange, 
  tenants = [], 
  staff = [],
  properties = [] 
}) {
  // Top-level mode: 'signin' | 'register'
  const [activeMode, setActiveMode] = useState('signin');

  // Sign-in state
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'google' | 'email'
  const [identifier, setIdentifier] = useState('9876543210'); // Default demo phone
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('1234');
  const [authError, setAuthError] = useState('');
  const [detectedUser, setDetectedUser] = useState(null);

  // New PG Registration Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [newPG, setNewPG] = useState({
    ownerName: 'Vikram Malhotra',
    ownerPhone: '9811234567',
    ownerEmail: 'vikram@sapphirepg.com',
    pgName: 'Sapphire Elite PG & Co-Living',
    city: 'Bengaluru',
    address: '4th Block, Koramangala',
    upiId: 'sapphirepg@okhdfcbank',
    floorsCount: 3,
    roomsPerFloor: 2,
    baseRent: 9000
  });

  // Auto-Detect role & user by phone or email
  const resolveUserByIdentifier = (idInput) => {
    const cleanId = idInput.trim().replace(/\D/g, '');
    const cleanEmail = idInput.trim().toLowerCase();

    // 1. Check if matches any Tenant
    const foundTenant = tenants.find(tItem => {
      const tPhone = tItem.phone.replace(/\D/g, '');
      return (cleanId.length >= 8 && tPhone.endsWith(cleanId)) || (tItem.email && tItem.email.toLowerCase() === cleanEmail);
    });

    if (foundTenant) {
      return {
        role: 'tenant',
        tenantId: foundTenant.id,
        name: foundTenant.name,
        email: foundTenant.email,
        phone: foundTenant.phone,
        roomId: foundTenant.roomId,
        propertyId: foundTenant.propertyId,
        avatarText: foundTenant.name.split(' ').map(n => n[0]).join('').slice(0, 2),
        badge: `Resident • Rm ${foundTenant.roomId.replace('r', '')}`
      };
    }

    // 2. Check if matches any Staff
    const foundStaff = staff.find(sItem => {
      const sPhone = sItem.phone.replace(/\D/g, '');
      return cleanId.length >= 8 && sPhone.endsWith(cleanId);
    });

    if (foundStaff) {
      return {
        role: 'staff',
        staffId: foundStaff.id,
        name: foundStaff.name,
        phone: foundStaff.phone,
        staffRole: foundStaff.role,
        propertyId: foundStaff.propertyId,
        avatarText: foundStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2),
        badge: `Staff • ${foundStaff.role}`
      };
    }

    // 3. Fallback: Owner Account
    if (cleanEmail.includes('owner') || cleanId.startsWith('999') || idInput.toLowerCase().includes('aditya') || !cleanId) {
      return {
        role: 'owner',
        name: 'Aditya Raman',
        email: 'aditya.owner@pgmanager.com',
        avatarText: 'AR',
        badge: 'PG Owner'
      };
    }

    return null;
  };

  // Handle Sign In Submit
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const resolved = resolveUserByIdentifier(identifier);
    if (resolved) {
      setDetectedUser(resolved);
      onLogin(resolved);
    } else {
      setAuthError('Identifier not found in system. Try our demo numbers below or register a new PG.');
    }
  };

  // Handle Google Login Simulation
  const handleGoogleLogin = () => {
    onLogin({
      role: 'owner',
      name: 'Aditya Raman',
      email: 'aditya.owner@pgmanager.com',
      avatarText: 'AR',
      badge: 'PG Owner'
    });
  };

  // 1-Click Fast Presets
  const handleQuickDemo = (role, targetId) => {
    if (role === 'owner') {
      onLogin({
        role: 'owner',
        name: 'Aditya Raman',
        email: 'aditya.owner@pgmanager.com',
        avatarText: 'AR',
        badge: 'PG Owner'
      });
    } else if (role === 'tenant') {
      const tItem = tenants.find(t => t.id === targetId) || tenants[0];
      onLogin({
        role: 'tenant',
        tenantId: tItem.id,
        name: tItem.name,
        email: tItem.email,
        phone: tItem.phone,
        roomId: tItem.roomId,
        propertyId: tItem.propertyId,
        avatarText: tItem.name.split(' ').map(n => n[0]).join('').slice(0, 2),
        badge: `Resident • Rm ${tItem.roomId.replace('r', '')}`
      });
    } else if (role === 'staff') {
      const sItem = staff.find(s => s.id === targetId) || staff[0];
      onLogin({
        role: 'staff',
        staffId: sItem.id,
        name: sItem.name,
        phone: sItem.phone,
        staffRole: sItem.role,
        propertyId: sItem.propertyId,
        avatarText: sItem.name.split(' ').map(n => n[0]).join('').slice(0, 2),
        badge: `Staff • ${sItem.role}`
      });
    }
  };

  // Handle Register Wizard submission
  const handleFinishWizard = (e) => {
    e.preventDefault();
    if (onRegisterNewPG) {
      onRegisterNewPG(newPG);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '620px' }}>
        {/* Top Header: Brand & Language */}
        <div className="flex justify-between items-center mb-4">
          <div className="auth-brand" style={{ marginBottom: 0 }}>
            <div className="auth-logo-badge">M</div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                My PG Manager
              </h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Multi-Tenant Accommodation Cloud
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Globe2 size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={lang}
              onChange={onLanguageChange}
              className="ui-select"
              style={{ border: 'none', background: 'transparent', padding: '2px 4px', fontSize: '0.8125rem' }}
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>
        </div>

        {/* Mode Switcher: Sign In vs Register New PG */}
        <div className="wizard-tabs">
          <button 
            type="button"
            className={`wizard-tab ${activeMode === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveMode('signin')}
          >
            Sign In to Your PG
          </button>
          <button 
            type="button"
            className={`wizard-tab ${activeMode === 'register' ? 'active' : ''}`}
            onClick={() => setActiveMode('register')}
          >
            ✨ Register New PG (14-Day Free Trial)
          </button>
        </div>

        {/* ====================================================================
            MODE 1: IDENTIFIER-FIRST SMART SIGN IN
            ==================================================================== */}
        {activeMode === 'signin' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>
                Unified Portal Access
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                Enter your mobile number or email. The system will automatically detect your PG and role.
              </p>
            </div>

            {/* Auth Method Tabs */}
            <div className="auth-tabs">
              <button 
                type="button"
                className={`auth-tab-btn ${authMethod === 'phone' ? 'active' : ''}`}
                onClick={() => setAuthMethod('phone')}
              >
                Phone OTP
              </button>
              <button 
                type="button"
                className={`auth-tab-btn ${authMethod === 'google' ? 'active' : ''}`}
                onClick={() => setAuthMethod('google')}
              >
                Google 1-Tap
              </button>
              <button 
                type="button"
                className={`auth-tab-btn ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => setAuthMethod('email')}
              >
                Email
              </button>
            </div>

            {/* Phone OTP View */}
            {authMethod === 'phone' && (
              <form onSubmit={handleSignInSubmit} className="flex flex-col gap-3">
                <div>
                  <label htmlFor="auth-phone-input" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    Mobile Number (Auto-Detects Owner / Resident / Staff):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.875rem' }}>+91</span>
                    <input 
                      id="auth-phone-input"
                      type="tel"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="form-control"
                      style={{ paddingLeft: '48px', fontSize: '0.9375rem' }}
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(true)}
                    className="btn btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Smartphone size={16} />
                    <span>Send Verification Code (WhatsApp / SMS)</span>
                  </button>
                ) : (
                  <div>
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8125rem', color: '#166534', marginBottom: '8px' }}>
                      ✓ OTP sent via WhatsApp to {identifier}. Use <strong>1234</strong> for verification.
                    </div>
                    <label htmlFor="auth-otp-input" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                      Enter 4-Digit Code:
                    </label>
                    <input 
                      id="auth-otp-input"
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="form-control"
                      style={{ letterSpacing: '0.4em', fontSize: '1.2rem', textAlign: 'center', fontWeight: 800, marginBottom: '8px' }}
                    />
                  </div>
                )}

                {authError && (
                  <div className="flex items-center gap-2" style={{ color: '#dc2626', fontSize: '0.8125rem', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
                    <AlertCircle size={15} />
                    <span>{authError}</span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  <CheckCircle2 size={16} />
                  <span>Sign In & Open My Portal</span>
                </button>
              </form>
            )}

            {/* Google 1-Tap View */}
            {authMethod === 'google' && (
              <div style={{ padding: '8px 0' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  One-tap authentication with your verified Google account.
                </p>
                <button 
                  onClick={handleGoogleLogin}
                  className="btn-google"
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}

            {/* Email View */}
            {authMethod === 'email' && (
              <form onSubmit={handleSignInSubmit} className="flex flex-col gap-3" style={{ padding: '4px 0' }}>
                <div>
                  <label htmlFor="auth-email-input" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                    Email Address:
                  </label>
                  <input 
                    id="auth-email-input"
                    type="email"
                    required
                    value={identifier.includes('@') ? identifier : 'owner@greenwoodpg.com'}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div>
                  <label htmlFor="auth-password-input" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                    Password:
                  </label>
                  <input 
                    id="auth-password-input"
                    type="password"
                    defaultValue="password123"
                    className="form-control"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Quick Demo Presets */}
            <div className="quick-demo-box">
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Instant 1-Click Demo Profiles
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('owner')}
                  className="demo-account-pill"
                >
                  <span style={{ fontWeight: 700, color: '#1e40af' }}>👑 PG Owner</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('tenant', 't1')}
                  className="demo-account-pill"
                >
                  <span style={{ fontWeight: 700, color: '#15803d' }}>🛏️ Rahul (Rm 101)</span>
                  <span style={{ fontSize: '0.6875rem', color: '#166534' }}>Paid</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('tenant', 't3')}
                  className="demo-account-pill"
                >
                  <span style={{ fontWeight: 700, color: '#b91c1c' }}>⚠️ Rohan (Rm 201)</span>
                  <span style={{ fontSize: '0.6875rem', color: '#dc2626' }}>Due</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('staff', 'st-1')}
                  className="demo-account-pill"
                >
                  <span style={{ fontWeight: 700, color: '#d97706' }}>🍳 Ramesh (Cook)</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Staff</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODE 2: ONBOARDING WIZARD FOR NEW PG OWNERS
            ==================================================================== */}
        {activeMode === 'register' && (
          <div>
            {/* Step Progress Indicator */}
            <div className="step-indicator-bar">
              <div className={`step-node ${wizardStep >= 1 ? (wizardStep > 1 ? 'completed' : 'active') : ''}`}>
                <div className="step-circle">{wizardStep > 1 ? '✓' : '1'}</div>
                <span className="step-label">Identity</span>
              </div>
              <div className={`step-node ${wizardStep >= 2 ? (wizardStep > 2 ? 'completed' : 'active') : ''}`}>
                <div className="step-circle">{wizardStep > 2 ? '✓' : '2'}</div>
                <span className="step-label">Property & UPI</span>
              </div>
              <div className={`step-node ${wizardStep === 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span className="step-label">Rooms Setup</span>
              </div>
            </div>

            {/* WIZARD STEP 1: OWNER & PG NAME */}
            {wizardStep === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setWizardStep(2); }} className="flex flex-col gap-3">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
                  Step 1: PG Owner & Brand Identity
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  Create your organization workspace to manage all your buildings.
                </p>

                <div className="form-group">
                  <label htmlFor="wiz-owner-name">Owner Full Name</label>
                  <input 
                    id="wiz-owner-name"
                    type="text" 
                    required 
                    value={newPG.ownerName}
                    onChange={(e) => setNewPG({ ...newPG, ownerName: e.target.value })}
                    placeholder="e.g. Vikram Malhotra" 
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="wiz-owner-phone">Owner Mobile Number</label>
                    <input 
                      id="wiz-owner-phone"
                      type="tel" 
                      required 
                      value={newPG.ownerPhone}
                      onChange={(e) => setNewPG({ ...newPG, ownerPhone: e.target.value })}
                      placeholder="e.g. 98112 34567" 
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="wiz-owner-email">Owner Email</label>
                    <input 
                      id="wiz-owner-email"
                      type="email" 
                      required 
                      value={newPG.ownerEmail}
                      onChange={(e) => setNewPG({ ...newPG, ownerEmail: e.target.value })}
                      placeholder="e.g. vikram@sapphirepg.com" 
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="wiz-pg-name">PG Organization / Brand Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      id="wiz-pg-name"
                      type="text" 
                      required 
                      value={newPG.pgName}
                      onChange={(e) => setNewPG({ ...newPG, pgName: e.target.value })}
                      placeholder="e.g. Sapphire Elite PG & Co-Living" 
                      className="form-control"
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
                  <span>Continue to Step 2</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* WIZARD STEP 2: LOCATION & UPI */}
            {wizardStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setWizardStep(3); }} className="flex flex-col gap-3">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
                  Step 2: Property Location & Payment UPI
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  Provide your address and merchant UPI ID for automated rent settlement.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="wiz-city">City</label>
                    <input 
                      id="wiz-city"
                      type="text" 
                      required 
                      value={newPG.city}
                      onChange={(e) => setNewPG({ ...newPG, city: e.target.value })}
                      placeholder="e.g. Bengaluru, Pune, Delhi..." 
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="wiz-address">Locality / Address</label>
                    <input 
                      id="wiz-address"
                      type="text" 
                      required 
                      value={newPG.address}
                      onChange={(e) => setNewPG({ ...newPG, address: e.target.value })}
                      placeholder="e.g. Koramangala 4th Block" 
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="wiz-upi">Owner UPI ID for Direct Rent Deposits</label>
                  <div style={{ position: 'relative' }}>
                    <QrCode size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      id="wiz-upi"
                      type="text" 
                      required 
                      value={newPG.upiId}
                      onChange={(e) => setNewPG({ ...newPG, upiId: e.target.value })}
                      placeholder="e.g. sapphirepg@okhdfcbank" 
                      className="form-control"
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    ✓ 100% Direct bank deposits. Zero platform transaction cut.
                  </span>
                </div>

                <div className="flex gap-2" style={{ marginTop: '6px' }}>
                  <button type="button" onClick={() => setWizardStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                    <span>Continue to Step 3</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* WIZARD STEP 3: QUICK INVENTORY PROVISIONING */}
            {wizardStep === 3 && (
              <form onSubmit={handleFinishWizard} className="flex flex-col gap-3">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
                  Step 3: Initial Building & Rooms Setup
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  Automatically provision your rooms and sharing options across floors.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="wiz-floors">Total Building Floors</label>
                    <input 
                      id="wiz-floors"
                      type="number" 
                      min={1} 
                      max={10}
                      required 
                      value={newPG.floorsCount}
                      onChange={(e) => setNewPG({ ...newPG, floorsCount: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="wiz-rooms-floor">Rooms Per Floor</label>
                    <input 
                      id="wiz-rooms-floor"
                      type="number" 
                      min={1} 
                      max={10}
                      required 
                      value={newPG.roomsPerFloor}
                      onChange={(e) => setNewPG({ ...newPG, roomsPerFloor: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="wiz-base-rent">Base Monthly Rent Per Bed (INR)</label>
                  <input 
                    id="wiz-base-rent"
                    type="number" 
                    required 
                    value={newPG.baseRent}
                    onChange={(e) => setNewPG({ ...newPG, baseRent: e.target.value })}
                    className="form-control"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Will provision {newPG.floorsCount * newPG.roomsPerFloor} ready-to-occupy rooms across {newPG.floorsCount} floors.
                  </span>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', fontSize: '0.8125rem', color: '#1e40af' }}>
                  🎁 <strong>14-Day Full Enterprise Trial Included</strong>: Free digital rent receipts, tenant onboarding, WhatsApp integration, and mess schedule planner.
                </div>

                <div className="flex gap-2" style={{ marginTop: '6px' }}>
                  <button type="button" onClick={() => setWizardStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                    <Sparkles size={16} />
                    <span>Launch My PG Portal</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
