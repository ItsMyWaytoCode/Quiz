import * as React from "react";
import { ICommonComponentProps } from "./ICommonComponentProps";
import { Checkbox, Dropdown, TextField, ChoiceGroup, IComboBoxOption, IComboBox } from "office-ui-fabric-react";
import { ICommonComponentState } from "./ICommonComponentState";
import { ComboBox } from "@fluentui/react";
export default class CommonComponent extends React.Component<ICommonComponentProps, ICommonComponentState> {
    constructor(props: ICommonComponentProps, state: ICommonComponentState) {
        super(props);
        this.state = {
            item: {}
        }
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
        this.props.updateMyResponse(event.target.value);
        this.setState({ item: item });
        console.log("---From text change---");
        console.log(item);
    }
    public OnDropDownChange(optSelectedOptions: any, eventData: any) {

        let item = this.state.item;
        try {
            item[eventData.fieldtitle] = optSelectedOptions.key;
        }
        catch (ex) {
            console.log(ex);
            console.trace(ex);
        }

        this.props.updateMyResponse(optSelectedOptions.key);
        this.setState({ item: item }, () => {

        });
        console.log("---From text change---");
        console.log(item);
    }
    public _onCheckBoxChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean, fieldName: string) {
        let item = this.state.item;
        item[fieldName] = isChecked;
        this.props.updateMyResponse(isChecked);
        this.setState({ item: item })


    }
    public onChoiceChange(ev: React.FormEvent<HTMLInputElement>, option: any, fieldTitle: string): void {
        let item = this.state.item;
        item[fieldTitle] = option.key;
        this.props.updateMyResponse(option.key);
        this.setState({ item: item })
    }
    public onComboChange(ev: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string, question?: any): void {
        let selected = option?.selected;
        let item = this.state.item;

        if (option) {
            if (!item[question["Question"]]) {
                item[question["Question"]] = [];
            }
            if (selected) {
                item[question["Question"]] = [...item[question["Question"]], option!.key as string]
            }
            else {
                item[question["Question"]] = item[question["Question"]].filter((k: any) => { return k !== option!.key })
            }

        }
        this.props.updateMyResponse(item[question["Question"]]);
        this.setState({ item: item });

    }
    public renderSwitchCase(): any {
        let questionItem = this.props.questionItem;
        let item = this.state.item;
        //let fieldInfo = questionItem.fieldInfo;
        switch (questionItem["QuestionType"]) {
            case "Text": return <div className="row">
                <div className="col-sm-12  mt-3">
                    <div className="form-group">
                        <label id={'Question' + questionItem["Id"]} className="mr-2">
                            <span className='pull-left'>{questionItem["Question"]}</span>
                        </label>
                    </div>
                </div>
                <div className="col-sm-12  mt-3">
                    <TextField key={questionItem["Id"]}  aria-describedby={'Response' + questionItem["Id"]} title={'Response' + questionItem["Id"]} value={item[questionItem["Question"]]} onChange={(event) => this.handleTextFieldChange(event, { fieldtitle: questionItem["Question"] })} />
                </div>
            </div>;
            case "Multi Line": return <div className="row">
                <div className="col-sm-12  mt-3">
                    <div className="form-group">
                        <label id={'Question' + questionItem["Id"]} className="mr-2">
                            <span className='pull-left'>{questionItem["Question"]}</span>
                        </label>
                    </div>
                </div>
                <div className="col-sm-12  mt-3">
                    <textarea key={questionItem["Id"]} rows={12} cols={110} value={item[questionItem["Question"]]} onChange={(controlValue) => this.handleTextFieldChange(controlValue, { fieldtitle: questionItem["Question"] })} ></textarea>
                </div>

            </div>;
            case "CheckBox": return <div className="form-group">
                <label id={'Question' + questionItem["Id"]} className="mr-2">
                    <span className='pull-left'>{questionItem["Question"]}</span>
                </label>
                <Checkbox key={questionItem["Id"]}  checked={item[questionItem["Question"]]} title={questionItem["Question"]} onChange={(e: any, checked: any) => this._onCheckBoxChange(e, checked, questionItem["Title"])} />
            </div>;
            case "Radio": return <div className="form-group">
                <label id={'Question' + questionItem["Id"]} className="mr-2">
                    <span className='pull-left'>{questionItem["Question"]}</span>
                </label>
                <ChoiceGroup key={questionItem["Id"]} 
                    id={'Response' + questionItem["Id"]}
                    name={'Response' + questionItem["Id"]}
                    options={questionItem['Choices'] ? questionItem['Choices'] : []}
                    onChange={(ev: React.FormEvent<HTMLInputElement>, option: any) => this.onChoiceChange(ev, option, questionItem["Question"])}
                    selectedKey={item[questionItem["Question"]]}
                />
            </div>;
            case "Choices": return <div className="form-group">
                <label id={'Question' + questionItem["Id"]} className="mr-2">
                    <span className='pull-left'>{questionItem["Question"]}</span>
                </label><Dropdown key={questionItem["Id"]} 
                    placeHolder=""
                    options={questionItem['Choices'] ? questionItem['Choices'] : []}
                    selectedKey={item[questionItem["Question"]]}
                    onChanged={(optSelectedOptions, event) => this.OnDropDownChange(optSelectedOptions, { fieldtitle: questionItem["Question"] })}
                /></div>;
            case "MultiCheckBox": return <div className="form-group">
                <label id={'Question' + questionItem["Id"]} className="mr-2">
                    <span className='pull-left'>{questionItem["Question"]}</span>
                </label>
                <ComboBox key={questionItem["Id"]} 
                    defaultSelectedKey="C"
                    multiSelect
                    options={questionItem['Choices'] ? questionItem['Choices'] : []}
                    onChange={(ev: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => this.onComboChange(ev, option, index, value, questionItem)}
                />
            </div>;
            default: return <></>
        }

    }
    public render(): React.ReactElement<ICommonComponentProps> {

        return (
            <React.Fragment >

                {this.renderSwitchCase()}

            </React.Fragment >
        );
    }
}