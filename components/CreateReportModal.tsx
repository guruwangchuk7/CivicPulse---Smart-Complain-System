'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, MapPin, Camera, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReportCategory } from '@/types';

interface CreateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: { lat: number; lng: number } | null;
    onSuccess: () => void;
}

const CATEGORIES: { id: ReportCategory; label: string; color: string }[] = [
    { id: 'POTHOLE', label: 'Pothole', color: 'bg-red-500' },
    { id: 'TRASH', label: 'Trash', color: 'bg-yellow-500' },
    { id: 'HAZARD', label: 'Hazard', color: 'bg-orange-500' },
    { id: 'OTHER', label: 'Other', color: 'bg-blue-500' },
];

export default function CreateReportModal({ isOpen, onClose, location, onSuccess }: CreateReportModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [category, setCategory] = useState<ReportCategory | null>(null);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => setStep((prev) => (prev + 1) as 1 | 2 | 3);
    const handleBack = () => setStep((prev) => (prev - 1) as 1 | 2 | 3);

    const uploadPhoto = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async () => {
        if (!category || !location) return;

        setIsSubmitting(true);
        try {
            let photoUrl = null;
            if (file) {
                photoUrl = await uploadPhoto(file);
            }

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    description,
                    lat: location.lat,
                    lng: location.lng,
                    photoUrl,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit');
            }

            toast.success('Report submitted successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error submitting report:', error);
            toast.error(error.message || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />
            <div className="bg-white pointer-events-auto w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold">New Report</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">What is the issue?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setCategory(cat.id);
                                            handleNext();
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                      ${category === cat.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full ${cat.color}`} />
                                        <span className="font-medium">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Details</h3>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue..."
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none min-h-[100px]"
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Camera className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {file ? file.name : 'Add a photo (Optional)'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 text-center">
                            <h3 className="text-lg font-semibold">Confirm Location</h3>
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <MapPin className="w-5 h-5" />
                                <span>{location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</span>
                            </div>
                            <p className="text-sm text-gray-500">Is this location correct?</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-between">
                    {step > 1 ? (
                        <button onClick={handleBack} className="px-4 py-2 text-gray-600 font-medium hover:text-black">
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 2 && (
                        <button
                            onClick={handleNext}
                            disabled={!description}
                            className="bg-black text-white px-6 py-2 rounded-full font-medium disabled:opacity-50"
                        >
                            Next
                        </button>
                    )}

                    {step === 3 && (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-black text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            {!isSubmitting && <Check className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
