// ... imports
import CreateRecord from './CreateRecord';

// ... component starts
const DoctorPatientLookup = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showCreateRecord, setShowCreateRecord] = useState(false);

    // ... handleSearch (unchanged)
    const handleSearch = async (e) => {
        // ... (existing code)
        e.preventDefault();
        setLoading(true);
        setPatients([]);
        setSelectedPatient(null);
        try {
            const actor = await getBackendActor();
            const allPatients = await actor.debug_list_patients();
            const filtered = allPatients.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.health_id.includes(searchTerm) ||
                p.email.includes(searchTerm)
            );
            setPatients(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Lookup</h2>

            {/* Show Create Record Modal if active */}
            {showCreateRecord && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg">
                        <CreateRecord
                            patientPrincipal={selectedPatient.user_principal.toText()}
                            onSuccess={() => {
                                setShowCreateRecord(false);
                                alert('Record added successfully!');
                                // Optionally refresh list
                            }}
                            onCancel={() => setShowCreateRecord(false)}
                        />
                    </div>
                </div>
            )}

            {!selectedPatient ? (
                <>
                    {/* Search Form (unchanged structure) */}
                    <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                        {/* ... Input ... */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="input-field pl-10"
                                placeholder="Search by Name, Email, or Health ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    <div className="space-y-4">
                        {patients.map(p => (
                            <div key={p.user_principal.toText()} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors cursor-pointer"
                                onClick={() => setSelectedPatient(p)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{p.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            ID: {p.health_id} • Age: {p.age} • {p.gender}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        ))}
                        {!loading && patients.length === 0 && searchTerm && (
                            <p className="text-gray-500 text-center">No patients found matching "{searchTerm}"</p>
                        )}
                    </div>
                </>
            ) : (
                <div>
                    <button
                        onClick={() => setSelectedPatient(null)}
                        className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        ← Back to Search
                    </button>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                                    <p className="text-gray-500">Health ID: {selectedPatient.health_id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateRecord(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2"
                            >
                                + Add Record
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Shared Health Records</h4>
                            <HealthRecordList principal={selectedPatient.user_principal.toText()} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPatientLookup;
