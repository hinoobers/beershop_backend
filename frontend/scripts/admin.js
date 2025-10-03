document.addEventListener("DOMContentLoaded", function() {
    if(localStorage.getItem("admin-token") == null) {
        window.location.href = "login.html";
        return;
    }
    fetch("/fetchOrders", {
        headers: {
            "Authorization": localStorage.getItem("admin-token")
        },
        method: "GET",
    }).then(response => response.json())
    .then(data => {
        const ordersTable = document.getElementById("ordersTable").getElementsByTagName('tbody')[0];
        data.forEach(order => {
            const row = ordersTable.insertRow();
            row.insertCell(0).innerText = order.order_id;
            let products = JSON.parse(order.products).map(item => `${item.name} x${item.quantity}`).join(", ");
            const address = JSON.parse(order.address);
            row.insertCell(1).innerText = products;
            row.insertCell(2).innerText = address.country + ", " + (address.state ? "State: " + address.state + "," : "") + " City: " + address.city + ", " + address.line1.trim() + (address.line2 ? address.line2.trim() : "") + ", ZIP: " + address.postal_code;
            row.insertCell(3).innerText = (order.status === 0) ? "Pending" : "Done";
            const actionCell = row.insertCell(4);
            if (order.status === 0) {
                const doneButton = document.createElement("button");
                doneButton.classList.add("btn");
                doneButton.innerText = "Mark as Done";
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
                            // disable
                            doneButton.disabled = true;
                        }
                    });
                };
                actionCell.appendChild(doneButton);
            } else {
                const doneButton = document.createElement("button");
                doneButton.classList.add("btn");
                doneButton.innerText = "Mark as Done";
                doneButton.disabled = true;
                actionCell.appendChild(doneButton);
            }
        });
    }).catch(err => {
        window.location.href = "login.html";
    });

    // for modal
    const listeners = [];

    fetch("/fetchProducts", {
        method: "GET",
    }).then(response => response.json())
    .then(data => {
        const ordersTable = document.getElementById("productsTable").getElementsByTagName('tbody')[0];
        data.forEach(product => {
            const row = ordersTable.insertRow();
            row.insertCell(0).innerText = product.id;
            row.insertCell(1).innerText = product.name;
            row.insertCell(2).innerText = product.description;
            row.insertCell(3).innerText = product.price;
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
                document.getElementById("productPrice").value = product.price;

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
    }).catch(err => {
        console.log(err);
        window.location.href = "login.html";
    });

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