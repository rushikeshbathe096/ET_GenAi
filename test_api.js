async function run() {
  const getDashboardData = require('./dashboard/utils/api').getDashboardData;
  console.log(await getDashboardData());
}
run();
