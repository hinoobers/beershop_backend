import { useEffect, useState } from "react";
import { fetchProductById } from "../APIHandler";
import "./Cart.css";

export const CartProduct = ({ productId }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetchProductById(productId).then(setProduct);
    }, [productId]);
    
    return (
        <div className="cart-product">
            {product && (
                <>
                    <p>Name: {product.name}</p>
                    <p>Description: {product.description}</p>
                    <p>Price: ${product.price}</p>
                    <div>
                        <span> Quantity: 1 </span>
                        <button className="remove-button">Remove from cart</button>
                        <button className="add-button">Add one more</button>
                    </div>
                </>
            )}
        </div>
    );
}
