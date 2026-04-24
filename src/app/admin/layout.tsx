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
          <h1 className="text-2xl font-bold font-heading">管理系統.</h1>
          <AdminNav />
        </div>
      </header>
      {children}
    </div>
  );
}
