import Link from 'next/link';
import { auth } from '../auth';

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white">
          CL<span className="text-indigo-500">X</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-md">
          A professional Discord bot with advanced moderation and automod capabilities.
        </p>
      </div>

      <div className="flex gap-4">
        {session ? (
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/api/auth/signin"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
          >
            Login with Discord
          </Link>
        )}

        {process.env.NEXT_PUBLIC_BOT_INVITE_URL && (
          <a
            href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            Invite Bot
          </a>
        )}
      </div>
    </main>
  );
}
