/*
 * Wazuh app - Integrity monitoring components
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCallOut,
  EuiHorizontalRule,
  EuiSpacer,
  EuiTitle,
  EuiIcon,
  EuiPopover,
  EuiButtonEmpty,
  EuiButton,
} from '@elastic/eui';
import '../../common/modules/module.scss';
import { updateGlobalBreadcrumb } from '../../../redux/actions/globalBreadcrumbActions';
import store from '../../../redux/store';
import { FilterHandler } from '../../../utils/filter-handler';
import { AppState } from '../../../react-services/app-state';
import { ReportingService } from '../../../react-services/reporting';
import { WAZUH_MODULES } from '../../../../common/wazuh-modules';
import { Events, Dashboard, Loader, Settings } from '../../common/modules';
import WzReduxProvider from '../../../redux/wz-redux-provider';
import { AgentInfo } from '../../common/welcome/agents-info';
import Overview from '../../wz-menu/wz-menu-overview';
import { MainFim } from '../../agents/fim';
import { MainSca } from '../../agents/sca';
import { MainMitre } from '../modules/main-mitre';
import { getAngularModule } from '../../../kibana-services';
import { withAgentSupportModule } from '../../../components/common/hocs';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { ModuleMitreAttackIntelligence } from '../../overview/mitre_attack_intelligence';
import { GitGubInventorySection } from '../../overview/github_audit_logs';

export class MainModuleAgent extends Component {
  props!: {
    [key: string]: any
  };
  state: {
    selectView: Boolean,
    loadingReport: Boolean,
    switchModule: Boolean,
    showAgentInfo: Boolean
  };
  reportingService: ReportingService;
  filterHandler: FilterHandler

  constructor(props) {
    super(props);
    this.reportingService = new ReportingService();
    this.filterHandler = new FilterHandler(AppState.getCurrentPattern());
    this.state = {
      selectView: false,
      loadingReport: false,
      switchModule: false,
      showAgentInfo: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.section !== this.props.section) {
      this.setGlobalBreadcrumb();
    }
  }

  setGlobalBreadcrumb() {
    let breadcrumb;
    if (this.props.section === 'welcome') {
      breadcrumb = [
        { text: '' },
        { text: 'Agents', href: '#/agents-preview' },
        { text: this.props.agent.id }
      ];
    } else {
      breadcrumb = [
        {
          text: '',
        },
        {
          text: 'Agents',
          href: "#/agents-preview"
        },
        { agent: this.props.agent },
        {
          text: WAZUH_MODULES[this.props.section].title,
          className: 'wz-global-breadcrumb-popover'
        },
      ];
    }
    store.dispatch(updateGlobalBreadcrumb(breadcrumb));
    $('#breadcrumbNoTitle').attr("title","");
  }

  async componentDidMount() {
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
    this.setGlobalBreadcrumb();
  }

  showAgentInfo() {
    const elem = document.getElementsByClassName('wz-module-body-main')[0];
    if (elem) {
      if (!this.state.showAgentInfo) {
        elem.classList.add("wz-module-body-main-double");
      } else {
        elem.classList.remove("wz-module-body-main-double");
      }
    }
    this.setState({ showAgentInfo: !this.state.showAgentInfo });
  }

  color = (status, hex = false) => {
    if (status.toLowerCase() === 'active') { return hex ? '#017D73' : 'success'; }
    else if (status.toLowerCase() === 'disconnected') { return hex ? '#BD271E' : 'danger'; }
    else if (status.toLowerCase() === 'never connected') { return hex ? '#98A2B3' : 'subdued'; }
  }

  async startReport() {
    this.setState({ loadingReport: true });
    const syscollectorFilters: any[] = [];
    const agent = (this.props.agent || store.getState().appStateReducers.currentAgentData || {}).id || false;
    if (this.props.section === 'syscollector' && agent) {
      syscollectorFilters.push(
        this.filterHandler.managerQuery(agent, true)
      );
      syscollectorFilters.push(
        this.filterHandler.agentQuery(agent)
      );
    }
    await this.reportingService.startVis2Png(
      this.props.section,
      agent,
      syscollectorFilters.length ? syscollectorFilters : null
    );
    this.setState({ loadingReport: false });
  }

  renderReportButton() {
    return (
      (this.props.section === 'syscollector' &&
        <EuiFlexItem grow={false} style={{ marginRight: 4, marginTop: 6 }}>
          <EuiButtonEmpty
            iconType="document"
            isLoading={this.state.loadingReport}
            onClick={async () => this.startReport()}>
            Generate report
          </EuiButtonEmpty>
        </EuiFlexItem>
      )
    );
  }

  renderTitle() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s" className="wz-module-header-agent-title-btn">
                  <h1>
                    <span
                      onClick={() => {
                        window.location.href = `#/agents?agent=${this.props.agent.id}`;
                        this.router.reload();
                      }}>
                      {/* <EuiIcon size="m" type="arrowLeft" color='primary' /> */}
                      <span>&nbsp;{this.props.agent.name}&nbsp;&nbsp;&nbsp;
                      </span>
                    </span>
                  </h1>
                </EuiTitle>
                {/*                 <EuiHealth style={{ paddingTop: 3 }} size="xl" color={this.color(this.props.agent.status)}>
                  {this.props.agent.status}
                </EuiHealth> */}
              </span>
            </EuiFlexItem>
            {/*             <EuiFlexItem grow={false} style={{ margin: '16px 0' }} className="wz-module-header-agent-title-btn">
              <EuiIcon type="iInCircle" color="primary" size="l" onClick={() => this.showAgentInfo()} />
            </EuiFlexItem> */}
            <EuiFlexItem grow={false} style={{ marginLeft: 0, marginTop: 7 }}>
              {/* {this.props.section && (
                <Fragment>
                  <EuiPopover
                    button={
                      <EuiButtonEmpty
                        onClick={() => this.setState({ switchModule: !this.state.switchModule })} style={{ cursor: 'pointer' }}
                        iconType="apps">
                        <span>Navigation&nbsp;<EuiIcon type='arrowDown'></EuiIcon></span>
                      </EuiButtonEmpty>
                    }
                    isOpen={this.state.switchModule}
                    closePopover={() => this.setState({ switchModule: false })}
                    repositionOnScroll={true}
                    anchorPosition="downLeft">
                    <div>
                      <WzReduxProvider>
                        <div style={{ maxWidth: 650 }}>
                          <Overview isAgent={this.props.agent} closePopover={() => this.setState({ switchModule: false })}></Overview>
                        </div>
                      </WzReduxProvider>
                      <EuiHorizontalRule margin="s" />
                      <EuiSpacer size='m' />
                      <EuiFlexGroup>
                        <EuiFlexItem grow={false} style={{ marginRight: 0, marginTop: 0 }}>
                          <EuiButton
                            onClick={() => {
                              this.props.cardsProps.switchTab('syscollector');
                              this.setState({ switchModule: false });
                            }}
                            iconType="inspect">
                            <span>Inventory data</span>
                          </EuiButton>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ marginTop: 0 }}>
                          <EuiButton
                            onClick={() => {
                              this.props.cardsProps.switchTab('configuration');
                              this.setState({ switchModule: false });
                            }}
                            iconType="gear" >
                            <span>Configuration</span>
                          </EuiButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </div>
                  </EuiPopover>
                </Fragment>
              )} */}
            </EuiFlexItem>
            <EuiFlexItem />
            {this.renderReportButton()}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  renderSettingsButton() {
    return (
      <EuiFlexItem grow={false} style={{ marginRight: 4, marginTop: 6 }}>
        <EuiButtonEmpty
          fill={this.state.selectView === 'settings' || undefined}
          iconType="wrench"
          onClick={() => this.onSelectedTabChanged('settings')}>
          Configuration
          </EuiButtonEmpty>
      </EuiFlexItem>
    );
  }

  render() {
    const { agent, section, selectView } = this.props;
    const title = this.renderTitle();
    return (
      <div className={this.state.showAgentInfo ? 'wz-module wz-module-showing-agent' : 'wz-module'}>
        <div className='wz-module-header-agent-wrapper'>
          <div className='wz-module-header-agent'>
            {title}
          </div>
        </div>
        {(agent && agent.os) &&
          <Fragment>
            <div className='wz-module-header-nav-wrapper'>
              <div className={this.props.tabs && this.props.tabs.length && 'wz-module-header-nav'}>
                {this.state.showAgentInfo &&
                  <div className={
                    !this.props.tabs || !this.props.tabs.length ?
                      "wz-welcome-page-agent-info" :
                      "wz-welcome-page-agent-info wz-welcome-page-agent-info-gray"}>
                    <AgentInfo agent={this.props.agent} isCondensed={false} hideActions={true} {...this.props}></AgentInfo>
                  </div>
                }
                {(this.props.tabs && this.props.tabs.length) &&
                  <div className="wz-welcome-page-agent-tabs">
                    <EuiFlexGroup>
                      {this.props.renderTabs()}
                      {(selectView === 'dashboard') &&
                        this.props.renderReportButton()
                      }
                      {(this.props.buttons || []).includes('dashboard') &&
                        this.props.renderDashboardButton()
                      }
                      {(this.props.buttons || []).includes('settings') &&
                        this.renderSettingsButton()
                      }
                    </EuiFlexGroup>
                  </div>
                }
              </div>
            </div>
            {!['syscollector', 'configuration'].includes(this.props.section) &&
              <ModuleTabViewer component={section} {...this.props}/>
            }
          </Fragment>
        }
        {(!agent || !agent.os) &&
          <EuiCallOut
            style={{ margin: '66px 16px 0 16px' }}
            title=" This agent has never connected"
            color="warning"
            iconType="alert">
          </EuiCallOut>
        }
      </div>
    );
  }
}



