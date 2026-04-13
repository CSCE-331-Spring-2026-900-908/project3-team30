// import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

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
import { useEffect } from 'react';  
// import { Link, useNavigate } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';

export default function PortalPage() {

    const navigate = useNavigate();
    const handleManagerLogin = () => {
        // window.location.href = 'http://localhost:8080/oauth2/authorization/google';
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    }

    const handleLogin = () => {
        navigate('/login'); //this needs to change once cashier login is made, name it handleCashierLogin to keep consistent
    }

    //the handleLogin in cashier and kitchen need to change once those logins are made
    //customer and menu should not have logins?

    const handleCashierLogin = () => {
        navigate('/cashier-login');
    }
    const handleCustomer = () => {
        navigate('/customer');
    }

    const handleKitchenLogin = () => {
        navigate('/kitchen-login');
    }

    const handleMenuBoard = () => {
            navigate('/menu-board');
    }



    return (
        <main className="app-shell portal-page">
            <p className="eyebrow">PROJECT 3 GUI</p>
            <h1>Welcome</h1>
            <p className="subtle portal-subtitle">Select an interface to continue</p>

            <div className="portal-stack">
                <section className="quick-grid three-col">
                    <button className="quick-link card portal-card" onClick={handleManagerLogin}>
                        <span className="material-symbols-outlined portal-icon">badge</span>
                        <span>Manager</span>
                    </button>

                    <button className="quick-link card portal-card" onClick={handleCashierLogin}>
                        <span className="material-symbols-outlined portal-icon">point_of_sale</span>
                        <span>Cashier</span>
                    </button>

                    <button className="quick-link card portal-card" onClick={handleCustomer}>
                        <span className="material-symbols-outlined portal-icon">shopping_bag</span>
                        <span>Customer</span>
                    </button>
                </section>

                <section className="quick-grid two-col portal-bottom">
                    <button className="quick-link card portal-card" onClick={handleMenuBoard}>
                        <span className="material-symbols-outlined portal-icon">menu_book</span>
                        <span>Menu</span>
                    </button>

                    <button className="quick-link card portal-card" onClick={handleKitchenLogin}>
                        <span className="material-symbols-outlined portal-icon">kitchen</span>
                        <span>Kitchen</span>
                    </button>
                </section>
            </div>
        </main>
    );
}