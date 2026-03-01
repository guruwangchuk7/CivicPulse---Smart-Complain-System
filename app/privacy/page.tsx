'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
                <h1 className="text-4xl font-bold tracking-tight text-black mb-8">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-12 uppercase tracking-wider font-semibold">Last Updated: March 1, 2026</p>

                <section className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">1. Introduction</h2>
                        <p className="text-gray-600 leading-relaxed">
                            At CivicPulse, your privacy is a top priority. This Privacy Policy explains how we collect, use, and protect your information when you use our platform to report civic issues and improve your neighborhood.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">2. Information We Collect</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            To make CivicPulse effective, we collect the following types of information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li><strong>Report Data:</strong> Description of the issue, category, and timestamps.</li>
                            <li><strong>Location Data:</strong> Precise GPS coordinates of the issue being reported to help city crews locate the hazard.</li>
                            <li><strong>Media:</strong> Photos uploaded to provide visual context for reports.</li>
                            <li><strong>Usage Data:</strong> Information on how you interact with the map and leaderboard.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">3. How We Use Information</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The information collected is used strictly for community improvement:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>To present a live feed of civic issues on the public map.</li>
                            <li>To help local authorities and maintenance crews fix potholes, hazards, and trash issues.</li>
                            <li>To allow neighbors to upvote and prioritize critical problems.</li>
                            <li>To maintain a fair and transparent leaderboard system.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">4. Transparency & Sharing</h2>
                        <p className="text-gray-600 leading-relaxed">
                            CivicPulse is a transparency-first platform. Please note that data within a report (photos, location, description) is **publicly visible** on our map. This ensures accountability and helps other residents avoid hazards. We do not sell your personal usage data to third-party advertisers.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">5. Security</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We implement industry-standard security measures to protect the integrity of the data reported. However, as reports are designed for public transparency, we advise against including personally identifiable information in report descriptions or photos.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-black mb-4">6. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you have any questions about this Privacy Policy, please reach out to us at <span className="font-medium text-black underline">support@civicpulse.org</span>.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-100 py-12 mt-12 bg-gray-50">
                <div className="w-full px-6 lg:px-12 text-center">
                    <p className="text-sm text-gray-400">© 2026 CivicPulse. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
