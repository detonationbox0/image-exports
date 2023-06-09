/**
 * Largely imported from image-quality project
 * Adapted for this purpose
 * https://github.com/detonationbox0/image-quality/blob/main/js/app.js
 */

var stage;
var layer;
var trLayer;
var tr;


$(function() {
    console.log("konva.js loaded.")

    //#region

    // Create Konva stage
    stage = new Konva.Stage({
        container: 'canvas',   // id of container <div>
        width: 300,
        height: 400,
        // scaleX: .15,
        // scaleY: .15
    });
    
    // Give the Konva stage a border
    stage.getContainer().style.border = '1px solid white';


    // Create a new layer in the Stage
    layer = new Konva.Layer();

    // Create a new layer in the Stage for the Transformer
    trLayer = new Konva.Layer();

    stage.add(layer);
    stage.add(trLayer);





    // Create a Transformer for the selection
    tr = new Konva.Transformer({
        // nodes: [imgNode],
        rotateAnchorOffset: 30,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    });

    // Add the transformer to the Layer
    trLayer.add(tr);



    /**
     * -----------------------------------------------------------------------------------
     * Add Guides for Snapping
     * -----------------------------------------------------------------------------------
     * 
     */
    //#region

    // Add the top-right guide
    var topRight = new Konva.Rect({
        x: 200,
        y: 0,
        width: 100,
        height: 100,
        // fill: 'green',
        stroke: '#00FFFF',
        strokeWidth: 1,
        dash: [10, 10],
        name:"guide"
    });

    layer.add(topRight);

    //#endregion
    
    /**
     * -----------------------------------------------------------------------------------
     * Snapping shapes
     * -----------------------------------------------------------------------------------
     * Adapted from https://konvajs.org/docs/sandbox/Objects_Snapping.html
     * 
     * This aligns the node to other nodes, but doesn't snap
     * I can't work out how to get one node to "snap" to another
     * We probably need to get the x + y and w + h of the snap-to node,
     * and the x + y and w + h of the selected node, and do
     * some math to figure out how close the selected node is to the snap-to node
     * if it's close enough, change the x + y and w + h of the selected node to
     * match the snap-to node...
     * 
     */
    //#region

        var GUIDELINE_OFFSET = 5;

        // were can we snap our objects?
        function getLineGuideStops(skipShape) {
            // we can snap to stage borders and the center of the stage
            var vertical = [0, stage.width() / 2, stage.width()];
            var horizontal = [0, stage.height() / 2, stage.height()];

            // and we snap over edges and center of each object on the canvas
            stage.find('.guide').forEach((guideItem) => {
                if (guideItem === skipShape) {
                    return;
                }

                var box = guideItem.getClientRect();
                // and we can snap to all edges of shapes
                vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
                horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
            });
            return {
                vertical: vertical.flat(),
                horizontal: horizontal.flat(),
            };
        }

        // what points of the object will trigger to snapping?
        // it can be just center of the object
        // but we will enable all edges and center
        function getObjectSnappingEdges(node) {

            var box = node.getClientRect();
            var absPos = node.absolutePosition();

            return {
                vertical: [
                    {
                        guide: Math.round(box.x),
                        offset: Math.round(absPos.x - box.x),
                        snap: 'start',
                    },
                    {
                        guide: Math.round(box.x + box.width / 2),
                        offset: Math.round(absPos.x - box.x - box.width / 2),
                        snap: 'center',
                    },
                    {
                        guide: Math.round(box.x + box.width),
                        offset: Math.round(absPos.x - box.x - box.width),
                        snap: 'end',
                    },
                ],
                horizontal: [
                    {
                        guide: Math.round(box.y),
                        offset: Math.round(absPos.y - box.y),
                        snap: 'start',
                    },
                    {
                        guide: Math.round(box.y + box.height / 2),
                        offset: Math.round(absPos.y - box.y - box.height / 2),
                        snap: 'center',
                    },
                    {
                        guide: Math.round(box.y + box.height),
                        offset: Math.round(absPos.y - box.y - box.height),
                        snap: 'end',
                    },
                ],
                };
        }

        // find all snapping possibilities
        function getGuides(lineGuideStops, itemBounds) {
            var resultV = [];
            var resultH = [];

            lineGuideStops.vertical.forEach((lineGuide) => {
            itemBounds.vertical.forEach((itemBound) => {
                var diff = Math.abs(lineGuide - itemBound.guide);
                // if the distance between guild line and object snap point is close we can consider this for snapping
                if (diff < GUIDELINE_OFFSET) {
                resultV.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                });
                }
            });
            });

            lineGuideStops.horizontal.forEach((lineGuide) => {
            itemBounds.horizontal.forEach((itemBound) => {
                var diff = Math.abs(lineGuide - itemBound.guide);
                if (diff < GUIDELINE_OFFSET) {
                resultH.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                });
                }
            });
            });

            var guides = [];

            // find closest snap
            var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
            var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
            if (minV) {
            guides.push({
                lineGuide: minV.lineGuide,
                offset: minV.offset,
                orientation: 'V',
                snap: minV.snap,
            });
            }
            if (minH) {
            guides.push({
                lineGuide: minH.lineGuide,
                offset: minH.offset,
                orientation: 'H',
                snap: minH.snap,
            });
            }
            return guides;
        }

        function drawGuides(guides) {
            guides.forEach((lg) => {
            if (lg.orientation === 'H') {
                var line = new Konva.Line({
                    points: [-6000, 0, 6000, 0],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: 'guid-line',
                    dash: [4, 6],
                });
                layer.add(line);
                line.absolutePosition({
                    x: 0,
                    y: lg.lineGuide,
                });
            } else if (lg.orientation === 'V') {
                var line = new Konva.Line({
                    points: [0, -6000, 0, 6000],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: 'guid-line',
                    dash: [4, 6],
                });
                layer.add(line);
                line.absolutePosition({
                    x: lg.lineGuide,
                    y: 0,
                });
            }
            });
        }


        layer.on('dragmove', function (e) {
            // clear all previous lines on the screen
            layer.find('.guid-line').forEach((l) => l.destroy());

            // find possible snapping lines
            var lineGuideStops = getLineGuideStops(e.target);
            // find snapping points of current object
            var itemBounds = getObjectSnappingEdges(e.target);

            // now find where can we snap current object
            var guides = getGuides(lineGuideStops, itemBounds);

            // do nothing of no snapping
            if (!guides.length) {
                return;
            }

            drawGuides(guides);

            var absPos = e.target.absolutePosition();
            // now force object position
            guides.forEach((lg) => {
            switch (lg.snap) {
                case 'start': {
                switch (lg.orientation) {
                    case 'V': {
                        absPos.x = lg.lineGuide + lg.offset;
                        break;
                    }
                    case 'H': {
                        absPos.y = lg.lineGuide + lg.offset;
                        break;
                    }
                }
                break;
                }
                case 'center': {
                switch (lg.orientation) {
                    case 'V': {
                        absPos.x = lg.lineGuide + lg.offset;
                        break;
                    }
                    case 'H': {
                        absPos.y = lg.lineGuide + lg.offset;
                        break;
                    }
                }
                break;
                }
                case 'end': {
                switch (lg.orientation) {
                    case 'V': {
                        absPos.x = lg.lineGuide + lg.offset;
                        break;
                    }
                    case 'H': {
                        absPos.y = lg.lineGuide + lg.offset;
                        break;
                    }
                }
                break;
                }
            }
            });
            e.target.absolutePosition(absPos);
        });

        layer.on('dragend', function (e) {
            // clear all previous lines on the screen
            layer.find('.guid-line').forEach((l) => l.destroy());
        });


        


    //#endregion

    /**
     * -----------------------------------------------------------------------------------
     * Stage Events
     * Adapted from https://konvajs.org/docs/select_and_transform/Basic_demo.html
     * -----------------------------------------------------------------------------------
     * Handles Selection / Deselection
     */
    //#region

        // add a new feature, lets add ability to draw selection rectangle
        var selectionRectangle = new Konva.Rect({
            fill: 'rgba(121,185,201,0.5)',
            visible: false,
        });

        layer.add(selectionRectangle);

        var x1, y1, x2, y2;
        stage.on('mousedown touchstart', (e) => {

            console.log("mousedown");
            // do nothing if we mousedown on any shape
            if (e.target !== stage) {
                return;
            }
    
            e.evt.preventDefault();
            x1 = stage.getPointerPosition().x;
            y1 = stage.getPointerPosition().y;
            x2 = stage.getPointerPosition().x;
            y2 = stage.getPointerPosition().y;

            selectionRectangle.visible(true);
            selectionRectangle.width(0);
            selectionRectangle.height(0);

        });



        stage.on('mousemove touchmove', (e) => {

            // do nothing if we didn't start selection
            if (!selectionRectangle.visible()) {
                return;
            }

            e.evt.preventDefault();
            x2 = stage.getPointerPosition().x;
            y2 = stage.getPointerPosition().y;

            selectionRectangle.setAttrs({
                x: Math.min(x1, x2),
                y: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1),
            });
        });


        stage.on('mouseup touchend', (e) => {
            // do nothing if we didn't start selection
            if (!selectionRectangle.visible()) {
                return;
            }
            e.evt.preventDefault();
            // update visibility in timeout, so we can check it in click event
            setTimeout(() => {
                selectionRectangle.visible(false);
            });

            // console.log(stage);

            var shapes = stage.find('.selectable');
            var box = selectionRectangle.getClientRect();
            var selected = shapes.filter((shape) =>
                Konva.Util.haveIntersection(box, shape.getClientRect())
            );

            tr.nodes(selected);
        });


        // clicks should select/deselect shapes
        stage.on('click tap', function (e) {
            // if we are selecting with rect, do nothing
            if (selectionRectangle.visible()) {
                return;
            }

            // if click on empty area - remove all selections
            if (e.target === stage) {
                tr.nodes([]);
                return;
            }

            // do nothing if clicked NOT on our rectangles
            if (!e.target.hasName('selectable')) {
                console.log("Does not have .selectable")
                return;
            }


            console.log("Event target:")
            console.log(e.target);

            // do we pressed shift or ctrl?
            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            const isSelected = tr.nodes().indexOf(e.target) >= 0;

            if (!metaPressed && !isSelected) {
            // if no key pressed and the node is not selected
            // select just one
            tr.nodes([e.target]);
            } else if (metaPressed && isSelected) {
                // if we pressed keys and node was selected
                // we need to remove it from selection:
                const nodes = tr.nodes().slice(); // use slice to have new copy of array
                // remove node from array
                nodes.splice(nodes.indexOf(e.target), 1);
                    tr.nodes(nodes);
                } else if (metaPressed && !isSelected) {
                // add the node into selection
                const nodes = tr.nodes().concat([e.target]);
                tr.nodes(nodes);
            }
        });
    //#endregion



    //#endregion

});

