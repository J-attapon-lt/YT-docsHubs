import React, { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  Menu, Search, BookOpen, ChevronRight, AlertCircle, CheckCircle2, ArrowLeft,
  Settings, MonitorSmartphone, LayoutGrid, Printer, Plus, Edit, Trash2, Save,
  Warehouse, Shield, Lock, Mail, LogOut, X, Eye, FileText
} from 'lucide-react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { appId, auth, db, firebaseReady } from './lib/firebase.js';
import { seedDocument } from './lib/seed.js';

const COMPANY_LOGO_URL = import.meta.env.VITE_COMPANY_LOGO_URL || '/company-logo.png';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Yang Yuen';
const COMPANY_SUBTITLE = import.meta.env.VITE_COMPANY_SUBTITLE || 'Technology';

const CompanyLogo = ({ className = '', textClassName = 'text-white', showText = true }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden p-1">
      <img
        src={COMPANY_LOGO_URL}
        alt={`${COMPANY_NAME} logo`}
        className="w-full h-full object-contain"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          event.currentTarget.parentElement.innerHTML = '<span class="text-blue-900 font-black text-xl tracking-tighter">YY</span>';
        }}
      />
    </div>
    {showText && (
      <div className={`flex flex-col ${textClassName}`}>
        <span className="font-extrabold text-lg leading-tight tracking-wide uppercase">{COMPANY_NAME}</span>
        <span className="text-[10px] opacity-80 leading-tight tracking-widest uppercase">{COMPANY_SUBTITLE}</span>
      </div>
    )}
  </div>
);

const getIcon = (iconName, className = 'w-8 h-8') => {
  switch (iconName) {
    case 'Warehouse': return <Warehouse className={className} />;
    case 'MonitorSmartphone': return <MonitorSmartphone className={className} />;
    case 'Settings': return <Settings className={className} />;
    case 'FileText': return <FileText className={className} />;
    default: return <BookOpen className={className} />;
  }
};

