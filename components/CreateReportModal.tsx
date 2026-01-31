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

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {step > 1 && (
                            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Report</h2>
                            <p className="text-xs text-gray-500 font-medium">Step {step} of 3</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100/50 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
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
                <div className="flex-1 overflow-y-auto p-6 md:p-8">

                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">What did you see?</h3>
                                <p className="text-gray-500">Help us categorize the issue correctly.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setCategory(cat.id);
                                            handleNext();
                                        }}
                                        className={`group relative overflow-hidden p-6 rounded-2xl border transition-all text-left hover:shadow-xl hover:-translate-y-1
                                            ${category === cat.id ? 'border-transparent ring-2 ring-black' : 'border-gray-200 hover:border-gray-300'}
                                        `}
                                    >
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${cat.gradient}`} />

                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg`}>
                                                <cat.icon className="w-6 h-6" />
                                            </div>
                                            {category === cat.id && <div className="w-3 h-3 bg-black rounded-full" />}
                                        </div>

                                        <div className="relative z-10">
                                            <h4 className="text-lg font-bold text-gray-900">{cat.label}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-lg mx-auto">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Add Details</h3>
                                <p className="text-gray-500">A picture is worth a thousand words.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="block group cursor-pointer">
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:bg-gray-50 hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-3 text-center">
                                        {file ? (
                                            <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">Change Photo</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-2">
                                                    <Camera className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <span className="text-lg font-semibold text-gray-900">Tap to upload photo</span>
                                                    <p className="text-sm text-gray-500 mt-1">Or drag and drop</p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </div>
                                </label>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the issue... (Optional)"
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none min-h-[120px] resize-none text-base"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 flex flex-col h-full justify-center text-center max-w-sm mx-auto">

                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                                <MapPin className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Confirm Reporting</h3>
                                <p className="text-gray-500 mt-2">You are about to submit a report at this location:</p>
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm text-gray-600 inline-block">
                                    {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Submitting...</span>
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
