/*
 * Contains code to draw an ant.
 */



// BezierShapePoint
//
// A BezierShapePoint is one point along a shape which is drawn using bezier curves.
//
// It is an object with four fields: "x" and "y" give the coordinates of a point, "angle"
// gives the tangent to that point in "clockAngle" (0 up to 12) clockwise from "straight down".
// (We always have angle >=0 and angle < 360.) And "flat" tells how far out the control points
// should be: larger numbers will be more flat.
//
// Example:
//   const p = {x:0, y:50, angle:3, flat:5}


// LinePoint
//
// A LinePoint is one point along a lnie which is drawn using straight segments.
//
// It is an object with two fields, "x" and "y".
//
// Example:
//   const p = {x: 3, y:6}


// Shape
//
// A thing we can draw. There are two kinds right now: a solid shape with bezier
// curves or a straight line.
//
// It has a field named "type" which is either "BezierShape" or "Line". And it has
// other fields depending on the value of that:
//   BezierShape:
//     "points": a list of BezierShapePoint. The first and last point should be identical.
//
//   Line:
//     "points": A list of LinePoint.
//     "width": the width of the line
//
// Example:
//   const shape = {
//       "type": "BezierShape",
//       "points": [
//           {x:0,  y:13,  angle:3, flat:2},
//           {x:4,  y:10,  angle:5, flat:1.5},
//           {x:3,  y:8,   angle:9, flat:0.8},
//           {x:0,  y:13,  angle:3, flat:2},
//       ]
//   };


// Diagram
//
// A collection of Shapes.
//
// It is just an array of Shape objects.



/*
 * This is passed an array of pointData representing one side of a shape (the positive x side)
 * and it reflects that in the y-axis to produce (and return) the points of a complete shape.
 *
 * It requires that the first and last point have x=0 and all other points have x >= 0.
 */
function makeSymmetric(oneSide) {
    console.assert(oneSide[0].x === 0);
    console.assert(oneSide[oneSide.length - 1].x === 0);
    console.assert(oneSide.every(p => p.x >= 0));

    const result = oneSide.slice(); // copy the existing points
    const reflectedPoints = []; // all but first and last point w/ x reversed
    oneSide.slice(1,-1).forEach(p => {
        reflectedPoints.push({
            x: -1 * p.x,
            y: p.y,
            angle: (18 - p.angle) % 12, // reflect in y-axis
            flat: p.flat,
        });
    });
    reflectedPoints.reverse(); // reverse the reflected ones
    reflectedPoints.forEach(p => result.push(p)); // add them to the list
    result.push(oneSide[0]); // add the first point at the end of the list also
    return result;
}


/*
 * This is given a shape and returns an equivalent shape which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistBezierShapePoints(points, scale, clockAngle) {
    const cosAngle = Math.cos(clockAngle * Math.PI / 6);
    const sinAngle = Math.sin(clockAngle * Math.PI / 6);
    return points.map(p => {
        return {
            x: scale * (p.x * cosAngle - p.y * sinAngle),
            y: scale * (p.x * sinAngle + p.y * cosAngle),
            angle: (p.angle + clockAngle) % 12,
            flat: scale * p.flat,
        }
    });
}



/*
 * This is given a shape and returns an equivalent shape which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistLinePoints(points, scale, clockAngle) {
    const cosAngle = Math.cos(clockAngle * Math.PI / 6);
    const sinAngle = Math.sin(clockAngle * Math.PI / 6);
    return points.map(p => {
        return {
            x: scale * (p.x * cosAngle - p.y * sinAngle),
            y: scale * (p.x * sinAngle + p.y * cosAngle),
        };
    });
}

function twistPoint (point, scale, clockAngle){
    const cosAngle = Math.cos(clockAngle * Math.PI / 6);
    const sinAngle = Math.sin(clockAngle * Math.PI / 6);
    return {
        x: scale * (point.x * cosAngle - point.y * sinAngle),
        y: scale * (point.x * sinAngle + point.y * cosAngle),
    };
}

/*
 * This is given a shape and returns an equivalent shape which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistShape(shape, scale, clockAngle) {
    if (shape.type === "BezierShape") {
        return {
            type: "BezierShape",
            points: twistBezierShapePoints(shape.points, scale, clockAngle),
        };
    } else if (shape.type === "Line") {
        return {
            type: "Line",
            points: twistLinePoints(shape.points, scale, clockAngle),
            width: scale * shape.width,
        };
    } else {
        throw Error("Invalid type for shape");
    }
}

/*
 * This is given a diagram and returns an equivalent diagram which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistDiagram(diagram, scale, clockAngle) {
    return diagram.map(shape => twistShape(shape, scale, clockAngle));
}

function shiftDiagram (diagram, coord){
    return diagram.map(shape => shiftShape(shape, coord));
}

function shiftShape(shape,coord) {
    if (shape.type === "BezierShape") {
        return {
            type: "BezierShape",
            points: shiftPoints(shape.points,coord),
        };
    } else if (shape.type === "Line") {
        throw Error("Not Implemented");
    } else {
        throw Error("Invalid type for shape");
    }
}

function shiftPoints(points, coord) {
    return points.map(p => {
        return {
            x: p.x+coord[0],
            y: p.y + coord[1],
            angle: p.angle,
            flat: p.flat,
        }
    });
}


/*
 * Given the points of a BezierShape, this returns the points of the same shape reflected over the y-axis.
 */
