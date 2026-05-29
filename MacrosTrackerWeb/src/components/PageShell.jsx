export default function PageShell({ eyebrow, title, description, children }) {
  return (
    <div className="page-shell-content">
      {(eyebrow || title || description) && (
        <header className="page-header">
          {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
          {title && <h1 className="page-title">{title}</h1>}
          {description && <p className="page-description">{description}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
