import { CartProduct } from "./CartProduct";
import "./Cart.css";

export const CartContainer = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return (
        <div className="cart-container">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                cart.map(item => (
                    <CartProduct key={item.id} productId={item.id} />
                ))
            )}
        </div>
    );
}