const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('notification.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const notificationProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

function sendNotification(call, callback) {
    console.log(`Notification sent: ${call.request.message}`);
    callback(null, { success: true });
}

function subscribeNotifications(call) {
    call.on('data', (request) => {
        const message = {
            message: "Notification: Update " + request.subscriber_id,
            timestamp: new Date().toISOString()
        };
        call.write(message);
    });
    call.on('end', () => call.end());
}

const server = new grpc.Server();
server.addService(notificationProto.NotificationService.service, { sendNotification, subscribeNotifications });
server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Notification service running on port 50053');
    server.start();
});