function reflectXBezierShapePoints(points) {
    return points.map(p => {
        return {x: -1 * p.x, y: p.y, angle: (12 - p.angle) % 12, flat: p.flat};
    });
}

/*
 * Given the points of a line, this returns the points of the same line reflected over the y-axis.
 */
function reflectXLinePoints(points) {
    return points.map(p => {
        return {x: -1 * p.x, y: p.y};
    });
}

/*
 * Given a shape, this returns the same shape reflected over the y-axis.
 */
function reflectXShape(shape) {
    if (shape.type === "BezierShape") {
        return {
            type: "BezierShape",
            points: reflectXBezierShapePoints(shape.points),
        };
    } else if (shape.type === "Line") {
        return {
            type: "Line",
            points: reflectXLinePoints(shape.points),
            width: shape.width,
        };
    } else {
        throw Error("Invalid type for shape");
    }
}

function reflectXDiagram(diagram){
    return diagram.map(shape => reflectXShape(shape));
}



/*
 * This is passed a draw context, an array of BezierShapePoint objects (where the first and
 * last object are the same), an x,y position, and a color. It draws the shape to the drawContext
 * in the given color at that location.
 * strokeWidth and strokeColor are optional, if defined the shape will be outlined in the
 * with the specified lineWidth and color
 */
function drawBezierShapePoints(drawContext, points, coord, color, strokeWidth, strokeColor) {
    console.assert(points[0].x === points[points.length - 1].x);
    console.assert(points[0].y === points[points.length - 1].y);

    function ctrlPos(p) {
        const cosAngle = Math.cos(p.angle * Math.PI / 6);
        const sinAngle = Math.sin(p.angle * Math.PI / 6);
        const dx = p.flat * -1 * sinAngle;
        const dy = p.flat * cosAngle;
        return {
            nextX: p.x + dx,
            nextY: p.y + dy,
            prevX: p.x - dx,
            prevY: p.y - dy,
        };
    }

    const x = coord[0];
    const y = coord[1];
    const cx = drawContext;
    cx.beginPath();
    cx.moveTo(x + points[0].x, y + points[0].y);
    for (let i=1; i < points.length; i++) { // loop over all EXCEPT the first and last
        const prev = points[i-1];
        const prevCtrlPos = ctrlPos(prev);
        const p = points[i];
        const thisCtrlPos = ctrlPos(p);
        cx.bezierCurveTo(
            x + prevCtrlPos.nextX, y + prevCtrlPos.nextY,
            x + thisCtrlPos.prevX, y + thisCtrlPos.prevY,
            x + p.x, y + p.y // x,y of the point
        );
    }
    cx.closePath();
    cx.fillStyle = color;
    cx.fill();

    if (strokeWidth !== undefined) {
        cx.lineWidth = strokeWidth;
        if (strokeColor !== undefined) {
            cx.strokeStyle = strokeColor;
        }
        cx.stroke();
    }
}

/*
 * On context "drawContext", this draws the line whose points are in "points"
 * at location coord (an x,y position in pixels) in the given color.
 */
