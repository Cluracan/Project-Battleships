import { availableShips } from "./game-logic/battleships-config.mjs";
import GameboardController from "./gameboardController.mjs";
import { cleanContent } from "./utils.mjs";

export default function insertBuildFleetContent(
  headerContent,
  leftContent,
  rightContent,
  footerContent
) {
  //Variables
  let availableShipList = availableShips.slice();
  let placedShipList = [];
  let selectedShipDiv;

  //Clean divs
  cleanContent(headerContent, leftContent, rightContent, footerContent);

  //Header
  headerContent.appendChild(getMarvinDiv());
  headerContent.appendChild(getTitleDiv());

  //Left content
  const shipSelectContainer = document.createElement("div");
  shipSelectContainer.setAttribute("id", "ship-select-container");
  leftContent.appendChild(shipSelectContainer);

  //fill ships
  availableShips.forEach((ship) => {
    const shipHolder = document.createElement("div");
    shipHolder.setAttribute("class", "ship-holder");
    const shipName = document.createElement("div");
    shipName.setAttribute("class", "ship-name");
    shipName.textContent = ship.name;
    shipHolder.appendChild(shipName);
    if (
      availableShipList.some((availableShip) => availableShip.id === ship.id)
    ) {
      const shipDiv = getShipDiv(ship);
      shipDiv.addEventListener("mousedown", handleMouseDown);
      shipHolder.appendChild(shipDiv);
    }
    shipSelectContainer.appendChild(shipHolder);
  });
  //old content :
  // for (const shipData of availableShipList) {
  //   const shipDiv = getShipDiv(shipData);
  //   shipDiv.addEventListener("mousedown", handleMouseDown);
  //   shipSelectContainer.appendChild(shipDiv);
  // }

  //Right content

  //TESTING CLASS GAMEBOARD CONTROLLER-
  const gameboardController = new GameboardController(rightContent);

  //mouse functions
  function handleMouseDown(e) {
    selectedShipDiv = e.target.parentNode;

    const shipPartIndex = parseInt(e.target.dataset.shipPartIndex);
    selectedShipDiv.dataset.selectedPartIndex = shipPartIndex;

    gameboardController.selectedShip = {
      id: selectedShipDiv.id,
      shipLength: parseInt(selectedShipDiv.dataset.shipLength),
      shipPartIndex: selectedShipDiv.dataset.selectedPartIndex,
      orientation: 0,
    };

    const bounds = selectedShipDiv.getBoundingClientRect();

    selectedShipDiv.dataset.height = bounds.height;
    selectedShipDiv.dataset.width = bounds.width;
    selectedShipDiv.dataset.orientation = 0;
    selectedShipDiv.style.pointerEvents = "none";
    selectedShipDiv.style.zIndex = 1;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }
  function handleMouseMove(e) {
    selectedShipDiv.style.position = "absolute";
    let { xOffset, yOffset } = getOffset(selectedShipDiv);

    selectedShipDiv.style.left = `${e.clientX - xOffset}px`;
    selectedShipDiv.style.top = `${e.clientY - yOffset}px`;

    window.addEventListener("wheel", handleMouseWheel);
  }
  function handleMouseWheel(e) {
    const rotationIncrement = e.deltaY === 100 ? 1 : 3;
    const currentOrientation = gameboardController.selectedShip.orientation;
    const newOrientation = (currentOrientation + rotationIncrement) % 4;
    selectedShipDiv.classList.remove(`rotate${currentOrientation}`);
    selectedShipDiv.classList.add(`rotate${newOrientation}`);
    selectedShipDiv.dataset.orientation = newOrientation;
    gameboardController.selectedShip.orientation = newOrientation;

    let { xOffset, yOffset } = getOffset(selectedShipDiv);

    selectedShipDiv.style.left = `${e.clientX - xOffset}px`;
    selectedShipDiv.style.top = `${e.clientY - yOffset}px`;

    if (e.target.classList.contains("play-cell")) {
      gameboardController.handleMouseOver(e);
    }
  }
  function handleMouseUp(e) {
    if (
      e.target.classList.contains("play-cell") &&
      gameboardController.selectedShip
      //set as gamebaord fn 'validDropSite'
    ) {
      const curRow = parseInt(e.target.dataset.rowIndex);
      const curCol = parseInt(e.target.dataset.colIndex);
      const { id, shipLength, shipPartIndex, orientation } =
        gameboardController.selectedShip;
      const { startPoint, endPoint, allPoints } =
        gameboardController.getCoordinates(
          curRow,
          curCol,
          shipLength,
          shipPartIndex,
          orientation
        );

      if (
        gameboardController.isValidLocation(shipLength, startPoint, endPoint)
      ) {
        console.log("DROP!");
        gameboardController.placeSelectedShip(startPoint, endPoint, allPoints);
        //Remove ship from availableShips
        availableShipList = availableShipList.filter((ship) => ship.id !== id);
        //Add ship to placedShips
        placedShipList.push({
          id,
          shipLength,
          startPoint,
          endPoint,
          allPoints,
        });
      }
    }
    //ShipPlacement not valid: return selectedship to fleet
    //reset ship position
    shipSelectContainer.left = 0;
    shipSelectContainer.top = 0;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("wheel", handleMouseWheel);
    //refresh availableShipsContainer
    cleanContent(shipSelectContainer);
    availableShips.forEach((ship) => {
      const shipHolder = document.createElement("div");
      shipHolder.setAttribute("class", "ship-holder");
      const shipName = document.createElement("div");
      shipName.setAttribute("class", "ship-name");
      shipName.textContent = ship.name;
      shipHolder.appendChild(shipName);
      if (
        availableShipList.some((availableShip) => availableShip.id === ship.id)
      ) {
        const shipDiv = getShipDiv(ship);
        shipDiv.addEventListener("mousedown", handleMouseDown);
        shipHolder.appendChild(shipDiv);
      }
      shipSelectContainer.appendChild(shipHolder);
    });

    //remove selectedShipDiv
    selectedShipDiv = null;
    gameboardController.selectedShip = null;
  }

  function getOffset(selectedShipDiv) {
    let xOffset, yOffset;
    const shipLength = parseInt(selectedShipDiv.dataset.shipLength);
    const shipPartIndex = parseInt(selectedShipDiv.dataset.selectedPartIndex);
    const currentOrientation = parseInt(selectedShipDiv.dataset.orientation);

    switch (currentOrientation) {
      case 0:
        xOffset =
          ((shipPartIndex + 0.5) / shipLength) *
          parseInt(selectedShipDiv.dataset.width);
        yOffset = parseInt(selectedShipDiv.dataset.height) / 2;
        break;
      case 1:
        yOffset =
          (1 - (shipLength / 2 - shipPartIndex)) *
          parseInt(selectedShipDiv.dataset.height);
        xOffset = parseInt(selectedShipDiv.dataset.width) / 2;
        break;
      case 2:
        xOffset =
          (1 - (shipPartIndex + 0.5) / shipLength) *
          parseInt(selectedShipDiv.dataset.width);
        yOffset = parseInt(selectedShipDiv.dataset.height) / 2;
        break;
      case 3:
        yOffset =
          (shipLength / 2 - shipPartIndex) *
          parseInt(selectedShipDiv.dataset.height);
        xOffset = parseInt(selectedShipDiv.dataset.width) / 2;
        break;
    }

    return { xOffset, yOffset };
  }

  const startBtn = document.createElement("button");
  startBtn.textContent = "START";
  startBtn.addEventListener("click", (e) => {});
  footerContent.textContent = "Footer";
}

function getShipDiv(shipData) {
  const shipDiv = document.createElement("div");
  shipDiv.setAttribute("id", shipData.id);
  shipDiv.dataset.shipLength = shipData.length;
  for (let i = 0; i < shipData.length; i++) {
    const shipPart = document.createElement("div");
    shipPart.classList.add("ship-part");
    shipPart.classList.add(`${shipData.id}${i}`);
    shipPart.dataset.shipPartIndex = i;
    shipDiv.appendChild(shipPart);
  }
  return shipDiv;
}

function getMarvinDiv() {
  const marvinDiv = document.createElement("div");
  marvinDiv.setAttribute("id", "marvin-div");
  const marvinImg = document.createElement("img");
  marvinImg.src = "./images/marvin.svg";
  marvinDiv.appendChild(marvinImg);
  const instructionsDiv = document.createElement("div");
  instructionsDiv.setAttribute("id", "instructionsText");
  instructionsDiv.textContent = "testing";
  marvinDiv.appendChild(instructionsDiv);
  return marvinDiv;
}

function getTitleDiv() {
  const titleDiv = document.createElement("div");
  titleDiv.setAttribute("id", "title-text");
  titleDiv.textContent = "Battleships";
  return titleDiv;
}
