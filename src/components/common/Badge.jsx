export default function Badge({ variant = 'neu', className = '', children }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>{children}</span>
  );
}