/**
 * User clicks an Add Image button
 */
$(document).on("click", ".add-image", function() {

    console.log("Add image clicked");

    // Which file shall we add?
    var file = $(this).attr("value");

    // We will need to convert this to a PNG file if it's a PSD
    var ext = file.split(".").pop();

    if (ext == "psd") {
        // Convert to a PNG file
        // Show the loader
        $("#wait").css("display", "flex");
        // API call (server.js)
        $.post("/convert", {filename:file}, function(pngFile) {
            console.log(pngFile);
            addImage(pngFile);
            // Hide the loader
            $("#wait").hide();
            return;
        });
    } else {
        addImage(file);
        $("#wait").hide();
    }

});

/**
 * Add an image to Konva
 * @param {string} url The path to the image being added 
 */
function addImage(url) {

    
    // If the image is a PSD file, convert it to a PNG first.


    // Create Image Node to be added to the layer
    // Konva.Image.fromURL('/ubiquitous-giggle/lq.png', function (imgNode) { // <- This line is for GitHub's relative link
    Konva.Image.fromURL(url, function (imgNode) { // <- This line is for GitHub's relative link


        // Scale the image to 50% of the width of the canvas, regardless of canvas width 
        var cnvWidth = stage.width();
        var scaleTo = cnvWidth / 2;
        var imgWidth = imgNode.width();
        var scaleFactor = scaleTo / imgWidth;


        imgNode.setAttrs({
            x: 0,
            y: 0,
            scaleX: scaleFactor,
            scaleY: scaleFactor,
            draggable: true,
            name:"selectable",
            id:"effect-image"
        });

        // Possible Effects
        imgNode.cache();

        // Add the Image Node to the Layer
        layer.add(imgNode);
        imgNode.moveToTop();

        // Add the image to the Transformer
        tr.nodes([imgNode])

        // Draw the layer
        layer.draw();
        


        // Attach events to the Image Node
        
        imgNode.on('mouseover', function() {
            document.body.style.cursor = 'pointer';            
        });

        imgNode.on('mouseout', function() {
            document.body.style.cursor = 'default';
        });

        imgNode.on('transform', function() {

            // console.log("Transforming...")

            

            // Other data of interest....
           
            
        })

        // ... more events available https://konvajs.org/docs/events/Binding_Events.html

        


        // console.log();


    });
}

