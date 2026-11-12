import { DesignSystemView } from "@/app/design-system/DesignSystemView";

export const metadata = { title: "Design system" };

/** Admin-gated living style guide (available in production). */
export default function AdminDesignSystemPage() {
  return <DesignSystemView embedded />;
}
