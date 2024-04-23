const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const servicePath = '../order.proto';
const packageDefinition = protoLoader.loadSync(servicePath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const orderProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

describe('Order Management Service', function() {
    let server;
    let client;
    let mockServer;

    before(function() {
        mockServer = new grpc.Server();
        const placeOrder = sinon.fake((call, callback) => {
            callback(null, { order_id: '123', product_id: call.request.product_id, quantity: call.request.quantity, status: 'processed' });
        });

        mockServer.addService(orderProto.OrderService.service, { placeOrder });
        const port = mockServer.bindAsync('0.0.0.0:0', grpc.ServerCredentials.createInsecure(), () => {
            const address = `localhost:${port}`;
            client = new orderProto.OrderService(address, grpc.credentials.createInsecure());
        });
        mockServer.start();
    });

    after(function() {
        mockServer.forceShutdown();
    });

    it('PlaceOrder should process order correctly', function(done) {
        client.placeOrder({ product_id: '1', quantity: 10 }, function(err, response) {
            expect(err).to.be.null;
            expect(response).to.deep.equal({ order_id: '123', product_id: '1', quantity: 10, status: 'processed' });
            done();
        });
    });
});

