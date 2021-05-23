let gizmos = [];
let foods = [];

let population = 50;
let foodSize = 20;

let timeLine = 0;
const lifeTime = 1001;

let generation = 1;
let bestColorHistory = [];
let auto_save = false;
let active_gizmos = [];
let leader = null;
let input_1 = [];
let output_1 = [];
let output = [];

let mutationRate = 0.1;
let scoreText = "Pontos:";

let show = 0;
let species = [];
let showBest = false;

const Neat = neataptic.Neat;
const Config = neataptic.Config;
const Network = neataptic.Network;
Config.warnings = false;

let neat;

function setup() {
  neat = new Neat(12, 4, null, {
    popsize: population,
    elitism: Math.round(0.2 * population),
    mutationRate: mutationRate,
    mutationAmount: 3,
  });
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("field");
  populationSlider = createSlider(0, 200, population, 1);
  populationSlider.position(10, 100);
  populationSlider.style("width", "80px");

  foodSizeSlider = createSlider(0, 50, 10, 5);
  foodSizeSlider.position(10, 120);
  foodSizeSlider.style("width", "80px");

  mutationSlider = createSlider(0, 1, 0.01, 0.01);
  mutationSlider.position(10, 140);
  mutationSlider.style("width", "80px");

  colorMode(HSB, 360, 100, 100);
  // drawingContext.shadowOffsetX = 5;
  // drawingContext.shadowOffsetY = -5;
  // drawingContext.shadowBlur = 10;
  // drawingContext.shadowColor = 'black';

  button = createButton("Load Gizmos");
  button.mouseClicked(load_gizmos);
  button.size(100, 25);
  button.position(10, 25);
  button.style("font-family", "Bodoni");
  button.style("font-size", "15px");

  buttonClear = createButton("Clear");
  buttonClear.mouseClicked(clear_gizmos);
  buttonClear.size(50, 25);
  buttonClear.position(120, 25);
  buttonClear.style("font-family", "Bodoni");
  buttonClear.style("font-size", "15px");

  checkbox = createCheckbox("Auto Save", false);
  checkbox.position(30, 65);
  checkbox.changed(toogle_auto_save);

  checkbox_best = createCheckbox("Show Best", showBest);
  checkbox_best.position(30, 50);
  checkbox_best.changed(toogle_show_best);

  let newGeneration=[]
  for (let i = 0; i < population; i++) {
    neat.mutate()
    newGeneration.push(neat.getOffspring());
  }
  neat.population = newGeneration

  for (let index = 0; index < population; index++) {
    let gizmo = new Gizmo(neat, neat.population[index]);
    gizmo.color = round((360 * index) / population);
    gizmos.active = true;
    gizmos.push(gizmo);
    active_gizmos.push(gizmo);
  }

  for (let i = 0; i < foodSize; i++) {
    foods.push(new Food());
  }

  // load_gizmos()

  console.log("Starting Simulation");

}
function reset_active_gizmos() {
  active_gizmos = [];
  gizmos.forEach((gizmo) => {
    active_gizmos.push(gizmo);
  });
}
function reset_gizmos() {
  gizmos.slice(0, population).forEach((gizmo) => {
    gizmo.reset();
  });
}

function clear_gizmos() {
  gizmos = [];
  active_gizmos = [];

  neat = new Neat(12, 2, null, {
    popsize: population,
    elitism: Math.round(0.2 * population),
    mutationRate: mutationRate,
    mutationAmount: 3,
  });
  newPopulation =[]

  for (let index = 0; index < population; index++) {
    neat.mutate()
    neat.getOffspring()

  }
  for (let index = 0; index < population; index++) {
    neat.mutate()
    neat.getOffspring()
    let gizmo = new Gizmo(neat, neat.population[index]);
    gizmo.color = round((360 * index) / population);
    gizmos.active = true;
    gizmos.push(gizmo);
    active_gizmos.push(gizmo);
  }

  generation = 1;
}

function toogle_auto_save() {
  auto_save = !auto_save;
  if (auto_save) {
    save_gizmos();
  }
}
function showBestGraph(){
  if (showBest) {
    $(".best").show();
    try {
      drawGraph(
        neat.population[0].graph($(".best").width()/2, $(".best").height()/2),
        ".best"
      );
    } catch (error) {

    }

  } else {
    $(".best").hide();
  }
}

function toogle_show_best() {
  showBest = !showBest;
  showBestGraph()
}
function load_gizmos() {
    neat.import(JSON.parse(localStorage['neat']))
    console.log("Loaded!")
}
function drawWalls() {
  colorMode(HSB, 360, 100, 100);
  fill(247, 100, 100);
  strokeWeight(0);
  rect(0, 0, windowWidth, 5);
  rect(0, 0, 5, windowHeight);
  rect(0, windowHeight - 5, windowWidth, 5);
  rect(windowWidth - 5, 0, 5, windowHeight);
}

