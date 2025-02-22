<template>
  <div>
    <canvas ref="canvas" @click="click">No canvas support</canvas>
    <button @click="clearAll">Clear All</button>
    <button @click="toggleVerticalFlip">Flip Vertical</button>
  </div>
</template>

<script setup lang="ts">
import { get } from "lodash";
import { useWidgetsStore } from "@/common/stores";
import { watch } from "vue";
import { Widget, WidgetPositions } from "@/config";

interface Point {
  x: number;
  y: number;
  filled: boolean;
  orient: number;
}

type DimensionName = "width" | "height";

const props = defineProps<{
  data: Widget & WidgetPositions,
  currentId: string
}>();

const selections = $ref(new Array<Point>(36));
for (let count = 0; count<selections.length; count++){
  selections[count]= {x: 0,y: 0,filled: false, orient: 0};
}
const canvas = $ref<HTMLCanvasElement>();

// Set up a flag to flip vertically.
let flipVertical = false;

// Scales a coordinate on the canvas between 0 and 1 using the image dimensions.
const divide = (val: number, dimension: DimensionName) => (val / (get(canvas, dimension) ?? 1)).toFixed(3);

// The exported value
const value = $computed(() => selections.map(c => `${divide(c.x, "width")},${divide(c.y, "height")}`));
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });

// Load the image file
const image = new Image();
image.src = `${import.meta.env.BASE_URL}assets/${props.data.file}`;
image.addEventListener("load", () => {
  setDimensions("width", "height");
  setDimensions("height", "width");
  draw();
});

// Redraw the canvas when the selections change
//watch(selections, draw);

/*const filled = new Array(24);

for (let i = 0; i<filled.length; i++){
  filled[i]=true;
}*/

const boundingBoxes = [ //x,y positions of each coral node
    [
      {x1: 119, y1: 35, x2: 153, y2: 68, xplace: 130, yplace: 50, orient: 31 * Math.PI / 90}, // 62 degrees //1
      {x1: 181, y1: 4, x2: 210, y2: 35, xplace: 199, yplace: 16, orient: 31 * Math.PI / 90}, // 62 degrees //2
      {x1: 149, y1: 79, x2: 201, y2: 100, xplace: 174, yplace: 100, orient: 0}, //3
      {x1: 198, y1: 51, x2: 225, y2: 76, xplace: 217, yplace: 75, orient: 2 * Math.PI / 3}, // 45 degrees //4
      {x1: 162, y1: 109, x2: 221, y2: 133, xplace: 195, yplace: 137, orient: 0}, //5
      {x1: 221, y1: 83, x2: 252, y2: 106, xplace: 240, yplace: 115, orient: 2 * Math.PI / 3}, // 45 degrees //6
    ],
    [
      {x1: 33, y1: 213, x2: 80, y2: 233, xplace: 54, yplace: 264, orient: 0}, //7
      {x1: 33, y1: 154, x2: 80, y2: 165, xplace: 54, yplace: 190, orient: 0}, //8
      {x1: 101, y1: 202, x2: 127, y2: 223, xplace: 118, yplace: 253, orient: 2 * Math.PI / 3}, // 45 degrees //9
      {x1: 97, y1: 154, x2: 134, y2: 184, xplace: 114, yplace: 200, orient: 31 * Math.PI / 90}, // 62 degrees //10
      {x1: 143, y1: 203, x2: 172, y2: 226, xplace: 157, yplace: 254, orient: 2 * Math.PI / 3}, // 45 degrees //11
      {x1: 144, y1: 157, x2: 175, y2: 183, xplace: 156, yplace: 201, orient: 31 * Math.PI / 90}, // 62 degrees //12
    ],
    [
      {x1: 181, y1: 345, x2: 213, y2: 380, xplace: 197, yplace: 435, orient: 2 * Math.PI / 3}, // 45 degrees //13
      {x1: 116, y1: 311, x2: 156, y2: 351, xplace: 133, yplace: 400, orient: 2 * Math.PI / 3}, // 45 degrees //14
      {x1: 210, y1: 291, x2: 222, y2: 338, xplace: 218, yplace: 375, orient: 31 * Math.PI / 90}, // 62 degrees //15
      {x1: 148, y1: 283, x2: 189, y2: 308, xplace: 173, yplace: 350, orient: 0}, //16
      {x1: 227, y1: 271, x2: 254, y2: 306, xplace: 239, yplace: 338, orient: 31 * Math.PI / 90}, // 62 degrees //17
      {x1: 169, y1: 251, x2: 210, y2: 278, xplace: 194, yplace: 318, orient: 0}, //18
    ],
    [
      {x1: 381, y1: 322, x2: 441, y2: 345, xplace: 419, yplace: 405, orient: 31 * Math.PI / 90}, // 62 degrees //19
      {x1: 324, y1: 345, x2: 374, y2: 379, xplace: 353, yplace: 435, orient: 31 * Math.PI / 90}, // 62 degrees //20
      {x1: 354, y1: 285, x2: 397, y2: 308, xplace: 377, yplace: 350, orient: 0}, //21
      {x1: 316, y1: 305, x2: 348, y2: 329, xplace: 333, yplace: 375, orient: 2 * Math.PI / 3}, // 45 degrees //22
      {x1: 334, y1: 257, x2: 373, y2: 278, xplace: 357, yplace: 318, orient: 0}, //23
      {x1: 291, y1: 274, x2: 329, y2: 297, xplace: 314, yplace: 340, orient: 2 * Math.PI / 3}, // 45 degrees //24
    ],
    [
      {x1: 458, y1: 140, x2: 510, y2: 173, xplace: 497, yplace: 190, orient: 0}, //25
      {x1: 466, y1: 204, x2: 514, y2: 232, xplace: 494, yplace: 270, orient: 0}, //26
      {x1: 421, y1: 157, x2: 445, y2: 182, xplace: 433, yplace: 200, orient: 2 * Math.PI / 3}, // 45 degrees //27
      {x1: 421, y1: 202, x2: 449, y2: 226, xplace: 436, yplace: 260, orient: 31 * Math.PI / 90}, // 62 degrees //28
      {x1: 380, y1: 153, x2: 405, y2: 180, xplace: 395, yplace: 200, orient: 2 * Math.PI / 3}, // 45 degrees //29
      {x1: 377, y1: 199, x2: 410, y2: 226, xplace: 394, yplace: 260, orient: 31 * Math.PI / 90}, // 62 degrees //30
    ],
    [
      {x1: 337, y1: 0, x2: 369, y2: 36, xplace: 353, yplace: 14, orient: 2 * Math.PI / 3}, // 45 degrees //31
      {x1: 386, y1: 30, x2: 428, y2: 65, xplace: 418, yplace: 55, orient: 2 * Math.PI / 3}, // 45 degrees //32
      {x1: 317, y1: 47, x2: 346, y2: 78, xplace: 334, yplace: 78, orient: 31 * Math.PI / 90}, // 62 degrees //33
      {x1: 362, y1: 70, x2: 394, y2: 98, xplace: 377, yplace: 105, orient: 0}, //34
      {x1: 297, y1: 76, x2: 325, y2: 107, xplace: 312, yplace: 107, orient: 31 * Math.PI / 90}, // 62 degrees //35
      {x1: 337, y1: 101, x2: 373, y2: 127, xplace: 359, yplace: 136, orient: 0}, //36
    ]
];

