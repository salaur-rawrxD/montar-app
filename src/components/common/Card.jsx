export default function Card({ variant = 'el', className = '', children, style }) {
  const cls = variant === 'fill' ? 'card-fill' : variant === 'low' ? 'card' : 'card-el';
  return (
    <div className={`${cls} ${className}`} style={style}>
      {children}
    </div>
  );
}
