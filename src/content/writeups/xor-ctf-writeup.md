_CTF write-up and reproduction guide (TryHackMe, Windows only)_

# Summary

The challenge gives a Python script and a file called `encrypted.bin`. The script encrypts a flag by XOR-ing it with a random 4-byte key that repeats across the whole message. Because every TryHackMe flag begins with the known text `THM{`, and that text is exactly 4 bytes long, the entire key can be recovered from the ciphertext alone. Once the key is known, the full flag decrypts instantly.

| Item | Detail |
| --- | --- |
| Category | Cryptography |
| Vulnerability | Short, repeating XOR key combined with predictable plaintext |
| Attack | Known-plaintext attack on repeating-key XOR |
| Tools | Windows PowerShell, Python 3 (no Linux, VM or pwntools needed) |
| Result | Full 4-byte key recovered, flag decrypted (verified on a practice file first) |

# Background

## What is a .bin file?

`.bin` simply means binary: raw bytes with no fixed format. A text file stores bytes that map to readable characters; a binary file can contain any byte value from 0 to 255, so it looks like garbage in Notepad. The extension tells you nothing about the contents. To understand a `.bin` file, look at the program that created it, which in this challenge is provided.

## How XOR works

XOR (written `^` in Python) compares two numbers bit by bit. Think of it as flipping light switches: the key says which switches to flip. Flipping the same switch twice returns it to its original state, so XOR undoes itself.

There are three values: the plaintext letter, the key byte, and the encrypted (cipher) byte. Knowing any two gives you the third:

| Equation | Meaning |
| --- | --- |
| `plaintext ^ key = cipher` | Encrypting |
| `cipher ^ key = plaintext` | Decrypting |
| **`cipher ^ plaintext = key`** | **The attack: recovering the key** |

Worked example: the letter `T` is the number 84. With a key byte of 50, `84 ^ 50 = 102`, and 102 is what gets saved. An attacker who sees 102 and knows the letter was `T` computes `102 ^ 84 = 50`, which is the key.

# The vulnerable code

Challenge script (provided):

```python
import os
from pwn import *

key = os.urandom(4)
flag = b"THM{FAKE_FLAG_FOR_TESTING}"  # placeholder, real flag is hidden
encrypted = xor(flag, key)

with open("encrypted.bin", "wb") as f:
    f.write(encrypted)
```

| Line | What it does |
| --- | --- |
| `key = os.urandom(4)` | Creates a random key that is only **4 bytes** long |
| `flag = b"THM{...}"` | The secret. Every TryHackMe flag starts with `THM{` |
| `xor(flag, key)` | XORs each flag byte with a key byte, **repeating the key** every 4 bytes |
| `f.write(encrypted)` | Saves the raw result bytes to `encrypted.bin` |

# Vulnerability analysis

Two design choices together make this encryption breakable:

1. **The key is short and repeats.** Only 4 bytes protect the whole message. Byte 5 of the flag uses key byte 1 again, byte 6 uses key byte 2, and so on.
2. **The plaintext is predictable.** The first 4 characters of every flag are `T`, `H`, `M`, `{`. That is exactly the length of the key.

Because `cipher ^ plaintext = key`, XOR-ing the first 4 encrypted bytes with `THM{` reveals all 4 key bytes. The key then decrypts every other byte. The length of the file also leaks the length of the flag, since XOR does not change size.

# Environment setup (Windows)

Everything runs in Windows PowerShell and Python. pwntools is skipped because it is built for Linux and often fails on Windows; a 3-line XOR function replaces it.

```powershell
mkdir C:\CTF\xor
cd C:\CTF\xor
python --version
```

If `python --version` prints 3.x, you are ready. If it opens the Microsoft Store, install Python from python.org and tick **Add Python to PATH**.

# Reproduction steps

## Step 1: Build a practice target

Before attacking the real file, create your own encrypted file with a known answer. This lets you confirm the attack works. Save as `C:\CTF\xor\make_practice.py`:

```python
import os

def xor(data, key):
    return bytes(d ^ key[i % len(key)] for i, d in enumerate(data))

key = os.urandom(4)
flag = b"THM{FAKE_FLAG_FOR_TESTING}"
encrypted = xor(flag, key)

with open("practice.bin", "wb") as f:
    f.write(encrypted)

print("secret key (hex):", key.hex())
print("secret key (decimal bytes):", list(key))
```

Run it **once** in PowerShell:

```powershell
python make_practice.py
```

Expected output: two lines showing the random key, for example `1c30a9e6` and `[28, 48, 169, 230]`. Write the key down as an answer sheet, then pretend you never saw it. Run the script only once: every run creates a new key and overwrites `practice.bin`.

