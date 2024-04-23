const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const inventoryProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

let stock = {
    "1": 100,
    "2": 150,
    "3": 200
};

function checkStock(call, callback) {
    const productId = call.request.product_id;
    const quantity = stock[productId] || 0;
    callback(null, { product_id: productId, quantity });
}

function updateStock(call, callback) {
    const { product_id, adjustment } = call.request;
    if (stock[product_id] !== undefined) {
        stock[product_id] += adjustment;
        callback(null, { product_id, new_quantity: stock[product_id] });
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Product not found"
        });
    }
}
const server = new grpc.Server();
server.addService(inventoryProto.InventoryService.service, { checkStock, updateStock });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory service running on port 50051');
    server.start();
});

