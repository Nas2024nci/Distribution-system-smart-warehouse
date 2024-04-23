// server.ts
import * as grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';
import { listProducts } from './warehouseManagement';
import { placeOrder } from './orderProcessing';
import { trackStock } from './stockTracking';

const PROTO_PATH = './proto/';

const packageDefinition = protoLoader.loadSync([
  PROTO_PATH + 'warehouse.proto',
  PROTO_PATH + 'order.proto',
  PROTO_PATH + 'stock.proto',
]);

const { WarehouseManagementService, OrderProcessingService, StockTrackingService } =
  grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(WarehouseManagementService.service, {
  listProducts,
});

server.addService(OrderProcessingService.service, {
  placeOrder,
});

server.addService(StockTrackingService.service, {
  trackStock,
});

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());

server.start();
console.log('Server started, listening on port 50051');
