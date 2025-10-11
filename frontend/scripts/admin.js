document.addEventListener("DOMContentLoaded", function() {
    if(localStorage.getItem("admin-token") == null) {
        window.location.href = "login.html";
        return;
    }

    // Pagination state
    let ordersPage = 1;
    let ordersLimit = 10;
    let ordersTotal = 0;
    let productsPage = 1;
    let productsLimit = 10;
    let productsTotal = 0;

   function loadOrders(page = 1) {
    fetch(`/fetchOrders?page=${page}&limit=${ordersLimit}`, {
        headers: {
            "Authorization": localStorage.getItem("admin-token")
        },
        method: "GET",
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token invalid or expired
                localStorage.removeItem("admin-token");
                window.location.href = "login.html";
                throw new Error("Unauthorized");
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        const data = result.data || [];
        ordersTotal = result.total || 0;
        ordersPage = page;

        const ordersTable = document.getElementById("ordersTable").getElementsByTagName('tbody')[0];
        ordersTable.innerHTML = "";

        data.forEach(order => {
            const row = ordersTable.insertRow();
            row.insertCell(0).innerText = order.order_id;
            let products = JSON.parse(order.products).map(item => `${item.name} x${item.quantity}`).join(", ");
            const address = JSON.parse(order.address);
            row.insertCell(1).innerText = products;
            row.insertCell(2).innerText =
                (address.country || address.country_code) + ", " +
                (address.state ? "State: " + address.state + ", " : "") +
                "City: " + address.city + ", " +
                address.line1.trim() + (address.line2 ? address.line2.trim() : "") +
                ", ZIP: " + address.postal_code;
            row.insertCell(3).innerText = (order.status === 0) ? "Pending" : "Done";

            const actionCell = row.insertCell(4);
            const doneButton = document.createElement("button");
            doneButton.classList.add("btn");
            doneButton.innerText = "Mark as Done";

            if (order.status === 0) {
                doneButton.onclick = function() {
                    fetch(`/completeOrder`, {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": localStorage.getItem("admin-token")
                        },
                        body: JSON.stringify({ orderId: order.order_id })
                    }).then((r) => {
                        if (r.ok) {
                            row.cells[3].innerText = "Done";
                            doneButton.disabled = true;
                        } else if (r.status === 401) {
                            localStorage.removeItem("admin-token");
                            window.location.href = "login.html";
                        }
                    });
                };
            } else {
                doneButton.disabled = true;
            }

            actionCell.appendChild(doneButton);
        });

        document.getElementById("ordersPageInfo").innerText =
            `Page ${ordersPage} of ${Math.max(1, Math.ceil(ordersTotal / ordersLimit))}`;
        document.getElementById("ordersPrevBtn").disabled = ordersPage <= 1;
        document.getElementById("ordersNextBtn").disabled = ordersPage >= Math.ceil(ordersTotal / ordersLimit);
    })
    .catch(err => {
        console.error("Error loading orders:", err);
        if (err.message.includes("Unauthorized")) return;
        window.location.href = "login.html";
    });
}

    document.getElementById("ordersPrevBtn").addEventListener("click", () => {
        if (ordersPage > 1) loadOrders(ordersPage - 1);
    });
    document.getElementById("ordersNextBtn").addEventListener("click", () => {
        if (ordersPage < Math.ceil(ordersTotal/ordersLimit)) loadOrders(ordersPage + 1);
    });

    loadOrders(1);

    // for modal
    const listeners = [];

    function loadProducts(page = 1) {
        fetch(`/fetchProducts?page=${page}&limit=${productsLimit}`, {
            method: "GET",
        }).then(response => response.json())
        .then(result => {
            const data = result.data || [];
            productsTotal = result.total || 0;
            productsPage = page;
            const productsTable = document.getElementById("productsTable").getElementsByTagName('tbody')[0];
            productsTable.innerHTML = "";
            data.forEach(product => {
                const row = productsTable.insertRow();
                row.insertCell(0).innerText = product.id;
                row.insertCell(1).innerText = product.name;
                row.insertCell(2).innerText = product.description;
                row.insertCell(3).innerText = product.price.currency + product.price.total;
                const actionCell = row.insertCell(4);
                actionCell.className = "actioncell";

                const editButton = document.createElement("button");
                editButton.classList.add("btn");
                editButton.innerText = "Edit";
                editButton.onclick = function() {
                    const modal = document.getElementById("productModal");
                    modal.classList.add("active");

                    document.getElementById("productName").value = product.name;
                    document.getElementById("productDescription").value = product.description;
                    document.getElementById("productImage").value = product.image_url;
                    document.getElementById("productPrice").value = product.price.total;

                    const saveBtn =document.getElementById("submitProductBtn");
                    listeners.forEach(l => {
                        saveBtn.removeEventListener(l);
                    })
                    const listener = () => {
                        fetch(`/updateProduct/${product.id}`, {
                            method: "PUT",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": localStorage.getItem("admin-token")
                            },
                            body: JSON.stringify({
                                name: document.getElementById("productName").value,
                                description: document.getElementById("productDescription").value,
                                image_url: document.getElementById("productImage").value,
                                price: document.getElementById("productPrice").value
                            })
                        }).then((r) => {
                            if (r.ok) {
                                alert("Product updated!");
                                window.location.reload();
                            }
                        });
                    }
                    saveBtn.addEventListener("click", listener);
                    listeners.push(listener);

                };
                actionCell.appendChild(editButton);

                const removeButton = document.createElement("button");
                removeButton.classList.add("btn");
                removeButton.innerText = "Remove";
                removeButton.onclick = function() {
                    fetch(`/deleteProduct/${product.id}`, {
                        method: "DELETE",
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": localStorage.getItem("admin-token")
                        }
                    }).then((r) => {
                        if (r.ok) {
                            alert("Product deleted!");
                            window.location.reload();
                        }
                    });
                };
                actionCell.appendChild(removeButton);
            });
            // Update pagination info
            document.getElementById("productsPageInfo").innerText = `Page ${productsPage} of ${Math.max(1, Math.ceil(productsTotal/productsLimit))}`;
            document.getElementById("productsPrevBtn").disabled = productsPage <= 1;
            document.getElementById("productsNextBtn").disabled = productsPage >= Math.ceil(productsTotal/productsLimit);
        }).catch(err => {
            console.log(err);
            window.location.href = "login.html";
        });
    }

    document.getElementById("productsPrevBtn").addEventListener("click", () => {
        if (productsPage > 1) loadProducts(productsPage - 1);
    });
    document.getElementById("productsNextBtn").addEventListener("click", () => {
        if (productsPage < Math.ceil(productsTotal/productsLimit)) loadProducts(productsPage + 1);
    });

    loadProducts(1);

    document.getElementById("addProductBtn").addEventListener("click", () => {
        const modal = document.getElementById("productModal");
        modal.classList.add("active");

        const saveBtn =document.getElementById("submitProductBtn");
        listeners.forEach(l => {
            saveBtn.removeEventListener(l);
        })
        const listener = () => {
            fetch(`/addProduct`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("admin-token")
                },
                body: JSON.stringify({
                    name: document.getElementById("productName").value,
                    description: document.getElementById("productDescription").value,
                    image_url: document.getElementById("productImage").value,
                    price: document.getElementById("productPrice").value
                })
            }).then((r) => {
                if (r.ok) {
                    alert("Product added!");
                    window.location.reload();
                }
            });
        }
        saveBtn.addEventListener("click", listener);
        listeners.push(listener);
    });
});