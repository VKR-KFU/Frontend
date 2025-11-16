import React from "react";
import { Link } from "react-router-dom";

function AppLayout({ children }) {
    return (
        <div className="page">
            <header className="header">
                <div className="header-inner">
                    <Link to="/" className="logo">
                        VKR Articles
                    </Link>
                </div>
            </header>

            <main className="main">{children}</main>
        </div>
    );
}

export default AppLayout;
