import * as React from 'react';
import styles from './Quiz.module.scss';
import type { IQuizProps } from './IQuizProps';
import { SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse } from '@microsoft/sp-http';
import { IQuizState } from './IQuizState';
import { TextField } from '@fluentui/react';
import CommonComponent from './ReusableComponent/CommonComponent';
import { spfi, SPFx } from "@pnp/sp";
import '@pnp/sp/presets/all';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import * as moment from 'moment';
import ResultComponent from './ResultComponent';
import Feedback from './FeedBack';
export default class Quiz extends React.Component<IQuizProps, IQuizState> {
  public constructor(props: IQuizProps, state: IQuizState) {

    super(props);
    this.state = {
      item: {
        ExamTakenOn: moment().format('MM/DD/yyyy')
      },
      questions: [],
      showFeedBack: false,
      data: {
        fieldInfo: {},
        activeScreen: -1,
        userInformation: {
          quizStartTime: null,
          quizEndTime: null
        },
        isSubmitted: false,
        showFeedback: false,
        isFeedBackSubmitted: false,
        responseJSON: {}
      }
    }
  }
  public componentDidMount() {
    const sp = spfi().using(SPFx(this.props.context));
    //let item = this.state.item;
    SPComponentLoader.loadCss("https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css");
    let promises = [];
    const spOpts: ISPHttpClientOptions = {
      method: "GET",
      mode: "no-cors",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      }
    };


    promises.push(
      this.props.context.spHttpClient.get(`https://timeapi.io/api/Time/current/zone?timeZone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`, SPHttpClient.configurations.v1, spOpts)
        .then((response: SPHttpClientResponse) => {
          return response.json();

        }).then((timeData: any) => {
          debugger;
        }).catch((e) => {
          debugger;
        })

    );



