'use client';

import { useState } from 'react';
import { X, MapPin, Camera, Check, ChevronLeft, AlertTriangle, Trash2, HelpCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReportCategory } from '@/types';

interface CreateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: { lat: number; lng: number } | null;
    onSuccess: () => void;
    userId: string;
}

const CATEGORIES: { id: ReportCategory; label: string; gradient: string; icon: any; description: string }[] = [
    { id: 'POTHOLE', label: 'Pothole', gradient: 'from-orange-500 to-red-500', icon: AlertTriangle, description: 'Road damage' },
    { id: 'TRASH', label: 'Trash', gradient: 'from-green-400 to-emerald-600', icon: Trash2, description: 'Debris or overflow' },
    { id: 'HAZARD', label: 'Hazard', gradient: 'from-yellow-400 to-orange-500', icon: AlertTriangle, description: 'Dangerous condition' },
    { id: 'OTHER', label: 'Other', gradient: 'from-blue-500 to-indigo-600', icon: HelpCircle, description: 'Something else' },
];

export default function CreateReportModal({ isOpen, onClose, location, onSuccess, userId }: CreateReportModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [category, setCategory] = useState<ReportCategory | null>(null);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => setStep((prev) => (prev + 1) as 1 | 2 | 3);
    const handleBack = () => setStep((prev) => (prev - 1) as 1 | 2 | 3);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async () => {
        console.log('Starting submission...');
        if (!category || !location) {
            toast.error('Missing category or location');
            return;
        }

        setIsSubmitting(true);
        try {
            let photoUrl = null;
            if (file) {
                // Resize image before converting to base64 to save DB space
                // For now, simpler base64 conversion
                try {
                    photoUrl = await convertToBase64(file);
                } catch (e) {
                    console.error("Image conversion failed", e);
                }
            }

            const payload = {
                category,
                description,
                lat: location.lat,
                lng: location.lng,
                photoUrl,
                userId,
            };

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit report');
            }

            toast.success('Report submitted successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Something went wrong. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 transform-gpu border border-white/20 dark:border-gray-800">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {step > 1 && (
                            <button onClick={handleBack} className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors -ml-2 group">
                                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">New Report</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Step {step} of 3</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 w-full">
                    <div
                        className="h-full bg-black transition-all duration-300 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">

                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">What did you see?</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Help us categorize the issue to dispatch the right team.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setCategory(cat.id);
                                            // Slight delay to allow selection animation to play
                                            setTimeout(() => handleNext(), 150);
                                        }}
                                        className={`group relative overflow-hidden p-6 rounded-3xl border transition-all text-left duration-300
                                            ${category === cat.id
                                                ? 'border-transparent ring-2 ring-black dark:ring-white scale-[0.98] shadow-inner bg-gray-50 dark:bg-gray-800'
                                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-900/50'
                                            }
                                        `}
                                    >
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${cat.gradient}`} />

                                        <div className="flex items-start justify-between mb-5 relative z-10">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                                <cat.icon className="w-7 h-7" />
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${category === cat.id ? 'border-black dark:border-white bg-black dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                                {category === cat.id && <Check className="w-3.5 h-3.5 text-white dark:text-black" />}
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cat.label}</h4>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{cat.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in max-w-xl mx-auto">
                            <div className="text-center mb-2">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Add Details</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">A picture is worth a thousand words.</p>
                            </div>

                            <div className="space-y-6">
                                <label className="block group cursor-pointer relative">
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl p-8 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center min-h-[220px]">
                                        {file ? (
                                            <div className="absolute inset-2 bg-gray-100 rounded-[22px] overflow-hidden shadow-sm">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <span className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2">
                                                        <Camera className="w-4 h-4" /> Change Photo
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-2 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                                    <Camera className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">Tap to upload photo</span>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Make sure the issue is clearly visible</p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment" // Suggests taking a photo on mobile
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </div>
                                </label>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">Additional Notes</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the issue... (Optional)"
                                        className="w-full p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none min-h-[140px] resize-none text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.12)] hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in flex flex-col h-full justify-center max-w-sm mx-auto">

                            {/* Beautiful Confirmation Card */}
                            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-1 border border-gray-200 dark:border-gray-700 shadow-inner overflow-hidden">
                                {/* Decorational background pattern */}
                                <div className="absolute inset-0 opacity-10 dark:opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.2)_75%,rgba(0,0,0,0.2)_100%)] bg-[length:20px_20px]"></div>

                                <div className="relative bg-white dark:bg-gray-900 rounded-[22px] p-6 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce-short shadow-inner">
                                        <MapPin className="w-10 h-10" />
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Ready to Submit</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 mb-6">Your report helps build a better community.</p>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Category</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {CATEGORIES.find(c => c.id === category)?.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Location</span>
                                            <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.12)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Dispatching...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Report</span>
                                        <Check className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
