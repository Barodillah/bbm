import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, FileDown, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { read, utils } from 'xlsx';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function MigrationPage() {
    const { categories, wallets, addTransaction } = useApp();
    const navigate = useNavigate();

    const [type, setType] = useState('expense');
    const [categoryId, setCategoryId] = useState('');
    const [walletId, setWalletId] = useState('');
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const fileInputRef = useRef(null);

    // Filter categories based on type
    const availableCategories = categories.filter(c => c.type === type);

    const handleDownloadTemplate = () => {
        const headers = ['Date', 'Title', 'Nominal'];
        const data = [
            headers,
            ['2024-01-31', 'Contoh Transaksi', 50000]
        ];

        const ws = utils.aoa_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Template");

        // Write file
        const wbout = utils.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_migrasi.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = utils.sheet_to_json(ws, { header: 1 });

                // Parse data (skip header row 0)
                const rows = data.slice(1).filter(row => row.length >= 3).map(row => {
                    // Assuming order: Date, Title, Nominal
                    // Handle Excel dates if necessary, or assume string YYYY-MM-DD
                    let date = row[0];
                    if (typeof date === 'number') {
                        // Excel serial date to JS Date
                        const d = new Date(Math.round((date - 25569) * 86400 * 1000));
                        date = d.toISOString().split('T')[0];
                    }

                    return {
                        date: date, // Ensure YYYY-MM-DD format
                        title: row[1],
                        amount: parseFloat(row[2])
                    };
                });

                setParsedData(rows);
                toast.success(`Berhasil membaca ${rows.length} baris data`);
            } catch (err) {
                console.error(err);
                toast.error('Gagal membaca file Excel');
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleProcess = async () => {
        if (!categoryId) return toast.error('Pilih kategori terlebih dahulu');
        if (!walletId) return toast.error('Pilih wallet terlebih dahulu');
        if (parsedData.length === 0) return toast.error('Tidak ada data yang valid');

        if (!confirm(`Yakin ingin memproses ${parsedData.length} data?`)) return;

        setIsProcessing(true);
        let successCount = 0;
        let failCount = 0;

        try {
            const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
            if (!selectedCategory) throw new Error('Category not found');

            for (const item of parsedData) {
                try {
                    await addTransaction({
                        title: item.title,
                        amount: item.amount,
                        category: selectedCategory.name,
                        type: type,
                        date: item.date,
                        wallet_id: parseInt(walletId),
                        skip_balance_update: true
                    });
                    successCount++;
                } catch (err) {
                    console.error(err);
                    failCount++;
                }
            }

            toast.success(`Berhasil migrasi: ${successCount}, Gagal: ${failCount}`);
            if (successCount > 0) {
                setParsedData([]);
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (err) {
            toast.error('Terjadi kesalahan saat memproses data');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Migrasi Data Lama</h1>
                    <p className="text-gray-500">Upload data transaksi lama via Excel</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                        Konfigurasi
                    </h3>

                    <div className="space-y-4">
                        {/* Type Selector */}
                        <div className="grid grid-cols-2 bg-gray-50 p-1 rounded-xl">
                            <button
                                onClick={() => { setType('expense'); setCategoryId(''); }}
                                className={`py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                Pengeluaran
                            </button>
                            <button
                                onClick={() => { setType('income'); setCategoryId(''); }}
                                className={`py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                Pemasukan
                            </button>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Kategori</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                            >
                                <option value="">-- Pilih Kategori --</option>
                                {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Wallet Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Masuk ke Wallet</label>
                            <select
                                value={walletId}
                                onChange={(e) => setWalletId(e.target.value)}
                                className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                            >
                                <option value="">-- Pilih Wallet --</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                        Upload File
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-sm text-indigo-800 mb-3 font-medium">Format Excel:</p>
                            <ul className="text-xs text-indigo-600 space-y-1 list-disc ml-4">
                                <li>Kolom A: Date (YYYY-MM-DD)</li>
                                <li>Kolom B: Title (Judul Transaksi)</li>
                                <li>Kolom C: Nominal (Angka)</li>
                            </ul>
                            <button
                                onClick={handleDownloadTemplate}
                                className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <FileDown size={14} />
                                Download Template
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="block w-full text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-gray-50 transition-all group"
                            >
                                <div className="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-3 transition-colors">
                                    <Upload size={20} className="text-gray-400 group-hover:text-indigo-600" />
                                </div>
                                <p className="text-sm font-bold text-gray-600 group-hover:text-gray-800">
                                    {file ? file.name : 'Klik untuk upload Excel'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Format .xlsx atau .xls
                                </p>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            {parsedData.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">3</span>
                            Preview Data ({parsedData.length} items)
                        </h3>
                        <button
                            onClick={handleProcess}
                            disabled={isProcessing || !categoryId || !walletId}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            {isProcessing ? 'Memproses...' : 'Proses Migrasi'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">Date</th>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Nominal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {parsedData.slice(0, 10).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{row.date}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{row.title}</td>
                                        <td className="px-4 py-3 text-right font-mono">{row.amount.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                                {parsedData.length > 10 && (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-center text-gray-400 italic">
                                            ... dan {parsedData.length - 10} data lainnya
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
