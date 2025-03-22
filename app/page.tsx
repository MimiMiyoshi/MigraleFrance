import { redirect } from 'next/navigation';

// ルートページ - 自動的に/auth へリダイレクト
export default function Home() {
  redirect('/auth');
}