function sortscore(a, b) {
  return a["score"] > b["score"] ? -1 : 0;
}

function remove_from_active(gizmo) {
  const index = active_gizmos.indexOf(gizmo);
  if (index > -1) {
    active_gizmos.splice(index, 1);
  }
}

function draw() {
  population = populationSlider.value();
  foodSize = foodSizeSlider.value();

  neat.mutationRate = mutationSlider.value();

  // if(frameRate()<30){
  //     gizmos.pop()
  //     active_gizmos.pop()
  // }
  background("gray");

  timeLine += 1;

  if (active_gizmos.length == 0) {
    newGeneration();
  }

  drawBestColors();
  // drawBestBrain()

  let remove = [];
  active_gizmos.forEach((gizmo) => {
    if (!gizmo.active) {
      remove.push(gizmo);
      return;
    }
    gizmo.draw();
    gizmo.sonar(foods.concat(active_gizmos));
    gizmo.move();
  });
  remove.forEach((gizmo) => {
    remove_from_active(gizmo);
  });

  drawFoods();
  drawWalls();
  checkLeader();
  strokeWeight(1);

  fill("black");
  text(leader?.output.map(n=>round(n,1)) ||"- -", 30,200);

  fill("black");
  rect(0, height - 50, 250, 50, 5);

  fill("white");
  rect(8, height - 15, (200 * (lifeTime - timeLine)) / lifeTime, 5);

  textSize(20);
  text("Generation: " + generation, 8, height - 20);

  fill("black");
  rect(width - 200, height - 50, 250, 50, 5);
  fill("white");
  text(scoreText, width - 190, height - 20);

  // text("FPS: " + frameRate().toFixed(0) + " Gizmos: " + active_gizmos.length, 10, 20);
  text("Gizmos: " + active_gizmos.length, 10, 20);

  textSize(20);
  text("Gizmos -" + populationSlider.value(), 100, 115);
  text("Food -" + foodSizeSlider.value(), 100, 135);
  text("Mutation -" + mutationSlider.value(), 100, 155);
}

function drawBestColors() {
  strokeWeight(1);
  bestColorHistory.forEach((bestColor, index) => {
    let height = index * 30 + 10;
    fill(bestColor, 100, 100, 0.8);
    rect(width - 40, height, 30, 30, 5);
  });
}

function drawFoods() {
  foods.forEach((food) => food.draw());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function newGeneration() {
  timeLine = 0;
  generation += 1;

  for (let i = 0; i < gizmos.length; i++) {
    gizmos[i].gene.score = gizmos[i].score;
  }

  neat.sort();
  const newGeneration = [];

  for (let i = 0; i < Math.round(0.05 * neat.popsize); i++) {
    newGeneration.push(neat.population[i]);
  }
  //mutação
  neat.mutate();

  //novos seres
  let newGizmosSize =  populationSlider.value() - Math.round(0.05 * neat.popsize)
  for (let i = 0; i < newGizmosSize; i++) {
    newGeneration.push(neat.getOffspring());
  }
  neat.population = newGeneration;


  foods = [];
  for (let i = 0; i < foodSizeSlider.value(); i++) {
    foods.push(new Food());
  }

  //best colors
  gizmos = gizmos.sort(sortscore);
  for (let i = 5; i > 0; i--) {
    if (gizmos[i]) {
      bestColorHistory.unshift(gizmos[i].color);
    }
  }
  bestColorHistory = bestColorHistory.slice(0, 20);

  let newGizmos = [];
  for (let i = 0; i < neat.population.length; i++) {
    let newGizmo = new Gizmo(neat, neat.population[i]);
    newGizmo.color = constrain(
      (gizmos[0].color + gizmos[1].color) / 2 + 10 * (Math.random() * 2 - 1),
      0,
      360
    );
    newGizmos.push(newGizmo);
  }

  gizmos = newGizmos;
  reset_active_gizmos();
  leader = null;
  showBestGraph()

  if (auto_save) {
    save_gizmos();
  }
}
function save_gizmos() {
    let data = neat.export();
    localStorage.setItem('neat', JSON.stringify(data, null, 2));
  console.log("Saved!");
}




function checkLeader() {
  if (frameCount % 120 == 0) {
    gizmos = gizmos.sort(sortscore);
    let score = [];
    let foundLeader = false;
    let foundActive = false;

    gizmos.forEach((gizmo) => {
      score.push(gizmo.score);
      if (gizmo.active && !foundLeader) {
        gizmo.leader = true;
        foundLeader = true;
        leader = gizmo;
      } else {
        gizmo.leader = false;
      }

      if (gizmo.active) {
        foundActive = true;
      }
    });

    score = score.slice(0, 5);

    scoreText = "Pontos:" + score;
    if (!foundActive) {
      timeLine = lifeTime;
    }
  }
}