//if alliance color = blue back of reef is on the left side and home processor is on bottom, if red back of reef is on the right side and home processor is on the top.
//Then add a flip button where color flips 
//add different color images, this is not possible i dont think



// Redraws the canvas.
function draw() {

  if (!canvas) {
    console.warn('Canvas element not found');
    return;
  }
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    console.warn('Failed to get 2D context - browser may not support canvas');
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let flipped = false;

  if (flipVertical && !flipped) {
    flipped = true;
    ctx.save();
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
  } else {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  // Draw a rectangle around each selected point
  for (let i = 0; i<selections.length; i++){
    const x = selections[i].x;
    const y = selections[i].y;
    const f = selections[i].filled;
    const rectWidth = 30;
    const rectHeight = 10;
    let angle = 0;
    if (f){
      angle = selections[i].orient;
      /*if (selections[i].orient == "vertical"){
        angle = Math.PI / 2; // 90 degrees
      }
      else if (selections[i].orient == "slight right") {
        angle = 2*(Math.PI) / 3; // 45 degrees
      }
      else if (selections[i].orient == "slight left") {
        angle = 31 * Math.PI / 90; // 62 degrees
      }*/
      ctx.save(); // Save the current context state
      ctx.translate(x, y); // Translate to the rectangle's center
      ctx.rotate(angle); // Rotate the context by the specified angle
      ctx.fillStyle = "white";
      ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight); // Draw the rectangle
      ctx.restore();
    }
  }
  ctx.restore(); //restores it here so that the flip is applied to the rectangles as well
}
  


// Sets the dimensions of the canvas based on the image dimensions and configuration data.
function setDimensions(a: DimensionName, b: DimensionName) {
  if (!canvas) return;

  const dims = { width: props.data.width ?? 0, height: props.data.height ?? 0 };

  if (dims[a] > 0) canvas[a] = dims[a];
  else if (dims[b] > 0) canvas[a] = (image[a] * dims[b]) / image[b];
  else canvas[a] = image[a];
}

// Clears all selections and redraws the canvas.
function clearAll() {
  for (let i = 0; i < selections.length; i++) {
    selections[i].filled = false;
    // Optionally reset x, y and orient if needed:
    selections[i].x = 0;
    selections[i].y = 0;
    selections[i].orient = 0;
  }
  draw();
}

function toggleVerticalFlip() {
  flipVertical = !flipVertical;
  draw();
}

