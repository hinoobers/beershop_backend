import { useParams } from "react-router-dom";
import { fetchProductById } from "../APIHandler";
import { useEffect, useState } from "react";
import "./ProductPage.css";
import { Header } from "../components/Header";

const ProductPage = () => {
    // productPage/:id
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    
    useEffect(() => {
        fetchProductById(id).then(setProduct);
    }, [id]);

    return (
        <>
            <Header />
            <div className="product-page-container">
                {product === null ? (
                    <p>Loading product details...</p>
                ) : product.error ? (
                    <p>Error: {product.error}</p>
                ) : (
                    <>
                        <h1>{product.name}</h1>
                        <img src={product.image_url} alt={product.name} />
                        <p>{product.description}</p>
                        <p>Price: ${product.price}</p>
                    </>
                )}
            </div>
        </>
    );
}

export {ProductPage};