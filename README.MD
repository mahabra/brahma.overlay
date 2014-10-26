Brahma.overlay
---
## Usage
```javascript
Brahma('selector').component('overlay', {
	//options
});
```
Selector is not the content of the layer! Selector is a container inside which creates a layer. In the classic model, the selector must be "body". But you have choice another container.

## Options
- content : Html text of overlay content
- panel : 
	- style : Css directives (like .css in jQuery) for styling popup panel
- overlay : 
	- style : Css directives (like .css in jQuery) for styling overlayer
- effect : 
	- type : name of showing/hiding effect
	- direction : direction of show (only when type is slide)
	- duration : duration of effect
- class : classname of main wrapper
- freeze : freeze main document
- verticalMargin : popup panel will have got strict top/bottom margin (make high content's overlays more beauty)
- autoshow : show after create
- zIndex : manual z-index

## Depends
Brahma, Brahma.transit, jQuery, jUqery.tie

## Authors
Vladimir Morulus

## License
MIT 
