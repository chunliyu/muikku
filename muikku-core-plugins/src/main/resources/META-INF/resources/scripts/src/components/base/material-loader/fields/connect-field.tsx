import * as React from "react";
import { shuffle } from "~/util/modifiers";
import Draggable from "~/components/general/draggable";
import equals = require("deep-equal");
import { i18nType } from "~/reducers/base/i18n";
import FieldBase from "./base";

interface FieldType {
  name: string,
  text: string
}

interface ConnectFieldProps {
  type: string,
  content: {
    name: string,
    fields: FieldType[],
    counterparts: FieldType[],
    connections: {
      field: string,
      counterpart: string
    }[]
  },
  
  readOnly?: boolean,
  initialValue?: string,
  onChange?: (context: React.Component<any, any>, name: string, newValue: any)=>any,
  i18n: i18nType,
      
  displayCorrectAnswers?: boolean,
  checkAnswers?: boolean,
  onAnswerChange?: (name: string, value: boolean)=>any
}

interface ConnectFieldState {
  fields: FieldType[],
  counterparts: FieldType[],
  selectedField: FieldType,
  selectedIsCounterpart: boolean,
  selectedIndex: number,
  editedIds: Set<string>,
  
  //This state comes from the context handler in the base
  //We can use it but it's the parent managing function that modifies them
  //We only set them up in the initial state
  modified: boolean,
  synced: boolean,
  syncError: string,
  
  //we check whether each pair passed or failed
  //there is no unknown state here
  answerState: Array<"PASS" | "FAIL">
}

