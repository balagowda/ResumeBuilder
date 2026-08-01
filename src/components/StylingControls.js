import React from 'react';

// Inter, Lato, and Source Serif 4 are bundled (see Styles/fonts.css), so they
// render identically on every visitor's machine and in the exports; the rest
// are system stacks.
const HEADER_FONTS = [
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Inter', value: "'Inter', Helvetica, Arial, sans-serif" },
  { name: 'Lato', value: "'Lato', Helvetica, Arial, sans-serif" },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Source Serif', value: "'Source Serif 4', Georgia, serif" },
  { name: 'Gill Sans', value: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" },
  { name: 'Garamond', value: 'Garamond, serif' }
];

const SUBHEADER_FONTS = [
  { name: 'Calibri', value: "Calibri, 'Helvetica Neue', Helvetica, sans-serif" },
  { name: 'Tahoma', value: 'Tahoma, Verdana, sans-serif' },
  { name: 'Cambria', value: 'Cambria, Georgia, serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Inter', value: "'Inter', Helvetica, Arial, sans-serif" },
  { name: 'Lato', value: "'Lato', Helvetica, Arial, sans-serif" },
  { name: 'Source Serif', value: "'Source Serif 4', Georgia, serif" }
];

const ACCENT_COLORS = [
  { name: 'Template default', value: '' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Royal Blue', value: '#1d4ed8' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Forest Green', value: '#15803d' },
  { name: 'Maroon', value: '#b91c1c' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Slate', value: '#334155' },
];

const TEXT_FONTS = [
  { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { name: 'Calibri', value: "Calibri, 'Helvetica Neue', Helvetica, sans-serif" },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Inter', value: "'Inter', Helvetica, Arial, sans-serif" },
  { name: 'Lato', value: "'Lato', Helvetica, Arial, sans-serif" },
  { name: 'Source Serif', value: "'Source Serif 4', Georgia, serif" }
];

// Matches MIN_SCALE in TemplateWorkspace — below 70% the type stops being
// readable in print.
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.1;
const SCALE_STEP = 0.05;

export default function StylingControls({ formData, handleChange }) {
  const scale = formData.contentScale || 1;

  const setScale = (value) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(value * 100) / 100));
    handleChange({ target: { name: 'contentScale', value: clamped } });
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '8px'
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: '0.9rem',
    color: '#1e293b',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      marginTop: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <i className="fas fa-paint-brush" style={{ color: 'var(--primary-color)' }}></i>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-dark)' }}>Typography & Spacing</h3>
      </div>
      
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="fontHeading">Main Headers Font</label>
        <select
          id="fontHeading"
          name="fontHeading"
          value={formData.fontHeading || 'Arial, Helvetica, sans-serif'} 
          onChange={handleChange}
          style={selectStyle}
        >
          {HEADER_FONTS.map(font => (
            <option key={font.name} value={font.value}>{font.name}</option>
          ))}
        </select>
      </div>
      
      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="fontSubheading">Sub-Headers Font</label>
        <select
          id="fontSubheading"
          name="fontSubheading"
          value={formData.fontSubheading || 'Arial, Helvetica, sans-serif'} 
          onChange={handleChange}
          style={selectStyle}
        >
          {SUBHEADER_FONTS.map(font => (
            <option key={font.name} value={font.value}>{font.name}</option>
          ))}
        </select>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="fontText">Text Font</label>
        <select
          id="fontText"
          name="fontText"
          value={formData.fontText || 'Arial, Helvetica, sans-serif'} 
          onChange={handleChange}
          style={selectStyle}
        >
          {TEXT_FONTS.map(font => (
            <option key={font.name} value={font.value}>{font.name}</option>
          ))}
        </select>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Accent Color</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {ACCENT_COLORS.map((c) => {
            const selected = (formData.accentColor || '') === c.value;
            return (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => handleChange({ target: { name: 'accentColor', value: c.value } })}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: c.value || 'linear-gradient(135deg, #f8fafc 50%, #cbd5e1 50%)',
                  border: selected ? '3px solid var(--primary-color)' : '2px solid #e2e8f0',
                  boxShadow: selected ? '0 0 0 2px #fff inset' : 'none',
                  transition: 'all 0.15s',
                }}
              />
            );
          })}
          {(() => {
            // The picker doubles as the swatch for whatever custom color is
            // active, so a hand-picked shade shows selected the same way a
            // preset does.
            const isCustom =
              !!formData.accentColor &&
              !ACCENT_COLORS.some((c) => c.value === formData.accentColor);
            return (
              <label
                title="Pick any color"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCustom
                    ? formData.accentColor
                    : 'conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)',
                  border: isCustom ? '3px solid var(--primary-color)' : '2px solid #e2e8f0',
                  boxShadow: isCustom ? '0 0 0 2px #fff inset' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {!isCustom && (
                  <i className="fas fa-plus" style={{ color: '#fff', fontSize: '0.7rem', textShadow: '0 0 2px rgba(0,0,0,0.6)' }}></i>
                )}
                <input
                  type="color"
                  aria-label="Custom accent color"
                  value={isCustom ? formData.accentColor : '#4f46e5'}
                  onChange={(e) => handleChange({ target: { name: 'accentColor', value: e.target.value } })}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0,
                  }}
                />
              </label>
            );
          })()}
        </div>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
          Recolors headings, rules, and header bands. The rainbow swatch picks any custom color; "Template default" restores the original palette.
        </p>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Text Size</label>
        <div className="scale-stepper">
          <button
            type="button"
            title="Smaller text — fits more on the page"
            disabled={scale <= MIN_SCALE}
            onClick={() => setScale(scale - SCALE_STEP)}
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="scale-stepper-value">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            title="Larger text"
            disabled={scale >= MAX_SCALE}
            onClick={() => setScale(scale + SCALE_STEP)}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
          Scales the whole resume. Use it with "Fit to one page" when your content spills over.
        </p>
      </div>

      <div style={{ marginTop: '28px' }}>
        <label style={labelStyle}>Line Spacing</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'lineHeight', value: 1.2 } })}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: `2px solid ${formData.lineHeight === 1.2 ? 'var(--primary-color)' : '#e2e8f0'}`,
              backgroundColor: formData.lineHeight === 1.2 ? '#eff6ff' : 'white',
              color: formData.lineHeight === 1.2 ? 'var(--primary-color)' : '#64748b',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-align-justify" style={{ fontSize: '1.1rem' }}></i>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Compact</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'lineHeight', value: 1.4 } })}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: `2px solid ${formData.lineHeight === 1.4 || !formData.lineHeight ? 'var(--primary-color)' : '#e2e8f0'}`,
              backgroundColor: formData.lineHeight === 1.4 || !formData.lineHeight ? '#eff6ff' : 'white',
              color: formData.lineHeight === 1.4 || !formData.lineHeight ? 'var(--primary-color)' : '#64748b',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-align-left" style={{ fontSize: '1.1rem' }}></i>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Standard</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'lineHeight', value: 1.6 } })}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: `2px solid ${formData.lineHeight === 1.6 ? 'var(--primary-color)' : '#e2e8f0'}`,
              backgroundColor: formData.lineHeight === 1.6 ? '#eff6ff' : 'white',
              color: formData.lineHeight === 1.6 ? 'var(--primary-color)' : '#64748b',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-list" style={{ fontSize: '1.1rem' }}></i>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Relaxed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
