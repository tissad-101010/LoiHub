import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadFolderSmart } from "./fileLoader";

const testDir = path.join(process.cwd(), "tmp-test-loader");

describe("loadFolderSmart", () => {
  beforeEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it("returns [] if path does not exist", () => {
    const result = loadFolderSmart("path-that-does-not-exist");
    expect(result).toEqual([]);
  });

  it("loads one valid JSON file", () => {
    fs.writeFileSync(
      path.join(testDir, "one.json"),
      JSON.stringify({ id: 1, name: "test" })
    );

    const result = loadFolderSmart(testDir);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 1, name: "test" });
  });

  it("ignores non-json files", () => {
    fs.writeFileSync(path.join(testDir, "note.txt"), "hello");

    const result = loadFolderSmart(testDir);

    expect(result).toEqual([]);
  });

  it("ignores empty JSON files", () => {
    fs.writeFileSync(path.join(testDir, "empty.json"), "");

    const result = loadFolderSmart(testDir);

    expect(result).toEqual([]);
  });

  it("ignores invalid JSON files", () => {
    fs.writeFileSync(path.join(testDir, "bad.json"), "{ invalid json");

    const result = loadFolderSmart(testDir);

    expect(result).toEqual([]);
  });

  it("loads JSON files recursively", () => {
    const nestedDir = path.join(testDir, "nested");
    fs.mkdirSync(nestedDir);

    fs.writeFileSync(
      path.join(testDir, "root.json"),
      JSON.stringify({ level: "root" })
    );

    fs.writeFileSync(
      path.join(nestedDir, "nested.json"),
      JSON.stringify({ level: "nested" })
    );

    const result = loadFolderSmart(testDir);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ level: "root" });
    expect(result).toContainEqual({ level: "nested" });
  });
});