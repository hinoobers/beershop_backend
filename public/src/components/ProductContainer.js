import { Product } from "./Product";
import "./ProductContainer.css";
import { fetchProducts } from "../APIHandler";
import { useState, useEffect } from "react";

export const ProductContainer = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts()
            .then(data => {
                setProducts(data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    return (
        <div className="product-container">
            {products.map(product => (
                <Product key={product.id} id={product.id} name={product.name} image={product.image_url} description={product.description} />
            ))}
        </div>
    );
}