// src/components/WhatsAppTemplateModal.jsx
import React, { useState, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Send, 
  Copy, 
  HelpCircle, 
  Layers, 
  Building2, 
  Info,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { 
  DEFAULT_TEMPLATES, 
  TEMPLATE_METADATA, 
  TOKEN_DEFINITIONS, 
  SAMPLE_PREVIEW_DATA, 
  interpolateTemplate,
  getPropertyTemplate
} from '../utils/templateEngine';

export default function WhatsAppTemplateModal({ property, onSaveTemplates, onClose, initialTab = 'rent_reminder' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Local state for all templates of this property
  const [templates, setTemplates] = useState(() => ({
    rent_reminder: property?.templates?.rent_reminder || DEFAULT_TEMPLATES.rent_reminder,
    cash_receipt: property?.templates?.cash_receipt || DEFAULT_TEMPLATES.cash_receipt,
    welcome_chit: property?.templates?.welcome_chit || DEFAULT_TEMPLATES.welcome_chit
  }));

  const [savedToast, setSavedToast] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const textareaRef = useRef(null);

  // Active template metadata
  const currentMeta = TEMPLATE_METADATA.find(m => m.key === activeTab) || TEMPLATE_METADATA[0];
  const currentTemplateText = templates[activeTab] || '';

  // Handle text edit
  const handleTextChange = (e) => {
    const val = e.target.value;
    setTemplates(prev => ({
      ...prev,
      [activeTab]: val
    }));
  };

  // Insert token chip into textarea at current cursor position
  const handleInsertToken = (tokenKey) => {
    const textarea = textareaRef.current;
    const tokenTag = `{{${tokenKey}}}`;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentVal = templates[activeTab] || '';
      const newVal = currentVal.substring(0, start) + tokenTag + currentVal.substring(end);
      
      setTemplates(prev => ({
        ...prev,
        [activeTab]: newVal
      }));

      // Restore focus and cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tokenTag.length, start + tokenTag.length);
      }, 0);
    } else {
      setTemplates(prev => ({
        ...prev,
        [activeTab]: (prev[activeTab] || '') + ' ' + tokenTag
      }));
    }
  };

  // Reset current template to factory default
  const handleResetToDefault = () => {
    if (window.confirm(`Reset "${currentMeta.name}" to the system recommended template?`)) {
      setTemplates(prev => ({
        ...prev,
        [activeTab]: DEFAULT_TEMPLATES[activeTab]
      }));
    }
  };

  // Save changes
  const handleSave = () => {
    onSaveTemplates(property.id, templates);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 900);
  };

  // Interpolate for WhatsApp chat bubble preview
  const previewContext = {
    ...SAMPLE_PREVIEW_DATA,
    property_name: property?.name || SAMPLE_PREVIEW_DATA.property_name,
    upi_id: property?.upiId || SAMPLE_PREVIEW_DATA.upi_id
  };
  const renderedPreview = interpolateTemplate(currentTemplateText, previewContext);

  // Copy rendered preview to clipboard
  const handleCopyPreview = () => {
    navigator.clipboard?.writeText(renderedPreview);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '960px', 
          width: '95%', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid var(--border-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#fff'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>📱</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                WhatsApp Message Template Studio
              </h2>
              <span 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '3px 8px', 
                  borderRadius: '12px',
                  letterSpacing: '0.02em'
                }}
              >
                PROPERTY SCOPED
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: '#a7f3d0' }}>
              Configuring custom WhatsApp dispatch texts specifically for <strong style={{ color: '#fff' }}>{property?.name}</strong>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="btn-icon"
            style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div 
          style={{ 
            display: 'flex', 
            background: 'var(--surface-color)', 
            borderBottom: '1px solid var(--border-color)',
            padding: '0 16px',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {TEMPLATE_METADATA.map(meta => {
            const isActive = activeTab === meta.key;
            return (
              <button
                key={meta.key}
                onClick={() => setActiveTab(meta.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
                  color: isActive ? '#059669' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{meta.icon}</span>
                <span>{meta.name}</span>
                {templates[meta.key] !== DEFAULT_TEMPLATES[meta.key] && (
                  <span 
                    style={{ 
                      fontSize: '0.6875rem', 
                      background: '#ecfdf5', 
                      color: '#059669', 
                      padding: '1px 6px', 
                      borderRadius: '999px',
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    Customized
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body: Editor on Left, WhatsApp Live Preview on Right */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1fr', 
            flex: 1, 
            overflow: 'hidden',
            background: 'var(--bg-main)'
          }}
          className="modal-body-grid"
        >
          {/* Left Column: Template Editor & Dynamic Token Inserter */}
          <div 
            style={{ 
              padding: '20px', 
              overflowY: 'auto', 
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    {currentMeta.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                    {currentMeta.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', gap: '4px', padding: '4px 8px' }}
                  title="Reset this template to factory default"
                >
                  <RotateCcw size={12} />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Dynamic Token Chips - Click to Insert */}
            <div 
              style={{ 
                background: 'var(--surface-color)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '12px' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ Insert Dynamic Placeholders (Click to Add)
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Auto-replaced per tenant
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentMeta.supportedTokens.map(tokenKey => {
                  const def = TOKEN_DEFINITIONS[tokenKey];
                  return (
                    <button
                      key={tokenKey}
                      type="button"
                      onClick={() => handleInsertToken(tokenKey)}
                      className="token-chip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        cursor: 'pointer',
                        transition: 'transform 0.1s, background-color 0.15s'
                      }}
                      title={`${def?.description || tokenKey} (e.g. "${def?.sample || ''}")`}
                    >
                      <span>+</span>
                      <code>{`{{${tokenKey}}}`}</code>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Raw Template Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Message Template Text
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports WhatsApp markdown (*bold*, _italic_)
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={currentTemplateText}
                onChange={handleTextChange}
                placeholder="Type your message with dynamic {{tokens}}..."
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: '200px',
                  fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.8125rem',
                  lineHeight: '1.5',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-main)',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Zero-Cost Deep-Link Explainer */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'flex-start', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                backgroundColor: '#eff6ff', 
                border: '1px solid #bfdbfe',
                fontSize: '0.75rem',
                color: '#1e40af'
              }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#2563eb' }} />
              <div>
                <strong>Zero-Cost Direct Trigger:</strong> When you or staff click "Send on WhatsApp", it triggers a deep-link directly via the resident's WhatsApp chat with this customized message. <em>Zero Meta API conversation fees.</em>
              </div>
            </div>
          </div>

          {/* Right Column: Live Real-Time WhatsApp Phone Simulation */}
          <div 
            style={{ 
              padding: '20px', 
              background: '#e5ddd5', 
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>
                  Live Tenant Chat Bubble Preview
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPreview}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.6875rem', padding: '3px 8px', backgroundColor: '#ffffff', color: '#374151' }}
              >
                {copiedPreview ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                <span>{copiedPreview ? 'Copied' : 'Copy Test'}</span>
              </button>
            </div>

            {/* WhatsApp Chat Bubble */}
            <div 
              style={{ 
                backgroundColor: '#dcf8c6', 
                borderRadius: '8px 8px 2px 8px', 
                padding: '12px 14px', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                color: '#111827',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                position: 'relative',
                marginBottom: '16px'
              }}
            >
              {renderedPreview}
              
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end', 
                  gap: '4px', 
                  marginTop: '6px', 
                  fontSize: '0.6875rem', 
                  color: '#6b7280' 
                }}
              >
                <span>10:45 AM</span>
                <span style={{ color: '#3b82f6', fontWeight: 800 }}>✓✓</span>
              </div>
            </div>

            {/* Test Action */}
            <div 
              style={{ 
                marginTop: 'auto', 
                backgroundColor: '#ffffff', 
                borderRadius: '8px', 
                padding: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                🧪 Quick Test Dispatch
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#6b7280', margin: '0 0 10px 0' }}>
                Open this rendered text on your own WhatsApp to see how it renders on mobile:
              </p>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(renderedPreview)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{ 
                  width: '100%', 
                  backgroundColor: '#25D366', 
                  color: '#ffffff', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px',
                  textDecoration: 'none',
                  borderRadius: '6px'
                }}
              >
                <MessageSquare size={14} />
                <span>Test Send on WhatsApp Web</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          style={{ 
            padding: '16px 24px', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: 'var(--surface-color)'
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Changes will automatically apply to all upcoming reminders & cash slips for <strong>{property?.name}</strong>.
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSave} 
              className="btn btn-primary"
              style={{ backgroundColor: '#059669', borderColor: '#059669', minWidth: '130px', gap: '6px' }}
            >
              {savedToast ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <span>Save Templates</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
