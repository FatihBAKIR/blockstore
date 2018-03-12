import { BlockStoreClient } from "./BlockStoreClient";

const client = new BlockStoreClient(process.argv[2], 9090);
