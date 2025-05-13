
# 💻 VANTA-1  
**A Simple Web-Based Virtual CPU & RAM Emulator**

## 🧠 Overview

**VANTA-1** is a lightweight, web-based virtual CPU and memory emulator designed to simulate basic low-level computing operations. It features a custom instruction set, 1MB of virtual RAM, a virtual display system, and a set of general-purpose registers that allow users to experiment with memory management, arithmetic operations, control flow, and I/O handling.

This project is ideal for educational purposes, retro computing enthusiasts, or those interested in building their own low-level execution environment from scratch.

---

## 🧮 Specifications

- 🧠 **Registers:** 9 general-purpose registers (R0–R8)  
- 📦 **RAM:** 1 Megabyte of virtual memory  
- 🎥 **Video Memory:** Mapped section of RAM used for rendering pixels  
- 🧾 **Keyboard Buffer:** Allocated RAM space for storing user input  
- 🖥️ **Display Output:** Outputs values to screen using a simple command  
- 🛑 **Instruction Set:** Custom-designed opcodes with varying byte sizes  

---

## 🔢 Instruction Set (Opcodes)

| Opcode | Name                     | Size (bytes) | Description |
|--------|--------------------------|--------------|-------------|
| `0x00` | **NULL**                 | 0            | No operation (NOP). Used as filler or placeholder. |
| `0x01` | **PUT**                  | 3            | Stores a value in a specific RAM address. Format: `PUT address value` |
| `0x02` | **GET**                  | 3            | Loads a value from RAM into a register. Format: `GET address register` |
| `0x03` | **COPY**                 | 3            | Copies the content of one register to another. Format: `COPY src dest` |
| `0x04` | **ADD**                  | 3            | Adds values from two registers and stores result in R4 (Accumulator). Format: `ADD reg1 reg2` |
| `0x05` | **SUB**                  | 3            | Subtracts second register from the first and stores in R4. Format: `SUB reg1 reg2` |
| `0x06` | **JMP**                  | 2            | Jumps to a specific memory address. Format: `JMP address` |
| `0x07` | **JMPIF (Z flag)**       | 3            | Jumps if the comparison flag (Z) is set to 1. Format: `JMPIF address flag` |
| `0x08` | **PRINT**                | 2            | Outputs the value of a register to the screen. Format: `PRINT reg` |
| `0x09` | **CMP (Compare)**        | 3            | Compares two registers. If equal, sets flag Z=1 in R4; else Z=0. Format: `CMP reg1 reg2` |
| `0x0A` | **SET**                  | 3            | Sets an immediate (constant) value into a register. Format: `SET value register` |
| `0x0B` | **INPUT**                | 2            | Waits for user input and stores it in a register. Format: `INPUT reg` |
| `0x0C` | **WRITE**                | 3            | Writes the value of a register into a specific RAM address. Format: `WRITE reg address` |
| `0xFF` | **HALT**                 | 1            | Stops execution of the program. |

---

## 🧱 RAM Structure (Memory Map)

| Address Range       | Description |
|---------------------|-------------|
| `0x000000`–`0x000257` | Reserved for general execution / OS |
| `0x000258`–`0x000259` | **Read/Write Index Tracker** — Keeps track of cursor or I/O buffer position |
| `0x00025A`–`0x0002BC` | **Keyboard Input Buffer** — Stores up to ~100 bytes of user keystrokes |
| `0x000320`–`0x0F423F` | **Video Memory** — Starts from address `0x320` (800 decimal) up to `width * height`, storing screen data for rendering (monochrome or grayscale expected) |
| Remaining addresses | Available for general RAM usage |

---

## 🧩 Example Use Case (Basic Program)

```js
0x01, 0, 20
0x08, 0,
0xff
```

---

## 🚀 Why VANTA-1?

- 🧑‍🏫 Great for learning how CPUs work under the hood.
- 🕹️ Fully interactive in-browser simulation.
- 🔧 Ideal for building custom instruction sets or testing low-level logic.
- 💡 Bridges the gap between high-level thinking and bare-metal programming.
