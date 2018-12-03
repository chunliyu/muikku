import * as React from 'react';
import $ from '~/lib/jquery';

import '~/sass/elements/content-panel.scss';
import '~/sass/elements/loaders.scss';

interface ContentPanelProps {
  modifier: string,
  title?: React.ReactElement<any> | string,
  navigation: React.ReactElement<any>
}

interface ContentPanelState {
  displayed: boolean,
  visible: boolean,
  dragging: boolean,
  drag: number,
  open: boolean
}

function checkLinkClicked(target: HTMLElement): boolean {
  return target.nodeName.toLowerCase() === "a" || (target.parentElement ? checkLinkClicked(target.parentElement) : false);
}

export default class ContentPanel extends React.Component<ContentPanelProps, ContentPanelState> {
  private touchCordX: number;
  private touchCordY: number;
  private touchMovementX: number;
  private preventXMovement: boolean;
  constructor(props: ContentPanelProps){
    super(props);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.closeByOverlay = this.closeByOverlay.bind(this);

    this.state = {
      displayed: false,
      visible: false,
      dragging: false,
      drag: null,
      open: false
    }
  }

  onTouchStart(e: React.TouchEvent<any>){
    this.setState({dragging: true});
    this.touchCordX = e.changedTouches[0].pageX;
    this.touchCordY = e.changedTouches[0].pageY;
    this.touchMovementX = 0;
    this.preventXMovement = false;
    e.preventDefault();
  }
  onTouchMove(e: React.TouchEvent<any>){
    let diffX = e.changedTouches[0].pageX - this.touchCordX;
    let diffY = e.changedTouches[0].pageY - this.touchCordY;
    let absoluteDifferenceX = Math.abs(diffX - this.state.drag);
    this.touchMovementX += absoluteDifferenceX;

    if (diffX > 0) {
      diffX = 0;
    }
    
    if (diffX >= -3){
      if (diffY >= 5 || diffY <= -5){
        diffX = 0;
        this.preventXMovement = true;
      } else {
        this.preventXMovement = false;
      }
    }
    
    if (!this.preventXMovement){
      this.setState({drag: diffX});
    }
    e.preventDefault();
  }
  onTouchEnd(e: React.TouchEvent<any>){
    let width = (document.querySelector(".content-panel__navigation-content") as HTMLElement).offsetWidth;
    let diff = this.state.drag;
    let movement = this.touchMovementX;
    
    let menuHasSlidedEnoughForClosing = Math.abs(diff) >= width*0.33;
    let youJustClickedTheOverlay = e.target === this.refs["menu-overlay"] && movement <= 5;
    let youJustClickedALink = checkLinkClicked(e.target as HTMLElement) && movement <= 5;
    
    this.setState({dragging: false});
    setTimeout(()=>{
      this.setState({drag: null});
      if (menuHasSlidedEnoughForClosing || youJustClickedTheOverlay || youJustClickedALink){
        this.close();
      }
    }, 10);
    e.preventDefault();
  }
  open(){
    this.setState({displayed: true, open: true});
    setTimeout(()=>{
      this.setState({visible: true});
    }, 10);
    $(document.body).css({'overflow': 'hidden'});
  }
  closeByOverlay(e: React.MouseEvent<any>){
    let isOverlay = e.target === e.currentTarget;
    let isLink = checkLinkClicked(e.target as HTMLElement);
    if (!this.state.dragging && (isOverlay || isLink)){
      this.close();
    }
  }
  close(){
    $(document.body).css({'overflow': ''});
    this.setState({visible: false});
    setTimeout(()=>{
      this.setState({displayed: false, open: false});
    }, 300);
  }
  render(){
    return (        
    <div className={`content-panel content-panel--${this.props.modifier}`} ref="panel">
      <div className="content-panel__container">                
        
        <div className="content-panel__header">{this.props.title}</div>
        
        <div className="content-panel__body" ref="body">
          <div className="content-panel__content">
            <div className={`content-panel__main-container loader-empty`}>{this.props.children}</div>
            <div className="content-panel__navigation-open" onClick={this.open}/>
            <div ref="menu-overlay"
              className={`content-panel__navigation ${this.state.displayed ? "displayed" : ""} ${this.state.visible ? "visible" : ""} ${this.state.dragging ? "dragging" : ""}`}
              onClick={this.closeByOverlay}>
              <div className="content-panel__navigation-content" style={{right: this.state.drag}}>{
                this.props.navigation
              }</div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}

export class ContentPanelItem extends React.Component<{}, {}> {
  render(){
    return (<div className="content-panel__item">{this.props.children}</div>);
  }
}