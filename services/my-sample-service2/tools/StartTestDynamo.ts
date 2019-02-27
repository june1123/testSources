import { ProcHelper } from './utils';

function main() {
  if (ProcHelper.isDynamodbRunning()) {
    console.log('Dynamodb is running');
    process.exit(1);
  }
  ProcHelper.startDynamoInMemory();
}

main();
