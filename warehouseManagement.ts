// warehouseManagement.ts
import { ListProductsRequest, ListProductsResponse } from './proto/warehouse_pb';

export function listProducts(call: any, callback: any) {
  const products = [
    { id: '1', name: 'Product 1', quantity: 100 },
    { id: '2', name: 'Product 2', quantity: 50 },
  ];
  const response = new ListProductsResponse();
  response.setProductsList(products);
  callback(null, response);
}
