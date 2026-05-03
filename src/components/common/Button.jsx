export default function Button({ variant = 'fill', className = '', children, ...props }) {
  const base = variant === 'fill' ? 'btn-fill' : variant === 'outline' ? 'btn-outline' : 'btn-err';
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
