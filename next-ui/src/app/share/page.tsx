import { redirect } from 'next/navigation';

// The bookmarks/share feature is deprecated — sharing and saving links is no longer supported.
export default function SharePage() {
  redirect('/projects/bookmarks');
}
