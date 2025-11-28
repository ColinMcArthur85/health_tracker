import { redirect } from 'next/navigation';

export default function JournalPage() {
  // Redirect to today's journal entry
  const today = new Date().toISOString().split('T')[0];
  redirect(`/dashboard/journal/${today}`);
}
