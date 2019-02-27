const child_process = require('child_process');
const lastTag = 'build_by_bot_first';

function getChangedServices() {
  const command = `git --no-pager diff --name-only ${lastTag} HEAD | sort -u | awk 'BEGIN { FS="/"; OFS="/" } /^services/ { print $1,$2 }' | uniq`;
  const result = child_process.execSync(command).toString();

  const serviceNames = [];
  const changedServices = result.split('\n');
  for (const service of changedServices) {
    if (service.trim().length > 0) {
      serviceNames.push(service.trim());
    }
  }
  return serviceNames;
}

module.exports = getChangedServices;