## Step 2: Inspect the binary file

```powershell
Format-Hex .\practice.bin
(Get-Item .\practice.bin).Length
```

`Format-Hex` is the Windows equivalent of `xxd`. It shows the byte offset, each byte in hex, and a text view that will be mostly junk. The length should be **26**, the same as the number of characters in `THM{FAKE_FLAG_FOR_TESTING}`.

## Step 3: Recover the key one byte at a time

Type `python` in PowerShell to open the interactive prompt (`>>>`), then:

```python
data = open("practice.bin", "rb").read()
hex(data[0] ^ ord("T"))
hex(data[1] ^ ord("H"))
hex(data[2] ^ ord("M"))
hex(data[3] ^ ord("{"))
```

Each line XORs one encrypted byte with the letter known to be at that position. Each result is one key byte. With the example key `1c30a9e6`, the results are `0x1c`, `0x30`, `0xa9`, `0xe6`, which match the answer sheet exactly.

## Step 4: Recover the whole key in one line

```python
key = bytes(data[i] ^ b"THM{"[i] for i in range(4))
key.hex()
```

## Step 5: Decrypt the full flag

The key repeats every 4 bytes. The modulo operator `%` gives the remainder after division, so `i % 4` cycles 0, 1, 2, 3, 0, 1, 2, 3... which picks the correct key byte for every position.

```python
flag = bytes(data[i] ^ key[i % 4] for i in range(len(data)))
print(flag)
```

Expected output: `b'THM{FAKE_FLAG_FOR_TESTING}'`. The practice round is complete and the attack is proven.

## Step 6: Solve the real challenge

Download the room's `encrypted.bin` (Download Task Files) into `C:\CTF\xor`. Save this as `solve.py`. It needs no key and no answer sheet, only the ciphertext and the known prefix:

```python
data = open("encrypted.bin", "rb").read()
known = b"THM{"

key = bytes(data[i] ^ known[i] for i in range(4))
print("key:", key.hex())

flag = bytes(data[i] ^ key[i % 4] for i in range(len(data)))
print(flag)
```

```powershell
cd C:\CTF\xor
python solve.py
```

The output shows the recovered key and the real flag beginning with `THM{`. Submit it in the TryHackMe room.

# Problems hit and how they were fixed

| Problem | Cause | Fix |
| --- | --- | --- |
| Result 203 did not match key 291... | Comparing a decimal number to a hex string; the key had also been regenerated by re-running the generator | Convert with `hex(203)` or `0x29`; compare only 2 hex characters per byte; run the generator once |
| Third key byte came out as 208 | Off-by-one error: used `data[3]` with `M`. Python counts from 0, so `M` (3rd letter) is `data[2]` | Match the index to the letter position: `data[2] ^ ord("M")` gives 169 (`0xa9`) |
| `pwn` module not found | pwntools is Linux-focused | Use the plain-Python `xor` function shown above |
| Fake flag will not submit | `THM{FAKE_FLAG_FOR_TESTING}` comes from your own practice file | Run `solve.py` against the room's real `encrypted.bin` |

# Remediation

- Use a real, vetted cipher such as **AES-GCM** from a standard library instead of hand-rolled XOR.
- If XOR must be used, the key must be truly random, **as long as the message**, and **never reused** (a one-time pad).
- Never assume an attacker cannot guess part of the plaintext. Headers, file signatures and flag formats are all predictable.

# Windows command cheat sheet

| Task | Linux | Windows |
| --- | --- | --- |
| Hex dump a file | `xxd file` | `Format-Hex file` |
| File size | `ls -l` | `(Get-Item file).Length` |
| Run Python | `python3` | `python` |
| XOR helper | pwntools `xor()` | 3-line `xor` function |
| Hex to decimal |  | `0x29` gives 41 |
| Decimal to hex |  | `hex(203)` gives `'0xcb'` |
| Hex string to bytes |  | `list(bytes.fromhex("1c30a9e6"))` |

Browser alternative with no install: CyberChef (gchq.github.io/CyberChef) has **To Hex** and **XOR** operations, useful for double-checking a recovered key.

# Key takeaways

- How to inspect binary files on Windows with `Format-Hex` and Python.
- XOR undoes itself, and knowing any two of plaintext, key and cipher reveals the third.
- Hex vs. decimal: each byte is 2 hex characters; convert before comparing.
- Python indexing starts at 0; off-by-one errors are common in CTFs.
- Testing an attack on a self-made target with a known answer before using it on the real one.
- The known-plaintext attack on repeating-key XOR, and how to prevent it.
