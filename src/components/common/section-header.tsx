export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
