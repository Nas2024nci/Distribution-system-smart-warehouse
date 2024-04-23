

function checkStock() {
    const productId = document.getElementById('productId').value;
    if (productId) {
        // Here you would call your gRPC service
        console.log(`Checking stock for product ID: ${productId}`);
        // Mock response
        document.getElementById('stockResult').innerText = `Stock for Product ${productId}: 100 units`;
    }
}

