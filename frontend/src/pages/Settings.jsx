import { useNavigate } from 'react-router-dom';
import { FaPercentage, FaTools, FaFileInvoiceDollar } from 'react-icons/fa';

const Settings = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: 'Tax Rates',
            description: 'Manage tax rates, groups, and codes.',
            icon: <FaPercentage size={24} />,
            path: '/dashboard/settings/taxes',
            color: 'var(--accent-primary)'
        },
        {
            title: 'General Preferences',
            description: 'Date formats, number formats, and themes.',
            icon: <FaTools size={24} />,
            path: '/dashboard/settings/preferences',
            color: 'var(--success)'
        },
        {
            title: 'Invoice Templates',
            description: 'Customize the look of your invoices.',
            icon: <FaFileInvoiceDollar size={24} />,
            path: '/dashboard/settings/invoice-templates',
            color: 'var(--warning)'
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted">Configure your book and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <div
                        key={section.title}
                        onClick={() => navigate(section.path)}
                        className="card hover:border-accent cursor-pointer transition-all hover:translate-y-1"
                        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `${section.color}20`, // 20% opacity
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: section.color
                            }}
                        >
                            {section.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                            <p className="text-muted text-sm">{section.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Settings;
