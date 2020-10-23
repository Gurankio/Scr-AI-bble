'use strict'

let letters = [];
let personal = [];
let effects = [];

const WIDTH = 15;
const HEIGHT = 15;
const SIZE = 50;

const DOUBLE_LETTER = 1;
const TRIPLE_LETTER = 2;
const DOUBLE_WORD = 3;
const TRIPLE_WORD = 4;

const letterPoints = new Map();
letterPoints.set("A", 1);
letterPoints.set("B", 4);
letterPoints.set("C", 1);
letterPoints.set("D", 4);
letterPoints.set("E", 1);
letterPoints.set("F", 4);
letterPoints.set("G", 4);
letterPoints.set("H", 8);
letterPoints.set("I", 1);
letterPoints.set("L", 2);
letterPoints.set("M", 2);
letterPoints.set("N", 2);
letterPoints.set("O", 1);
letterPoints.set("P", 3);
letterPoints.set("Q", 10);
letterPoints.set("R", 1);
letterPoints.set("S", 1);
letterPoints.set("T", 1);
letterPoints.set("U", 4);
letterPoints.set("V", 4);
letterPoints.set("Z", 8);

// Get next move
function getMultiplier(y, x) {
  switch (effects[y][x]) {
    case DOUBLE_LETTER:
      return 2;

    case TRIPLE_LETTER:
      return 3;

    case DOUBLE_WORD:
      return -2;

    case TRIPLE_WORD:
      return -3;

    default:
      return 1;
  }
}

function checkVertical(y, x) {
  let up = 1, upOut = "";
  while (y - up >= 0) {
      if (letters[y - up][x] === " " && letters[y - up][x - 1] === " " && letters[y - up][x + 1] === " ") {
        upOut += ".";
      } else {
        if (letters[y - up][x] === " ") break;
        upOut += letters[y - up][x];
      }
      up++;
  }
  up--;
  upOut = upOut.split("").reverse().join("");

  let down = 1, downOut = "";
  while (y + down < HEIGHT) {
      if (letters[y + down][x] === " " && letters[y + down][x - 1] === " " && letters[y + down][x + 1] === " ") {
        downOut += ".";
      } else {
        if (letters[y + down][x] === " ") break;
        downOut += letters[y + down][x];
      }
      down++;
  }
  down--;

  let out = upOut + letters[y][x] + downOut;
  if (up != 0 || down != 0) return {
    regex: new RegExp(out.replace(/\./g, ".?"), "gi"),
    chars: out.replace(/\./g, "").split(""),
    direction: "Vertical",
    coords: { y: y, x: x }
  };
  else return null;
}

function checkHorizontal(y, x) {
  let left = 1, leftOut = "";
  while (x - left >= 0) {
      if (letters[y][x - left] === " " && letters[y - 1][x - left] === " " && letters[y + 1][x - left] === " ") {
        leftOut += ".";
      } else {
        if (letters[y][x - left] === " ") break;
        leftOut += letters[y][x - left];
      }
      left++;
  }
  left--;
  leftOut = leftOut.split("").reverse().join("");

  let right = 1, rightOut = "";
  while (x + right < HEIGHT) {
    if (letters[y][x + right] === " " && letters[y - 1][x + right] === " " && letters[y + 1][x + right] === " ") {
      rightOut += ".";
    } else {
      if (letters[y][x + right] === " ") break;
      rightOut += letters[y][x + right];
    }
    right++;
  }
  right--;

  let out = leftOut + letters[y][x] + rightOut;
  if (left != 0 || right != 0) return {
    regex: new RegExp(out.replace(/\./g, ".?"), "gi"),
    chars: out.replace(/\./g, "").split(""),
    direction: "Horizontal",
    coords: { y: y, x: x }
  };
  else return null;
}

let lastTimeUsed = null;

