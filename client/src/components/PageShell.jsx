export default function PageShell({ title, subtitle, actions, children, titleClassName = '' }) {
  const renderedSubtitle = typeof subtitle === 'string'
    ? <p className="subtle">{subtitle}</p>
    : <div className="subtle">{subtitle}</div>;

  return (
    <div className="app-shell">
      <header className="topbar" role="banner">
        <div>
          <h1 className={titleClassName}>{title}</h1>
          {subtitle ? renderedSubtitle : null}
        </div>
      </header>
      {actions ? <nav className="page-actions" aria-label="Page actions">{actions}</nav> : null}
      <main>{children}</main>
    </div>
  );
}
