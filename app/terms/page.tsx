'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Scale, Handshake } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
            <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="w-full px-6 lg:px-12 flex items-center h-16">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                </div>
            </nav>

            <main className="w-full px-6 lg:px-12 pt-32 pb-24">
                <h1 className="text-4xl font-bold tracking-tight text-black mb-8">Terms of Service</h1>
                <p className="text-sm text-gray-500 mb-12 uppercase tracking-wider font-semibold">Effective Date: March 1, 2026</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <Scale className="w-6 h-6 mb-4 text-black" />
                        <h3 className="font-bold text-black mb-2">Legal Basis</h3>
                        <p className="text-xs text-gray-500">Governing community reporting standards.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <ShieldAlert className="w-6 h-6 mb-4 text-black" />
                        <h3 className="font-bold text-black mb-2">Reporting Rule</h3>
                        <p className="text-xs text-gray-500">Mandatory accuracy for all submitted media.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <Handshake className="w-6 h-6 mb-4 text-black" />
                        <h3 className="font-bold text-black mb-2">Community</h3>
                        <p className="text-xs text-gray-500">Mutual respect and collective action.</p>
                    </div>
                </div>

                <section className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            By accessing or using the CivicPulse platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">2. User Conduct & Responsibility</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Our platform is built on trust and collective action. Users are strictly prohibited from:
                        </p>
                        <ul className="list-disc pl-6 space-y-3 text-gray-600">
                            <li>Submitting false, misleading, or fraudulent reports.</li>
                            <li>Uploading offensive, obscene, or illegal media in report attachments.</li>
                            <li>Harassing other users or community members through report descriptions.</li>
                            <li>Attempting to manipulate the leaderboard system or upvote counts.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">3. Content Ownership & License</h2>
                        <p className="text-gray-600 leading-relaxed">
                            When you submit a report (including photos and descriptions), you retain ownership of your content. However, by submitting content, you grant CivicPulse a worldwide, non-exclusive, royalty-free license to display, distribute, and share this information with city officials and the general public for the purpose of community improvement.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">4. Limitation of Liability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            CivicPulse is a tool for reporting and transparency. While we strive for accuracy, we do not guarantee that the reported issues will be fixed within a specific timeframe, as the final action relies on local authorities and municipalities. CivicPulse is not liable for any damages resulting from the use or inability to use the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">5. Modifications to Service</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We reserve the right to modify or terminate the service for any reason, without notice, at any time to preserve the quality and integrity of our community reporting.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">6. Contact Information</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Questions regarding these terms should be sent to <span className="font-medium text-black underline">legal@civicpulse.org</span>.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-100 py-12 mt-12 bg-gray-50">
                <div className="w-full px-6 lg:px-12 text-center text-gray-400">
                    <p className="text-sm">© 2026 CivicPulse. Integrity in community reporting.</p>
                </div>
            </footer>
        </div>
    );
}
