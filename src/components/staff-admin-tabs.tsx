import Link from "next/link";

type StaffAdminTabsProps = {
  current: "records" | "staff" | "attendance";
};

export function StaffAdminTabs({ current }: StaffAdminTabsProps) {
  const tabs = [
    { key: "records", label: "Record Management", href: "/staff/records" },
    { key: "staff", label: "Staff Management", href: "/staff/staff" },
    { key: "attendance", label: "Staff Attendance", href: "/staff/attendance" },
  ] as const;

  return (
    <div className="sticky top-4 z-20 w-fit max-w-full rounded-[32px] bg-[#f4f7fb]/90 p-1 backdrop-blur">
      <div className="inline-flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              current === tab.key
                ? "bg-[#0f2350] text-white"
                : "text-slate-700 hover:bg-slate-50 hover:text-[#0f2350]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
