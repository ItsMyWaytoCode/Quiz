import * as React from "react";
import { IResultComponentProps } from "./IResultComponentProps";
import { IFeedBackProps } from "./IFeedBackProps";

export default class Feedback extends React.Component<IFeedBackProps, { myRatings: any }> {
    constructor(props: IFeedBackProps, state: { myRatings: any }) {
        super(props);
        this.state = {
            myRatings: {}
        }
    }
    public logMyRating(question: any, rating: any) {
        let myRatings = this.state.myRatings;
        myRatings[question] = rating;
        this.props.updateParent(myRatings);
        this.setState({ myRatings: myRatings });

    }

    public render(): React.ReactElement<IResultComponentProps> {
        let feedBackQuestions: any = [
            "What will be level of exam?",
            "Did you understood the questions?",
            "What level of improvements required?"
        ];
        let ratings: any = [1, 2, 3, 4, 5];
        let myRatings: any = this.state.myRatings;
        return (
            <React.Fragment>
                <div className="row"><div className="col-md-12"><h4>Feedback</h4></div></div>
                <p>Please note: 5 will be the Highest and 1 will be Lowest</p>
                {
                    feedBackQuestions.map((v: any, i: any) => {
                        return <div className="row mt-5">
                            <div className="col-md-6">
                                <h4>{v}</h4>
                            </div>
                            <div className="col-md-6">
                                {
                                    ratings.map((rateItem: any, i: any) => {

                                        return <div className="col-md-2"><div style={{ cursor: "pointer" }} onClick={() => this.logMyRating(v, rateItem)} className={myRatings[v] == rateItem ? "circle black-circle" : "circle white-circle"}>{rateItem}</div></div>
                                    })
                                }
                            </div>
                        </div>
                    })
                }

            </React.Fragment>
        )
    }
}