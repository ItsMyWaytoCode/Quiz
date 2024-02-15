import * as React from "react";
import { IResultComponentProps } from "./IResultComponentProps";

export default class ResultComponent extends React.Component<IResultComponentProps, {}> {

    public render(): React.ReactElement<IResultComponentProps> {
        let resultObj = this.props.resultObj ? this.props.resultObj : [];
        let questions = this.props.questions;
        return (
            <React.Fragment>
                <div className="row"><div className="col-md-12"><h4>Final Result</h4></div></div>
                <div className="row">
                    {
                        questions.map((v: any, i: any) => {
                            return <div className="col-md-6" style={{ marginTop: '5px' }}>
                                <div className="col-md-2">
                                    {resultObj[v["Question"]] && <div className={resultObj[v["Question"]]['isValidAnswer'] ? 'circle right-answer' : 'circle wrong-answer'}>{v["Sequence"]}</div>}
                                    {!resultObj[v["Question"]] && <div className={'circle wrong-answer'}>{v["Sequence"]}</div>}
                                </div>
                                <div className="col-md-10">{
                                    v["Question"]
                                }</div>
                            </div>;
                        })
                    }
                </div>

            </React.Fragment>
        )
    }
}