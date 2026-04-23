import { AdminNav } from './_components/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-bold">管理系統</span>
          <AdminNav />
        </div>
      </header>
      {children}
    </div>
  );
}