function run() {
  console.log("Calculation started...");

  let cases = [];

  for (let i = 0; i < letters.length; i++) {
    for (let j = 0; j < letters[i].length; j++) {
      if (letters[i][j] === " ") continue;
      cases.push(checkVertical(i, j));
      cases.push(checkHorizontal(i, j));
    }
  }

  cases = cases.filter((v, i, a) => i === a.findIndex((t) => (t.regex.source === v.regex.source)))

  console.log(cases);

  if (words == null) {
    console.log("No Words.");
    return;
  }

  console.log("Finding possible moves...");
  console.log("Processing " + cases.length + " regex on " + words.length + " words...");
  if (lastTimeUsed != null) {
    console.log("Expected duration is " + cases.length * lastTimeUsed + " milliseconds.");
  }
  let startTime = performance.now();

  let results = [];

  for (let c of cases) {
    for (let word of words) {
      let result = word.match(c.regex);
      if (result !== null && result.length > 0 && result[0] === word) {
        let wordChars = word.toUpperCase().split("");
        let regexChars = c.chars.slice();

        for (let i = 0; i < wordChars.length; i++) {
          if (regexChars.includes(wordChars[i])) {
            regexChars.splice(regexChars.indexOf(wordChars[i]), 1);
            wordChars.splice(i, 1);
            i--;
          }
        }

        let personalChars = personal.slice();
        let possible = true;
        for (let i = 0; i < wordChars.length; i++) {
          if (!personalChars.includes(wordChars[i])) {
            possible = false;
            break;
          } else {
            personalChars.splice(personalChars.indexOf(wordChars[i]), 1)
          }
        }
        if (possible) {
          results.push({c: c, result: word, points: 0});
        }
      }
    }
  }

  let endTime = performance.now();
  console.log("Took " + (endTime - startTime) + " milliseconds.");
  let runTime = (endTime - startTime) / cases.length;
  if (lastTimeUsed != null) lastTimeUsed = (lastTimeUsed + runTime) / 2;
  else lastTimeUsed = runTime;

  console.log("Found " + results.length + " moves.");
  console.log("Sorting by points...");

  results.forEach((item, i) => {
    let known = item.result.toUpperCase().indexOf(item.c.chars.join());
    let prefix = item.result.toUpperCase().substring(0, known).split("").reverse();
    let suffix = item.result.toUpperCase().substring(known + item.c.chars.length, item.result.length).split("");

    if (item.c.direction === "Horizontal") {
      let wordMultiplier = 1;
      let pX = item.c.coords.x - 1, pY = item.c.coords.y;
      for (let i = 0; i < prefix.length; i++) {
        let multiplier = getMultiplier(pY, pX--);
        if (multiplier < 0) {
          wordMultiplier += abs(multiplier);
          multiplier = 1;
        }
        item.points += letterPoints.get(prefix[i]) * multiplier;
      }

      let sX = item.c.coords.x + item.c.chars.length, sY = item.c.coords.y;
      for (let i = 0; i < suffix.length; i++) {
        let multiplier = getMultiplier(sY, sX++);
        if (multiplier < 0) {
          wordMultiplier += abs(multiplier);
          multiplier = 1;
        }
        item.points += letterPoints.get(suffix[i]) * multiplier;
      }

      item.points *= wordMultiplier;
    }

    if (item.c.direction === "Vertical") {
      let wordMultiplier = 1;
      let pX = item.c.coords.x, pY = item.c.coords.y - 1;
      for (let i = 0; i < prefix.length; i++) {
        let multiplier = getMultiplier(pY--, pX);
        if (multiplier < 0) {
          wordMultiplier += abs(multiplier);
          multiplier = 1;
        }
        item.points += letterPoints.get(prefix[i]) * multiplier;
      }

      let sX = item.c.coords.x, sY = item.c.coords.y + item.c.chars.length;
      for (let i = 0; i < suffix.length; i++) {
        let multiplier = getMultiplier(sY++, sX);
        if (multiplier < 0) {
          wordMultiplier += abs(multiplier);
          multiplier = 1;
        }
        item.points += letterPoints.get(suffix[i]) * multiplier;
      }

      item.points *= wordMultiplier;
    }
  });

  results.sort((first, second) => {
    return first.points < second.points;
  });

  console.log("Sorted.");
  console.log("Calculation ended.");

  showResults(results);
}

function showResults(results) {
  for (let x = 0; x < (results.length < 5 ? results.length : 5); x++) {
    let item = results[x];
    console.log(item);

    if (!confirm("Best Move: " + item.result + " (" + item.points + ")")) continue;

    let known = item.result.toUpperCase().indexOf(item.c.chars.join());
    let prefix = item.result.toUpperCase().substring(0, known).split("").reverse();
    let suffix = item.result.toUpperCase().substring(known + item.c.chars.length, item.result.length).split("");

    if (item.c.direction === "Horizontal") {
      let pX = item.c.coords.x - 1, pY = item.c.coords.y;
      for (let i = 0; i < prefix.length; i++) {
        letters[pY][pX--] = prefix[i];
      }

      let sX = item.c.coords.x + item.c.chars.length, sY = item.c.coords.y;
      for (let i = 0; i < suffix.length; i++) {
        letters[sY][sX++] = suffix[i];
      }
    }

    if (item.c.direction === "Vertical") {
      let pX = item.c.coords.x, pY = item.c.coords.y - 1;
      for (let i = 0; i < prefix.length; i++) {
        letters[pY--][pX] = prefix[i];
      }

      let sX = item.c.coords.x, sY = item.c.coords.y + item.c.chars.length;
      for (let i = 0; i < suffix.length; i++) {
        letters[pY++][pX] = suffix[i];
      }
    }

    for (let i = 0; i < prefix.length; i++) {
      personal[personal.indexOf(prefix[i])] = " ";
    }

    for (let i = 0; i < suffix.length; i++) {
      personal[personal.indexOf(suffix[i])] = " ";
    }
    break;
  }
}

