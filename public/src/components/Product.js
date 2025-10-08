import "./Product.css";

export const Product = ({ id, name, description, image }) => {
    console.log(id);

    const addToCart = (productId) => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.qty += 1;
        } else {
            cart.push({ id, qty: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${name} added to cart!`);
    };
    return (
        <div className="product">
            <img src={image} alt="Product Image" />
            <h3>{name}</h3>
            <p>{description}</p>
            <div className="product-buttons">
                <button className="buy-button" onClick={() => addToCart(id)}>Add to cart</button>
                <button className="details-button" onClick={() => {window.location.href=`/productPage/${id}`}}>View info</button>
            </div>
        </div>
    );
}