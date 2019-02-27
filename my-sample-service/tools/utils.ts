import * as child_process from 'child_process';
const spawn = child_process.spawn;

class ProcHelper {
  static startDynamo(ignoreExit: boolean = false) {
    const args = 'dynamodb start --dbPath ../../../../.db';
    this.startDetachedProcess('sls', args, ignoreExit);
  }

  static isDynamodbRunning() {
    const result = child_process.execSync('ps aux | grep dynamodb');
    return result.toString().indexOf('DynamoDBLocal.jar') >= 0;
  }

  static execCommand(command) {
    child_process.execSync(command, { stdio: [0, 1, 2] });
  }

  static startDynamoInMemory() {
    const args = 'dynamodb start --port 8001 --inMemory';
    this.startDetachedProcess('sls', args);
  }

  static detachedChildProcesses: any[] = [];
  static normalChildProcesses: any[] = [];

  static clearProcesses(cause) {
    for (const proc of this.detachedChildProcesses) {
      process.kill(-proc.pid);
    }

    for (const proc of this.normalChildProcesses) {
      proc.kill();
    }
  }

  static setCleanupHandlerToProcess(childProcess, events: string[] | string, detached: boolean = false) {
    events = (typeof (events) === 'string') ? [events] : events;
    for (const event of events) {
      childProcess.on(event, (code) => process.exit(code));
    }

    if (detached) {
      this.detachedChildProcesses.push(childProcess);
    } else {
      this.normalChildProcesses.push(childProcess);
    }
  }

  static startNormalProcess(command: string, args: string | string[]) {
    args = (typeof (args) === 'string') ? args.split(' ') : args;
    const childProcess = spawn(command, args, { stdio: 'inherit' });
    this.setCleanupHandlerToProcess(childProcess, ['SIGTERM', 'SIGINT', 'exit']);
  }

  static startDetachedProcess(command: string, args: string | string[], ignoreExit: boolean = false) {
    console.log(command, args);
    const spawnOptions: child_process.SpawnOptions = { detached: true, stdio: 'inherit' };
    args = (typeof (args) === 'string') ? args.split(' ') : args;
    const childProcess = spawn(command, args, spawnOptions);
    if (!ignoreExit) {
      this.setCleanupHandlerToProcess(childProcess, ['exit'], true);
    }
  }
}

process.on('SIGINT', () => ProcHelper.clearProcesses('sigint'));
process.on('SIGTERM', () => ProcHelper.clearProcesses('sigterm'));
process.on('exit', () => ProcHelper.clearProcesses('exit'));

/**
 * Wait until resolver returns true or timeout time spends.
 * @param resolver function to determine it needs wait.
 * @param timeoutMs timeout time in milliseconds.
 */
async function waitResolver(resolver?: () => Promise<boolean>, timeoutMs?: number) {
  let intervalId;
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    intervalId = setInterval(async () => {
      const timeout = (timeoutMs && (Date.now() - startTime) > timeoutMs);
      let loadingDone = false;
      if (!timeout && resolver) {
        loadingDone = await resolver();
      }
      if (loadingDone || timeout) {
        clearInterval(intervalId);
        resolve();
      }
    }, 100);
  });
}

export { waitResolver, ProcHelper };