    sp.web.lists.getByTitle(this.props.quizMasterListTitle).items().then((masterQuestions) => {
      if (masterQuestions && masterQuestions.length > 0) {

        masterQuestions.forEach((v, i) => {
          if (v['Options']) {
            if (v['QuestionType'] == "MultiCheckBox" || v['QuestionType'] == 'Choices' || v['QuestionType'] == "Radio") {
              let choices = v['Options'].split(';');
              v["Choices"] = choices.filter((c: any, i: any) => {
                if (String(c).trim() != '')
                  return c;
              }).map((c: any, i: any) => {
                return {
                  key: c, text: c
                }
              });
            }
          }
        })


        this.setState({ questions: [...masterQuestions] })
      }
    }).catch((ex) => {
      console.log(ex);
    })
  }
  public createResponse() {
    let item = this.state.item;
    const sp = spfi().using(SPFx(this.props.context));
    sp.web.lists.getByTitle(this.props.quizSubmissionListTitle).items.add(item).then((createdResponse) => {
      if (createdResponse) {
        this.setState({ showFeedBack: true })
      }
    }).catch((ex) => {
      console.log(ex);
    })
  }
  public handleTextFieldChange(event: any, eventData?: any) {
    let item = this.state.item;
    try {
      item[eventData.fieldtitle] = event.target.value;
    }
    catch (ex) {
      console.log(ex);
      console.trace(ex);
    }
    
    this.setState({ item: item });
    console.log("---From text change---");
    console.log(item);
  }
  //Method is used to handle multi line text change  data and update the state variable
  public handleMultiTextFieldChange(event: any, eventData?: any) {

    let item = this.state.item
    try {
      item[eventData.fieldtitle] = event.target.value;



    }
    catch (ex) {
      console.log(ex);
      console.trace(ex);
    }
    this.setState({ item: item });
    console.log("---From text change---");
    console.log(item);
  }
  public handleSelectLeave(eventData: any, selectedLeave: any) {

    let item = this.state.item;
    item[eventData.fieldtitle] = selectedLeave;



    this.setState({ item: item });
  }
  public updateMyResponse(response: any) {
    let data = this.state.data;
    let questions = this.state.questions;
    let responseJSON = data["responseJSON"];
    let qDetails = questions[data["activeScreen"]];
    if (qDetails) {
      let isValidAnswer = false;
      if (qDetails['QuestionType'] == "MultiCheckBox" || qDetails['QuestionType'] == 'Choices' || qDetails['QuestionType'] == "Radio") {
        let answers = qDetails["Answer"] ? qDetails["Answer"].split(';').filter((an: string) => { if (an != "") return true; }) : [];
        isValidAnswer = true;
        answers.forEach((element: any) => {
          if (response.indexOf(element) == -1) {
            isValidAnswer = false;
          }
        });


      }
      else {
        isValidAnswer = qDetails["Answer"] == response;
      }
      responseJSON[qDetails["Question"]] = {
        isValidAnswer: isValidAnswer,
        qNo: qDetails["Sequence"],
        myResponse: response
      }
    }
    let totalScore = 0;
    questions.forEach((element: any) => {
      if (responseJSON[element["Question"]] && responseJSON[element["Question"]].isValidAnswer) {
        totalScore += parseInt(element["Marks"]);
      }
    });
    data['totalScore'] = totalScore;
    data["responseJSON"] = responseJSON;
    this.setState(({ data: data }));

  }
  public StartQuiz() {
    let data = this.state.data;
    data["activeScreen"] = 0;
    this.setState(({ data: data }));
  }
  public NavigateToPrevQuestion() {
    let data = this.state.data;
    data["activeScreen"] = data["activeScreen"] - 1;
    this.setState(({ data: data }));
  }
  public NavigateToNextQuestion() {
    let data = this.state.data;
    data["activeScreen"] = data["activeScreen"] + 1;
    this.setState(({ data: data }));
  }
  public SubmiQuiz() {
    let data = this.state.data;
    let item = this.state.item;
    item['Score'] = data['totalScore'];
    item['QuizResponse'] = data["responseJSON"] ? JSON.stringify(data["responseJSON"]) : "";

    const sp = spfi().using(SPFx(this.props.context));
    sp.web.lists.getByTitle(this.props.quizSubmissionListTitle).items.add(item).then((response: any) => {
      if (response.item) {
        alert("Thanks for your valuable feedback");
        data["isSubmitted"] = true;
        this.setState({ data: data });
      }
    })



  }
  public ShowFeedBack() {
    let data = this.state.data;
    data["showFeedback"] = true;
    this.setState({ data: data });
  }
  public UpdateFeedBackRatings(ratings: any) {
    let data = this.state.data;
    data['ratings'] = ratings;
    this.setState({ data: data });
  }
  public SubmitFeedBack() {
    let data = this.state.data;
    const sp = spfi().using(SPFx(this.props.context));
    let item: any = {};
    item["Answer"] = JSON.stringify(data['ratings'] ? data['ratings'] : {});
    item["SubmittedBy"] = this.state.item["Name"];
    sp.web.lists.getByTitle(this.props.quizFeedbackListTitle).items.add(item).then((response: any) => {
      if (response.item) {
        alert("Thanks for your valuable feedback");
        data["isFeedBackSubmitted"] = true;
        this.setState({ data: data });
      }
    })

  }

  public render(): React.ReactElement<IQuizProps> {
    const {
      hasTeamsContext,

    } = this.props;
    let item = this.state.item;
    let questions = this.state.questions;
    let data = this.state.data;
    let activeScreen = data.activeScreen;
    let isSubmitted = data.isSubmitted;
    let showFeedback = data.showFeedback;
    return (

      <section className={`${styles.quiz} ${hasTeamsContext ? styles.teams : ''}`} style={{ background: "lightgray" }}>

        {activeScreen == -1 && !isSubmitted && <section className='questions'>
          <div className='row'>
            <div className="col-sm-12">
              This Quiz is to validate you on SPFx. This quiz covers basic concepts of SPFx
              <p></p>
            </div>
          </div>


          <div className='row mt-3'>
            <div className="col-sm-12">
              <h4>Personal Details</h4>
            </div>
          </div>
          <div className='row mt-3'>
            <div className="col-sm-6">
              <div className="form-group">
                <label id="ExamTakenOn" className="mr-2">
                  <span className='pull-left'>Exam Taken On</span>
                </label>
                <TextField aria-describedby="ExamTakenOn" title="ExamTakenOn" readOnly={true} value={item["ExamTakenOn"]} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label id="EmployeeNo" className="mr-2">
                  <span className='pull-left'>Employee No</span>
                </label>
                <TextField aria-describedby="EmployeeNo" title="Employee No" value={item["EmployeeNo"]} onChange={(event) => this.handleTextFieldChange(event, { fieldtitle: 'EmployeeNo' })}/>
              </div>
            </div>
          </div>
          <div className='row mt-3'>
            <div className="col-sm-6">
              <div className="form-group">
                <label id="Name" className="mr-2">
                  <span className='pull-left'>Name</span>
                </label>
                <TextField aria-describedby="Name" title="Employee Name" value={item["Name"]} onChange={(event) => this.handleTextFieldChange(event, { fieldtitle: 'Name' })}/>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-group">
                <label id="Department" className="mr-2">
                  <span className='pull-left'>Department</span>

                </label>
                <TextField aria-describedby="Department" title="Department" value={item["Department"]} onChange={(event) => this.handleTextFieldChange(event, { fieldtitle: 'Department' })}/>

              </div>
            </div>
          </div>
          <div className='row mt-3'>
            <div className="col-sm-6">
              <div className="form-group">
                <label id="EmployeeManager" className="mr-2">
                  <span className='pull-left'>Direct Manager</span>

                </label>
                <TextField aria-describedby="EmployeeManager" title="Manager" value={item["EmployeeManager"]} onChange={(event) => this.handleTextFieldChange(event, { fieldtitle: 'EmployeeManager' })}/>

              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-group">
                <label id="MobileNo" className="mr-2">
                  <span className='pull-left'>Mobile No</span>
                </label>
                <TextField aria-describedby="MobileNo" title="MobileNo" value={item["MobileNo"]} onChange={(event) => this.handleTextFieldChange(event, { fieldtitle: 'MobileNo' })}/>
              </div>
            </div>
          </div>
        </section>}

        {activeScreen != -1 && !isSubmitted && <section className='questions'>
          <div className='row'>
            <div className="col-sm-12">
              <h4>SPFx Quiz</h4>
            </div>
          </div>
          {
            <div className="row mt-3" style={{ margin: "10px" }}>
              <CommonComponent questionItem={questions[activeScreen]} updateMyResponse={(response) => this.updateMyResponse(response)} />
            </div>
          }

        </section>
        }

        {!isSubmitted && <div className='row mt-5 Container-bottom'>
          <div className='col-sm-6'></div>
          {activeScreen == -1 && <div className='col-sm-6'>
            <DefaultButton text="Start Quiz" className='pull-right' onClick={() => this.StartQuiz()} />
          </div>}
          {activeScreen != -1 && <div className='col-sm-6'>
            <div className='pull-right'>
              {activeScreen != 0 && <DefaultButton text="Prev" onClick={() => this.NavigateToPrevQuestion()} />}&nbsp;
              {activeScreen != questions.length - 1 && <DefaultButton text="Next" onClick={() => this.NavigateToNextQuestion()} />}
              {activeScreen == questions.length - 1 && <PrimaryButton text='Submit Quiz' onClick={() => this.SubmiQuiz()} />}
            </div>
          </div>}
        </div>}

        {
          isSubmitted && !showFeedback &&
          <section className='questions'>
            <ResultComponent resultObj={data['responseJSON']} isPassed={true} score={data["totalScore"]} questions={questions} />
          </section>

        }
        {
          isSubmitted && !showFeedback && <div className="row">
            <div className='col-sm-12'>
              <div className='pull-right'>
                <h3> You are with the score <span className={true ? 'circle right-answer' : 'circle wrong-answer'}>{data["totalScore"] ? data["totalScore"] : 0}</span></h3>
              </div>
            </div>
            <div className='col-sm-12'>
              <div className='pull-right'>
                <PrimaryButton text='Feedback' onClick={() => this.ShowFeedBack()} />
              </div>
            </div>
          </div>
        }
        {
          showFeedback &&
          <section className='questions'>
            <Feedback updateParent={(ratings) => this.UpdateFeedBackRatings(ratings)} />
          </section>

        }
        {
          showFeedback && <div className="row">

            <div className='col-sm-12'>
              <div className='pull-right'>
                <PrimaryButton disabled={data['isFeedBackSubmitted']} text='Submit Feedback' onClick={() => this.SubmitFeedBack()} />
              </div>
            </div>
          </div>
        }

      </section>
    );
  }
}
