# moonshot devlog: first week of building an os from scratch

i am still sick and miserable, and i can't wait to go back to work. to calm my withdrawal i am writing this blog post for the progress of the first week of working on moonshot.

i chose to go with QEMU+RISC-V+OpenSBI+GDB for my development tech stack, or whatever. so first i had to learn some of the basics.

## RISC-V privilege levels

to learn about the privilege levels of RISC-V i used the following [article](https://danielmangum.com/posts/risc-v-bytes-privilege-levels/) and also looked at the [riscv specification](https://riscv.org/specifications/ratified/).

in simple terms, RISC-V offers three modes of privilege (order of decreasing privilege):

- machine (M)
- supervisor (S)
- user (U)

all RISC-V systems must implement M, but S and U are optional.

## OpenSBI

SBI=Supervisor Binary Interface

the goal of OpenSBI is to provide an open-source reference implementation of the RISC-V SBI specifications for platform-specific firmwares executing in M-mode. a bootloader implementation can link against OpenSBI library libsbi.a to ensure conformance with the SBI interface specifications.

## install riscv, QEMU and GDB

i installed QEMU via brew, through [these instructions](https://www.qemu.org/download/). initially, i could not run `riscv64-unknown-elf-gcc`, but it turns out it was not installed by default. so i had to run the following commands:

```
brew tap riscv-software-src/riscv
brew install riscv-tools
```

and i verified that it was installed with:

```
riscv64-unknown-elf-gcc --version
```

## run QEMU with no kernel

when running `qemu-system-riscv64 -machine virt -nographic` you should see something like:

```
OpenSBI v1.x
Platform Name             : riscv-virtio,qemu
...
Boot HART ID              : 0
...
```

at this point you are in M mode and OpenSBI is running

## start QEMU in debug mode

now we want to freeze at reset and open a GDB server:

```
qemu-system-riscv64 -machine virt -nographic -S -s
```

the `S` flag will make it so that we do not start CPU immediately and the `s` flag opens a GDB server on port `1234`. QEMU will appear to “hang” and that is correct, now the CPU is paused at the reset vector.

### attach GDB

run gdb:

```
th@tavro.se week1 % gdb
(gdb) target remote :1234
Remote debugging using :1234
...
0x0000000000001000 in ?? ()
```

you are now connected to QEMU's virtual CPU.

### inspect

on my first attempt i was no longer at rest, i was inside OpenSBI, i probably accidentally ran the continue command somehow. this is what that looked like:

```
(gdb) info registers
ra             0x8001165e	0x8001165e
...
pc             0x8000053e	0x8000053e

(gdb) p/x $pc
$1 = 0x8000053e
```

but on my second attempt it looked more correct, or what i was expecting it to look like:

```
(gdb) p/x $pc
$1 = 0x1000

(gdb) info registers
ra             0x0	0x0
sp             0x0	0x0
gp             0x0	0x0
tp             0x0	0x0
t0             0x0	0
t1             0x0	0
t2             0x0	0
fp             0x0	0x0
s1             0x0	0
a0             0x0	0
a1             0x0	0
a2             0x0	0
a3             0x0	0
a4             0x0	0
a5             0x0	0
a6             0x0	0
a7             0x0	0
s2             0x0	0
s3             0x0	0
s4             0x0	0
s5             0x0	0
s6             0x0	0
s7             0x0	0
s8             0x0	0
s9             0x0	0
s10            0x0	0
s11            0x0	0
t3             0x0	0
t4             0x0	0
t5             0x0	0
t6             0x0	0
pc             0x1000	0x1000
```

`0x1000` is the reset vector in QEMU's virt machine.

### disassemble

```
(gdb) x/10i $pc
=> 0x1000:	auipc	t0,0x0
   0x1004:	addi	a2,t0,40
   0x1008:	csrr	a0,mhartid
   0x100c:	ld	a1,32(t0)
   0x1010:	ld	t0,24(t0)
   0x1014:	jr	t0
   0x1018:	unimp
   0x101a:	.insn	2, 0x8000
   0x101c:	unimp
   0x101e:	unimp
```

we are now looking at the very first instructions executed after reset. this is not our code. this is QEMU's firmware stub. now watch me step through M mode boot firmware:

```
(gdb) si
0x0000000000001004 in ?? ()
(gdb) si
0x0000000000001008 in ?? ()
(gdb) si
0x000000000000100c in ?? ()
(gdb) si
0x0000000000001010 in ?? ()
(gdb) p/x $pc
$2 = 0x1010
```

### run OpenSBI

run `continue` and you will now see OpenSBI output in the QEMU window. interrupt and look at where we are:

```
(gdb) continue
Continuing.

^C
Program received signal SIGINT, Interrupt.
0x0000000080004fcc in ?? ()

(gdb) p/x $pc
$3 = 0x80004fcc
```

now we are somewhere inside OpenSBI.

### identify the handoff

OpenSBI's job is to initialize machine mode, set up traps, drop to supervisor mode and then jump to the next stage, which is kernel entry. right now, since we did not provide a kernel, there is no real handoff target. so we will stay in M mode.

the flow would look something like this

```
reset -> QEMU firmware stub -> OpenSBI (M-mode) -> sets up trap delegation, prepares S-mode -> kernel entry
```

we now understand more about boot than most developers, according to some random person on the internet. ;-P

## write simple linker script

on `qemu-system-riscv64 -machine virt` RAM starts at `0x80000000`, this is where OpenSBI loads your kernel. so we will place our kernel there.

now we want to write our minimal kernel code that sets the stack pointer, calls C and loops forever. the code can be found [here](https://github.com/tavro/moonshot-src/commit/4e89c47c718dbfad999610e46d8260e2422c487e)

`ENTRY(_start)` tells the linker that the program entry point is `_start`.

in the `MEMORY` section we are declaring there is a memory region called `RAM` and it starts at `0x80000000`, it is `128MB` long and it is readable, writable and executable. note, this does not allocate memory, it only describes hardware memory to the linker.

`.` is the current location counter, so `. = ORIGIN(RAM);` sets next thing at `0x80000000`

for the `.text` section we put all sections matching `.text*` into it, in RAM. this includes our `_start`, our C code and compiler generated functions, etc.

read only data, like string literals goes into the `.rodata` section.

initialized global variables goes into `.data` and unitialized goes into `.bss`

we also define a symbol `_stack_top` and place it `4KB` above the current location, we use this in `start.S`.

### compile and link

i am currently on a mac and apples built-in clang does not include the RISC-V backend, so i have to make sure to use `/opt/homebrew/opt/llvm/bin/clang`, this might be different for you if you are following along using a different system.

```
/opt/homebrew/opt/llvm/bin/clang \
  --target=riscv64-unknown-elf \
  -ffreestanding \
  -nostdlib \
  -fno-stack-protector \
  -c kernel.c -o kernel.o

/opt/homebrew/opt/llvm/bin/clang \
  --target=riscv64-unknown-elf \
  -ffreestanding \
  -nostdlib \
  -c start.S -o start.o
```

now we have compiled, so we want to link:

```
/opt/homebrew/opt/llvm/bin/clang \
  --target=riscv64-unknown-elf \
  -nostdlib \
  -T linker.ld \
  start.o kernel.o \
  -o moonshot.elf
```

i linked using clang, because apparently `ld.lld` was not installed on my machine.

### verify

we can now inspect the elf file and verify the entry point:

```
th@tavro.se week1 % riscv64-unknown-elf-objdump -h moonshot.elf

moonshot.elf:     file format elf64-littleriscv

Sections:
Idx Name          Size      VMA               LMA               File off  Algn
  0 .text         0000001a  0000000080000000  0000000080000000  00001000  2**1
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
  1 .riscv.attributes 0000004e  0000000000000000  0000000000000000  0000101a  2**0
                  CONTENTS, READONLY
  2 .comment      0000001e  0000000000000000  0000000000000000  00001068  2**0
                  CONTENTS, READONLY

th@tavro.se week1 % /opt/homebrew/opt/llvm/bin/llvm-readelf -h moonshot.elf
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           RISC-V
  Version:                           0x1
  Entry point address:               0x80000000
  Start of program headers:          64 (bytes into file)
  Start of section headers:          4688 (bytes into file)
  Flags:                             0x1, RVC
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         3
  Size of section headers:           64 (bytes)
  Number of section headers:         7
  Section header string table index: 6
```

this means our linker script worked. woho! now let's boot it:

```
th@tavro.se week1 % qemu-system-riscv64 \
  -machine virt \
  -nographic \
  -kernel moonshot.elf
```

and it crashed:

```
qemu-system-riscv64: Some ROM regions are overlapping
...
The following two regions overlap (in the memory address space):
  .../share/qemu/opensbi-riscv64-generic-fw_dynamic.bin (addresses 0x0000000080000000 - 0x0000000080042a98)
  moonshot.elf ELF program header segment 1 (addresses 0x0000000080000000 - 0x000000008000001a)
```

apparently we have overlapping addresses. based on the error message i can see that OpenSBI has addresses within this range, which i can recall from earlier this week. so i simply moved my range to `0x80200000` and now the kernel runs successfully. i am not certain i did this 100% correctly, so i will probably come back and edit this at a later point.

## end of week one

i will end the first week of development here, because this is already a lot of information to consume. so what have we learnt so far?

### what runs before my code?

before my `_start` executes, the RISC-V CPU begins executing at a fixed address, OpenSBI runs first to initialize hardware and prepare for entering the kernel, then it jumps directly to `_start` in our elf.

## what privilege mode am i in?

when `_start` runs under OpenSBI, the CPU is in S mode. OpenSBI switches from M-mode to supervisor mode before handing control to the kernel. in S-mode, the kernel has access to memory and most system resources but cannot access M-mode control registers directly.

## boot sequence

```
CPU reset -> OpenSBI initialization (M-mode) -> _start (kernel entry, S-mode) -> kernel_main -> infinite loop
```

that is all for this week! :o)
