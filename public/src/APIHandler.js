function fetchProducts() {
    return fetch("http://localhost:3001/fetchProducts", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        return response.json();
    });
}

function fetchProductById(id) {
    return fetch(`http://localhost:3001/fetchProduct/${id}`, {
        method: "GET",
    })
    .then(response => {
        if (!response.ok && response.status !== 404) {
            throw new Error("Failed to fetch product");
        }
        return response.json();
    });
}

module.exports = { fetchProducts, fetchProductById };