const HomeView = ({ docs, onSelectDoc, onOpenAdmin }) => {
  const [search, setSearch] = useState('');
  const filteredDocs = docs
    .filter((item) => (item.status || 'published') === 'published')
    .filter((item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <nav className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50">
        <CompanyLogo textClassName="text-white" />
        <button onClick={onOpenAdmin} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all shadow-sm text-sm font-medium">
          <Shield className="w-4 h-4" /> จัดการเนื้อหา
        </button>
      </nav>
      <div className="bg-blue-900 text-white pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="bg-blue-800 p-3 rounded-2xl mb-6 shadow-lg border border-blue-700">
            <LayoutGrid className="w-12 h-12 text-blue-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">DocsHub</h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mb-8">ศูนย์รวมคู่มือการใช้งานและเอกสารอ้างอิงของระบบ ( Central Knowledge Base )</p>
          <div className="w-full max-w-xl relative text-gray-900">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="ค้นหาคู่มือที่ต้องการ..." className="w-full pl-12 pr-4 py-4 rounded-full text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-600" /> คลังเอกสาร ({filteredDocs.length})</h2>
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((item) => (
              <button key={item.id} onClick={() => onSelectDoc(item)} className="group flex flex-col text-left bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-200">
                <div className={`${item.color || 'bg-blue-600'} text-white p-4 rounded-xl inline-block mb-4 shadow-sm w-fit`}>{getIcon(item.iconName)}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{item.description}</p>
                <div className="mt-6 flex items-center justify-between text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><span>เปิดอ่าน</span><ChevronRight className="w-4 h-4" /></div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"><Search className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-gray-600">ไม่พบคู่มือที่คุณค้นหา</h3></div>
        )}
      </div>
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <div className="flex justify-center mb-4"><CompanyLogo textClassName="text-gray-300" /></div>
        <p>© {new Date().getFullYear()} Yang Yuen Technology Service and Supply Co., Ltd.</p>
        <p className="text-sm text-gray-500">© Design by Attapon J. </p>
        <p className="text-sm text-gray-500">Tel 090 239 0786 | Email : attapon.j@ltrthailand.com</p>
      </footer>
    </div>
  );
};

const ReaderView = ({ docData, onBack }) => {
  const [activeSection, setActiveSection] = useState(docData.sections?.[0]?.id || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');

  const filteredSections = useMemo(() => (docData.sections || []).filter((item) =>
    item.title?.toLowerCase().includes(sectionSearch.toLowerCase()) ||
    item.content?.toLowerCase().includes(sectionSearch.toLowerCase())
  ), [docData.sections, sectionSearch]);
  const currentContent = (docData.sections || []).find((item) => item.id === activeSection) || docData.sections?.[0];

  const handleSelectSection = (id) => { setActiveSection(id); setIsSidebarOpen(false); window.scrollTo(0, 0); };
  const printAllSections = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('กรุณาอนุญาต Pop-up เพื่อพิมพ์เอกสาร');
    const allContent = (docData.sections || []).map((section) => `<section style="page-break-after: always;"><h1>${section.title}</h1>${DOMPurify.sanitize(section.content || '')}</section>`).join('');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${docData.title}</title><meta charset="UTF-8"/><style>body{font-family:Arial,Tahoma,sans-serif;padding:40px;color:#111827;line-height:1.7}h1{color:#1e3a8a;border-bottom:2px solid #dbeafe;padding-bottom:10px}table{width:100%;border-collapse:collapse}table,th,td{border:1px solid #d1d5db}th,td{padding:8px}@media print{body{padding:0}}</style></head><body><h1>${docData.title}</h1><p>${docData.description || ''}</p><hr/>${allContent}<script>window.onload=function(){window.print();};</script></body></html>`);
    printWindow.document.close();
  };

  if (!docData.sections?.length) return <div className="h-screen flex flex-col items-center justify-center bg-gray-50"><h2 className="text-2xl font-bold text-gray-800 mb-4">ยังไม่มีเนื้อหาในคู่มือนี้</h2><button onClick={onBack} className="bg-blue-600 text-white px-6 py-2 rounded-lg">กลับหน้าหลัก</button></div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden no-print" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 bg-white border-r shadow-lg transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col no-print ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 bg-white"><CompanyLogo textClassName="text-blue-900" /></div>
        <div className="p-3 border-b bg-gray-50"><button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors w-full px-3 py-2 rounded-lg hover:bg-white shadow-sm border border-gray-200"><ArrowLeft className="w-4 h-4" /> กลับคลังเอกสาร</button></div>
        <div className={`p-5 border-b flex justify-between items-center ${docData.color || 'bg-blue-600'} text-white`}><div><h1 className="text-lg font-bold tracking-tight line-clamp-2 leading-tight">{docData.title}</h1><p className="text-[10px] opacity-80 mt-1 uppercase tracking-wider font-semibold">Table of Contents</p></div><button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6 text-white" /></button></div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input value={sectionSearch} onChange={(e) => setSectionSearch(e.target.value)} placeholder="ค้นหาในคู่มือ..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div></div>
          <ul className="space-y-1 px-3">{filteredSections.map((item) => <li key={item.id}><button onClick={() => handleSelectSection(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeSection === item.id ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'}`}><span className={activeSection === item.id ? 'text-blue-600' : 'text-gray-400'}><BookOpen className="w-4 h-4" /></span><span className="text-sm leading-5">{item.title}</span></button></li>)}</ul>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-white print-area">
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm z-10 no-print"><div className="flex items-center gap-3"><button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button><h1 className="font-bold text-gray-800 line-clamp-1 text-sm">{docData.title}</h1></div></div>
        <div className="hidden lg:flex justify-end gap-2 p-4 border-b bg-gray-50 no-print"><button onClick={() => window.print()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white border px-4 py-2 rounded-lg shadow-sm"><Printer className="w-4 h-4" /> พิมพ์หน้านี้</button><button onClick={printAllSections} className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg shadow-sm"><Printer className="w-4 h-4" /> พิมพ์ทั้งเล่ม</button></div>
        <div className="flex-1 overflow-y-auto p-6 md:p-12 print-area"><div className="max-w-4xl mx-auto"><div className="mb-8"><h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 pb-4 border-b-2 border-blue-100 mt-4 leading-tight">{currentContent?.title}</h1></div><div className="prose prose-blue max-w-none text-base lg:text-lg text-gray-800 print-content space-y-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentContent?.content || '') }} />
          <div className="mt-20 pt-8 border-t flex justify-between items-center no-print bg-white">{(() => { const index = docData.sections.findIndex((item) => item.id === activeSection); const prev = index > 0 ? docData.sections[index - 1] : null; const next = index < docData.sections.length - 1 ? docData.sections[index + 1] : null; return <><div className="flex-1">{prev && <button onClick={() => handleSelectSection(prev.id)} className="text-left text-gray-500 hover:text-blue-700 p-4"><span className="text-xs font-bold uppercase mb-1 block">« บทก่อนหน้า</span><span className="font-medium text-lg">{prev.title}</span></button>}</div><div className="flex-1 text-right">{next ? <button onClick={() => handleSelectSection(next.id)} className="text-right text-gray-500 hover:text-blue-700 p-4 ml-auto"><span className="text-xs font-bold uppercase mb-1 block">บทถัดไป »</span><span className="font-medium text-lg">{next.title}</span></button> : <button onClick={onBack} className="text-right text-gray-500 hover:text-green-700 p-4 ml-auto flex flex-col items-end"><span className="text-xs font-bold uppercase mb-1">จบเนื้อหา</span><span className="font-medium text-lg flex items-center gap-2 text-green-700">กลับสู่หน้าหลัก <CheckCircle2 className="w-5 h-5" /></span></button>}</div></>; })()}</div>
        </div></div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) return setError('ยังไม่ได้ตั้งค่า Firebase ในไฟล์ .env');
    setLoading(true); setError('');
    try { await signInWithEmailAndPassword(auth, email, password); onSuccess(); }
    catch { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); }
    finally { setLoading(false); }
  };
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative"><div className="absolute top-0 left-0 w-full h-1/3 bg-blue-900 z-0" /><div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10"><div className="bg-blue-900 text-white p-8 text-center border-b border-blue-800"><div className="flex justify-center mb-6"><CompanyLogo textClassName="text-white" /></div><h2 className="text-xl font-bold">เข้าสู่ระบบหลังบ้าน</h2><p className="text-blue-200 text-sm mt-1">Admin Dashboard Login</p></div><form onSubmit={handleLogin} className="p-8 space-y-6">{error && <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}<div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">อีเมลแอดมิน</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="admin@ltrthailand.com" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="••••••••" /></div></div></div><div className="pt-2 flex flex-col gap-3"><button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70">{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</button><button type="button" onClick={onBack} className="w-full bg-white text-gray-600 font-medium py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">ยกเลิกและกลับหน้าหลัก</button></div></form></div></div>;
};

const AdminDashboard = ({ docs, user, userRole, userProfile, onBack, onLogout, onEditDoc, onCreateDoc, onDeleteDoc }) => (
  <div className="min-h-screen bg-gray-50 font-sans"><div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow"><CompanyLogo textClassName="text-white" /><div className="flex items-center gap-3"><div className="hidden md:flex flex-col text-right text-xs text-blue-100"><span>{userProfile?.displayName || user?.email}</span><span className="uppercase font-bold">{userRole}</span></div><button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm">กลับหน้าหลัก</button><button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><LogOut className="w-4 h-4" />ออกจากระบบ</button></div></div><div className="max-w-6xl mx-auto px-6 py-10"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"><div><h1 className="text-3xl font-extrabold text-gray-900">จัดการคู่มือ</h1><p className="text-gray-500 mt-1">เพิ่ม แก้ไข หรือลบคู่มือในระบบ YYT DocsHub</p></div>{['admin', 'editor'].includes(userRole) && <button onClick={onCreateDoc} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow"><Plus className="w-5 h-5" />เพิ่มคู่มือใหม่</button>}</div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between"><h2 className="font-bold text-gray-800">รายการคู่มือทั้งหมด ({docs.length})</h2></div>{docs.length === 0 ? <div className="p-12 text-center text-gray-500"><BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" /><p className="font-medium">ยังไม่มีคู่มือในระบบ</p></div> : <div className="divide-y">{docs.map((item) => <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50"><div className="flex items-start gap-4"><div className={`${item.color || 'bg-blue-600'} text-white p-3 rounded-xl`}>{getIcon(item.iconName, 'w-6 h-6')}</div><div><h3 className="text-lg font-bold text-gray-900">{item.title}</h3><span className={`inline-flex mt-2 px-2 py-1 text-xs rounded-full font-bold ${(item.status || 'published') === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{(item.status || 'published') === 'published' ? 'Published' : 'Draft'}</span><p className="text-sm text-gray-500 mt-2">{item.description}</p><p className="text-xs text-gray-400 mt-2">จำนวนบท: {item.sections?.length || 0}</p></div></div><div className="flex items-center gap-2"><button onClick={() => onEditDoc(item)} className="px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg flex items-center gap-2 text-sm font-bold"><Edit className="w-4 h-4" />แก้ไข</button>{userRole === 'admin' && <button onClick={() => onDeleteDoc(item.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 text-sm font-bold"><Trash2 className="w-4 h-4" />ลบ</button>}</div></div>)}</div>}</div></div></div>
);

