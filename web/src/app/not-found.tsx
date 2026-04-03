import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page not found</h1>
      <Link href="/" style={{ color: 'var(--mantine-color-blue-6)' }}>
        Back to home
      </Link>
    </div>
  );
}
