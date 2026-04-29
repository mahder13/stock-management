import ModernDashboard from '@/components/dashboard/ModernDashboard';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-700">Welcome, {session.user?.name || session.user?.email}</h2>
                    <p className="text-sm text-slate-500">Role: {session.user?.role}</p>
                </div>
                <LogoutButton />
            </div>
            <ModernDashboard />
        </main>
    );
}

