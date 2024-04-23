const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('order.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const orderProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

function placeOrder(call, callback) {
    const { product_id, quantity } = call.request;
    // Assume product exists and order can be processed for simplicity
    const orderResponse = {
        order_id: new Date().getTime().toString(),
        product_id,
        quantity,
        status: "processed"
    };
    callback(null, orderResponse);
}

function streamOrders(call) {
    call.on('data', (orderRequest) => {
        const response = {
            order_id: new Date().getTime().toString(),
            product_id: orderRequest.product_id,
            quantity: orderRequest.quantity,
            status: "streamed"
        };
        call.write(response);
    });
    call.on('end', () => {
        call.end();
    });
}

const server = new grpc.Server();
server.addService(orderProto.OrderService.service, { placeOrder, streamOrders });
server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Order service running on port 50052');
    server.start();
});
