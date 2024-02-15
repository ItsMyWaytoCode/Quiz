import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IQuizProps {
  context:WebPartContext;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  quizMasterListTitle: string;
  quizFeedbackListTitle: string;
  quizSubmissionListTitle: string;
}