const emptyDoc = { id: '', title: '', description: '', iconName: 'BookOpen', color: 'bg-blue-700', status: 'draft', sections: [] };
const AdminEditor = ({ initialDoc, onCancel, onSave }) => {
  const [form, setForm] = useState(initialDoc ? structuredClone(initialDoc) : emptyDoc);
  const [saving, setSaving] = useState(false);
  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const addSection = () => setForm((prev) => ({ ...prev, sections: [...(prev.sections || []), { id: `section-${Date.now()}`, title: `บทใหม่ ${(prev.sections || []).length + 1}`, content: '<p>ใส่เนื้อหาที่นี่...</p>' }] }));
  const updateSection = (index, field, value) => setForm((prev) => { const sections = [...(prev.sections || [])]; sections[index] = { ...sections[index], [field]: value }; return { ...prev, sections }; });
  const deleteSection = (index) => { if (!window.confirm('ต้องการลบบทนี้ใช่หรือไม่?')) return; setForm((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) })); };
  const moveSection = (index, direction) => { const newIndex = index + direction; if (newIndex < 0 || newIndex >= form.sections.length) return; setForm((prev) => { const sections = [...prev.sections]; [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]]; return { ...prev, sections }; }); };
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.id.trim()) return alert('กรุณาระบุ Document ID'); if (!form.title.trim()) return alert('กรุณาระบุชื่อคู่มือ'); setSaving(true); try { await onSave({ ...form, id: form.id.trim(), updatedAt: new Date().toISOString() }); } finally { setSaving(false); } };
  return <div className="min-h-screen bg-gray-50 font-sans"><div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow"><CompanyLogo textClassName="text-white" /><button onClick={onCancel} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><ArrowLeft className="w-4 h-4" />กลับ Dashboard</button></div><form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-6 py-10 space-y-8"><div><h1 className="text-3xl font-extrabold text-gray-900">{initialDoc ? 'แก้ไขคู่มือ' : 'เพิ่มคู่มือใหม่'}</h1><p className="text-gray-500 mt-1">กรอกข้อมูลคู่มือและจัดการบทภายในเอกสาร</p></div><div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6"><h2 className="text-xl font-bold text-gray-900 border-b pb-3">ข้อมูลคู่มือ</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Input label="Document ID" value={form.id} onChange={(v) => updateField('id', v)} disabled={!!initialDoc} placeholder="akrivis-warehouse" hint="ใช้ตัวอักษรอังกฤษ ตัวเลข และขีดกลาง" /><Select label="สีการ์ด" value={form.color} onChange={(v) => updateField('color', v)} options={[['bg-blue-700','น้ำเงิน'],['bg-green-700','เขียว'],['bg-purple-700','ม่วง'],['bg-orange-600','ส้ม'],['bg-red-700','แดง'],['bg-gray-800','เทาเข้ม']]} /><div className="md:col-span-2"><Input label="ชื่อคู่มือ" value={form.title} onChange={(v) => updateField('title', v)} placeholder="ศูนย์รวมคู่มือการใช้งานและเอกสารอ้างอิงของระบบ (Central Knowledge Base)" /></div><div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">คำอธิบาย</label><textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div><Select label="ไอคอน" value={form.iconName} onChange={(v) => updateField('iconName', v)} options={[['BookOpen','BookOpen'],['Warehouse','Warehouse'],['MonitorSmartphone','MonitorSmartphone'],['Settings','Settings'],['FileText','FileText']]} /><Select label="สถานะเอกสาร" value={form.status || 'draft'} onChange={(v) => updateField('status', v)} options={[['draft','Draft - ฉบับร่าง'],['published','Published - เผยแพร่']]} /></div></div><div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4"><div><h2 className="text-xl font-bold text-gray-900">เนื้อหาบททั้งหมด</h2><p className="text-sm text-gray-500 mt-1">สามารถใส่ HTML ได้ เช่น &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;table&gt;</p></div><button type="button" onClick={addSection} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Plus className="w-4 h-4" />เพิ่มบท</button></div>{form.sections.length === 0 ? <div className="border border-dashed rounded-2xl p-10 text-center text-gray-500"><BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p>ยังไม่มีบทในคู่มือนี้</p></div> : <div className="space-y-6">{form.sections.map((section, index) => <div key={`${section.id}-${index}`} className="border rounded-2xl overflow-hidden"><div className="bg-gray-50 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b"><div className="font-bold text-gray-800">บทที่ {index + 1}</div><div className="flex items-center gap-2"><button type="button" onClick={() => moveSection(index, -1)} className="px-3 py-1 bg-white border rounded-lg text-sm hover:bg-gray-100">ขึ้น</button><button type="button" onClick={() => moveSection(index, 1)} className="px-3 py-1 bg-white border rounded-lg text-sm hover:bg-gray-100">ลง</button><button type="button" onClick={() => deleteSection(index)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">ลบ</button></div></div><div className="p-5 space-y-4"><Input label="Section ID" value={section.id} onChange={(v) => updateSection(index, 'id', v)} /><Input label="ชื่อบท" value={section.title} onChange={(v) => updateSection(index, 'title', v)} /><div><label className="block text-sm font-bold text-gray-700 mb-2">เนื้อหา HTML</label><textarea value={section.content} onChange={(e) => updateSection(index, 'content', e.target.value)} rows={10} className="w-full px-4 py-3 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div><div className="bg-gray-50 border rounded-xl p-5"><p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</p><div className="prose prose-blue max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content || '') }} /></div></div></div>)}</div>}</div><div className="sticky bottom-0 bg-white border shadow-lg rounded-2xl p-4 flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-6 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50">ยกเลิก</button><button type="submit" disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-60"><Save className="w-5 h-5" />{saving ? 'กำลังบันทึก...' : 'บันทึกคู่มือ'}</button></div></form></div>;
};

