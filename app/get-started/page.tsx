import { AuthButton } from "@/components/auth-button";
import { OnboardingForm } from "@/components/OnboardingComponent";
import ProfileDropdown from "@/components/ProfileDropdown";
import { createClient } from "@/lib/supabase/server";

export default async function GetStartedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div>
      <div className="w-full flex items-center justify-between px-4 py-3 lg:px-20 xl:px-40 2xl:px-80 border-b">
        <div className="flex items-center gap-2">
          <h1 className="sm:text-2xl font-bold text-center">GetHired</h1>
        </div>
        <div className="flex items-center gap-5">
          {user ? (
            <ProfileDropdown user={user} isAgentSidebar={false} />
          ) : (
            <div className="hidden sm:block">
              <AuthButton />
            </div>
          )}
        </div>
      </div>

      <OnboardingForm />
    </div>
  );
}
