import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import type { StoresProps } from '../../../@types/ferdium-components.types';
import workspaceActions from '../actions';
import { getUserWorkspacesRequest } from '../api';
import { workspaceStore } from '../index';
import type Workspace from '../models/Workspace';
import WorkspaceDrawerItem from './WorkspaceDrawerItem';

const messages = defineMessages({
  headline: {
    id: 'workspaceDrawer.headline',
    defaultMessage: 'Workspaces',
  },
  allServices: {
    id: 'workspaceDrawer.allServices',
    defaultMessage: 'All services',
  },
  workspacesSettingsTooltip: {
    id: 'workspaceDrawer.workspacesSettingsTooltip',
    defaultMessage: 'Edit workspaces settings',
  },
  workspaceFeatureInfo: {
    id: 'workspaceDrawer.workspaceFeatureInfo',
    defaultMessage:
      '<p>Ferdium Workspaces let you focus on what’s important right now. Set up different sets of services and easily switch between them at any time.</p><p>You decide which services you need when and where, so we can help you stay on top of your game - or easily switch off from work whenever you want.</p>',
  },
  addNewWorkspaceLabel: {
    id: 'workspaceDrawer.addNewWorkspaceLabel',
    defaultMessage: 'Add new workspace',
  },
});

const styles = theme => ({
  drawer: {
    background: theme.workspaces.drawer.background,
    width: theme.workspaces.drawer.width,
    transition: 'transform 0.2s ease',
    display: 'flex',
    height: theme.workspaces.drawer.height,
    position: 'absolute',
    zIndex: 200,
    borderTop: `1px solid ${theme.workspaces.drawer.border}`,
    borderBottom: `1px solid ${theme.workspaces.drawer.border}`,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    transform() {
      return workspaceStore.isWorkspaceDrawerOpen
        ? 'translateY(0px) !important'
        : 'inherit';
    },
  },
  headline: {
    fontSize: '24px',
    marginTop: '38px',
    marginBottom: '25px',
    marginLeft: theme.workspaces.drawer.padding,
  },
  workspacesSettingsButton: {
    float: 'right',
    marginRight: theme.workspaces.drawer.padding,
    marginTop: '2px',
  },
  workspacesSettingsButtonIcon: {
    fill: theme.workspaces.drawer.buttons.color,
    '&:hover': {
      fill: theme.workspaces.drawer.buttons.hoverColor,
    },
  },
  workspaces: {
    flex: 1,
    height: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    padding: 6,
    gap: 6,
  },
  addNewWorkspaceLabel: {
    height: 'auto',
    color: theme.workspaces.drawer.buttons.color,
    margin: [40, 0],
    textAlign: 'center',
    '& > svg': {
      fill: theme.workspaces.drawer.buttons.color,
    },
    '& > span': {
      fontSize: '13px',
      marginLeft: 10,
      position: 'relative',
      top: -3,
    },
    '&:hover': {
      color: theme.workspaces.drawer.buttons.hoverColor,
      '& > svg': {
        fill: theme.workspaces.drawer.buttons.hoverColor,
      },
    },
  },
});

interface IProps
  extends WithStylesProps<typeof styles>,
    WrappedComponentProps,
    StoresProps {
  getServicesForWorkspace: (workspace: Workspace | null) => string[];
}

@inject('stores')
@observer
class WorkspaceDrawer extends Component<IProps> {
  componentDidMount(): void {
    try {
      getUserWorkspacesRequest.execute();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  render(): ReactElement {
    const { classes, getServicesForWorkspace } = this.props;
    const { intl } = this.props;
    const { activeWorkspace, isSwitchingWorkspace, nextWorkspace, workspaces } =
      workspaceStore;
    const actualWorkspace = isSwitchingWorkspace
      ? nextWorkspace
      : activeWorkspace;

    const { settings } = this.props.stores;

    const { hideAllServicesWorkspace } = settings.all.app;

    return (
      <div className={`${classes.drawer} workspaces-drawer`}>
        <div className={classes.workspaces}>
          {!hideAllServicesWorkspace && (
            <WorkspaceDrawerItem
              name={intl.formatMessage(messages.allServices)}
              onClick={() => {
                workspaceActions.deactivate();
                workspaceActions.toggleWorkspaceDrawer();
              }}
              services={getServicesForWorkspace(null)}
              isActive={actualWorkspace == null}
              shortcutIndex={0}
            />
          )}
          {workspaces.map((workspace, index) => (
            <WorkspaceDrawerItem
              key={workspace.id}
              name={workspace.name}
              isActive={actualWorkspace === workspace}
              onClick={() => {
                if (actualWorkspace === workspace) {
                  return;
                }
                workspaceActions.activate({ workspace });
                workspaceActions.toggleWorkspaceDrawer();
              }}
              onContextMenuEditClick={() =>
                workspaceActions.edit({ workspace })
              }
              services={getServicesForWorkspace(workspace)}
              shortcutIndex={index + 1}
            />
          ))}
        </div>

        {/* <span
          className={classes.workspacesSettingsButton}
          onKeyDown={noop}
          onClick={() => {
            workspaceActions.openWorkspaceSettings();
          }}
          data-tooltip-id="tooltip-workspaces-drawer"
          data-tooltip-content={intl.formatMessage(
            messages.workspacesSettingsTooltip,
          )}
        >
          <Icon
            icon={mdiCog}
            size={1.5}
            className={classes.workspacesSettingsButtonIcon}
          />
        </span> */}

        <ReactTooltip
          id="tooltip-workspaces-drawer"
          place="right"
          variant="dark"
          style={{ height: 'auto', zIndex: 210 }}
        />
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WorkspaceDrawer),
);
