import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="border-b border-gray-100 dark:border-gray-900 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-xl">🎯</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Viral Scout
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                AI Agent for Influencer Discovery
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <ChatInterface />
      </main>
    </div>
  );
}
