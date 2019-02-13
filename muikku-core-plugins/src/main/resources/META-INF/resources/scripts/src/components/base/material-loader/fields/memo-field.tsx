import * as React from "react";
import { i18nType } from "~/reducers/base/i18n";
import CKEditor from '~/components/general/ckeditor';
import $ from '~/lib/jquery';
import equals = require("deep-equal");

interface MemoFieldProps {
  type: string,
  content: {
    example: string,
    columns: string,
    rows: string,
    name: string,
    richedit: boolean
  },
  i18n: i18nType,
  readOnly?: boolean,
  initialValue?: string,
  onChange?: (context: React.Component<any, any>, name: string, newValue: any)=>any,
  
  displayRightAnswers?: boolean,
  checkForRightness?: boolean,
  onRightnessChange?: (name: string, value: boolean)=>any
}

interface MemoFieldState {
  value: string,
  words: number,
  characters: number,
  
  //This state comes from the context handler in the base
  //We can use it but it's the parent managing function that modifies them
  //We only set them up in the initial state
  modified: boolean,
  synced: boolean,
  syncError: string
}

const ckEditorConfig = {
  autoGrow_onStartup: true,
  mathJaxLib: '//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_HTMLorMML',
  toolbar: [
    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat' ] },
    { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'Undo', 'Redo' ] },
    { name: 'links', items: [ 'Link' ] },
    { name: 'insert', items: [ 'Image', 'Table', 'Muikku-mathjax', 'Smiley', 'SpecialChar' ] },
    { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
    { name: 'styles', items: [ 'Format' ] },
    { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight'] },
    { name: 'tools', items: [ 'Maximize' ] }
  ]
}
const extraPlugins = {
  'widget': '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/widget/4.5.8/',
  'lineutils': '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/lineutils/4.5.8/',
  'change' : '//cdn.muikkuverkko.fi/libs/coops-ckplugins/change/0.1.2/plugin.min.js',
  'autogrow' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/autogrow/4.5.8/plugin.js',
  'muikku-mathjax': (window as any).CONTEXTPATH + '/scripts/ckplugins/muikku-mathjax/'
}

//Counts the amount of characters, stolen from the old code, no idea how it exactly works
function characterCount(rawText: string){
  return rawText === '' ? 0 : rawText.trim().replace(/(\s|\r\n|\r|\n)+/g,'').split("").length;
}

//Counts the amount of words, stolen too
function wordCount(rawText: string){
  return rawText === '' ? 0 : rawText.trim().split(/\s+/).length;
}

export default class MemoField extends React.Component<MemoFieldProps, MemoFieldState> {
  constructor(props: MemoFieldProps){
    super(props);
    
    //get the initial value
    let value = props.initialValue || '';
    //and get the raw text if it's richedit
    let rawText = this.props.content.richedit ? $(value).text() : value;
    
    //set the state with the counts
    this.state = {
      value,
      words: wordCount(rawText),
      characters: characterCount(rawText),
      
      //modified synced and syncerror are false, true and null by default
      modified: false,
      synced: true,
      syncError: null
    }
    
    this.onInputChange = this.onInputChange.bind(this);
    this.onCKEditorChange = this.onCKEditorChange.bind(this);
  }
  shouldComponentUpdate(nextProps: MemoFieldProps, nextState: MemoFieldState){
    return !equals(nextProps.content, this.props.content) || this.props.readOnly !== nextProps.readOnly || !equals(nextState, this.state)
    || this.props.i18n !== nextProps.i18n || this.props.displayRightAnswers !== nextProps.displayRightAnswers || this.props.checkForRightness !== nextProps.checkForRightness;
  }
  //very simple this one is for only when raw input from the textarea changes
  onInputChange(e: React.ChangeEvent<HTMLTextAreaElement>){
    //we call the on change
    this.props.onChange && this.props.onChange(this, this.props.content.name, e.target.value);
    //and update the count
    this.setState({
      value: e.target.value,
      words: wordCount(e.target.value),
      characters: characterCount(e.target.value)
    });
  }
  //this one is for a ckeditor change
  onCKEditorChange(value: string){
    //we need the raw text
    let rawText = $(value).text();
    //call the update
    this.props.onChange && this.props.onChange(this, this.props.content.name, value);
    //and update the state
    this.setState({
      value,
      words: wordCount(rawText),
      characters: characterCount(rawText)
    });
  }
  render(){
    //we have a right answer example for when
    //we are asked for displaying right answer
    //so we need to set it up
    let answerExampleComponent = null;
    //it's simply set when we get it
    if (this.props.displayRightAnswers && this.props.content.example){
      answerExampleComponent = <span className="muikku-field-examples">
        <span className="muikku-field-examples-title">
          {this.props.i18n.text.get("plugin.workspace.assigment.checkAnswers.detailsSummary.title")}
        </span>
        <span className="muikku-field-example">{this.props.content.example}</span>
      </span>
    }
    
    //now we need the field
    let field;
    //if readonly
    if  (this.props.readOnly){
      //depending to whether richedit or not we make it be with the value as inner html or just raw text
      field = !this.props.content.richedit ? <div className="muikku-memo-field muikku-field">{this.state.value}</div> :
              <div className="muikku-memo-field muikku-field" dangerouslySetInnerHTML={{__html:this.state.value}}/>
    } else {
      //here we make it be a simple textarea or a rich text editor
      //note how somehow numbers come as string...
      field = !this.props.content.richedit ? <textarea className="muikku-memo-field muikku-field" cols={parseInt(this.props.content.columns)}
          rows={parseInt(this.props.content.rows)} value={this.state.value} onChange={this.onInputChange}/> :
            <CKEditor width="100%" configuration={ckEditorConfig} extraPlugins={extraPlugins}
             onChange={this.onCKEditorChange}>{this.state.value}</CKEditor>
    }
    
    //and here the element itself
    return <div>
      {field}
      <div className="count-container">
        <div className="word-count-container">
          <div className="word-count-title">{this.props.i18n.text.get("plugin.workspace.memoField.wordCount")}</div>
          <div className="word-count">{this.state.words}</div>
        </div>
        <div className="character-count-container">
          <div className="character-count-title">{this.props.i18n.text.get("plugin.workspace.memoField.characterCount")}</div>
          <div className="character-count">{this.state.characters}</div>
        </div>
      </div>
      {answerExampleComponent}
    </div>
  }
}