const mapStateToProps = state => ({
  agent: state.appStateReducers.currentAgentData
});

const ModuleTabViewer = compose(
  connect(mapStateToProps),
  withAgentSupportModule
)((props) => {
  const { section, selectView } = props;
  return <>
      {selectView === 'events' &&
        <Events {...props} />
      }
      {selectView === 'loader' &&
        <Loader {...props}
          loadSection={(section) => props.loadSection(section)}
          redirect={props.afterLoad}>
        </Loader>}
      {selectView === 'dashboard' &&
        <Dashboard {...props} />
      }
      {selectView === 'settings' &&
        <Settings {...props} />
      }


      {/* ---------------------MODULES WITH CUSTOM PANELS--------------------------- */}
      {section === 'fim' && selectView==='inventory' && <MainFim {...props} />}
      {section === 'sca' && selectView==='inventory' && <MainSca {...props} />}
      {section === 'mitre' && selectView === 'inventory' && <MainMitre {...props} />}
      {section === 'mitre' && selectView === 'intelligence' && <ModuleMitreAttackIntelligence {...props} />}
      {section === 'github' && selectView === 'inventory' && <GitGubInventorySection {...props} />}
      {/* {['pci', 'gdpr', 'hipaa', 'nist', 'tsc'].includes(section) && selectView === 'inventory' && <ComplianceTable {...props} goToDiscover={(id) => props.onSelectedTabChanged(id)} />} */}
      {/* -------------------------------------------------------------------------- */}
    </>
})