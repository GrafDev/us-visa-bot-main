import { useState, useEffect } from 'react';
import './EditModal.css';

function EditModal({ client, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country_code: '',
    schedule_id: '',
    facility_id: '',
    current_date: '',
    target_date: '',
    min_date: '',
    refresh_delay: 3,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        password: client.password || '',
        country_code: client.country_code || '',
        schedule_id: client.schedule_id || '',
        facility_id: client.facility_id || '',
        current_date: client.current_date || '',
        target_date: client.target_date || '',
        min_date: client.min_date || '',
        refresh_delay: client.refresh_delay || 3,
      });
    }
  }, [client]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.country_code.trim()) newErrors.country_code = 'Country code is required';
    if (!formData.schedule_id.trim()) newErrors.schedule_id = 'Schedule ID is required';
    if (!formData.facility_id.trim()) newErrors.facility_id = 'Facility ID is required';
    if (!formData.current_date.trim()) newErrors.current_date = 'Current date is required';

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (formData.current_date && !dateRegex.test(formData.current_date)) {
      newErrors.current_date = 'Invalid date format (use YYYY-MM-DD)';
    }
    if (formData.target_date && !dateRegex.test(formData.target_date)) {
      newErrors.target_date = 'Invalid date format (use YYYY-MM-DD)';
    }
    if (formData.min_date && !dateRegex.test(formData.min_date)) {
      newErrors.min_date = 'Invalid date format (use YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      // Clean up empty optional fields
      const dataToSave = {
        ...formData,
        target_date: formData.target_date || null,
        min_date: formData.min_date || null,
        refresh_delay: parseInt(formData.refresh_delay) || 3,
      };

      await onSave(dataToSave);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{client ? 'Edit Client' : 'Add New Client'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country_code">Country Code *</label>
              <input
                type="text"
                id="country_code"
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                placeholder="e.g., ru, fr, de"
                className={errors.country_code ? 'error' : ''}
              />
              {errors.country_code && <span className="error-text">{errors.country_code}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="schedule_id">Schedule ID *</label>
              <input
                type="text"
                id="schedule_id"
                name="schedule_id"
                value={formData.schedule_id}
                onChange={handleChange}
                className={errors.schedule_id ? 'error' : ''}
              />
              {errors.schedule_id && <span className="error-text">{errors.schedule_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="facility_id">Facility ID *</label>
              <input
                type="text"
                id="facility_id"
                name="facility_id"
                value={formData.facility_id}
                onChange={handleChange}
                className={errors.facility_id ? 'error' : ''}
              />
              {errors.facility_id && <span className="error-text">{errors.facility_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="current_date">Current Date *</label>
              <input
                type="date"
                id="current_date"
                name="current_date"
                value={formData.current_date}
                onChange={handleChange}
                className={errors.current_date ? 'error' : ''}
              />
              {errors.current_date && <span className="error-text">{errors.current_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="target_date">Target Date</label>
              <input
                type="date"
                id="target_date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                className={errors.target_date ? 'error' : ''}
              />
              {errors.target_date && <span className="error-text">{errors.target_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="min_date">Minimum Date</label>
              <input
                type="date"
                id="min_date"
                name="min_date"
                value={formData.min_date}
                onChange={handleChange}
                className={errors.min_date ? 'error' : ''}
              />
              {errors.min_date && <span className="error-text">{errors.min_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="refresh_delay">Refresh Delay (seconds)</label>
              <input
                type="number"
                id="refresh_delay"
                name="refresh_delay"
                value={formData.refresh_delay}
                onChange={handleChange}
                min="1"
                max="60"
              />
            </div>
          </div>

          {errors.submit && (
            <div className="error-banner">
              {errors.submit}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : client ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