const Input = ({ label, value, onChange, placeholder = '', disabled = false, hint = '' }) => <div><label className="block text-sm font-bold text-gray-700 mb-2">{label}</label><input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100" />{hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}</div>;
const Select = ({ label, value, onChange, options }) => <div><label className="block text-sm font-bold text-gray-700 mb-2">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">{options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>;

export default function App() {
  const [view, setView] = useState('home');
  const [docs, setDocs] = useState([seedDocument]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const docsCollectionPath = db ? collection(db, 'artifacts', appId, 'public', 'data', 'documents') : null;

  const loadUserProfile = async (currentUser) => {
    if (!db || !currentUser) { setUserRole(null); setUserProfile(null); return; }
    const profileRef = doc(db, 'users', currentUser.uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const profile = profileSnap.data();
      if (profile.active === false) { alert('บัญชีนี้ถูกปิดใช้งาน'); await signOut(auth); setUser(null); setUserRole(null); setUserProfile(null); return; }
      setUserProfile(profile); setUserRole(profile.role || 'viewer');
    } else {
      const profile = { email: currentUser.email, role: 'viewer', displayName: currentUser.email, active: true, createdAt: new Date().toISOString() };
      await setDoc(profileRef, profile); setUserProfile(profile); setUserRole('viewer');
    }
  };

  useEffect(() => {
    if (!auth) { setLoading(false); return undefined; }
    return onAuthStateChanged(auth, async (currentUser) => { setUser(currentUser || null); if (currentUser) await loadUserProfile(currentUser); else { setUserRole(null); setUserProfile(null); } });
  }, []);

  useEffect(() => {
    if (!db || !docsCollectionPath) { setDocs([seedDocument]); setLoading(false); return undefined; }
    return onSnapshot(docsCollectionPath, async (snapshot) => {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      if (items.length === 0) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'documents', seedDocument.id), { ...seedDocument, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        setDocs([seedDocument]);
      } else setDocs(items);
      setLoading(false);
    }, (error) => { console.error(error); setDocs([seedDocument]); setLoading(false); });
  }, []);

  const writeAuditLog = async ({ action, documentId, before = null, after = null }) => {
    if (!db) return;
    try { await addDoc(collection(db, 'auditLogs'), { action, documentId, before, after, userEmail: user?.email || 'unknown', userUid: user?.uid || null, createdAt: new Date().toISOString() }); }
    catch (error) { console.error('Audit log error:', error); }
  };

  const handleSaveDoc = async (docData) => {
    if (!db) return alert('ยังไม่ได้เชื่อมต่อ Firebase');
    if (!['admin', 'editor'].includes(userRole)) return alert('คุณไม่มีสิทธิ์เพิ่มหรือแก้ไขคู่มือ');
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'documents', docData.id);
    const beforeSnap = await getDoc(ref);
    const beforeData = beforeSnap.exists() ? beforeSnap.data() : null;
    const payload = { ...docData, updatedAt: new Date().toISOString(), updatedBy: user?.email || null };
    if (!beforeData) { payload.createdAt = new Date().toISOString(); payload.createdBy = user?.email || null; }
    await setDoc(ref, payload, { merge: true });
    await writeAuditLog({ action: beforeData ? 'UPDATE_DOCUMENT' : 'CREATE_DOCUMENT', documentId: docData.id, before: beforeData, after: payload });
    setEditingDoc(null); setView('admin');
  };

  const handleDeleteDoc = async (docId) => {
    if (userRole !== 'admin') return alert('เฉพาะ Admin เท่านั้นที่สามารถลบคู่มือได้');
    if (!window.confirm('ต้องการลบคู่มือนี้ใช่หรือไม่?')) return;
    if (!db) return alert('ยังไม่ได้เชื่อมต่อ Firebase');
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'documents', docId);
    const beforeSnap = await getDoc(ref);
    await deleteDoc(ref);
    await writeAuditLog({ action: 'DELETE_DOCUMENT', documentId: docId, before: beforeSnap.exists() ? beforeSnap.data() : null, after: null });
  };

  const handleLogout = async () => { if (auth) await signOut(auth); setUser(null); setView('home'); };
  const openAdmin = () => user ? setView('admin') : setView('admin-login');

  if (loading) return <div className="min-h-screen bg-blue-900 text-white flex flex-col items-center justify-center"><CompanyLogo textClassName="text-white" /><p className="mt-6 text-blue-200">กำลังโหลดระบบเอกสาร...</p></div>;
  if (!firebaseReady) console.warn('Firebase is not configured. Copy .env.example to .env and fill values.');
  if (view === 'reader' && selectedDoc) return <ReaderView docData={selectedDoc} onBack={() => { setSelectedDoc(null); setView('home'); }} />;
  if (view === 'admin-login') return <AdminLogin onBack={() => setView('home')} onSuccess={() => setView('admin')} />;
  if (view === 'admin') return <AdminDashboard docs={docs} user={user} userRole={userRole} userProfile={userProfile} onBack={() => setView('home')} onLogout={handleLogout} onCreateDoc={() => { setEditingDoc(null); setView('editor'); }} onEditDoc={(item) => { setEditingDoc(item); setView('editor'); }} onDeleteDoc={handleDeleteDoc} />;
  if (view === 'editor') return <AdminEditor initialDoc={editingDoc} onCancel={() => setView('admin')} onSave={handleSaveDoc} />;
  return <HomeView docs={docs} onSelectDoc={(item) => { setSelectedDoc(item); setView('reader'); }} onOpenAdmin={openAdmin} />;
}
