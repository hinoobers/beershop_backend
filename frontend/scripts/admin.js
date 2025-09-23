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
});