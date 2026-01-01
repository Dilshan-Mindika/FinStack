import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaSave, FaMoon, FaSun } from 'react-icons/fa';

const Preferences = () => {
    const { user, updateUser } = useAuth();
    const [prefs, setPrefs] = useState({
        locale: 'en-US',
        timezone: 'UTC',
        date_format: 'YYYY-MM-DD',
        number_format: '1,234.56',
        ui_settings: { theme: 'dark' }
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.preferences) {
            setPrefs(prev => ({ ...prev, ...user.preferences }));
        }
    }, [user]);

    const handleChange = (field, value) => {
        setPrefs(prev => ({ ...prev, [field]: value }));
    };

    const handleThemeChange = (theme) => {
        setPrefs(prev => ({
            ...prev,
            ui_settings: { ...prev.ui_settings, theme }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await api.put('/preferences', prefs);
            // Update global user context immediately so theme applies
            updateUser({ preferences: res.data });
            setMessage('Preferences saved successfully.');
        } catch (err) {
            console.error(err);
            setMessage('Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">User Preferences</h1>

            <div className="card">
                <form onSubmit={handleSave}>

                    {/* Localization Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2" style={{ borderColor: 'var(--border-color)' }}>Localization</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label>Language / Locale</label>
                                <select
                                    value={prefs.locale}
                                    onChange={(e) => handleChange('locale', e.target.value)}
                                >
                                    <option value="en-US">English (US)</option>
                                    <option value="en-GB">English (UK)</option>
                                    <option value="si-LK">Sinhala (Sri Lanka)</option>
                                </select>
                            </div>

                            <div>
                                <label>Timezone</label>
                                <select
                                    value={prefs.timezone}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="Asia/Colombo">Asia/Colombo</option>
                                    <option value="America/New_York">America/New_York</option>
                                    <option value="Europe/London">Europe/London</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Formatting Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2" style={{ borderColor: 'var(--border-color)' }}>Formatting</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label>Date Format</label>
                                <select
                                    value={prefs.date_format}
                                    onChange={(e) => handleChange('date_format', e.target.value)}
                                >
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                                </select>
                            </div>

                            <div>
                                <label>Number Format</label>
                                <select
                                    value={prefs.number_format}
                                    onChange={(e) => handleChange('number_format', e.target.value)}
                                >
                                    <option value="1,234.56">1,234.56</option>
                                    <option value="1.234,56">1.234,56</option>
                                    <option value="1 234.56">1 234.56</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Theme Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2" style={{ borderColor: 'var(--border-color)' }}>Appearance</h3>

                        <div className="flex gap-4">
                            <div
                                onClick={() => handleThemeChange('dark')}
                                className={`flex-1 p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition-all ${(!prefs.ui_settings.theme || prefs.ui_settings.theme === 'dark') ? 'border-accent bg-accent/10' : 'border-border'
                                    }`}
                                style={{
                                    borderColor: (!prefs.ui_settings.theme || prefs.ui_settings.theme === 'dark') ? 'var(--accent-primary)' : 'var(--border-color)',
                                    background: (!prefs.ui_settings.theme || prefs.ui_settings.theme === 'dark') ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                            >
                                <FaMoon size={24} className={(!prefs.ui_settings.theme || prefs.ui_settings.theme === 'dark') ? 'text-accent' : 'text-muted'} />
                                <span className="font-medium">Dark Mode</span>
                            </div>

                            <div
                                onClick={() => handleThemeChange('light')}
                                className={`flex-1 p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition-all ${prefs.ui_settings.theme === 'light' ? 'border-accent bg-accent/10' : 'border-border'
                                    }`}
                                style={{
                                    borderColor: prefs.ui_settings.theme === 'light' ? 'var(--accent-primary)' : 'var(--border-color)',
                                    background: prefs.ui_settings.theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                            >
                                <FaSun size={24} className={prefs.ui_settings.theme === 'light' ? 'text-accent' : 'text-muted'} />
                                <span className="font-medium">Light Mode</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-border" style={{ borderColor: 'var(--border-color)' }}>
                        {message && (
                            <span className={message.includes('Failed') ? 'text-danger' : 'text-success'}>
                                {message}
                            </span>
                        )}
                        <div className="flex-1"></div> {/* Spacer if no message */}
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ gap: '8px' }}>
                            <FaSave />
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Preferences;
