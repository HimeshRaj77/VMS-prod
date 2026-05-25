export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b-2 border-border">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm mt-1 font-medium">{subtitle}</p>}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0">
          {action}
        </div>
      )}
    </div>
  );
}
