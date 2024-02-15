import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'QuizWebPartStrings';
import Quiz from './components/Quiz';
import { IQuizProps } from './components/IQuizProps';

export interface IQuizWebPartProps {
  quizMasterListTitle: string;
  quizSubmissionListTitle: string;
  quizFeedbackListTitle: string;
}

export default class QuizWebPart extends BaseClientSideWebPart<IQuizWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    if (this.properties.quizMasterListTitle && this.properties.quizSubmissionListTitle) {
      const element: React.ReactElement<IQuizProps> = React.createElement(
        Quiz,
        {
          context: this.context,
          quizFeedbackListTitle: this.properties.quizFeedbackListTitle,
          quizMasterListTitle: this.properties.quizMasterListTitle,
          quizSubmissionListTitle: this.properties.quizSubmissionListTitle,
          isDarkTheme: this._isDarkTheme,
          environmentMessage: this._environmentMessage,
          hasTeamsContext: !!this.context.sdks.microsoftTeams,
          userDisplayName: this.context.pageContext.user.displayName
        }
      );

      ReactDom.render(element, this.domElement);
    }
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('quizMasterListTitle', {
                  label: strings.quizMaster
                }),
                PropertyPaneTextField('quizSubmissionListTitle', {
                  label: strings.quizResponses
                }),
                PropertyPaneTextField('quizFeedbackListTitle', {
                  label: strings.quizFeedback
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
