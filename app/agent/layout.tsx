import AgentMain from "@/components/AgentMain";
import AgentSidebar from "@/components/AgentSidebar";
import Error from "@/components/Error";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    return (
      <div className="h-screen w-screen flex items-center gap-0 overflow-x-hidden">
        {/* sidebar */}
        <div className={cn("hidden lg:block h-screen")}>
          <AgentSidebar screen={"lg"} user={user} />
        </div>
        {/* main layout */}
        <div className="flex-1 h-full overflow-hidden">{children}</div>
      </div>
    );
  } catch (error) {
    return <Error />;
  }
}