// Adds a new selection to the array.
function click(event: MouseEvent) {
  let point = { x: event.offsetX, y: event.offsetY, f: false};
  if (!canvas) return;
  const relativeX = (point.x/canvas.width) * image.width;
  const relativeY = (point.y/canvas.width) * image.height;
  console.log(`Actual Click: ${relativeX.toFixed(2)}, ${relativeY.toFixed(2)}`);
  if (!props.data.allowMultiple) selections.pop(); // Only allow one value in the array if specified

  const isWithinBoundingBox = (x: number, y: number,box: {x1: number, y1:number, x2: number, y2:number, xplace: number, yplace: number}) => {
    return (x >= box.x1 && x <= box.x2 && y >= box.y1 && y<= box.y2);
  };

  // horizontal indexes: 1: 3,5 2: 1,2 3: 4,6 4: 3,5 5: 1,2 6: 4,6
  // vertical indexes: 1: 1,2,4,6 2: 3,4,5,6 3: 1,2,3,5 4: 1,2,4,6 5: 3,4,5,6 6: 1,2,3,5

  let index = -1;
  let orient = Math.PI / 2; // 90 degrees
  let found = false;
  let coolY = relativeY;

  if(flipVertical){
    coolY = canvas.height - relativeY;
    //relativeY = canvas.height/2 + (canvas.height/2 - relativeY);
      }
  for (let row = 0; row < 6; row++){ //check if click is in one of the bounding boxes
    for (let col = 0; col < 6; col++) {
      /*if(flipVertical){
        relativeY = canvas.height - relativeY;
        //relativeY = canvas.height/2 + (canvas.height/2 - relativeY);
      }*/
      /*ctx.strokeStyle = 'red';  // Debug color
      ctx.lineWidth = 2;
      ctx.save(); // Save the current context state
      ctx.translate((boundingBoxes[col][row]).xplace, boundingBoxes[col][row].yplace); // Translate to the rectangle's center
      ctx.fillRect(-30 / 2, -20 / 2, 30, 20); // Draw the rectangle
      ctx.restore();*/
      //let checkY = flipVertical ? canvas.height - relativeY : relativeY;
      //ctx.translate(0, canvas.height);
      //ctx.scale(1, -1);
      
      if (isWithinBoundingBox(relativeX, coolY, boundingBoxes[col][row])){
        found = true;
        index = (col*6)+(row);
        point = { x: (boundingBoxes[col][row]).xplace, y: boundingBoxes[col][row].yplace, f: true };
        orient = (boundingBoxes[col][row]).orient;
        break;
      }
    if (found) break;
    }
  }
  if (found){
    console.log("Index: " + index);/*
    if (index <= 5){
      if (index == 2 || index == 4){
        orient = "horizontal";
      }
      else if (index == 0 || index == 1){
        orient = "slight left";
      }
      else if (index == 3 || index == 5){
        orient = "slight right";
      } 
    }
    else if (index <= 11){
      if (index == 6 || index == 7){
        orient = "horizontal";
      }
      else if (index == 9 || index == 11){
        orient = "slight left";
      }
      else if (index == 8 || index == 10){
        orient = "slight right";
      } 
    }
    else if (index <= 17){
      if (index == 15 || index == 17){
        orient = "horizontal";
      }
      else if (index == 14 || index == 16){
        orient = "slight left";
      }
      else if (index == 12 || index == 13){
        orient = "slight right";
      } 
    }
    else if (index <= 23){
      if (index == 20 || index == 22){
        orient = "horizontal";
      }
      else if (index == 18 || index == 19){
        orient = "slight left";
      }
      else if (index == 21 || index == 23){
        orient = "slight right";
      } 
    }
    else if (index <= 29){
      if (index == 24 || index == 25){
        orient = "horizontal";
      }
      else if (index == 27 || index == 29){
        orient = "slight left";
      }
      else if (index == 26 || index == 28){
        orient = "slight right";
      } 
    }
    else if (index <= 35){
      if (index == 33 || index == 35){
        orient = "horizontal";
      }
      else if (index == 32 || index == 34){
        orient = "slight left";
      }
      else if (index == 30 || index == 31){
        orient = "slight right";
      } 
    }
    else{
      console.log("error1");
    }*/
    selections[index].orient = orient;
    console.log("Orient: " + orient);

    if (!((selections[index]).filled)){
      console.log("not filled");
      (selections[index].filled)= true;
      (selections[index].x)= point.x;
      (selections[index].y)= point.y;
    }    
    else{
      console.log("already filled");
      (selections[index].filled)= false;
      (selections[index].x)= point.x;
      (selections[index].y)= point.y;
    }  
    draw();
    console.log("Grid position: " + (selections[index].x) + ", " + (selections[index].y));   
  }
}
// Add after draw() function
function drawDebugBoxes() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  ctx.strokeStyle = 'red';  // Debug color
  ctx.lineWidth = 2;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const box = boundingBoxes[col][row];
      
      // Draw bounding box
      ctx.beginPath();
      ctx.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.stroke();
      
      // Draw center point
      ctx.fillStyle = 'blue';
      ctx.fillRect(box.xplace - 2, box.yplace - 2, 4, 4);
    }
  }
}

// Add to draw() function after drawing image
/*if (flipVertical) {
  if (!canvas) break;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // ...existing image flip code...
  drawDebugBoxes();
  ctx.restore();
} else {
  // ...existing normal draw code...
  drawDebugBoxes();
}*/
</script>
