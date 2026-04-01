import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { getRoutinePageData } from "@/utils/routine-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = await getRoutinePageData();

  return <ProfileSettingsForm settings={data.settings} stats={data.weekly.summary} />;
}
