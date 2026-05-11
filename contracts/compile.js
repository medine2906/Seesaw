// Direct solcjs compilation — bypasses Hardhat's network-dependent compiler download
const solc = require("solc");
const fs = require("fs");
const path = require("path");

const contractSource = fs.readFileSync(path.join(__dirname, "src/Seesaw.sol"), "utf8");

// Read OpenZeppelin ReentrancyGuard
function findImport(importPath) {
  try {
    const resolved = path.join(__dirname, "node_modules", importPath);
    return { contents: fs.readFileSync(resolved, "utf8") };
  } catch (e) {
    return { error: "File not found: " + importPath };
  }
}

const input = {
  language: "Solidity",
  sources: {
    "Seesaw.sol": { content: contractSource },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode"] },
    },
  },
};

console.log("Compiling Seesaw.sol with solcjs", solc.version());
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === "error");
  if (errors.length > 0) {
    console.error("Compilation errors:");
    errors.forEach(e => console.error(e.formattedMessage));
    process.exit(1);
  }
  const warnings = output.errors.filter(e => e.severity === "warning");
  warnings.forEach(w => console.warn("Warning:", w.formattedMessage));
}

const contract = output.contracts["Seesaw.sol"]["Seesaw"];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

// Write artifact
const artifactDir = path.join(__dirname, "artifacts/src/Seesaw.sol");
fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(
  path.join(artifactDir, "Seesaw.json"),
  JSON.stringify({ abi, bytecode: "0x" + bytecode }, null, 2)
);

console.log("Artifact written to artifacts/src/Seesaw.sol/Seesaw.json");
console.log("ABI functions:", abi.filter(x => x.type === "function").map(x => x.name).join(", "));
