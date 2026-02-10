# a plan for building an operating system

this is written while sick and mildly miserable, and therefore i am thinking about extremely long term software projects instead of writing code.

i have a goal of building an operating system from scratch, including the languages and tooling used to build it. i see this as a lifetime project with no deadline. this post serves two purposes. first, explaining the philosophy of the project, and being a specification for the first years of work. this plan assumes solo development and limited weekly time and tolerance for long pauses and rewrites of software.

## philosophy

this is a systems literacy project before it is a software artifact. ugly, working code beats elegant and optimized code, and documentation is part of the system! the project is intentionally paced in years.

## high level architecture

these names are temporary, i like naming things early as it helps thinking, even if it will be renamed later.

- **moonshot** is the [operating system](https://en.wikipedia.org/wiki/Operating_system) as a whole
- **c0** is the [stage-0 bootstrap language](https://en.wikipedia.org/wiki/Bootstrapping_(compilers))
- **coff** is the compiler toolchain
- **knekt** the [kernel](https://en.wikipedia.org/wiki/Kernel_(operating_system))
- **jenna** is the [memory management](https://en.wikipedia.org/wiki/Memory_management_(operating_systems)) subsystem
- **chrone** is the [scheduler](https://en.wikipedia.org/wiki/Scheduling_(computing)) and timing subsystem
- **jakel** is the [filesystem](https://en.wikipedia.org/wiki/File_system) and storage layer
- **raket** is the [init](https://en.wikipedia.org/wiki/Init) system
- **verk** is the [networking stack](https://en.wikipedia.org/wiki/Protocol_stack)

## plan

### year 1

the first year i want to focus on understanding the [boot process](https://en.wikipedia.org/wiki/Booting) end-to-end and try to run my own code directly on the hardware.

#### q1 (- mar 2026)

getting the absolute minimum code running on the machine. meaning building a minimal [boot sector](https://en.wikipedia.org/wiki/Boot_sector), achieving serial output under [QEMU](https://en.wikipedia.org/wiki/QEMU), writing a basic [linker](https://en.wikipedia.org/wiki/Linker_(computing)) script and becoming comfortable with low-level debugging using QEMU and [GDB](https://en.wikipedia.org/wiki/GNU_Debugger).

#### q2 (apr - jun 2026)

set up [GDT](https://en.wikipedia.org/wiki/Global_Descriptor_Table) and [IDT](https://en.wikipedia.org/wiki/Interrupt_descriptor_table) and begin handling basic interrupts.

#### q3 (jul - sep 2026)

add simple main loop to knekt, text output to the screen and a panic handler that can produce stack traces.

#### q4 (oct - dec 2026)

the system is booted on real hardware and the build process is made reproducible and documentation is written that explains the entire boot process.

i will consider this part done when i can explain the boot sequence without any notes.

### year 2

the goal for the second year will be to create a tiny programming language that is usable for systems code and use it to build parts of the kernel.

#### q1 (jan - mar 2027)

c0 syntax and semantics are specified clearly enough to implement and an initial compiler is written in an existing language.

#### q2 (apr - jun 2027)

the compiler emits assembly or [object files](https://en.wikipedia.org/wiki/Object_file) and is supported by a minimal [runtime](https://en.wikipedia.org/wiki/Runtime_system) including a stack and heap allocator. c0 should be capable of expressing simple systems code.

#### q3 (jul - sep 2027)

c0 is used for rewriting selected knekt components. there exists a [ffi](https://en.wikipedia.org/wiki/Foreign_function_interface) boundary between c0, assembly and any remaining c code.

#### q4 (oct - dec 2027)

this is where the compiler becomes self hosting. cross-compilation from the host os to moonshot.

i will consider this part done when moonshot boots using binaries built by c0 and the compiler can compile itself.

### year 3

for the third year i want to focus on rewriting the kernel using c0 and introduce proper operating system abstractions.

#### q1 (jan - mar 2028)

clarified modules and logging / error handling is unified so that failures produce helpful information.

#### q2 (apr - jun 2028)

jenna is introduced as a physical and virtual memory subsystem.

#### q3 (jul - sep 2028)

the chrone scheduler is added.

#### q4 (oct - dec 2028)

a [system call](https://en.wikipedia.org/wiki/System_call) interface is introduced together with a simple user mode programs can execute without constant kernel intervention.

i am not sure when to consider this part done, maybe when the kernel runs for x amount of time without crashing, lol.

### year 4

for year four i want to focus on persistent storage and basic command line usability.

#### q1 (jan - mar 2029)

first version of jakel.

#### q2 (apr - jun 2029)

a virtual filesystem layer is added along with an permissions model.

#### q3 (jul - sep 2029)

add raket as init system and shell.

#### q4 (oct - dec 2029)

introduce primitive [package manager](https://en.wikipedia.org/wiki/Package_manager) and write system level documentation.

i will consider this done when following flow works: boot -> login -> shell -> edit files -> reboot, and data is persistent across restarts.

### year 5

focus for year five will be basic connectivity and general improvements. i will see this as the last year for my current plan, and i will extend it when we reach year five, if we do.

#### q1 (jan - mar 2030)

implement network driver and minimal version of verk stack.

#### q2 (apr - jun 2030)

add user space networking tools and logging.

#### q3 (jul - sep 2030)

add permissions and isolation mechanisms.

#### q4 (oct - dec 2030)

audit full system and write architectural documentation. revise roadmap into a longer and more informed ten-year plan.

i will consider this done when the system can run unattended and bugs can be tracked down.

---

this plan exists just so that when motivation is low or health is bad, or time is low, there is still a direction. progress can happen through thinking and writing or clarifying ideas, not just through code. this plan is intentionally incomplete and subject to change. its real purpose is orientation and future revisions or new blog posts related to this are expected.

wish me luck! :o)
