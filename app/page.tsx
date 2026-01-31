import Link from 'next/link';
import { ArrowRight, MapPin, ThumbsUp, Trophy } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          {/* Background Mesh Gradient */}
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Fix Your City, <br />
              <span className="text-blue-600">One Tap at a Time.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              CivicPulse empowers you to report potholes, trash, and hazards in seconds. Join your neighbors in making our community cleaner, safer, and better.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/map"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2 transition-all hover:scale-105"
              >
                Start Reporting <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Section */}
      <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Community-Driven Civic Action
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We've made it incredibly easy to get involved. No more complex forms or waiting on hold.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Pin & Report
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Spot specific issues like potholes or broken lights. Snap a photo, drop a pin, and you're done.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <ThumbsUp className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Upvote & Prioritize
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                See what neighbors are reporting. Upvote urgent issues to push them to the top of the list.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Trophy className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Earn Recognition
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Become a Civic Hero. Earn points for every report and climb the community leaderboard.
              </dd>
            </div>

          </dl>
        </div>
      </div>
    </div>
  );
}
