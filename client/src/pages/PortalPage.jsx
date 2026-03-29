// import { Link } from 'react-router-dom';
// // import PageShell from '../components/PageShell';

// export default function PortalPage() {
//   return (
//     <PageShell
//       title="Welcome"
//       subtitle="Select an interface to continue"
//       variant = "portal"
//     >
//       <section className="quick-grid three-col">
//         <Link className="quick-link card" to="/manager">Manager</Link>
//         <Link className="quick-link card" to="/cashier">Cashier</Link>
//         <Link className="quick-link card" to="/Customer">Customer</Link>
//       </section>
//       {/* <section className="quick-grid one-row centered">
//         <Link className="quick-link card" to="/Menu">Menu</Link>
//         <Link className="quick-link card" to="/Kitchen">Kitchen</Link>
//       </section> */}
//     </PageShell>
//   );
// }

import { Link } from 'react-router-dom';

export default function PortalPage() {
  return (
    <main className="app-shell portal-page">
      <p className="eyebrow">PROJECT 3 GUI</p>
      <h1>Welcome</h1>
      <p className="subtle portal-subtitle">Select an interface to continue</p>

      <div className="portal-stack">
        <section className="quick-grid three-col">
          <Link className="quick-link card" to="/manager">Manager</Link>
          <Link className="quick-link card" to="/cashier">Cashier</Link>
          <Link className="quick-link card" to="/Customer">Customer</Link>
        </section>

        <section className="quick-grid two-col portal-bottom">
          <Link className="quick-link card" to="/Menu">Menu</Link>
          <Link className="quick-link card" to="/Kitchen">Kitchen</Link>
        </section>
      </div>
    </main>
  );
}