import Portal from "~/components/general/portal";
import * as React from "react";
import $ from '~/lib/jquery';

function guidGenerator() {
  let S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"."+S4()+"."+S4()+"."+S4()+"."+S4()+S4()+S4());
}

let interactionData:{[key: string]: any} = {}

interface DroppableProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>  {
  interactionData: any,
  interactionGroup?: string
}

interface DroppableState {
  
}

function checkIsParentOrSelf(element: HTMLElement, comparer: HTMLElement): boolean{
  if (element === comparer){
    return true;
  }
  
  return element.parentElement ? checkIsParentOrSelf(element.parentElement, comparer) : false;
}

export class Droppable extends React.Component<DroppableProps, DroppableState>{
  id: string;

  constructor(props: DroppableProps){
    super(props);
  
    this.id = guidGenerator();
    
    if (typeof props.interactionData !== "undefined"){
      interactionData[this.id] = props.interactionData;
    }
  }
  componentWillReceiveProps(nextProps: DroppableProps){
    if (typeof nextProps.interactionData !== "undefined"){
      interactionData[this.id] = nextProps.interactionData;
    } else if (typeof nextProps.interactionData === "undefined" && typeof interactionData[this.id] !== "undefined"){
      delete interactionData[this.id];
    }
  }
  componentWillUnmount(){
    delete interactionData[this.id];
  }
  render(){
    let nProps = {...this.props};
    delete nProps["interactionData"];
    delete nProps["interactionGroup"];
    return <div data-interact-id={this.id} data-interact-group-id={this.props.interactionGroup} {...nProps} ref="base">
      {this.props.children}
    </div>
  }
  getDOMComponent(): HTMLDivElement {
    return this.refs.base as HTMLDivElement;
  }
}

interface DraggableProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  interactionData?: any,
  interactionGroup?: string,
  onInteractionWith?: (interactionData: any)=>any,
  onDropInto?: (interactionData: any)=>any,
  parentContainerSelector?: string,
  voidElement?: any,
  classNameDragging?: string,
  clone?: boolean
}

interface DraggableState {
  isDragging: boolean,
  width: number,
  height: number,
  totalWidthWithMargin: number,
  totalHeightWithMargin: number,
  x: number,
  y: number,
  display: string
}

export default class Draggable extends React.Component<DraggableProps, DraggableState> {
  private originalPageX:number;
  private originalPageY:number;
  private minX: number;
  private maxX: number;
  private minY: number;
  private maxY: number;
  private currentInteractionId: string;
  private selfId: string;
  private timer: number;
  private isFirstDrag: boolean;
  
