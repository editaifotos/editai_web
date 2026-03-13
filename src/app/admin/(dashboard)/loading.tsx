export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted/50 rounded" />
      <div className="h-4 w-96 bg-muted/50 rounded" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/30" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-muted/20" />
    </div>
  );
}
