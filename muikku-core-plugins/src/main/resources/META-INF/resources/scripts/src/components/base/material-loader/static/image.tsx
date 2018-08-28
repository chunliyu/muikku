import * as React from "react";
import { i18nType } from "~/reducers/base/i18n";
import { HTMLtoReactComponent } from "~/util/modifiers";

interface ImageProps {
  element: HTMLElement,
  dataset: {
    author: string,
    authorUrl: string,
    licence: string,
    licenseUrl: string,
    source: string,
    sourceUrl: string
  },
  i18n: i18nType
}

export default function image(props: ImageProps){
  return HTMLtoReactComponent(props.element, (Tag: string, elementProps: any, children: Array<any>, element: HTMLElement)=>{
    if (Tag === "figure"){
      children.push(<div className="image-details icon-copyright" key="details">
        <div className="image-details-container">
          <span className="image-details-label">{props.i18n.text.get("plugin.workspace.materials.detailsSourceLabel")} </span>
          {props.dataset.source ?  <a href={props.dataset.sourceUrl} target="_blank">{props.dataset.source}</a> : null}
          {props.dataset.source ? <span>&nbsp;/&nbsp;</span> : null}
          {props.dataset.author ? <a href={props.dataset.authorUrl} target="_blank">{props.dataset.author}</a> : null}
          {props.dataset.author ? <span>,&nbsp;</span> : null}
          {props.dataset.licence ? <a href={props.dataset.licenseUrl} target="_blank">{props.dataset.licence}</a> : null}
        </div>
      </div>);
    } else if (Tag === "img" && elementProps.width){
      elementProps.style = elementProps.style || {};
      elementProps.style.maxWidth = elementProps.width + "px";
      elementProps.style.width = "100%";
      elementProps.width = null;
      elementProps.height = null;
    }
    return <Tag {...elementProps}>{children}</Tag>
  });
}