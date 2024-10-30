import { test, expect, describe, beforeEach } from "vitest";
import { Gameboard } from "../gameboard";

test("Gameboard class exists", () => {
  expect(typeof Gameboard).toBe("function");
});

describe("Ship placement", () => {
  let testBoard;
  beforeEach(() => (testBoard = new Gameboard()));

  test("has a placeShip function", () => {
    expect(typeof testBoard.placeShip).toBe("function");
  });

  test("gameboard grid can be accessed", () => {
    expect(testBoard.grid[2][3]).toBe("#");
    expect(testBoard.grid[5][8]).toBe("#");
  });

  test("can place ship", () => {
    testBoard.placeShip("submarine", { row: 0, col: 2 }, { row: 2, col: 4 });
    for (const point of [
      { row: 0, col: 2 },
      { row: 1, col: 3 },
      { row: 2, col: 4 },
    ]) {
      expect(testBoard.grid[point.row][point.col]).toBe("S");
    }
    testBoard.placeShip("battleship", { row: 0, col: 3 }, { row: 0, col: 6 });
    for (const point of [
      { row: 0, col: 3 },
      { row: 0, col: 4 },
      { row: 0, col: 5 },
      { row: 0, col: 6 },
    ]) {
      expect(testBoard.grid[point.row][point.col]).toBe("B");
      expect(1 + 1).toBe;
    }
  });

  test("cannot place a ship out of bounds", () => {
    expect(
      testBoard.placeShip("submarine", { row: 0, col: 2 }, { row: 2, col: -1 })
    ).toBe(false);
  });

  test("cannot add an already-placed ship", () => {
    testBoard.placeShip("submarine", { row: 4, col: 1 }, { row: 4, col: 3 });
    expect(
      testBoard.placeShip("submarine", { row: 0, col: 2 }, { row: 2, col: 3 })
    ).toBe(false);
  });

  test("cannot add a misplaced ship", () => {
    expect(
      testBoard.placeShip("submarine", { row: 6, col: 2 }, { row: 6, col: 1 })
    ).toBe(false);
  });

  test("correct ship placement returns true", () => {
    expect(
      testBoard.placeShip("patrol boat", { row: 0, col: 2 }, { row: 0, col: 1 })
    ).toBe(true);
  });

  test("correct ship placement adds ship to placedShips store", () => {
    testBoard.placeShip("patrol boat", { row: 0, col: 2 }, { row: 0, col: 1 });
    testBoard.placeShip("submarine", { row: 1, col: 2 }, { row: 1, col: 4 });
    expect(testBoard.ships.length).toBe(2);
  });
});

describe("Receive attack", () => {
  let testBoard;
  beforeEach(() => (testBoard = new Gameboard()));

  test("has a receiveAttack function", () => {
    expect(typeof testBoard.receiveAttack).toBe("function");
  });

  test("attack is placed on grid", () => {
    testBoard.receiveAttack({ row: 2, col: 2 });
    expect(testBoard.grid[2][2]).toBe("*");
    testBoard.receiveAttack({ row: 4, col: 1 });
    expect(testBoard.grid[4][1]).toBe("*");
  });

  test("notification given if attack hits ship", () => {
    testBoard.placeShip("battleship", { row: 0, col: 3 }, { row: 0, col: 6 });
    expect(testBoard.receiveAttack({ row: 0, col: 4 })).toBe("HIT");
  });

  test("ship hitcount increased if attack hits ship", () => {
    testBoard.placeShip("battleship", { row: 0, col: 3 }, { row: 0, col: 6 });
    testBoard.receiveAttack({ row: 0, col: 4 });
    expect(
      testBoard.ships.find((ship) => ship.name === "battleship").hitCount
    ).toBe(1);
  });
});
