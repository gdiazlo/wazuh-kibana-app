const { WAIT_TIMEOUT, SERVER_URL } = require('../common/constants');
const logger = require('../common/logger');

module.exports = async function (context, commands) {
  // Navigate to a URL, but do not measure the URL
  await commands.navigate(SERVER_URL);
  try {
    
    await commands.wait.bySelector('button[data-test-subj="toggleNavButton"]', WAIT_TIMEOUT)
    await commands.click.bySelector('button[data-test-subj="toggleNavButton"]')
    await commands.wait.bySelector('a[href$="/app/wazuh"]', WAIT_TIMEOUT)
    await commands.click.bySelector('a[href$="/app/wazuh"]')
    //Wait for an Wazuh home page component to be loaded
    await commands.wait.byXpath('//*[contains(@class,"euiTitle euiTitle--small euiCard__title")]//*[contains(text(),"Security events")]', WAIT_TIMEOUT)
    // Click on Security Events module button
    await commands.wait.byXpath('//*[contains(@class,"euiTitle euiTitle--small euiCard__title")]//*[contains(text(),"Security events")]', WAIT_TIMEOUT)
    //Waiting for full load of the page
    await commands.wait.byCondition("!isNaN(parseInt(document.querySelector('.statWithLink').innerHTML))", WAIT_TIMEOUT)
    // Start collecting metrics
    logger('--- Initiate measures in dashboard module ---');
    await commands.measure.start('security-events-module')
    await commands.click.byXpath('//*[contains(@class,"euiTitle euiTitle--small euiCard__title")]//*[contains(text(),"Security events")]')
    
    logger('Alerts level evolution');
    await commands.wait.bySelector('[data-render-complete="true"][data-title="Alert level evolution"]', WAIT_TIMEOUT)    
    logger('Alerts Top Mitre Att&ck');
    await commands.wait.bySelector('[data-render-complete="true"][data-title="Alerts"]', WAIT_TIMEOUT)    
    logger('Top 5 Agent');
    await commands.wait.bySelector('[data-render-complete="true"][data-title="Top 5 agents"]', WAIT_TIMEOUT)
    logger('Alerts Evolutionn Top 5 Agent');
    await commands.wait.bySelector('[data-render-complete="true"][data-title="Alerts evolution Top 5 agents"]', WAIT_TIMEOUT)
    logger('Security Alerts Table');
    await commands.wait.bySelector('[data-test-subj="tableHeaderCell_timestamp_1"]', WAIT_TIMEOUT)
    // Stop and collect the metrics
    logger('--- Finish measures ---', 'info');
    return commands.measure.stop();
  } catch (e) {
    // We try/catch so we will catch if the the input fields can't be found
    // The error is automatically logged in Browsertime an rethrown here
    // We could have an alternative flow ...
    // else we can just let it cascade since it caught later on and reported in
    // the HTML
    throw e;
  }
};
