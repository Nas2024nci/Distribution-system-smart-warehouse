// notificationService.test.js
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the protobuf
const protoPath = path.resolve(__dirname, '../protos/notification.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const notificationProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

describe('Notification Service', function() {
    let server;
    let client;
    let mockServer;

    // Setting up the mock server
    before(function(done) {
        mockServer = new grpc.Server();
        const sendNotification = sinon.fake.yields(null, { success: true });
        const subscribeNotifications = (stream) => {
            stream.on('data', (request) => {
                stream.write({ message: "Notification: " + request.subscriber_id, timestamp: new Date().toISOString() });
            });
            stream.on('end', () => stream.end());
        };

        mockServer.addService(notificationProto.NotificationService.service, {
            SendNotification: sendNotification,
            SubscribeNotifications: subscribeNotifications
        });
        
        mockServer.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                return done(error);
            }
            server = `localhost:${port}`;
            client = new notificationProto.NotificationService(server, grpc.credentials.createInsecure());
            mockServer.start();
            done();
        });
    });

    after(function() {
        mockServer.forceShutdown();
    });

    // Test for SendNotification
    it('should send a notification successfully', function(done) {
        client.sendNotification({ message: 'Stock level low for product 123' }, (err, response) => {
            expect(err).to.be.null;
            expect(response.success).to.be.true;
            done();
        });
    });

    // Test for SubscribeNotifications
    it('should handle subscription and sending of messages correctly', function(done) {
        const call = client.subscribeNotifications();
        const testMessage = { subscriber_id: 'testClient' };

        call.write(testMessage);

        call.on('data', (message) => {
            expect(message).to.have.property('message').that.includes('Notification: testClient');
            call.end(); // End the call once the test verifies the incoming message
        });

        call.on('end', done);
        call.on('error', done);
    });
});

