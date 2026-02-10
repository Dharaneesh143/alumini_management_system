import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext.jsx';
import {
    Briefcase, Building, MapPin,
    Upload, X, Check, DollarSign,
    Calendar, Users, Info, Plus,
    FileText, GraduationCap, ArrowLeft
} from 'lucide-react';

const InputGroup = ({ label, children, icon: Icon }) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
            {label}
        </label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />}
            {children}
        </div>
    </div>
);

const CreateJob = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [opportunityType, setOpportunityType] = useState('Job');
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        location: '',
        requiredSkills: [],
        departmentsEligible: [],
        minQualification: '',
        minCgpa: '',
        deadline: '',
        contactEmail: '',
        openingsCount: 1,
        referralAvailable: false,
        // Job Specific
        salaryRange: '',
        employmentType: 'Full Time',
        experienceRequired: '',
        // Internship Specific
        stipend: '',
        duration: '',
        startDate: '',
        endDate: '',
        ppoAvailable: false
    });

    const [files, setFiles] = useState({
        companyLogo: null,
        jdPdf: null
    });

    const [currentSkill, setCurrentSkill] = useState('');
    const [currentDept, setCurrentDept] = useState('');

    useEffect(() => {
        if (isEdit) fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.GET_JOB(id));
            const data = res.data;
            setOpportunityType(data.opportunityType);
            setFormData({
                ...data,
                deadline: data.deadline ? data.deadline.split('T')[0] : '',
                startDate: data.startDate ? data.startDate.split('T')[0] : '',
                endDate: data.endDate ? data.endDate.split('T')[0] : ''
            });
            setLoading(false);
        } catch (err) {
            alert('Failed to fetch details');
            navigate('/jobs');
        }
    };

    const handleFileChange = (e, type) => {
        setFiles({ ...files, [type]: e.target.files[0] });
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && currentSkill.trim()) {
            e.preventDefault();
            if (!formData.requiredSkills.includes(currentSkill.trim())) {
                setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, currentSkill.trim()] });
            }
            setCurrentSkill('');
        }
    };

    const addDept = (e) => {
        if (e.key === 'Enter' && currentDept.trim()) {
            e.preventDefault();
            if (!formData.departmentsEligible.includes(currentDept.trim())) {
                setFormData({ ...formData, departmentsEligible: [...formData.departmentsEligible, currentDept.trim()] });
            }
            setCurrentDept('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key])) {
                data.append(key, formData[key].join(','));
            } else {
                data.append(key, formData[key]);
            }
        });

        data.append('opportunityType', opportunityType);
        if (files.companyLogo) data.append('companyLogo', files.companyLogo);
        if (files.jdPdf) data.append('jdPdf', files.jdPdf);

        try {
            if (isEdit) {
                await api.put(API_ENDPOINTS.GET_JOB(id), data);
                alert('Updated successfully!');
            } else {
                await api.post(API_ENDPOINTS.CREATE_JOB, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Opportunity posted for review!');
            }
            navigate('/jobs');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error saving opportunity');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-6 text-center font-bold">Loading...</div>;


    return (
        <div>
            {/* Form Header */}
            <div className="bg-white border-b border-gray-200 -mx-8 -mt-8 px-8 py-8 mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-2">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            {isEdit ? 'Refine Opportunity' : 'Post Career Opportunity'}
                        </h1>
                    </div>

                    {!isEdit && (
                        <div className="flex bg-gray-100 p-4 rounded-2xl gap-5">
                            {['Job', 'Internship'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setOpportunityType(t)}
                                    className={` p2 rounded-xl font-bold transition-all ${opportunityType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Basic & Specific Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Essential Info Section */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Info size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Essential Details</h3>
                        </div>

                        <InputGroup label="Official Title" icon={Briefcase}>
                            <input
                                type="text" required placeholder="e.g. Senior Frontend Engineer"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </InputGroup>

                        <InputGroup label="Company Name" icon={Building}>
                            <input
                                type="text" required placeholder="e.g. Google India"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                            />
                        </InputGroup>

                        <div className="grid md:grid-cols-2 gap-6">
                            <InputGroup label="Location / Policy" icon={MapPin}>
                                <input
                                    type="text" required placeholder="e.g. Bangalore (Remote Friendly)"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                    value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </InputGroup>
                            <InputGroup label="Openings Count" icon={Users}>
                                <input
                                    type="number" required min="1"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                    value={formData.openingsCount} onChange={e => setFormData({ ...formData, openingsCount: e.target.value })}
                                />
                            </InputGroup>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Full Description</label>
                            <textarea
                                required rows="6" placeholder="Describe the role, responsibilities, and team..."
                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-medium text-gray-800"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Type Specific Section */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                <Plus size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{opportunityType} Specifics</h3>
                        </div>

                        {opportunityType === 'Job' ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                <InputGroup label="Salary Range" icon={DollarSign}>
                                    <input
                                        type="text" placeholder="e.g. 15LPA - 20LPA"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                        value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Employment Type">
                                    <select
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800 appearance-none"
                                        value={formData.employmentType} onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
                                    >
                                        <option>Full Time</option>
                                        <option>Part Time</option>
                                        <option>Contract</option>
                                    </select>
                                </InputGroup>
                                <InputGroup label="Experience Required">
                                    <input
                                        type="text" placeholder="e.g. 2-4 years"
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                        value={formData.experienceRequired} onChange={e => setFormData({ ...formData, experienceRequired: e.target.value })}
                                    />
                                </InputGroup>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                <InputGroup label="Monthly Stipend" icon={DollarSign}>
                                    <input
                                        type="text" placeholder="e.g. ₹20,000"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                        value={formData.stipend} onChange={e => setFormData({ ...formData, stipend: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Internship Duration">
                                    <input
                                        type="text" placeholder="e.g. 6 Months"
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                        value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </InputGroup>
                                <InputGroup label="Tentative Start" icon={Calendar}>
                                    <input
                                        type="date"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                        value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </InputGroup>
                                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <input
                                        type="checkbox" id="ppo"
                                        className="w-5 h-5 accent-purple-600 rounded"
                                        checked={formData.ppoAvailable} onChange={e => setFormData({ ...formData, ppoAvailable: e.target.checked })}
                                    />
                                    <label htmlFor="ppo" className="font-bold text-purple-900 text-sm">PPO (Performance-based Job Offer) Available</label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Meta & Assets Sidebar */}
                <div className="space-y-8">
                    {/* File Uploads */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Assets & Files</h3>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Company Logo</label>
                            <div className="relative group">
                                <input type="file" onChange={e => handleFileChange(e, 'companyLogo')} className="hidden" id="logoInp" accept="image/*" />
                                <label htmlFor="logoInp" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer">
                                    <Upload className="text-gray-300 mb-2" size={20} />
                                    <span className="text-xs font-bold text-gray-500">{files.companyLogo ? files.companyLogo.name : 'Upload JPG/PNG'}</span>
                                </label>
                            </div>

                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Detailed JD (PDF)</label>
                            <div className="relative group">
                                <input type="file" onChange={e => handleFileChange(e, 'jdPdf')} className="hidden" id="jdInp" accept=".pdf" />
                                <label htmlFor="jdInp" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-orange-50 hover:border-orange-400 transition-all cursor-pointer">
                                    <FileText className="text-gray-300 mb-2" size={20} />
                                    <span className="text-xs font-bold text-gray-500">{files.jdPdf ? files.jdPdf.name : 'Upload PDF Document'}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Tags & Skills */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Tagging</h3>

                        <div className="space-y-4">
                            <InputGroup label="Required Skills" icon={Plus}>
                                <input
                                    type="text" placeholder="Type and hit Enter"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800"
                                    value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} onKeyDown={addSkill}
                                />
                            </InputGroup>
                            <div className="flex flex-wrap gap-2">
                                {formData.requiredSkills.map(s => (
                                    <span key={s} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-100">
                                        {s} <X size={12} className="cursor-pointer" onClick={() => setFormData({ ...formData, requiredSkills: formData.requiredSkills.filter(x => x !== s) })} />
                                    </span>
                                ))}
                            </div>

                            <InputGroup label="Eligible Departments" icon={GraduationCap}>
                                <select
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-gray-800 appearance-none"
                                    value={currentDept}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val && !formData.departmentsEligible.includes(val)) {
                                            setFormData({ ...formData, departmentsEligible: [...formData.departmentsEligible, val] });
                                        }
                                        setCurrentDept('');
                                    }}
                                >
                                    <option value="">Select Department to add</option>
                                    <option value="BE CSE (Computer Science & Engineering)">BE CSE (Computer Science & Engineering)</option>
                                    <option value="BE ECE (Electronics & Communication Engineering)">BE ECE (Electronics & Communication Engineering)</option>
                                    <option value="BE EEE (Electrical & Electronics Engineering)">BE EEE (Electrical & Electronics Engineering)</option>
                                    <option value="BE MECH (Mechanical Engineering)">BE MECH (Mechanical Engineering)</option>
                                    <option value="BE CIVIL (Civil Engineering)">BE CIVIL (Civil Engineering)</option>
                                    <option value="BE BME (Biomedical Engineering)">BE BME (Biomedical Engineering)</option>
                                    <option value="BE AGRI (Agricultural Engineering)">BE AGRI (Agricultural Engineering)</option>
                                    <option value="BE AERO (Aeronautical Engineering)">BE AERO (Aeronautical Engineering)</option>
                                    <option value="BE AUTO (Automobile Engineering)">BE AUTO (Automobile Engineering)</option>
                                    <option value="BTech IT (Information Technology)">BTech IT (Information Technology)</option>
                                    <option value="BTech AI&DS (Artificial Intelligence & Data Science)">BTech AI&DS (Artificial Intelligence & Data Science)</option>
                                    <option value="BTech CSBS (Computer Science & Business Systems)">BTech CSBS (Computer Science & Business Systems)</option>
                                    <option value="BTech CHEM (Chemical Engineering)">BTech CHEM (Chemical Engineering)</option>
                                </select>
                            </InputGroup>
                            <div className="flex flex-wrap gap-2">
                                {formData.departmentsEligible.map(d => (
                                    <span key={d} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-orange-100">
                                        {d} <X size={12} className="cursor-pointer" onClick={() => setFormData({ ...formData, departmentsEligible: formData.departmentsEligible.filter(x => x !== d) })} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submission */}
                    <div className="space-y-4 pt-10">
                        <button
                            type="submit" disabled={submitting}
                            className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl shadow-xl hover:bg-black transition-all disabled:bg-gray-400 active:scale-95 text-lg"
                        >
                            {submitting ? 'Sharing...' : isEdit ? 'Save Changes' : 'Post for Review'}
                        </button>
                        <p className="text-center text-xs text-gray-400 font-bold px-4 leading-relaxed">
                            By posting, you agree to share this with the college alumni community. Postings are audited for quality.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateJob;
