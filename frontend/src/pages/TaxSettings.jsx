import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaPlus, FaPercentage, FaTrash, FaEdit } from 'react-icons/fa';
import TaxRateModal from '../components/TaxRateModal';

const TaxSettings = () => {
    const { currentBook } = useAuth();
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchTaxes = async () => {
            if (!currentBook) return;
            try {
                const res = await api.get(`/taxes/book/${currentBook.id}`);
                setTaxes(res.data);
            } catch (err) {
                console.error("Failed to fetch taxes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTaxes();
    }, [currentBook]);

    if (!currentBook) return <div className="text-center mt-10">Please select a book first.</div>;
    if (loading) return <div>Loading tax rates...</div>;

    return (
        <div>
            {showModal && (
                <TaxRateModal
                    bookId={currentBook.id}
                    onClose={() => setShowModal(false)}
                    onSave={(newTax) => setTaxes([...taxes, newTax])}
                />
            )}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Tax Rates</h1>
                    <p className="text-muted">Manage the tax rates used in your invoices and bills.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: '8px' }}>
                    <FaPlus />
                    New Tax Rate
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th className="text-left p-4 font-semibold text-muted">Name</th>
                            <th className="text-left p-4 font-semibold text-muted">Total Rate</th>
                            <th className="text-left p-4 font-semibold text-muted">Components</th>
                            <th className="text-right p-4 font-semibold text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {taxes.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-muted">
                                    No tax rates found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            taxes.map(tax => {
                                // Calculate total rate (simplistic sum for display)
                                const totalRate = tax.entries?.reduce((acc, entry) => {
                                    return acc + (entry.amount_num / entry.amount_denom);
                                }, 0) || 0;

                                return (
                                    <tr key={tax.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-tertiary transition-colors">
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-accent">
                                                    <FaPercentage size={14} />
                                                </div>
                                                {tax.name}
                                                {tax.is_default && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Default</span>}
                                            </div>
                                        </td>
                                        <td className="p-4">{totalRate}%</td>
                                        <td className="p-4 text-sm text-muted">
                                            {tax.entries?.length} component(s)
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-muted hover:text-accent mr-3"><FaEdit /></button>
                                            <button className="text-muted hover:text-danger"><FaTrash /></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaxSettings;
