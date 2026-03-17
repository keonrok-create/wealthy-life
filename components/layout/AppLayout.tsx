import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch net worth
  const [{ data: assets }, { data: liabilities }, { data: profile }] = await Promise.all([
    supabase.from("assets").select("amount").eq("user_id", user?.id),
    supabase.from("liabilities").select("amount").eq("user_id", user?.id),
    supabase.from("profiles").select("name").eq("id", user?.id).single(),
  ]);

  const totalAssets = assets?.reduce((a, b) => a + b.amount, 0) ?? 0;
  const totalLiabilities = liabilities?.reduce((a, b) => a + b.amount, 0) ?? 0;
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="min-h-screen bg-navy-900">
      <Sidebar userName={profile?.name ?? user?.email?.split("@")[0]} netWorth={netWorth} />

      {/* Main content */}
      <main className="lg:ml-[220px] pb-24 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