// Setup

function addSpecialCell(x, y, effect) {
  effects[x][y] = effect;
}

function addSpecialCells() {
  addSpecialCell(0, 3, DOUBLE_LETTER);
  addSpecialCell(0, 11, DOUBLE_LETTER);
  addSpecialCell(3, 14, DOUBLE_LETTER);
  addSpecialCell(11, 14, DOUBLE_LETTER);
  addSpecialCell(14, 11, DOUBLE_LETTER);
  addSpecialCell(14, 3, DOUBLE_LETTER);
  addSpecialCell(3, 0, DOUBLE_LETTER);
  addSpecialCell(11, 0, DOUBLE_LETTER);

  addSpecialCell(6, 2, DOUBLE_LETTER);
  addSpecialCell(7, 3, DOUBLE_LETTER);
  addSpecialCell(8, 2, DOUBLE_LETTER);
  addSpecialCell(6, HEIGHT - 1 - 2, DOUBLE_LETTER);
  addSpecialCell(7, HEIGHT - 1 - 3, DOUBLE_LETTER);
  addSpecialCell(8, HEIGHT - 1 - 2, DOUBLE_LETTER);
  addSpecialCell(2, 6, DOUBLE_LETTER);
  addSpecialCell(3, 7, DOUBLE_LETTER);
  addSpecialCell(2, 8, DOUBLE_LETTER);
  addSpecialCell(WIDTH - 1 - 2, 6, DOUBLE_LETTER);
  addSpecialCell(WIDTH - 1 - 3, 7, DOUBLE_LETTER);
  addSpecialCell(WIDTH - 1 - 2, 8, DOUBLE_LETTER);

  addSpecialCell(6, 6, DOUBLE_LETTER);
  addSpecialCell(8, 6, DOUBLE_LETTER);
  addSpecialCell(6, 8, DOUBLE_LETTER);
  addSpecialCell(8, 8, DOUBLE_LETTER);

  addSpecialCell(5, 1, TRIPLE_LETTER);
  addSpecialCell(9, 1, TRIPLE_LETTER);
  addSpecialCell(9, 5, TRIPLE_LETTER);
  addSpecialCell(13, 5, TRIPLE_LETTER);
  addSpecialCell(13, 9, TRIPLE_LETTER);
  addSpecialCell(9, 9, TRIPLE_LETTER);
  addSpecialCell(9, 13, TRIPLE_LETTER);
  addSpecialCell(5, 13, TRIPLE_LETTER);
  addSpecialCell(5, 9, TRIPLE_LETTER);
  addSpecialCell(1, 9, TRIPLE_LETTER);
  addSpecialCell(1, 5, TRIPLE_LETTER);
  addSpecialCell(5, 5, TRIPLE_LETTER);

  addSpecialCell(1, 1, DOUBLE_WORD);
  addSpecialCell(2, 2, DOUBLE_WORD);
  addSpecialCell(3, 3, DOUBLE_WORD);
  addSpecialCell(4, 4, DOUBLE_WORD);
  addSpecialCell(10, 10, DOUBLE_WORD);
  addSpecialCell(11, 11, DOUBLE_WORD);
  addSpecialCell(12, 12, DOUBLE_WORD);
  addSpecialCell(13, 13, DOUBLE_WORD);

  addSpecialCell(7, 7, DOUBLE_WORD);

  addSpecialCell(WIDTH - 1 - 1, 1, DOUBLE_WORD);
  addSpecialCell(WIDTH - 1 - 2, 2, DOUBLE_WORD);
  addSpecialCell(WIDTH - 1 - 3, 3, DOUBLE_WORD);
  addSpecialCell(WIDTH - 1 - 4, 4, DOUBLE_WORD);
  addSpecialCell(WIDTH - 1 - 10, 10, DOUBLE_WORD);
  addSpecialCell(WIDTH - 1 - 11, 11, DOUBLE_WORD);
  addSpecialCell(WIDTH - 1 - 12, 12, DOUBLE_WORD);
  addSpecialCell(WIDTH - 1 - 13, 13, DOUBLE_WORD);

  addSpecialCell(0, 0, TRIPLE_WORD);
  addSpecialCell(7, 0, TRIPLE_WORD);
  addSpecialCell(14, 0, TRIPLE_WORD);
  addSpecialCell(14, 7, TRIPLE_WORD);
  addSpecialCell(14, 14, TRIPLE_WORD);
  addSpecialCell(7, 14, TRIPLE_WORD);
  addSpecialCell(0, 14, TRIPLE_WORD);
  addSpecialCell(0, 7, TRIPLE_WORD);
}

