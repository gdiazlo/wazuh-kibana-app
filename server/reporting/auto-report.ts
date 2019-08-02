import Chrome from 'selenium-webdriver/chrome';
import {WebDriver, Builder, By, until, WebElementCondition, WebElement} from 'selenium-webdriver';
import { async } from 'rxjs/internal/scheduler/async';

interface Report {
  uri: string,
  tab: string,
  filters: string,
  tFrom: string,
  tTo: string
}

interface AgentReport extends Report {
  agent: number
}

export class AutoReport {
  screen: { width: number; height: number; };
  url: string;
  tab: string;
  tabs: {};
  filters: string;
  tFrom: string;
  tTo: string;
  driver!: WebDriver;

  constructor(report: Report) {
    this.screen = { width: 1920, height: 1080 };
    this.url = `${report.uri}/app/wazuh#/`;
    this.tab = report.tab; 
    this.tabs = {};
    this.filters = report.filters;
    this.tFrom = report.tFrom;
    this.tTo = report.tTo;
  }

  availabeTab() {
    if(this.tab in this.tabs) {
      return true;
    }
    throw new Error(
      `The tab don't exists for the current context`
    );
  }

  async clickButton(selector: string, errorMessage: string, apendError=false) {
    try {
      await this.driver.wait(until.elementLocated(By.css(selector)), 10000).then(async (button) => {
        await this.driver.wait(until.elementIsEnabled(button), 10000)
        .then(async () => {
          await button.click();
        })
      })
    } catch (e) {
      throw new Error(
        `${errorMessage} ${apendError ? e:''}`
      )
    }
  }


  async createDriver() {
    return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new Chrome.Options().headless().windowSize(this.screen))
    .build();
  }

  async generateReport() {
    const selector = '[data-test-subj="overviewGenerateReport"]';
    await this.clickButton(
      selector,
      `The generate report button is disabled`
    );
  }

  async openWazuh(){
    this.driver.get(this.url);
    await this.driver.wait(until.urlContains('overview'), 10000);
  }

  /**
   * Open de correct controller in the web browser
   *
   * @param {string} type 
   * @param {WebDriver} driver
   */
  async setController(type: string) {
    const ctrls = {
      agent: '[data-test-subj="wzMenuAgents"]',
      overview: '[data-test-subj="wzMenuOverview"]'
    }
    
    const selector = ctrls[type];
    await this.clickButton(
      selector,
      `Unexpected error when load the controlle`,
      true
    );
  }

  async setTab() {
    const selector = this.tabs[this.tab];
    await this.clickButton(
      selector,
      `The tab is disabled or don't exists for the current context`
    );
  }

}


export class OverviewAutoReport extends AutoReport {

  constructor(report: Report) {
    super(report);
    this.tabs = {
      general: '[data-test-subj="overviewWelcomeGeneral"]',
      fim: '[data-test-subj="overviewWelcomeFim"]',
      aws: '[data-test-subj="overviewWelcomeAws"]',
      pm: '[data-test-subj="overviewWelcomePm"]',
      audit: '[data-test-subj="overviewWelcomeAudit"]',
      oscap: '[data-test-subj="overviewWelcomeOscap"]',
      ciscat: '[data-test-subj="overviewWelcomeCiscat"]',
      vuls: '[data-test-subj="overviewWelcomeVuls"]',
      virustotal: '[data-test-subj="overviewWelcomeVirustotal"]',
      osquery: '[data-test-subj="overviewWelcomeOsquery"]',
      docker: '[data-test-subj="overviewWelcomeDocker"]',
      pci: '[data-test-subj="overviewWelcomePci"]',
      gdpr: '[data-test-subj="overviewWelcomeGdpr"]',
    }
    this.availabeTab();
  }

  public async run(screenshot: (name: string, driver: WebDriver) => any) {
    try {
      this.driver = await this.createDriver();
      await this.openWazuh();
      await this.setController('overview');
      await this.setTab();
      await this.generateReport();
      await this.driver.sleep(30000);
      await screenshot('test-'+Date.now(), this.driver);
      await this.driver.quit();
      return 'Reporting success.\n';
    } catch (err) {
      await screenshot('error-'+Date.now(), this.driver);
      await this.driver.quit();
      return `${err}`;
    }
  }
}

export class AgentsAutoReport extends AutoReport {
  agent: number;
  constructor(agentReport: AgentReport) {
    super(agentReport);
    this.agent = agentReport.agent;
  }

}