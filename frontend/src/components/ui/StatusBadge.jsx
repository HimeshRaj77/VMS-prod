export default function StatusBadge({ status, label }) {
  const styles = {
    success: 'bg-[#34c759] text-white border-border',
    warning: 'bg-[#ffcc00] text-black border-border',
    danger: 'bg-[#ff3b30] text-white border-border',
    info: 'bg-[#5ac8fa] text-black border-border',
    default: 'bg-slate-200 text-black border-border',
  };

  const styleClass = styles[status] || styles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 border-2 text-xs font-bold uppercase tracking-wider shadow-sm ${styleClass}`}>
      {label}
    </span>
  );
}
