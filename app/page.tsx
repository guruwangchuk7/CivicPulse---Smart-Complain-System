'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, ThumbsUp, Trophy, Github, Linkedin, Mail, Menu, X } from 'lucide-react';
import AdminLoginModal from '@/components/AdminLoginModal';
import { useState } from 'react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 relative">


      {/* Interactive Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
              <span className="text-xl font-bold tracking-tight text-gray-900">CivicPulse</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#developer" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Developer</a>

              <div className="h-6 w-px bg-gray-200 mx-2" />

              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Admin
              </button>

              <Link
                href="/map"
                className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors hover:shadow-lg active:scale-95"
              >
                Launch App
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-4 shadow-lg absolute w-full">
            <a href="#features" className="block text-base font-medium text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#developer" className="block text-base font-medium text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Developer</a>
            <button
              onClick={() => { setIsMenuOpen(false); setIsAdminModalOpen(true); }}
              className="block text-base font-medium text-gray-600 hover:text-black w-full text-left"
            >
              Admin Dashboard
            </button>
            <Link href="/map" className="block w-full text-center bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>
              Launch App
            </Link>
          </div>
        )}
      </nav>

      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />

      {/* Hero Section */}
      <header className="relative isolate px-6 pt-32 lg:px-8 pb-16 md:pb-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
        </div>

        <div className="mx-auto max-w-2xl text-center">

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Fix Your City, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">One Tap at a Time.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-xl mx-auto">
            CivicPulse empowers you to report potholes, trash, and hazards in seconds. Join your neighbors in making our community cleaner, safer, and better.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/map"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-500 hover:shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              Start Reporting <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900 group flex items-center gap-1">
              Learn more <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </header>

      {/* Feature Section (Benefits) */}
      <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Why CivicPulse?</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Empower Your Voice, <br />Transform Your Neighborhood
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Traditional reporting is slow and opaque. CivicPulse gives you real-time visibility and the collective power to get things done.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Detailed Reporting
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Don't just say "it's broken". Pin the exact location, upload photos, and categorize the issue so crews know exactly what to bring.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <ThumbsUp className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Crowd Prioritization
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Resources are limited. Upvoting helps the city understand which issues matter most to the community, ensuring critical fixes happen faster.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Trophy className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Transparent Tracking
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                No more black holes. Track the status of your reports from "Open" to "Resolved" and get notified when change happens.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Visual / Image Section */}
      <div className="relative overflow-hidden pt-16 pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl bg-gray-900 p-8 sm:p-20 relative overflow-hidden text-center sm:text-left">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                See what's happening <br /> right now.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Our interactive map shows a live feed of reports in your area. Avoid hazards, identifying trends, and see the positive impact of your reports in real-time.
              </p>
              <div className="mt-10 flex items-center justify-center sm:justify-start gap-x-6">
                <Link
                  href="/map"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  View Live Map
                </Link>
              </div>
            </div>
            {/* Decorative mock map element */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] opacity-20 sm:opacity-40 rounded-full bg-blue-500 blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Testimonials (Social Proof) */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by local residents
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                <p className="leading-relaxed text-gray-600">
                  "I reported a massive pothole on my morning commute. It was upvoted by 50 people by noon and fixed the next day. Incredible!"
                </p>
                <div className="mt-6 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">SAR</div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Jenkins</div>
                    <div className="text-sm text-gray-600">Resident</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                <p className="leading-relaxed text-gray-600">
                  "CivicPulse brings our community together. We're not just complaining; we're actively prioritizing what needs to be fixed first."
                </p>
                <div className="mt-6 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">M</div>
                  <div>
                    <div className="font-semibold text-gray-900">Mike T.</div>
                    <div className="text-sm text-gray-600">Community Organizer</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                <p className="leading-relaxed text-gray-600">
                  "I love the leaderboard! It's a fun way to encourage everyone to keep our streets clean and safe. A true game changer."
                </p>
                <div className="mt-6 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">J</div>
                  <div>
                    <div className="font-semibold text-gray-900">Jessica Wong</div>
                    <div className="text-sm text-gray-600">Student</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div id="developer" className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Meet the Developer</h2>
            <p className="mt-4 text-lg leading-8 text-gray-400">
              Built with passion by Guru Wangchuk.
            </p>
          </div>
          <div className="mx-auto mt-16 flex flex-col items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-[2px]">
              <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center text-3xl font-bold text-white">
                GW
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">Guru Wangchuk</h3>
              <p className="text-sm text-blue-400 mt-1 uppercase tracking-wider font-semibold">Full Stack Engineer</p>
            </div>

            <div className="flex gap-6 mt-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:guru@example.com" className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to make a difference?
              <br />
              Start reporting today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Join thousands of other citizens who are taking pride in their neighborhoods. It takes less than 30 seconds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/map"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:scale-105"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