export default class ConnectField extends FieldBase<ConnectFieldProps, ConnectFieldState> {
  constructor(props: ConnectFieldProps){
    super(props);
    
    //we need to prepare the initial state
    //this is for the fields
    let fields:FieldType[];
    //and the counterparts
    let counterparts:FieldType[];
    //the fields that have been edited, sadly we don't know from the start
    //but I leave in here just in case
    let editedIdsArray:Array<string> = [];
    
    //so if we got an initial value
    if (props.initialValue){
      //we parse the initial value given
      let value = JSON.parse(props.initialValue);
      //let get the fields from the content
      fields = props.content.fields;
      //and the counterparts
      counterparts = [];
      
      //and now we match the counterpart with the fields as given by the initial value
      fields.forEach((field)=>{
        let counterpartId = value[field.name];
        counterparts.push(props.content.counterparts.find((c)=>c.name === counterpartId))
      });
    } else {
      //otherwise we just shuffle the thing
      counterparts = shuffle(props.content.counterparts);
      fields = props.content.fields;
    }
    
    //set the state
    this.state = {
      fields,
      counterparts,
      selectedField: null,
      selectedIsCounterpart: false,
      selectedIndex: null,
      editedIds: new Set(editedIdsArray),
      
      //modified synced and syncerror are false, true and null by default
      modified: false,
      synced: true,
      syncError: null,
      answerState: null
    }
    
    this.swapField = this.swapField.bind(this);
    this.swapCounterpart = this.swapCounterpart.bind(this);
    this.pickField = this.pickField.bind(this);
    this.cancelPreviousPick = this.cancelPreviousPick.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
  }
  shouldComponentUpdate(nextProps: ConnectFieldProps, nextState: ConnectFieldState){
    return !equals(nextProps.content, this.props.content) || this.props.readOnly !== nextProps.readOnly || !equals(nextState, this.state)
    || this.props.i18n !== nextProps.i18n || this.props.displayCorrectAnswers !== nextProps.displayCorrectAnswers || this.props.checkAnswers !== nextProps.checkAnswers;
  }
  triggerChange(){
    //whenever we get a change, check for rightness
    this.checkAnswers();
    
    //if there is no onchange function then return
    //there is no bussiness with the next code
    if (!this.props.onChange){
      return;
    }
    
    //so we create the new value
    let newValue:any = {};
    //get the fields and create the object
    this.state.fields.forEach((field, index)=>{
      let counterpart = this.state.counterparts[index];
      newValue[field.name] = counterpart.name;
    });
    //and trigger the change
    this.props.onChange(this, this.props.content.name, JSON.stringify(newValue));
  }
  checkAnswers(){
    //if we are not allowed to check for rightness then return
    if (!this.props.checkAnswers){
      return;
    }
    
    //so now we got to assess each change
    let newanswerState:Array<"PASS" | "FAIL"> = this.state.fields.map((field, index)=>{
      //ge thte counterpart from the same index
      let counterpart = this.state.counterparts[index];
      //check whether the connection matches
      let connection = this.props.content.connections.find(connection=>connection.field === field.name);
      //and return pass or fail
      return connection && connection.counterpart === counterpart.name ? "PASS" : "FAIL";
    });
    
    //if the new state does not equal the current set the state
    if (!equals(newanswerState, this.state.answerState)){
      this.setState({
        answerState: newanswerState
      });
    }
    
    //check whether it is right
    let isCorrect = newanswerState.includes("FAIL");
    //if we don't have a answer state
    if (!this.state.answerState){
      //then send it thru
      this.props.onAnswerChange(this.props.content.name, isCorrect);
      return;
    }
    
    //otherwise lets check which one was the previous
    let wasCorrect = !this.state.answerState.includes("FAIL");
    //and update in a way where it matters if it changed
    if (isCorrect && !wasCorrect){
      this.props.onAnswerChange(this.props.content.name, true);
    } else if (!isCorrect && wasCorrect){
      this.props.onAnswerChange(this.props.content.name, false);
    }
  }
  componentDidMount(){
    this.checkAnswers();
  }
  componentDidUpdate(prevProps: ConnectFieldProps, prevState: ConnectFieldState){
    this.checkAnswers();
  }
  //swapping the fields
  swapField(fielda: FieldType, fieldb: FieldType){
    //if the same then it's pointless
    if (fielda.name === fieldb.name){
      return;
    }
    
    //basically just swapping the fields from the state
    this.setState({
      fields: this.state.fields.map(f=>{
        if (f.name === fielda.name){
          return fieldb;
        } else if (f.name === fieldb.name){
          return fielda
        }
        return f;
      })
    }, this.triggerChange)
  }
  //swapping two counterparts, same as fields
  swapCounterpart(fielda: FieldType, fieldb: FieldType){
    if (fielda.name === fieldb.name){
      return;
    }
    this.setState({
      counterparts: this.state.counterparts.map(f=>{
        if (f.name === fielda.name){
          return fieldb;
        } else if (f.name === fieldb.name){
          return fielda
        }
        return f;
      })
    }, this.triggerChange)
  }
  //ok so this is about picking a field, whether it is counterpart or not, and the index it is in
  //I could've found the index it is in, by searching, but I am lazy
  //and I want it in the function
  pickField(field: FieldType, isCounterpart: boolean, index: number){
    //if by the time this function runs there is no selected field
    //then we just set the state that this one is the first selected
    //And we got no bizness to do
    if (!this.state.selectedField){
      this.setState({
        selectedField: field,
        selectedIsCounterpart: isCounterpart,
        selectedIndex: index
      });
      return;
    }
    
    //otherwise let get the editedIds
    let editedIds = new Set(this.state.editedIds);
    
    //lets check for the new field name and make sure that is not the same as the selected
    if (field.name !== this.state.selectedField.name){
      //if the selected is counterpart and this one is counterpart
      //then we need to swap two counterparts
      if (this.state.selectedIsCounterpart && isCounterpart){
        //we swap them
        this.swapCounterpart(this.state.selectedField, field);
        
        //however we need to figure out for the edited things
        //the opposite of the 
        let diametricOpposite = this.state.fields[this.state.selectedIndex];
        //we remove it
        editedIds.delete(diametricOpposite.name);
        //we also remove the one that we currently selected
        //that's because it is the place we are forcing it to take
        editedIds.delete(field.name);
        
        //now we get the opposite of the current
        let opposite = this.state.fields[index];
        //and we add it
        editedIds.add(opposite.name);
        //we also add the field that we moved to the new place
        editedIds.add(this.state.selectedField.name);
        
      //Otherwise if we are doing a field field swap
      } else if (!this.state.selectedIsCounterpart && !isCounterpart){
        //we do basically the same as before but in the opposite way
        this.swapField(this.state.selectedField, field);
        
        let diametricOpposite = this.state.counterparts[this.state.selectedIndex];
        editedIds.delete(diametricOpposite.name);
        editedIds.delete(field.name);
        
        let opposite = this.state.counterparts[index];
        editedIds.add(opposite.name);
        editedIds.add(this.state.selectedField.name);
      } else {
        //otherwise in the most complicated way
        //we need the counterpart
        let counterpart:FieldType = this.state.selectedIsCounterpart ? this.state.selectedField : field;
        //the counterpart index
        let counterpartIndex:number = this.state.selectedIsCounterpart ? this.state.selectedIndex : index;
        //the field index
        let givenFieldIndex:number = !this.state.selectedIsCounterpart ? this.state.selectedIndex : index;
        //the opposite of the field (which is a counterpart)
        let opposite = this.state.counterparts[givenFieldIndex];
        //and the opposite of the counterpart (which is a field)
        let diametricOpposite = this.state.fields[counterpartIndex];
        
        //we swap the counterparts only
        this.swapCounterpart(counterpart, opposite);
        
        //we delete all the opposites from the edited list
        editedIds.delete(opposite.name);
        editedIds.delete(diametricOpposite.name);
        
        //and we add the field and the selected field as those are the ones
        //we chose to match each other
        editedIds.add(field.name);
        editedIds.add(this.state.selectedField.name);
      }
    }
    
    //and we unselect everything
    this.setState({
      selectedField: null,
      selectedIsCounterpart: false,
      selectedIndex: null,
      editedIds
    });
  }
  //basically we remove whatever was picked before
  cancelPreviousPick(){
    this.setState({
      selectedField: null,
      selectedIsCounterpart: false,
      selectedIndex: null
    });
  }
  render(){
    if (!this.loaded){
      return <div className="material-page__connectfield-wrapper">
        <div className="material-page__connectfield">
          {this.state.fields.map((field, index)=>{
            return <div key={index} className="material-page__connectfield-term"/>
          })}
        </div>
      </div>
    }
    
    //the element calass name matching the state on whether it passes or fails
    let elementClassNameState = this.props.checkAnswers && this.state.answerState ?
        "state-" + (this.state.answerState.includes("FAIL") ? "FAIL" : "PASS") : "";
    return <div className="material-page__connectfield-wrapper">
      <div className={`material-page__connectfield ${elementClassNameState}`}>
        <div className="material-page__connectfield-terms-container">
          {this.state.fields.map((field, index)=>{
            //the item class name only necessary if it was a fail and we are checking for rightness
            let itemClassNameState = this.props.checkAnswers && this.state.answerState &&
              this.state.answerState.includes("FAIL") && this.state.answerState[index] ? 
                "state-" + this.state.answerState[index] : ""
            //so now we get the fields here
            //the fields cannot be dragged and they remain in order
            //they are simple things
            return <div key={field.name} onClick={this.props.readOnly ? null : this.pickField.bind(this, field, false, index)}>
              <span className="material-page__connectfield-term-number">{index + 1}</span>
              <div className={`material-page__connectfield-term ${this.state.selectedField && this.state.selectedField.name === field.name ?
                "material-page__connectfield-term-selected" : ""} ${this.state.editedIds.has(field.name) ? "material-page__connectfield-term-edited" : ""}
                ${itemClassNameState}`}>{field.text}</div>
            </div>
           })}
        </div>
        <div className="material-page__connectfield-gap"></div>
        <div className="material-page__connectfield-counterparts-container">
         {this.state.counterparts.map((field, index)=>{
           //the item rightness
           let itemAnswer = this.props.checkAnswers && this.state.answerState && this.state.answerState[index];
           //the classname state if necessary
           let itemClassNameState = itemAnswer && this.state.answerState.includes("FAIL") ? 
               "state-" + this.state.answerState[index] : "";
           //the basic class name
           let className = `material-page__connectfield-counterpart ${this.state.selectedField && this.state.selectedField.name === field.name ?
             "material-page__connectfield-counterpart-selected" : ""} ${this.state.editedIds.has(field.name) ? "material-page__connectfield-counterpart-edited" : ""} ${itemClassNameState}`;
           
           //TODO delet this
           let style:React.CSSProperties = {
               justifyContent: "flex-start"  //TODO lankkinen Add this in classes sadly I had to use the original connect field term class because of missing functionality
           };
           
           //if readonly we just add the classname in there
           if (this.props.readOnly){
             return <div className={className}
               key={field.name} style={style}>{field.text}</div>
           }
           
           //if we are asked for correct answers
           let itemCorrectAnswerComponent = null;
           //we need to do this
           if (this.props.displayCorrectAnswers && !(this.props.checkAnswers && itemAnswer === "PASS")){
             //this is just a component giving an overview, of which number was meant to be the right answer
             itemCorrectAnswerComponent = <span className="material-page__connectfield-term-number">
               {this.state.fields.findIndex(f=>f.name === (this.props.content.connections.find(c=>c.counterpart === field.name) || {field: null}).field) + 1}
             </span>
           }
           
           //ok so the counterpart is draggable
           //the interaction data is the field, index, and whether is counterpart
           //note how the inline function onDropInto handles this data
           //so it can be swapped
           //the interaction group there only for the counterparts
           //on drag we cancel if the field had been picked before with the click event
           //or any other field that had been selected before, and we pick this one
           //on click we just handle it the same way as the standard click
           //the parent container selector is the field on its own
           return <Draggable interactionData={{field, index, isCounterpart: true}} 
             interactionGroup={this.props.content.name + "-counterparts-container"}
             onDrag={()=>{this.cancelPreviousPick(); this.pickField(field, true, index);}}
             onClick={this.pickField.bind(this, field, true, index)} parentContainerSelector=".material-page__connectfield"
             onDropInto={(data)=>this.pickField(data.field, data.isCounterpart, data.index)}
             className={className} key={field.name} style={style}>{itemCorrectAnswerComponent}{field.text}</Draggable>
         })}
        </div>
      </div>
    </div>
  }
}