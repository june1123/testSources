const child_process = require('child_process');

const FindChanges = require('./FindChanges');

const services = FindChanges();
for (const service of services) {
  const r = child_process.execSync(`cd ${service}; echo install ${service}; npm i; npm t`, { stdio: 'inherit' });
  console.log(r);
}


// const child_process = require('child_process');
// const lastTag = 'build_by_bot_first';

// function getChangedServices() {
//   const command = `git --no-pager diff --name-only ${lastTag} HEAD | sort -u | awk 'BEGIN { FS="/"; OFS="/" } /^services/ { print $1,$2 }' | uniq`;
//   const result = child_process.execSync(command).toString();

//   const serviceNames = [];
//   const changedServices = result.split('\n');
//   for (const service of changedServices) {
//     if (service.trim().length > 0) {
//       serviceNames.push(service.trim());
//     }
//   }
//   return serviceNames;
// }

// module.exports = getChangedServices;
