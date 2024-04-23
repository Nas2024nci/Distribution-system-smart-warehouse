const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const PROTO_PATH = './inventory.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition).warehouse;
const client = new inventoryProto.InventoryService('localhost:50051', grpc.credentials.createInsecure());

function prompt() {
    rl.question('Enter product ID to check stock: ', (productId) => {
        client.checkStock({ product_id: productId }, (error, response) => {
            if (error) console.error(error);
            console.log('Stock:', response.quantity);
            prompt();  // Loop the prompt
        });
    });
}

prompt();
