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

import { Link, useNavigate } from 'react-router-dom';

export default function PortalPage() {
    const navigate = useNavigate();
    const handleManagerLogin = () => {
        navigate('/manager-login');
    }

    const handleLogin = () => {
        navigate('/login'); //this needs to change once cashier login is made, name it handleCashierLogin to keep consistent
    }

    //the handleLogin in cashier and kitchen need to change once those logins are made
    //customer and menu should not have logins?
    return (
        <main className="app-shell portal-page">
            <p className="eyebrow">PROJECT 3 GUI</p>
            <h1>Welcome</h1>
            <p className="subtle portal-subtitle">Select an interface to continue</p>

            <div className="portal-stack">
                <section className="quick-grid three-col">
                <button className="quick-link card" to="/manager" onClick={handleManagerLogin}>Manager</button>
                <button className="quick-link card" to="/cashier" onClick={handleLogin}>Cashier</button>
                <button className="quick-link card" to="/Customer">Customer</button>
                </section>

                <section className="quick-grid two-col portal-bottom">
                <button className="quick-link card" to="/Menu">Menu</button>
                <button className="quick-link card" to="/Kitchen" onClick={handleLogin}>Kitchen</button>
                </section>
            </div>
        </main>
  );
}