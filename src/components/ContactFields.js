import React from 'react';

const ContactFields = ({ formData, handleChange }) => (
  <div className="contact-fields">
    <div className="contact-field">
      <label htmlFor="fullName">👤 Name</label>
      <input
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={(e) => handleChange(e, 'fullName')}
        placeholder="e.g., John Doe"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="mail"><i className="fas fa-envelope"></i> Mail</label>
      <input
        type="text"
        name="mail"
        value={formData.mail}
        onChange={(e) => handleChange(e, 'mail')}
        placeholder="e.g., example@email.com"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="mobile">📱 Mobile</label>
      <input
        type="text"
        name="mobile"
        value={formData.mobile}
        onChange={(e) => handleChange(e, 'mobile')}
        placeholder="e.g., +1-123-456-7890"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="linkedin"><i className="fab fa-linkedin"></i> LinkedIn</label>
      <input
        type="url"
        name="linkedin"
        value={formData.linkedin}
        onChange={(e) => handleChange(e, 'linkedin')}
        placeholder="e.g., https://linkedin.com/in/username"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="github"><i className="fab fa-github"></i> GitHub</label>
      <input
        type="url"
        name="github"
        value={formData.github}
        onChange={(e) => handleChange(e, 'github')}
        placeholder="e.g., https://github.com/username"
        className="input-field"
      />
    </div>
    <div className="contact-field">
      <label htmlFor="other">🔗 Other</label>
      <input
        type="url"
        name="other"
        value={formData.other}
        onChange={(e) => handleChange(e, 'other')}
        placeholder="e.g., https://otherlink.com"
        className="input-field"
      />
    </div>
  </div>
);

export default ContactFields;