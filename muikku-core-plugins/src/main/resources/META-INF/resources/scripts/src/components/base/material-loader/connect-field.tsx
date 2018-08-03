import * as React from "react";
import { shuffle } from "~/util/modifiers";

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
  }
}

interface ConnectFieldState {
  fields: FieldType[],
  counterparts: FieldType[],
  selectedField: FieldType,
  selectedIsCounterpart: boolean,
  selectedIndex: number,
  editedIds: Set<string>
}

export default class ConnectField extends React.Component<ConnectFieldProps, ConnectFieldState> {
  constructor(props: ConnectFieldProps){
    super(props);
    
    this.state = {
      fields: shuffle(props.content.fields),
      counterparts: shuffle(props.content.counterparts),
      selectedField: null,
      selectedIsCounterpart: false,
      selectedIndex: null,
      editedIds: new Set([])
    }
    
    this.swapField = this.swapField.bind(this);
    this.swapCounterpart = this.swapCounterpart.bind(this);
    this.pickField = this.pickField.bind(this);
  }
  componentWillReceiveProps(nextProps: ConnectFieldProps){
    if (JSON.stringify(nextProps.content) !== JSON.stringify(this.props.content)){
      this.setState({
        fields: shuffle(nextProps.content.fields),
        counterparts: shuffle(nextProps.content.counterparts)
      });
    }
  }
  swapField(fielda: FieldType, fieldb: FieldType){
    this.setState({
      fields: this.state.fields.map(f=>{
        if (f.name === fielda.name){
          return fieldb;
        } else if (f.name === fieldb.name){
          return fielda
        }
        return f;
      })
    })
  }
  swapCounterpart(fielda: FieldType, fieldb: FieldType){
    this.setState({
      counterparts: this.state.counterparts.map(f=>{
        if (f.name === fielda.name){
          return fieldb;
        } else if (f.name === fieldb.name){
          return fielda
        }
        return f;
      })
    })
  }
  pickField(field: FieldType, isCounterpart: boolean, index: number){
    if (!this.state.selectedField){
      this.setState({
        selectedField: field,
        selectedIsCounterpart: isCounterpart,
        selectedIndex: index
      });
      return;
    }
    
    let editedIds = new Set(this.state.editedIds);
    if (field.name !== this.state.selectedField.name){
      if (this.state.selectedIsCounterpart && isCounterpart){
        this.swapCounterpart(this.state.selectedField, field);
        
        let diametricOpposite = this.state.fields[this.state.selectedIndex];
        editedIds.delete(diametricOpposite.name);
        editedIds.delete(field.name);
        
        let opposite = this.state.fields[index];
        editedIds.add(opposite.name);
        editedIds.add(this.state.selectedField.name);
      } else if (!this.state.selectedIsCounterpart && !isCounterpart){
        this.swapField(this.state.selectedField, field);
        
        let diametricOpposite = this.state.counterparts[this.state.selectedIndex];
        editedIds.delete(diametricOpposite.name);
        editedIds.delete(field.name);
        
        let opposite = this.state.counterparts[index];
        editedIds.add(opposite.name);
        editedIds.add(this.state.selectedField.name);
      } else {
        let counterpart:FieldType = this.state.selectedIsCounterpart ? this.state.selectedField : field;
        let counterpartIndex:number = this.state.selectedIsCounterpart ? this.state.selectedIndex : index;
        let givenFieldIndex:number = !this.state.selectedIsCounterpart ? this.state.selectedIndex : index;
        let opposite = this.state.counterparts[givenFieldIndex];
        let diametricOpposite = this.state.fields[counterpartIndex];
        
        this.swapCounterpart(counterpart, opposite);
        
        editedIds.delete(opposite.name);
        editedIds.delete(diametricOpposite.name);
        
        editedIds.add(field.name);
        editedIds.add(this.state.selectedField.name);
      }
    }
    
    this.setState({
      selectedField: null,
      selectedIsCounterpart: false,
      selectedIndex: null,
      editedIds
    });
  }
  render(){
    return <div className="muikku-connect-field muikku-field">
      <div className="muikku-connect-field-terms">
        {this.state.fields.map((field, index)=><div key={field.name} onClick={this.pickField.bind(this, field, false, index)}>
          <span className="muikku-connect-field-number">{index + 1}</span>
          <div className={`muikku-connect-field-term ${this.state.selectedField && this.state.selectedField.name === field.name ?
            "muikku-connect-field-term-selected" : ""} ${this.state.editedIds.has(field.name) ? "muikku-connect-field-edited" : ""}`}>{field.text}</div>
        </div>)}
      </div>
      <div className="muikku-connect-field-gap"></div>
      <div className="muikku-connect-field-counterparts">
       {this.state.counterparts.map((field, index)=><div onClick={this.pickField.bind(this, field, true, index)}
         className={`muikku-connect-field-term ${this.state.selectedField && this.state.selectedField.name === field.name ?
           "muikku-connect-field-term-selected" : ""} ${this.state.editedIds.has(field.name) ? "muikku-connect-field-edited" : ""}`}
           key={field.name} style={{
             justifyContent: "flex-start"  //TODO lankkinen Add this in classes sadly I had to use the original connect field term class because of missing functionality
           }}>{field.text}</div>)}
      </div>
    </div>
  }
}