import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBook, FaCheckCircle, FaBuilding, FaCoins, FaCalendar } from 'react-icons/fa';

const BookSetup = () => {
    const { organization, selectBook } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('list'); // 'list' or 'wizard'

    // Wizard State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        currency: null,
        fiscal_year_start: new Date().getFullYear() + '-01-01',
    });
    const [currencies, setCurrencies] = useState([]);
    const [creating, setCreating] = useState(false);

    // Initial Load: Check for existing books
    useEffect(() => {
        const fetchBooks = async () => {
            if (!organization) return;
            try {
                const res = await api.get(`/books/organization/${organization.id}`);
                setBooks(res.data);
                if (res.data.length === 0) {
                    setMode('wizard'); // Auto-start wizard if no books
                }
            } catch (err) {
                console.error("Failed to fetch books", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [organization]);

    // Load Currencies if entering wizard
    useEffect(() => {
        if (mode === 'wizard') {
            const fetchCurrencies = async () => {
                try {
                    const res = await api.get('/commodities/standard');
                    setCurrencies(res.data);
                    // Default to first if not set
                    if (!formData.currency && res.data.length > 0) {
                        // setFormData(prev => ({ ...prev, currency: res.data[0] }));
                    }
                } catch (err) {
                    console.error("Failed to fetch currencies", err);
                }
            };
            fetchCurrencies();
        }
    }, [mode]);

    const handleSelectBook = (book) => {
        selectBook(book);
        navigate('/dashboard');
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleCreateBook = async () => {
        setCreating(true);
        try {
            const payload = {
                organization_id: organization.id,
                ...formData
            };
            const res = await api.post('/books', payload);
            selectBook(res.data.book); // Backend returns { book, base_currency, root_account }
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            // Handle error (show toast/alert)
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    // View: List of Books
    if (mode === 'list') {
        return (
            <div className="card max-w-4xl mx-auto mt-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Select a Book</h2>
                    <p className="text-muted">Choose which financial entity you want to manage.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {books.map(book => (
                        <div
                            key={book.id}
                            onClick={() => handleSelectBook(book)}
                            className="bg-tertiary p-6 rounded-xl border border-border cursor-pointer hover:border-accent transition-all hover:shadow-lg flex items-center gap-4 group"
                            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
                        >
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-accent">
                                <FaBook size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{book.name}</h3>
                                <p className="text-sm text-muted">{book.description || 'No description'}</p>
                            </div>
                        </div>
                    ))}

                    {/* Add New Button Card */}
                    <div
                        onClick={() => setMode('wizard')}
                        className="bg-tertiary p-6 rounded-xl border border-dashed border-border cursor-pointer hover:border-accent transition-all flex items-center justify-center gap-2 text-muted hover:text-white"
                        style={{ background: 'transparent', borderColor: 'var(--border-color)' }}
                    >
                        <FaPlus />
                        <span>Create New Book</span>
                    </div>
                </div>
            </div>
        );
    }

    // View: Wizard
    return (
        <div className="max-w-2xl mx-auto mt-14">

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-accent text-white' : 'bg-tertiary text-muted'
                                }`}
                            style={{
                                background: step >= i ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: step >= i ? 'white' : 'var(--text-secondary)'
                            }}
                        >
                            {step > i ? <FaCheckCircle /> : i}
                        </div>
                        <span className={`text-sm ${step >= i ? 'text-white' : 'text-muted'}`}>
                            {i === 1 && 'Basic Info'}
                            {i === 2 && 'Currency'}
                            {i === 3 && 'Fiscal Year'}
                        </span>
                        {i < 3 && <div className="w-12 h-0.5 bg-border mx-2" style={{ background: 'var(--border-color)' }}></div>}
                    </div>
                ))}
            </div>

            <div className="card">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                                <FaBuilding size={24} color="var(--accent-primary)" />
                            </div>
                            <h2 className="text-xl font-bold">Let's set up your Book</h2>
                            <p className="text-muted">Give your financial entity a name.</p>
                        </div>

                        <div className="mb-4">
                            <label>Book Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Acme Corp, My Personal Finances"
                                autoFocus
                            />
                        </div>
                        <div className="mb-6">
                            <label>Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="A brief description..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Currency */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                                <FaCoins size={24} color="var(--accent-secondary)" />
                            </div>
                            <h2 className="text-xl font-bold">Select Base Currency</h2>
                            <p className="text-muted">This will be the main currency for your reports.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto mb-6">
                            {currencies.map(curr => (
                                <div
                                    key={curr.mnemonic}
                                    onClick={() => setFormData({ ...formData, currency: curr })}
                                    className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${formData.currency?.mnemonic === curr.mnemonic
                                            ? 'border-accent bg-accent/10'
                                            : 'border-border hover:border-gray-500'
                                        }`}
                                    style={{
                                        borderColor: formData.currency?.mnemonic === curr.mnemonic ? 'var(--accent-primary)' : 'var(--border-color)',
                                        background: formData.currency?.mnemonic === curr.mnemonic ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg">{curr.mnemonic}</span>
                                        <span>{curr.fullname}</span>
                                    </div>
                                    {formData.currency?.mnemonic === curr.mnemonic && <FaCheckCircle color="var(--accent-primary)" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Fiscal Year */}
                {step === 3 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                                <FaCalendar size={24} color="var(--success)" />
                            </div>
                            <h2 className="text-xl font-bold">Fiscal Year</h2>
                            <p className="text-muted">When does your financial year start?</p>
                        </div>

                        <div className="mb-6">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={formData.fiscal_year_start}
                                onChange={e => setFormData({ ...formData, fiscal_year_start: e.target.value })}
                            />
                            <p className="text-xs text-muted mt-2">Usually Jan 1st or Apr 1st.</p>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-between mt-8 pt-4 border-t border-border" style={{ borderColor: 'var(--border-color)' }}>
                    {step > 1 ? (
                        <button onClick={handleBack} className="btn btn-secondary">Back</button>
                    ) : (
                        books.length > 0 ? <button onClick={() => setMode('list')} className="btn btn-secondary">Cancel</button> : <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="btn btn-primary"
                            disabled={
                                (step === 1 && !formData.name) ||
                                (step === 2 && !formData.currency)
                            }
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateBook}
                            className="btn btn-primary"
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : 'Finish Setup'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default BookSetup;
