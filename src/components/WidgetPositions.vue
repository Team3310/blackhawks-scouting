<template>
  <canvas ref="canvas" @click="click">No canvas support</canvas>
</template>

<script setup lang="ts">
import { get } from "lodash";
import { useWidgetsStore } from "@/common/stores";
import { watch } from "vue";
import { Widget, WidgetPositions } from "@/config";

interface Point {
  readonly x: number;
  readonly y: number;
}

type DimensionName = "width" | "height";

const props = defineProps<{
  data: Widget & WidgetPositions,
  currentId: string
}>();

const selections = $ref(new Array<Point>());
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
watch(selections, draw);

let d = true;

const filled = new Array(24);

for (let i = 0; i<filled.length; i++){
  filled[i]=true;
}

// Redraws the canvas.
function draw() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear the canvas, then draw the image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Draw a circle around each selected point
  
  for (const { x, y } of selections) {
    for (let i = 0; i<selections.length; i++){
    if (!(x==selections[i].x1) && !(y == selections.y1)){
  ctx.fillStyle = "white";
  
    const rectWidth = 30;
    const rectHeight = 40;
    ctx.fillRect(x - rectWidth/2, y-rectHeight / 2, rectWidth, rectHeight);
  }


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
  const point = { x: event.offsetX, y: event.offsetY };
  if (!canvas) return;
  const relativeX = (point.x/canvas.width) * image.width;
  const relativeY = (point.y/canvas.width) * image.height;
  console.log(`Relavetive postition: ${relativeX.toFixed(2)}, ${relativeY.toFixed(2)}`);
  if (!props.data.allowMultiple) selections.pop(); // Only allow one value in the array if specified

  const isWithinBoundingBox = (x: number, y: number,box: {x1: number, y1:number, x2: number, y2:number}) => {
    return (x >= box.x1 && x <= box.x2 && y >= box.y1 && y<= box.y2);
  };

  const boundingBoxes = [
    [
      {x1: 96, y1: 16, x2: 148, y2: 60, xplace: 121, yplace: 60, place: 1},
      {x1: 166, y1: 16, x2: 217, y2: 60, xplace: 187, yplace: 60, place: 2},
      {x1: 329, y1: 16, x2: 381, y2: 60, xplace: 357, yplace: 60, place: 3},
      {x1: 462, y1: 16, x2: 517, y2: 60, xplace: 493, yplace: 60, place: 4},
      {x1: 633, y1: 16, x2: 682, y2: 60, xplace: 662, yplace: 60, place: 5},
      {x1: 709, y1: 16, x2: 747, y2: 60, xplace: 726, yplace: 60, place: 6}
    ],
    
];

for (let row = 0; row < 6; row++){
  for (let col = 0; col < 1; col++) {
    if (isWithinBoundingBox(relativeX, relativeY, boundingBoxes[col][row])){
      if (filled[boundingBoxes[col][row].place]){
        point.x = boundingBoxes[col][row].xplace;
        point.y = boundingBoxes[col][row].yplace;
        filled[boundingBoxes[col][row].place]= false;
      
        selections.push(point);}
      else{
        
      
        selections.pop(point);
      }
    }
  }
}




   

}
</script>
