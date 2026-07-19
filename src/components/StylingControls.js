import React from 'react';

const HEADER_FONTS = [
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Gill Sans', value: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" },
  { name: 'Garamond', value: 'Garamond, serif' }
];

const SUBHEADER_FONTS = [
  { name: 'Calibri', value: "Calibri, 'Helvetica Neue', Helvetica, sans-serif" },
  { name: 'Tahoma', value: 'Tahoma, Verdana, sans-serif' },
  { name: 'Cambria', value: 'Cambria, Georgia, serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' }
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
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' }
];

export default function StylingControls({ formData, handleChange }) {
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
        <label style={labelStyle}>Main Headers Font</label>
        <select 
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
        <label style={labelStyle}>Sub-Headers Font</label>
        <select 
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
        <label style={labelStyle}>Text Font</label>
        <select 
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
        </div>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>
          Recolors headings, rules, and header bands. "Template default" restores the original palette.
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