function drawLine(drawContext, shape, coord, color) {
    const x = coord[0];
    const y = coord[1];
    const cx = drawContext;
    const points = shape.points;
    cx.beginPath();
    cx.moveTo(x + points[0].x, y + points[0].y);
    for (let i=1; i < points.length; i++) {
        const p = points[i];
        cx.lineTo(x + p.x, y + p.y);
    }
    cx.lineWidth = shape.width;
    cx.strokeStyle = color;
    cx.stroke();
}


function drawShape(drawContext, shape, coord, color, strokeWidth, strokeColor) {
    if (shape.type === "BezierShape") {
        return drawBezierShapePoints(drawContext, shape.points, coord, color, strokeWidth, strokeColor);
    } else if (shape.type === "Line") {
        return drawLine(drawContext, shape, coord, color);
    } else {
        throw Error("Invalid type for shape");
    }
}

/*
 * This is passed a draw context, a diagram (list of shapes), a coord (an x,y position in
 * pixels), and a color (a string which that can be used to specify a drawing context color).
 * It draws the shapes to the drawContext (in black) at that location in that color.
 */
function drawDiagram(drawContext, diagram, coord, color, strokeWidth, strokeColor) {
    diagram.forEach(shape => {
        drawShape(drawContext, shape, coord, color, strokeWidth, strokeColor)
    });
}
function drawLarva(drawContext, hexSize, colony,antState){
    const scaleFactor = 1 / 50;

    let placeToDraw = hexCenter(antState.location[0], antState.location[1], hexSize) ;
    placeToDraw[1] = placeToDraw[1] -15/120*hexSize;

    for (let i = 7; i >=0; i--) {
        const larvaSegment = {
            type: "BezierShape",
            points: [
                {x:0 + (.2*i*i)-i,  y:2 +i*1.8,  angle:9,  flat:3},
                {x:4+(.2*i*i)-i ,  y:0 +i*1.8,   angle:i>3?(i===7?5:5):6,   flat:1.5},
                {x:0+(.2*i*i)-i,  y:0+i*1.8,   angle:3,   flat:4},
                {x:-4+(.2*i*i)-i,  y:0+i*1.8,   angle:1,   flat:1.5},
                {x:0+(.2*i*i)-i,  y:2+i*1.8,  angle:9,  flat:3},

            ]};
        const larvaDiagram = twistDiagram([larvaSegment], hexSize * scaleFactor, antState.facing);
        const lineWidth = 1*hexSize *1/170;
        drawDiagram(drawContext, larvaDiagram, placeToDraw, "white",lineWidth, colony.antColor);

        const head = {
            type: "BezierShape",
            points: [
                {x:-3.7,  y:-1.2,  angle:5, flat:1},
                {x:-1.7,  y:-4.5, angle:8, flat:1},
                {x:2.3,   y:-5.2,  angle:9,  flat:2},
                {x:4.3,   y:-1.2,  angle:2,  flat:1},
                {x:0.3,   y:-0.2,   angle:3,  flat:2},
                {x:-3.7,  y:-1.2,  angle:5, flat:1},
            ]
        };
        const headDiagram = twistDiagram([head], hexSize * scaleFactor, antState.facing);
        drawDiagram(drawContext, headDiagram, placeToDraw, "white", lineWidth, colony.antColor);

        drawLabel(drawContext, hexSize, scaleFactor, antState);

    }

}
function drawEgg(drawContext, hexSize, colony, eggStack) {
    const scaleFactor = 1 / 50;
    const coord = hexCenter(eggStack.location[0], eggStack.location[1], hexSize);

    drawContext.fillStyle = "#faf1d2";
    drawContext.strokeStyle = colony.antColor;
    drawContext.lineWidth = 1*hexSize *1/100;



    if (eggStack.numberOfEggs === 1){
        drawContext.beginPath();
        center = coord;
        const radiusX = 8 * scaleFactor* hexSize;
        const radiusY = 4 * scaleFactor* hexSize;

        drawContext.ellipse(coord[0], coord[1], radiusX, radiusY, (Math.PI/3),0, 2 * Math.PI);
        drawContext.stroke();
        drawContext.fill();
    }
    if (eggStack.numberOfEggs === 2){
        drawContext.beginPath();
        center = coord;
        const radiusX = 8 * scaleFactor* hexSize;
        const radiusY = 4 * scaleFactor* hexSize;
        const offset = 6 * scaleFactor*hexSize;

        //drawContext.ellipse(coord[0], coord[1], radiusX-offset, radiusY-offset, (Math.PI/3),0, 2 * Math.PI);
        drawContext.ellipse(coord[0]-offset, coord[1], radiusX, radiusY, (Math.PI/3),0, 2 * Math.PI);
        drawContext.stroke();
        drawContext.fill();

        drawContext.beginPath();
        drawContext.ellipse(coord[0]+offset, coord[1], radiusX, radiusY, (Math.PI/3),0, 2 * Math.PI);
        drawContext.stroke();
        drawContext.fill();
    }
    if (eggStack.numberOfEggs === 3){
        drawContext.beginPath();
        center = coord;
        const radiusX = 8 * scaleFactor* hexSize;
        radiusY = 4 * scaleFactor* hexSize;
        let offsetX = 7 * scaleFactor*hexSize;
        let offsetY = 4 * scaleFactor*hexSize;

        // //middle egg
        // drawContext.ellipse(coord[0], coord[1], radiusX, radiusY, (Math.PI/3),0, 2 * Math.PI);
        // drawContext.stroke();
        // drawContext.fill();

        drawContext.beginPath();
        drawContext.ellipse(coord[0]-offsetX, coord[1]+offsetY, radiusX, radiusY, (Math.PI/3),0, 2 * Math.PI);
        drawContext.stroke();
        drawContext.fillStyle = "#faf1d2";
        drawContext.fill();



        offsetY = 6 * scaleFactor* hexSize;
        //most right egg
        drawContext.beginPath();
        drawContext.ellipse(coord[0]+offsetX, coord[1]-offsetY, radiusX, radiusY, (Math.PI/3),0, 2 * Math.PI);
        drawContext.stroke();
        drawContext.fill();

        drawContext.ellipse(coord[0], coord[1], radiusX, radiusY, (Math.PI),0, 2 * Math.PI);
        drawContext.stroke();
        drawContext.fill();


    }



}