function setup() {
  for (let i = 0; i < HEIGHT; i++) {
    let letterRow = [],
      effectRow = [];
    for (let j = 0; j < WIDTH; j++) {
      letterRow.push(' ');
      effectRow.push(0);
    }
    letters.push(letterRow);
    effects.push(effectRow);
  }

  for (let i = 0; i <= 7; i++) {
    personal[i] = ' ';
  }

  addSpecialCells();

  createCanvas(WIDTH * SIZE, (HEIGHT + 2) * SIZE);
  frameRate(10);

  createButton("Calcola").mousePressed(run);
}

// Input Logic

let inputState = 0,
  inputX, inputY, inputValue;

function mouseClicked() {
  inputX = floor(mouseX / SIZE);
  inputY = floor(mouseY / SIZE);

  if (inputState === 0) {
    if (inputX >= 0 && inputX < WIDTH && inputY >= 0 && inputY < HEIGHT) {
      inputState = 1;
    }

    if (inputX >= 0 && inputX < 7 && inputY === HEIGHT + 1) {
      inputState = 1;
    }
  }
}

function keyPressed() {
  inputValue = String.fromCharCode(keyCode);
  // inputValue = String.fromCharCode((96 <= keyCode && keyCode <= 105) ? keyCode-48 : keyCode)
  if (inputState === 1) inputState = 2;
  return false;
}


// Graphics

function drawSpecialCells() {
  for (let i = 0; i < effects.length; i++) {
    for (let j = 0; j < effects[i].length; j++) {
      if (effects[i][j] != 0) {
        switch (effects[i][j]) {
          case DOUBLE_LETTER:
            fill(93, 205, 250);
            break;

          case TRIPLE_LETTER:
            fill(1, 61, 245);
            break;

          case DOUBLE_WORD:
            fill(255, 154, 248);
            break;

          case TRIPLE_WORD:
            fill(255, 0, 23);
            break;
        }
        rect(i * SIZE, j * SIZE, SIZE, SIZE);
      }
    }
  }
}

function drawGrid() {
  fill(51);
  for (let i = 0; i <= WIDTH; i++) {
    line(i * SIZE, 0, i * SIZE, SIZE * HEIGHT);
  }

  for (let i = 0; i <= HEIGHT; i++) {
    line(0, i * SIZE, SIZE * WIDTH, i * SIZE);
  }

  drawSpecialCells();
}

function drawLetters() {
  fill(0);
  textSize(SIZE);
  textAlign(CENTER);

  for (let i = 0; i < letters.length; i++) {
    for (let j = 0; j < letters[i].length; j++) {
      text(letters[i][j], j * SIZE, i * SIZE, SIZE, SIZE);
    }
  }

  for (let i = 0; i <= 7; i++) {
    text(personal[i], i * SIZE, (HEIGHT + 1) * SIZE, SIZE, SIZE);
  }
}

function drawPersonal() {
  fill(51);
  line(0, (HEIGHT + 1) * SIZE, 7 * SIZE, (HEIGHT + 1) * SIZE);

  for (let i = 0; i <= 7; i++) {
    line(i * SIZE, (HEIGHT + 1) * SIZE, i * SIZE, (HEIGHT + 2) * SIZE);
  }

  line(0, (HEIGHT + 2) * SIZE, 7 * SIZE, (HEIGHT + 2) * SIZE);
}

//

function draw() {
  background(255);
  drawGrid();
  drawPersonal();

  if (inputState === 1) {
      fill(0, 255, 0);
      rect(inputX * SIZE, inputY * SIZE, SIZE, SIZE);
  }

  if (inputState === 2) {
    if (inputX >= 0 && inputX < WIDTH && inputY >= 0 && inputY < HEIGHT) {
      letters[inputY][inputX] = inputValue;
      inputState = 0;
    }

    if (inputX >= 0 && inputX < 7 && inputY === HEIGHT + 1) {
      personal[inputX] = inputValue;
      inputState = 0;
    }
  }

  drawLetters();
}
