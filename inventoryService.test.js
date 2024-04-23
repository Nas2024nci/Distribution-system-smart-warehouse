const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const servicePath = '../inventory.proto';
const packageDefinition = protoLoader.loadSync(servicePath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

describe('Inventory Service', function() {
    let server;
    let client;
    let mockServer;

    before(function() {
        mockServer = new grpc.Server();
        const checkStock = sinon.fake((call, callback) => {
            callback(null, { product_id: call.request.product_id, quantity: 100 });
        });
        const updateStock = sinon.fake((call, callback) => {
            callback(null, { product_id: call.request.product_id, new_quantity: call.request.adjustment + 100 });
        });

        mockServer.addService(inventoryProto.InventoryService.service, { checkStock, updateStock });
        const port = mockServer.bindAsync('0.0.0.0:0', grpc.ServerCredentials.createInsecure(), () => {
            const address = `localhost:${port}`;
            client = new inventoryProto.InventoryService(address, grpc.credentials.createInsecure());
        });
        mockServer.start();
    });

    after(function() {
        mockServer.forceShutdown();
    });

    it('CheckStock should return correct stock level', function(done) {
        client.checkStock({ product_id: '1' }, function(err, response) {
            expect(err).to.be.null;
            expect(response).to.deep.equal({ product_id: '1', quantity: 100 });
            done();
        });
    });

    it('UpdateStock should adjust stock correctly', function(done) {
        client.updateStock({ product_id: '1', adjustment: 50 }, function(err, response) {
            expect(err).to.be.null;
            expect(response).to.deep.equal({ product_id: '1', new_quantity: 150 });
            done();
        });
    });
});


