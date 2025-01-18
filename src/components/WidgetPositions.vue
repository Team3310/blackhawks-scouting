<template>
  <canvas ref="canvas" @click="click">No canvas support</canvas>
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
  orient: String;
}

type DimensionName = "width" | "height";

const props = defineProps<{
  data: Widget & WidgetPositions,
  currentId: string
}>();

const selections = $ref(new Array<Point>(24));
for (let count = 0; count<selections.length; count++){
  selections[count]= {x: 0,y: 0,filled: false, orient: ""};
}
const canvas = $ref<HTMLCanvasElement>();

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
      {x1: 119, y1: 35, x2: 153, y2: 68, xplace: 134, yplace: 47}, //1
      {x1: 181, y1: 4, x2: 210, y2: 35, xplace: 199, yplace: 16}, //2
      {x1: 149, y1: 79, x2: 201, y2: 100, xplace: 174, yplace: 100}, //3
      {x1: 198, y1: 51, x2: 225, y2: 76, xplace: 217, yplace: 75}, //4
      {x1: 162, y1: 109, x2: 221, y2: 133, xplace: 195, yplace: 137}, //5
      {x1: 226, y1: 82, x2: 251, y2: 111, xplace: 240, yplace: 115} //6
    ],
    
];



// Redraws the canvas.
function draw() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear the canvas, then draw the image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Draw a circle around each selected point
    for (let i = 0; i<selections.length; i++){
    const x = selections[i].x;
    const y = selections[i].y;
    const f = selections[i].filled;
    if (f){
      if (selections[i].orient == "vertical"){
        console.log("vertical");
        ctx.rotate(Math.PI / 2);}
        else{
            ctx.rotate(0);
        }
  ctx.fillStyle = "white"; 
  
    const rectWidth = 30;
    const rectHeight = 10;
    ctx.fillRect(x - rectWidth/2, y-rectHeight / 2, rectWidth, rectHeight);
    console.log("printed");
  }
    }

}
  


// Sets the dimensions of the canvas based on the image dimensions and configuration data.
function setDimensions(a: DimensionName, b: DimensionName) {
  if (!canvas) return;

  const dims = { width: props.data.width ?? 0, height: props.data.height ?? 0 };

  if (dims[a] > 0) canvas[a] = dims[a];
  else if (dims[b] > 0) canvas[a] = (image[a] * dims[b]) / image[b];
  else canvas[a] = image[a];
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
let orient = "";
for (let row = 0; row < 6; row++){ //check if click is in one of the bounding boxes
  for (let col = 0; col < 1; col++) {
    if (isWithinBoundingBox(relativeX, relativeY, boundingBoxes[col][row])){
      console.log("col " + col + " row " + row);
      index = (col*6)+(row);
      point = { x: (boundingBoxes[col][row]).xplace, y: boundingBoxes[col][row].yplace, f: true };
      if (col==0){
        if (row == 2 || row == 4){
          orient = "horizontal";
        }
        else{
          orient = "vertical";
        }
      

      }
      
  }
}
}
console.log("Index: " + index);

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
    console.log("Grid Position :"+ point.x + ", " + point.y);
    draw();
   
  }

</script>
