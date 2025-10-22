
import FxConversionCard from '@/components/FxConversionCard';

export default function Home() {
  return (
    <main className="flex items-start sm:items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4" style={{ background: 'var(--card-surface)'}}>
      <FxConversionCard />
    </main>
  );
}
