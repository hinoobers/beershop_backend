import "./Header.css";

const Header = () => {
    return (
        <header>
            <h1><a href="/">Beer Shop</a></h1>

            <div className="header-right">
                <select>
                    <option value="USD" selected>USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                </select>

                <a href="/cart" className="cart-link">
                    🛒 Cart
                </a>

                {window.location.pathname !== "/admin" && (
                    <a href="/admin">Admin?</a>
                )}
            </div>
        </header>
    );
}

export {Header};