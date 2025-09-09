import { Link } from "react-router";

export function DateTimeCell({ value }: { value?: string | Date | null }) {
  if (!value) return <span>-</span>;
  const d = typeof value === "string" ? new Date(value) : value;
  return <span>{d.toLocaleString()}</span>;
}

export function LinkCell({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className="text-primary hover:underline">
      {children}
    </Link>
  );
}
