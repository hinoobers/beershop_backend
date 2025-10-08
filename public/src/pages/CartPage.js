import { CartContainer } from "../components/CartContainer";
import { Header } from "../components/Header";

export const CartPage = () => {
    return (
        <>
            <Header />
            <div>
                <h2>Cart Page</h2>
                <CartContainer />
            </div>
        </>
    );
}