  constructor(props: DraggableProps){
    super(props);
    
    this.state = {
      isDragging: false,
      width: null,
      height: null,
      totalWidthWithMargin: null,
      totalHeightWithMargin: null,
      x: null,
      y: null,
      display: null
    }
    
    this.onRootSelectStart = this.onRootSelectStart.bind(this);
    this.onRootSeletEnd = this.onRootSeletEnd.bind(this);
    this.onMove = this.onMove.bind(this);
    this.detectCollisions = this.detectCollisions.bind(this);
  }
  componentDidMount(){
    document.body.addEventListener("mousedown", this.onRootSelectStart);
    document.body.addEventListener("mousemove", this.onMove);
    document.body.addEventListener("mouseup", this.onRootSeletEnd);
    
    if (this.props.interactionData){
      this.selfId = (this.refs.root as Droppable).id + "";
      this.currentInteractionId = this.selfId;
    }
  }
  componentWillUnmount(){
    document.body.removeEventListener("mousedown", this.onRootSelectStart);
    document.body.removeEventListener("mousemove", this.onMove);
    document.body.removeEventListener("mouseup", this.onRootSeletEnd);
  }
  onRootSelectStart(e: MouseEvent){
    let rootElement:HTMLDivElement;
    if (this.props.interactionData){
      rootElement = (this.refs.root as Droppable).getDOMComponent();
    } else {
      rootElement = this.refs.root as HTMLDivElement;
    }
    
    if (!checkIsParentOrSelf(e.target as HTMLElement, rootElement)){
      return;
    }
    
    this.timer = (new Date()).getTime();
    this.isFirstDrag = true;
    
    let clientRect = rootElement.getBoundingClientRect();
    let style = getComputedStyle(rootElement);
    
    this.originalPageX = e.pageX;
    this.originalPageY = e.pageY;
    
    if (this.props.parentContainerSelector){
      let parentContainerOffset = $(rootElement).closest(this.props.parentContainerSelector).offset();
      let rootElementOffset = $(rootElement).offset();
      let parentContainerClientRect = $(rootElement).closest(this.props.parentContainerSelector)[0].getBoundingClientRect();
      
      this.minX = parentContainerOffset.left - rootElementOffset.left;
      this.minY = parentContainerOffset.top - rootElementOffset.top;
      this.maxX = parentContainerClientRect.width - (rootElementOffset.left - parentContainerOffset.left + clientRect.width);
      this.maxY = parentContainerClientRect.height - (rootElementOffset.top - parentContainerOffset.top + clientRect.height);
    } else {
      this.maxX = null;
      this.minX = null;
      this.maxY = null;
      this.minY = null;
    }
    
    this.setState({
      isDragging: true,
      width: clientRect.width,
      height: clientRect.height,
      x: 0,
      y: 0,
      totalWidthWithMargin: clientRect.width + parseFloat(style.marginLeft) + parseFloat(style.marginRight),
      totalHeightWithMargin: clientRect.height + parseFloat(style.marginTop) + parseFloat(style.marginBottom),
      display: style.display
    });
  }
  onMove(e: MouseEvent){
    if (this.state.isDragging){
      
      if (this.isFirstDrag){
        this.isFirstDrag = false;
        this.props.onDrag && this.props.onDrag(e as any);
      }
      
      let newX = e.pageX - this.originalPageX;
      let newY = e.pageY - this.originalPageY;
      
      if (this.minX !== null && newX < this.minX){
        newX = this.minX;
      }
      if (this.minY !== null && newY < this.minY){
        newY = this.minY;
      }
      if (this.maxX !== null && newX > this.maxX){
        newX = this.maxX;
      }
      if (this.maxY !== null && newY > this.maxY){
        newY = this.maxY;
      }
      this.setState({
        x: newX,
        y: newY
      });
      this.props.interactionGroup && this.props.onInteractionWith && this.detectCollisions(false);
    }
  }
  onRootSeletEnd(e: MouseEvent){
    if (this.state.isDragging){
      if ((new Date()).getTime() - this.timer <= 300){
        this.props.onClick && this.props.onClick(e as any);
        this.setState({
          isDragging: false
        });
      } else {
        this.props.interactionGroup && this.props.onDropInto && this.detectCollisions(true);
        this.setState({
          isDragging: false
        });
      }
    }
  }
  detectCollisions(isDrop: boolean){    
    //the contestant that showed collisions
    let contestants:Array<{
      interactId: string,
      intersectionRatio: number
    }> = [];
    
    //for every element in the same group it can collide with
    $(`[data-interact-group-id="${this.props.interactionGroup}"]`).toArray().forEach((element: HTMLElement) => {
      
      //lets calculate the box of both
      let draggableOffset = $(this.refs.draggable).offset();
      let draggableBox = {
        top: draggableOffset.top,
        bottom: draggableOffset.top + (this.refs.draggable as HTMLDivElement).offsetHeight,
        left: draggableOffset.left,
        right: draggableOffset.left + (this.refs.draggable as HTMLDivElement).offsetWidth,
      }
      
      let otherOffset = $(element).offset();
      let otherBox = {
        top: otherOffset.top,
        bottom: otherOffset.top + element.offsetHeight,
        left: otherOffset.left,
        right: otherOffset.left + element.offsetWidth,
      }
      
      //calculate the area of a possible collision
      let x_overlap = Math.max(0, Math.min(draggableBox.right, otherBox.right) - Math.max(draggableBox.left, otherBox.left));
      if (!x_overlap){
        return;
      }
      let y_overlap = Math.max(0, Math.min(draggableBox.bottom, otherBox.bottom) - Math.max(draggableBox.top, otherBox.top));
      if (!y_overlap){
        return;
      }
      let overlapArea = x_overlap * y_overlap;
        
      //lets now get the area of the element we are dragging
      let draggableBoxArea = (this.refs.draggable as HTMLDivElement).offsetHeight * (this.refs.draggable as HTMLDivElement).offsetWidth;
        
      //let's check to which amount they intersect
      let intersectionRatio = overlapArea / draggableBoxArea;
        
      //it becomes a valid contestant if the amount is more than 25% of its area
      if (intersectionRatio >= 0.25){
        contestants.push({interactId: element.dataset.interactId, intersectionRatio});
      }
    });
    
    //now we check the contestants
    if (contestants.length){
      
      //the basic winner is the only contestant
      let winner = contestants[0];
      
      //but there might be more contestant
      if (contestants.length >= 2){
        
        //the one that gets more area wins
        winner = contestants.reduce((a, b)=>{
          if (a.intersectionRatio > b.intersectionRatio){
            return a;
          }
          return b;
        });
      }
      
      //so if the winner is not ourselves, and the winner interaction id is not the same as the current interaction id
      //(we might have been interacting with other stuff and this triggers every move, yep, it is expensive :|)
      if (winner.interactId !== this.currentInteractionId || isDrop){
        
        //if it's not a drop
        if (!isDrop){
          
          //we trigger an interaction event and register the latest winner
          this.props.onInteractionWith(interactionData[winner.interactId]);
          this.currentInteractionId = winner.interactId;
        } else {
          //otherwise we trigger the drop event and deregister any previous interaction
          this.props.onDropInto(interactionData[winner.interactId]);
          this.currentInteractionId = this.props.interactionData ? this.selfId : winner.interactId;
        }
      }
    } else if (!contestants.length && this.props.interactionData && isDrop){
      this.props.onDropInto(interactionData[this.selfId]);
      this.currentInteractionId = this.selfId;
    }
  }
  render(){
    let RootElement:any = 'div';
    let rootElementProps:any = {};
    if (this.props.interactionData){
      RootElement = Droppable;
      rootElementProps.interactionData = this.props.interactionData;
      rootElementProps.interactionGroup = this.props.interactionGroup;
    }
    
    let nProps = {...this.props};
    delete nProps["interactionData"];
    delete nProps["interactionGroup"];
    delete nProps["onInteractionWith"];
    delete nProps["onDropInto"];
    delete nProps["parentContainerSelector"];
    delete nProps["voidElement"];
    delete nProps["classNameDragging"];
    delete nProps["onClick"];
    delete nProps["onDrag"];
    delete nProps["clone"];
    
    if (this.state.isDragging) {
      let nStyle = {...this.props.style} || {};
      nStyle.position = "absolute";
      nStyle.width = this.state.width;
      nStyle.height = this.state.height;
      nStyle.left = this.state.x;
      nStyle.top = this.state.y;
      nStyle.zIndex = 100;
      
      if (this.props.classNameDragging){
        nProps.className = nProps.className ? nProps.className + " " + this.props.classNameDragging : nProps.className;
      }
           
      if (this.props.clone){
        rootElementProps.className = this.props.className;
        rootElementProps.style = this.props.style;
      } else {
        rootElementProps.style = {
          position: "relative",
          zIndex: 100,
          width: this.state.totalWidthWithMargin,
          height: this.state.totalHeightWithMargin,
          display: this.state.display
        };
      }
      
      nProps.style = nStyle;
      return <RootElement {...rootElementProps} ref="root">
        {this.props.clone ? this.props.children : this.props.voidElement}
        <div ref="draggable" {...nProps}/>
      </RootElement>
    }
    
    return <RootElement {...rootElementProps} {...nProps} ref="root"/>
  }
}