function drawLabel(drawContext, hexSize, scaleFactor, antState) {
    //StackSize Label
    const coord = hexCenter(antState.location[0], antState.location[1], hexSize);
    drawContext.beginPath();
    const center = twistPoint({x: 12, y: -13}, hexSize * scaleFactor, antState.facing);
    const shiftedCenter = {x: center.x + coord[0], y: center.y + coord[1]};
    const radius = 6 * scaleFactor * hexSize;


    drawContext.arc(shiftedCenter.x, shiftedCenter.y, radius, 0, 2 * Math.PI);
    drawContext.stroke();
    drawContext.fillStyle = "white";
    drawContext.fill();
    const fontSize = Math.round(10 * scaleFactor * hexSize);
    colorText(drawContext, antState.numberOfAnts, shiftedCenter.x, shiftedCenter.y, "black", fontSize);
}

/*
     * Draw an ant onto the drawContext, sized for hexes of width hexSize and drawn at the
     * hex at coordinates "coord" (a [x,y] array, measured in pixels), rotated to angle
     * "facing", and drawn in color "color".
     */
function drawAnt(drawContext, hexSize, colony, antState) {

    const correctedFacing = (antState.facing + 6) % 12;
    const scaleFactor = 1/50;
    const antScaleFactor = antState.cast === "Worker" ? 1/70: 1/50; // multiply by this to scale to normal ant size
    const coord = hexCenter(antState.location[0], antState.location[1], hexSize);

    //things drawn under the ant
    if (antState.cast === "Soldier") {
        const mandible = {
            type: "BezierShape",
            points: [
                {x:2.5,   y:12,   angle:0,   flat:7},
                {x:0,   y:16,   angle:9,   flat:0},
                {x:1,   y:12,   angle:5,   flat:3},
                {x:2.5,   y:12,   angle:3,   flat:0},

            ]}
        const mandibles = [mandible, reflectXShape(mandible)];
        const scaledMandibles = twistDiagram(mandibles, hexSize * antScaleFactor, correctedFacing);
        drawDiagram(drawContext, scaledMandibles, coord,colony.antColor);


    }
    if (antState.cast === "Queen") {
        const leftTopWing = {
            type: "BezierShape",
            points: [
                {x:1,   y:3,   angle:0,   flat:0},
                {x:12,  y:10,  angle:10,  flat:4},
                {x:21,  y:9,   angle:6,   flat:2},
                {x:16,  y:4,   angle:4,   flat:4},
                {x:1,   y:1,   angle:0,   flat:0},
                {x:1,   y:3,   angle:0,   flat:0},
            ]
        };
        const rightTopWing = reflectXShape(leftTopWing);
        const leftBottomWing = {
            type: "BezierShape",
            points: [
                {x:1,    y:0,    angle:0,   flat:0},
                {x:10,   y:0.5,  angle:9,   flat:4},
                {x:19.5, y:-0.5, angle:6,   flat:2},
                {x:11,   y:-4.5, angle:3,   flat:4},
                {x:1,    y:-1.5, angle:2,   flat:0},
                {x:1,    y:0,    angle:0,   flat:0},
            ]
        };
        const rightBottomWing = reflectXShape(leftBottomWing);
        const unscaledQueenWingsDiagram = [leftTopWing, rightTopWing, leftBottomWing, rightBottomWing];
        const queenWingsDiagram = twistDiagram(unscaledQueenWingsDiagram, hexSize * antScaleFactor, correctedFacing);
        drawDiagram(drawContext, queenWingsDiagram, coord, "#FFFF00");
    }

    //draw the ant
    const halfBodyPoints = [
        {x:0,   y:13,   angle:9,   flat:2},   // A
        {x:4,   y:10,   angle:7,   flat:1.5}, // B
        {x:3,   y:8,    angle:3,   flat:0.8}, // C
        {x:1,   y:8.2,  angle:3,   flat:0},   // D
        {x:1,   y:8.2,  angle:6,   flat:0},   // E
        {x:1,   y:7,    angle:7.5, flat:1},   // F
        {x:3,   y:6,    angle:7.5, flat:1.5}, // G
        {x:3,   y:-2,   angle:5,   flat:1.5}, // H
        {x:1.2, y:-4,   angle:4,   flat:0.5}, // I
        {x:1.2, y:-5,   angle:8,   flat:0.5}, // J
        {x:4,   y:-6,   angle:7,   flat:0.5}, // K
        {x:4.5, y:-15,  angle:5,   flat:2},   // L
        {x:0,   y:-19,  angle:3,   flat:1.5}, // M
    ];
    const body = {
        type: "BezierShape",
        points: makeSymmetric(halfBodyPoints),
    }
    const legWidth = 0.8;
    const antennaWidth = 0.5;
    const leg1 = {
        type: "Line",
        points: [
            {x:3, y:4},  // N
            {x:9,y:9},   // O
            {x:17,y:11}, // P
        ],
        width: legWidth,
    }
    const leg2 = {
        type: "Line",
        points: [
            {x:3, y:1.5}, // Q
            {x:11,y:3.5}, // R
            {x:15,y:2},   // S
            {x:19,y:3},   // T
        ],
        width: legWidth,
    }
    const leg3 = {
        type: "Line",
        points: [
            {x:2.5, y:-1}, // U
            {x:5.5, y:-3}, // V
            {x:10,y:-2.5}, // W
            {x:17,y:-8},   // X
            {x:20,y:-9},   // Y
        ],
        width: legWidth,
    }
    const antennae1 = {
        type: "Line",
        points: [
            {x: 3,   y: 11},  // AA
            {x: 12,   y: 14}, // BB
            {x: 12.5, y: 17}, // CC
            {x: 12,   y: 18}, // DD
        ],
        width: antennaWidth,
    }
    const leg4 = reflectXShape(leg1);
    const leg5 = reflectXShape(leg2);
    const leg6 = reflectXShape(leg3);
    const antennae2 = reflectXShape(antennae1);

    const unscaledAntDiagram = [body, leg1, leg2, leg3, leg4, leg5, leg6, antennae1, antennae2];
    const antDiagram = twistDiagram(unscaledAntDiagram, hexSize * antScaleFactor, correctedFacing);
    drawDiagram(drawContext, antDiagram, coord, colony.antColor);


    //additions drawn after the ant
    if (antState.cast === "Soldier") {
        const blade = {
            type: "BezierShape",
            points: [
                {x:-.5,   y:-1,   angle:2,   flat:0},
                {x:0,   y:5,   angle:0,   flat:0},
                {x:.5,   y:-1,   angle:0,   flat:0},
                {x:-.5,   y:-1,   angle:2,   flat:0},
            ]
        };
        const handle = {
            type: "BezierShape",
            points: [
                {x:-1.5,   y:0,   angle:3,   flat:0},
                {x:1.5,   y:0,   angle:3,   flat:0},
                {x:1.5,   y:.5,   angle:3,   flat:0},
                {x:-1.5,   y:.5,   angle:3,   flat:0},
                {x:-1.5,   y:0,   angle:3,   flat:0},
        ]}
        const daggerCenter = [blade, handle];

        const coord_left1 = [16,10.5];
        const coord_left2 = [19,3];
        const coord_left3 = [19,-9];
        const daggerLeft1 = shiftDiagram(daggerCenter, coord_left1);
        const daggerLeft2 = shiftDiagram(twistDiagram(daggerCenter, 1, 11), coord_left2);
        const daggerLeft3 = shiftDiagram(twistDiagram(daggerCenter, 1, 11), coord_left3);

        const leftDaggers = [].concat(daggerLeft1, daggerLeft2, daggerLeft3);
        const rightDaggers = reflectXDiagram(leftDaggers);

        const daggers = [].concat(leftDaggers, rightDaggers, daggerCenter);

        const scaledDaggers = twistDiagram(daggers, hexSize * antScaleFactor, correctedFacing);
        drawDiagram(drawContext, scaledDaggers, coord, "#FFFF00");

    }

    if (antState.cast === "Queen") {
        const crown = {
            type: "BezierShape",
            points: makeSymmetric([
                {x:0,   y:16,   angle:7,   flat:0},
                {x:1.5, y:14,   angle:7,   flat:0},
                {x:3,   y:16,   angle:7,   flat:0},
                {x:4,   y:13,   angle:10,  flat:0},
                {x:0,   y:12,   angle:3,   flat:4},
            ]),
        };
        const leftEye = {
            type: "BezierShape",
            points: [
                {x:2,   y:11,   angle:0,   flat:1},
                {x:3,   y:11,   angle:6,   flat:1},
                {x:2,   y:11,   angle:0,   flat:1},
            ]
        }
        const rightEye = reflectXShape(leftEye);
        const unscaledQueenDiagram = [crown, leftEye, rightEye];
        const queenDiagram = twistDiagram(unscaledQueenDiagram, hexSize * antScaleFactor, correctedFacing);
        drawDiagram(drawContext, queenDiagram, coord, "#FFFF00");
    }
    drawLabel(drawContext, hexSize, scaleFactor, antState);

}


function colorText(drawContext, text, x, y, fillColor, fontSize) {
    drawContext.beginPath();
    drawContext.textAlign = "center";
    drawContext.textBaseline = "middle";
    drawContext.fillStyle = fillColor;
    drawContext.font = `${fontSize}px lucida sans`;
    drawContext.fillStyle = fillColor;
    drawContext.fillText(text, x, y);
}

/*
 * Draws the "items" (ants and other mobile sprites) for the indicated gameState onto the
 * drawContext if the hexes are hexSize wide.
 */
function drawItems(drawContext, gameState, hexSize) {
    gameState.colonies.forEach(colony => {
        // render eggs
        const eggsToRender = colony.eggs;
        eggsToRender.forEach(eggStack => {
            drawEgg(drawContext, hexSize, colony, eggStack);
        });

        //render ants
        const antsToRender = mergeAnts(colony.ants);
        antsToRender.forEach(antState => {
            if (antState.cast === "Larva"){
                drawLarva(drawContext, hexSize, colony, antState);
            } else {
                drawAnt(drawContext, hexSize, colony, antState);
            }
        });
    });
    if (lastSelectedAntNum !== null){
       // lastSelectedAnt =
    }

}
