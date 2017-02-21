var TransIP = require('./transip');

var transipInstance = new TransIP();

// transipInstance.vpsService.stopVps('magnetme-vps29').then(data => {
//   console.log(data);
//   transipInstance.vpsService.startVps('magnetme-vps29').then(data => {
//     console.log(data);
//     transipInstance.vpsService.getVpsBackupsByVps('magnetme-vps29').then(data => console.log(data));
//   });
// });

// transipInstance.vpsService.getVpsBackupsByVps('magnetme-vps29').then(data => console.log(data));
transipInstance.haipService.getHaips().then(data => console.log(data));
