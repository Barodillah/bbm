import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check, Palette, ArrowDownLeft, ArrowUpRight, Loader2, BookOpen, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useApp } from '../context/AppContext';

const PRESET_COLORS = [
    '#F87171', '#FB923C', '#FBBF24', '#A3E635', '#34D399', '#2DD4BF',
    '#22D3EE', '#60A5FA', '#818CF8', '#A78BFA', '#E879F9', '#F472B6',
    '#9CA3AF', '#6B7280', '#374151',
];

export default function CategorySettingsPage() {
    const {
        categories, addCategory, updateCategory, deleteCategory,
        knowledge, addKnowledge, updateKnowledge, deleteKnowledge
    } = useApp();

    // Category State
    const [isAddingCat, setIsAddingCat] = useState(false);
    const [editingCatId, setEditingCatId] = useState(null);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
    const [newCatType, setNewCatType] = useState('expense');
    const [editCatName, setEditCatName] = useState('');
    const [editCatColor, setEditCatColor] = useState('');
    const [editCatType, setEditCatType] = useState('expense');
    const [showDeleteCatConfirm, setShowDeleteCatConfirm] = useState(null);
    const [isAddingCatLoading, setIsAddingCatLoading] = useState(false);
    const [isSavingCatEdit, setIsSavingCatEdit] = useState(false);

    // Knowledge State
    const [isAddingKnow, setIsAddingKnow] = useState(false);
    const [editingKnowId, setEditingKnowId] = useState(null);
    const [expandedKnowId, setExpandedKnowId] = useState(null);
    const [newKnowTitle, setNewKnowTitle] = useState('');
    const [newKnowContent, setNewKnowContent] = useState('');
    const [newKnowCategory, setNewKnowCategory] = useState('');
    const [editKnowTitle, setEditKnowTitle] = useState('');
    const [editKnowContent, setEditKnowContent] = useState('');
    const [editKnowCategory, setEditKnowCategory] = useState('');
    const [showDeleteKnowConfirm, setShowDeleteKnowConfirm] = useState(null);
    const [isAddingKnowLoading, setIsAddingKnowLoading] = useState(false);
    const [isSavingKnowEdit, setIsSavingKnowEdit] = useState(false);

    // Knowledge categories preset
    const KNOWLEDGE_CATEGORIES = ['Aturan', 'Target', 'Preferensi', 'Info Pribadi', 'Lainnya'];

    // --- Knowledge Handlers ---
    const handleAddKnow = async () => {
        if (!newKnowContent.trim() || isAddingKnowLoading) return;
        setIsAddingKnowLoading(true);
        try {
            await addKnowledge({
                title: newKnowTitle.trim() || null,
                content: newKnowContent.trim(),
                category: newKnowCategory || null
            });
            toast.success('Knowledge berhasil ditambahkan');
            setNewKnowTitle('');
            setNewKnowContent('');
            setNewKnowCategory('');
            setIsAddingKnow(false);
        } catch (err) {
            console.error('Failed to add knowledge:', err);
            toast.error('Gagal menambah knowledge. Coba lagi.');
        } finally {
            setIsAddingKnowLoading(false);
        }
    };

    const handleEditKnow = (k) => {
        setEditingKnowId(k.id);
        setEditKnowTitle(k.title || '');
        setEditKnowContent(k.content || '');
        setEditKnowCategory(k.category || '');
        setExpandedKnowId(null);
    };

    const handleSaveEditKnow = async () => {
        if (!editKnowContent.trim() || isSavingKnowEdit) return;
        setIsSavingKnowEdit(true);
        try {
            await updateKnowledge(editingKnowId, {
                title: editKnowTitle.trim() || null,
                content: editKnowContent.trim(),
                category: editKnowCategory || null
            });
            toast.success('Knowledge berhasil diperbarui');
            setEditingKnowId(null);
        } catch (err) {
            console.error('Failed to update knowledge:', err);
            toast.error('Gagal mengupdate knowledge. Coba lagi.');
        } finally {
            setIsSavingKnowEdit(false);
        }
    };

    const handleDeleteKnow = async () => {
        if (!showDeleteKnowConfirm) return;
        try {
            await deleteKnowledge(showDeleteKnowConfirm);
            toast.success('Knowledge berhasil dihapus');
            setShowDeleteKnowConfirm(null);
        } catch (err) {
            console.error('Failed to delete knowledge:', err);
            toast.error('Gagal menghapus knowledge. Coba lagi.');
        }
    };

    const toggleExpand = (id) => {
        setExpandedKnowId(prev => prev === id ? null : id);
    };

    // --- Category Handlers ---
    const handleAddCat = async () => {
        if (!newCatName.trim() || isAddingCatLoading) return;
        setIsAddingCatLoading(true);
        try {
            await addCategory(newCatName.trim(), newCatColor, newCatType);
            toast.success('Kategori berhasil ditambahkan');
            setNewCatName('');
            setNewCatColor(PRESET_COLORS[0]);
            setNewCatType('expense');
            setIsAddingCat(false);
        } catch (err) {
            console.error('Failed to add category:', err);
            toast.error('Gagal menambah kategori. Coba lagi.');
        } finally {
            setIsAddingCatLoading(false);
        }
    };

    const handleEditCat = (cat) => {
        setEditingCatId(cat.id);
        setEditCatName(cat.name);
        setEditCatColor(cat.color);
        setEditCatType(cat.type || 'expense');
    };

    const handleSaveEditCat = async () => {
        if (!editCatName.trim() || isSavingCatEdit) return;
        setIsSavingCatEdit(true);
        try {
            await updateCategory(editingCatId, editCatName.trim(), editCatColor, editCatType);
            toast.success('Kategori berhasil diperbarui');
            setEditingCatId(null);
        } catch (err) {
            console.error('Failed to update category:', err);
            toast.error('Gagal mengupdate kategori. Coba lagi.');
        } finally {
            setIsSavingCatEdit(false);
        }
    };

    const handleDeleteCat = async () => {
        if (!showDeleteCatConfirm) return;
        try {
            await deleteCategory(showDeleteCatConfirm);
            toast.success('Kategori berhasil dihapus');
            setShowDeleteCatConfirm(null);
        } catch (err) {
            console.error('Failed to delete category:', err);
            toast.error('Gagal menghapus kategori. Coba lagi.');
        }
    };

    const TypeSelector = ({ value, onChange, size = 'normal' }) => (
        <div className={`flex bg-gray-100 p-1 rounded-xl ${size === 'small' ? 'text-xs' : ''}`}>
            <button
                onClick={() => onChange('expense')}
                className={`flex-1 ${size === 'small' ? 'py-2 px-3' : 'py-2'} rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${value === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'
                    }`}
            >
                <ArrowDownLeft size={size === 'small' ? 14 : 16} />
                Pengeluaran
            </button>
            <button
                onClick={() => onChange('income')}
                className={`flex-1 ${size === 'small' ? 'py-2 px-3' : 'py-2'} rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${value === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                    }`}
            >
                <ArrowUpRight size={size === 'small' ? 14 : 16} />
                Pemasukan
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* --- Section 1: Category Settings --- */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <Palette size={20} className="text-indigo-500" />
                            Pengaturan Kategori
                        </h4>
                        <p className="text-sm text-gray-400">Kelola kategori pengeluaran dan pemasukan</p>
                    </div>
                    <button
                        onClick={() => setIsAddingCat(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
                    >
                        <Plus size={18} />
                        Tambah
                    </button>
                </div>

                {/* Add New Category Form */}
                {isAddingCat && (
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h5 className="font-bold text-gray-800">Kategori Baru</h5>
                            <button onClick={() => setIsAddingCat(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Nama kategori..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />

                        {/* Type Selector */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                Jenis Kategori
                            </label>
                            <TypeSelector value={newCatType} onChange={setNewCatType} />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                Pilih Warna
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewCatColor(color)}
                                        className={`w-8 h-8 rounded-full transition-all ${newCatColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsAddingCat(false)}
                                disabled={isAddingCatLoading}
                                className={`flex-1 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold ${isAddingCatLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddCat}
                                disabled={isAddingCatLoading}
                                className={`flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 ${isAddingCatLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isAddingCatLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Categories List */}
                <div className="space-y-3">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 transition-all hover:bg-gray-50"
                        >
                            {editingCatId === cat.id ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editCatName}
                                        onChange={(e) => setEditCatName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />

                                    <TypeSelector value={editCatType} onChange={setEditCatType} size="small" />

                                    <div className="flex flex-wrap gap-2">
                                        {PRESET_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setEditCatColor(color)}
                                                className={`w-6 h-6 rounded-full transition-all ${editCatColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingCatId(null)}
                                            disabled={isSavingCatEdit}
                                            className={`flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm ${isSavingCatEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleSaveEditCat}
                                            disabled={isSavingCatEdit}
                                            className={`flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${isSavingCatEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isSavingCatEdit ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                'Simpan'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Normal View
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: cat.color + '20' }}
                                        >
                                            <Palette size={20} style={{ color: cat.color }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{cat.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.type === 'income'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditCat(cat)}
                                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                        >
                                            <Edit2 size={18} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteCatConfirm(cat.id)}
                                            className="p-2 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} className="text-rose-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">Belum ada kategori</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Section 2: AI Advisor Knowledge --- */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <BookOpen size={20} className="text-amber-500" />
                            Acuan Finansial AI
                        </h4>
                        <p className="text-sm text-gray-400">Aturan dan preferensi keuangan untuk AI Advisor</p>
                    </div>
                    <button
                        onClick={() => setIsAddingKnow(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all"
                    >
                        <Plus size={18} />
                        Tambah
                    </button>
                </div>

                {/* Add New Knowledge Form */}
                {isAddingKnow && (
                    <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <h5 className="font-bold text-gray-800">Acuan Baru</h5>
                            <button onClick={() => setIsAddingKnow(false)} className="p-1 hover:bg-amber-100 rounded-full">
                                <X size={18} className="text-amber-400" />
                            </button>
                        </div>

                        {/* Title Input */}
                        <input
                            type="text"
                            placeholder="Judul (opsional)..."
                            value={newKnowTitle}
                            onChange={(e) => setNewKnowTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-amber-200 focus:ring-2 focus:ring-amber-400 transition-all"
                        />

                        {/* Content Textarea */}
                        <textarea
                            placeholder="Tulis aturan atau preferensi keuangan..."
                            value={newKnowContent}
                            onChange={(e) => setNewKnowContent(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white rounded-xl outline-none border border-amber-200 focus:ring-2 focus:ring-amber-400 transition-all resize-none"
                        />

                        {/* Category Selector */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                Kategori
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {KNOWLEDGE_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setNewKnowCategory(newKnowCategory === cat ? '' : cat)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${newKnowCategory === cat
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsAddingKnow(false)}
                                disabled={isAddingKnowLoading}
                                className={`flex-1 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold ${isAddingKnowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddKnow}
                                disabled={isAddingKnowLoading}
                                className={`flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 ${isAddingKnowLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isAddingKnowLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Knowledge List */}
                <div className="space-y-3">
                    {knowledge.map((k) => (
                        <div
                            key={k.id}
                            className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 transition-all hover:bg-gray-50"
                        >
                            {editingKnowId === k.id ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Judul (opsional)..."
                                        value={editKnowTitle}
                                        onChange={(e) => setEditKnowTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                    <textarea
                                        value={editKnowContent}
                                        onChange={(e) => setEditKnowContent(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {KNOWLEDGE_CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setEditKnowCategory(editKnowCategory === cat ? '' : cat)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${editKnowCategory === cat
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingKnowId(null)}
                                            disabled={isSavingKnowEdit}
                                            className={`flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm ${isSavingKnowEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleSaveEditKnow}
                                            disabled={isSavingKnowEdit}
                                            className={`flex-1 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${isSavingKnowEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isSavingKnowEdit ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                'Simpan Perubahan'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Normal View
                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className="flex-1 cursor-pointer group"
                                        onClick={() => setExpandedKnowId(expandedKnowId === k.id ? null : k.id)}
                                    >
                                        {/* Title */}
                                        {k.title && (
                                            <h5 className="font-bold text-gray-800 mb-1">{k.title}</h5>
                                        )}

                                        {/* Category Badge */}
                                        {k.category && (
                                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full mb-2">
                                                {k.category}
                                            </span>
                                        )}

                                        {/* Content */}
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {expandedKnowId === k.id || k.content.length <= 100
                                                ? k.content
                                                : `${k.content.substring(0, 100)}...`}
                                        </p>

                                        {k.content.length > 100 && (
                                            <button
                                                className="text-xs font-medium text-indigo-500 mt-1 hover:text-indigo-600 transition-colors"
                                            >
                                                {expandedKnowId === k.id ? 'Tutup' : 'Baca selengkapnya'}
                                            </button>
                                        )}

                                        <p className="text-xs text-gray-400 mt-2 group-hover:text-gray-500 transition-colors">
                                            Ditambahkan pada {new Date(k.created_at || Date.now()).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditKnow(k);
                                            }}
                                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                        >
                                            <Edit2 size={18} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDeleteKnowConfirm(k.id);
                                            }}
                                            className="p-2 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} className="text-rose-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {knowledge.length === 0 && (
                        <div className="text-center py-8">
                            <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-medium">Belum ada acuan finansial</p>
                            <p className="text-sm text-gray-300">Tambahkan aturan keuangan untuk membantu AI memahami preferensimu</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                isOpen={!!showDeleteCatConfirm}
                onClose={() => setShowDeleteCatConfirm(null)}
                onConfirm={handleDeleteCat}
                title="Hapus Kategori?"
                message="Kategori yang dihapus tidak dapat dikembalikan. Apakah Anda yakin?"
                confirmText="Hapus"
                isDestructive={true}
            />

            <ConfirmDialog
                isOpen={!!showDeleteKnowConfirm}
                onClose={() => setShowDeleteKnowConfirm(null)}
                onConfirm={handleDeleteKnow}
                title="Hapus Acuan?"
                message="Informasi ini akan dihapus dari ingatan AI Advisor. Apakah Anda yakin?"
                confirmText="Hapus"
                isDestructive={true}
            />
        </div>
    );
}
