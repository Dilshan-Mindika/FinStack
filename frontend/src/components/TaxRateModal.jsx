import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import api from '../api/axios';

const TaxRateModal = ({ bookId, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [entries, setEntries] = useState([
        { amount_num: 0, account_id: '' }
    ]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get(`/accounts/book/${bookId}`);
                setAccounts(res.data);
                // Auto-select first available account if any
                if (res.data.length > 0) {
                    setEntries([{ amount_num: 0, account_id: res.data[0].id }]);
                }
            } catch (err) {
                console.error("Failed to fetch accounts", err);
            } finally {
                setLoadingAccounts(false);
            }
        };
        fetchAccounts();
    }, [bookId]);

    const handleAddEntry = () => {
        // Default to first account again
        const defaultAccount = accounts.length > 0 ? accounts[0].id : '';
        setEntries([...entries, { amount_num: 0, account_id: defaultAccount }]);
    };

    const handleRemoveEntry = (index) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries);
    };

    const handleEntryChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!name) return alert("Name is required");
        if (entries.some(e => !e.account_id)) return alert("All entries must have an account selected");

        const taxData = {
            book_id: bookId,
            name,
            entries: entries.map(e => ({
                account_id: e.account_id,
                amount_num: parseFloat(e.amount_num),
                amount_denom: 100, // Fixed for now
                type: 'PERCENT'
            }))
        };

        try {
            const res = await api.post('/taxes', taxData);
            onSave(res.data);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to save tax rate");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="card w-full max-w-lg relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-white"
                >
                    <FaTimes size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">New Tax Rate</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label>Tax Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sales Tax, VAT"
                            autoFocus
                        />
                    </div>

                    <div className="mb-4">
                        <label className="flex justify-between items-center mb-2">
                            <span>Components</span>
                            <button type="button" onClick={handleAddEntry} className="text-xs text-accent hover:underline flex items-center gap-1">
                                <FaPlus size={10} /> Add Component
                            </button>
                        </label>

                        {loadingAccounts ? (
                            <p>Loading accounts...</p>
                        ) : (
                            <div className="space-y-3">
                                {entries.map((entry, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={entry.amount_num}
                                                onChange={(e) => handleEntryChange(index, 'amount_num', e.target.value)}
                                                placeholder="Rate %"
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <select
                                                value={entry.account_id}
                                                onChange={(e) => handleEntryChange(index, 'account_id', e.target.value)}
                                            >
                                                <option value="" disabled>Select Account</option>
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.code ? `${acc.code} - ` : ''}{acc.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {entries.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEntry(index)}
                                                className="mt-2 text-muted hover:text-danger"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted mt-2">
                            Select the liability account where this tax should be collected.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Tax Rate</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaxRateModal;
