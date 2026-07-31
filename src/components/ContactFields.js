import React from 'react';

// Each input carries the id its label points at. Without it the label is
// decorative: a screen reader announces an unlabelled edit box, and clicking
// the label does not focus the field.
//
// The autocomplete tokens are what let the browser's own autofill offer a name,
// email and phone number it already knows, which is most of the typing in this
// form. type="email"/"tel" additionally get the right keyboard on a phone.
const ContactFields = ({ formData, handleChange }) => (
  <div className="contact-fields">
    <div className="contact-field">
      <label htmlFor="fullName">👤 Name</label>
      <input
        id="fullName"
        type="text"
        name="fullName"
        autoComplete="name"
        value={formData.fullName}
        onChange={(e) => handleChange(e, 'fullName')}
        placeholder="e.g., John Doe"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="professionalTitle">💼 Professional Title</label>
      <input
        id="professionalTitle"
        type="text"
        name="professionalTitle"
        autoComplete="organization-title"
        value={formData.professionalTitle || ''}
        onChange={(e) => handleChange(e, 'professionalTitle')}
        placeholder="e.g., Senior Software Engineer (shown under your name)"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="mail"><i className="fas fa-envelope"></i> Mail</label>
      <input
        id="mail"
        type="email"
        name="mail"
        autoComplete="email"
        inputMode="email"
        value={formData.mail}
        onChange={(e) => handleChange(e, 'mail')}
        placeholder="e.g., example@email.com"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="mobile">📱 Mobile</label>
      <input
        id="mobile"
        type="tel"
        name="mobile"
        autoComplete="tel"
        inputMode="tel"
        value={formData.mobile}
        onChange={(e) => handleChange(e, 'mobile')}
        placeholder="e.g., +1-123-456-7890"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="linkedin"><i className="fab fa-linkedin"></i> LinkedIn</label>
      <input
        id="linkedin"
        type="url"
        name="linkedin"
        autoComplete="url"
        inputMode="url"
        value={formData.linkedin}
        onChange={(e) => handleChange(e, 'linkedin')}
        placeholder="e.g., https://linkedin.com/in/username"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="github"><i className="fab fa-github"></i> GitHub</label>
      <input
        id="github"
        type="url"
        name="github"
        autoComplete="url"
        inputMode="url"
        value={formData.github}
        onChange={(e) => handleChange(e, 'github')}
        placeholder="e.g., https://github.com/username"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="other">🔗 Other</label>
      <input
        id="other"
        type="url"
        name="other"
        autoComplete="url"
        inputMode="url"
        value={formData.other}
        onChange={(e) => handleChange(e, 'other')}
        placeholder="e.g., https://otherlink.com"
        className="input-field"
      />
    </div>
  </div>
);

export default ContactFields;
