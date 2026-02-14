# a plan for building an operating system

this is written while sick and mildly miserable, and therefore i am thinking about extremely long term software projects instead of writing code.

i have a goal of building an operating system from scratch, including the languages and tooling used to build it. i see this as a lifetime project with no deadline. this post serves two purposes. first, explaining the philosophy of the project, and being a specification for the first years of work. this plan assumes solo development and limited weekly time and tolerance for long pauses and rewrites of software.

## philosophy

this is a systems literacy project before it is a software artifact. ugly, working code beats elegant and optimized code, and documentation is part of the system!

## high level architecture

these names are temporary, i like naming things early as it helps thinking, even if it will be renamed later.

- **moonshot** is the [operating system](https://en.wikipedia.org/wiki/Operating_system) as a whole
- **c0** is the [stage-0 bootstrap language](https://en.wikipedia.org/wiki/Bootstrapping_(compilers))
- **coff** is the compiler toolchain
- **knekt** is the [kernel](https://en.wikipedia.org/wiki/Kernel_(operating_system))
- **jenna** is the [memory management](https://en.wikipedia.org/wiki/Memory_management_(operating_systems)) subsystem
- **chrone** is the [scheduler](https://en.wikipedia.org/wiki/Scheduling_(computing)) and timing subsystem
- **jakel** is the [filesystem](https://en.wikipedia.org/wiki/File_system) and storage layer
- **raket** is the [init](https://en.wikipedia.org/wiki/Init) system
- **verk** is the [networking stack](https://en.wikipedia.org/wiki/Protocol_stack)

## plan

EDIT: i managed to complete what i planned for the first year within two weeks, and i did not stick exactly to what i wrote here before, so i am intentionally removing what was here before to make this post more helpful (i am using this post when planning what to work on next).

### milestone 1

- focus on understanding the [boot process](https://en.wikipedia.org/wiki/Booting) end-to-end and try to run my own code in [QEMU](https://en.wikipedia.org/wiki/QEMU) virt machine.
- writing a basic [linker](https://en.wikipedia.org/wiki/Linker_(computing)) script and becoming comfortable with low-level debugging using QEMU and [GDB](https://en.wikipedia.org/wiki/GNU_Debugger).
- add simple main loop to knekt, text output to the screen and a panic handler that can produce stack traces.
- build process is made reproducible and documentation is written that explains the entire boot process.

i will consider this part done when i can explain the boot sequence without any notes.

### milestone 2

- create a tiny programming language (c0) that is usable for systems code and use it to build parts of the kernel.
- c0 syntax and semantics are specified clearly enough to implement and an initial compiler is written in risc-v assembly.
- the compiler emits risc-v assembly and is supported by a minimal [runtime](https://en.wikipedia.org/wiki/Runtime_system). 
- compiler becomes self hosting.

i will consider this part done when moonshot boots using binaries built by c0 and the compiler can compile itself.

### milestone 3

- rewriting the kernel using c0 (or other language in the compiler toolchain) and introduce proper operating system abstractions.
- jenna is introduced as a physical and virtual memory subsystem.
- the chrone scheduler is added.
- a [system call](https://en.wikipedia.org/wiki/System_call) interface is introduced together with a simple user mode programs can execute without constant kernel intervention.

i am not sure when to consider this part done, lol. i will probably divide this into sub-milestones when i get here.

### milestone 4

- persistent storage and basic command line usability.
- first version of jakel.
- virtual filesystem layer is added along with an permissions model.
- add raket as init system and shell.
- introduce primitive [package manager](https://en.wikipedia.org/wiki/Package_manager) and write system level documentation.

i will consider this done when following flow works: boot -> login -> shell -> edit files -> reboot, and data is persistent across restarts.

### milestone

i will see this as the last milestone for my current plan, and i will add more milestones when this is completed, if it ever will be.

- implement network driver and minimal version of verk stack
- add user space networking tools and logging.
- add permissions and isolation mechanisms.
- audit full system and write architectural documentation.

i will consider this done when the system can run unattended and bugs can be tracked down.

---

## blog posts related to this one
- [write-up for first week](https://tavro.se/blog.html?post=moonshot-os-devlog-week-1)

this plan exists just so that when motivation is low or time is low, there is still a direction. progress can happen through thinking and writing or clarifying ideas, not just through code. this plan is intentionally incomplete and subject to change.

wish me luck! :o)
