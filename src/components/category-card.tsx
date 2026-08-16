import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  count?: number;
  icon?: string;
}

export function CategoryCard({ name, slug, count, icon }: CategoryCardProps) {
  return (
    <Link
      href={`/explore?category=${slug}`}
      className="group block p-6 rounded-2xl bg-surface border border-border hover:border-foreground/50 transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <span className="text-2xl">{icon || "📱"}</span>
      </div>
      <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors">{name}</h3>
      <p className="text-sm text-muted">{count ?? 0} applications</p>
    </Link>
  );
}
