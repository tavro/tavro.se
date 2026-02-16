# moonshot devlog week 2

this weeks goal is to write our first working UART driver

## UART

before implementing anything i spent some time understanding what UART is. turns out it stands for Universal Asynchronous Receiver/Transmitter, and it is a hardware communication protocol that lets the system send and recieve serial data. in boot environments UART is the first way you can communicate with your machine. very good for debugging.

first we have to define the UART base and registers, and write some MMIO helpers. i have uploaded the code [here](https://github.com/tavro/moonshot-src/commit/b115a4f2a4dab018fd2272a1b0d71ac2aab066d5), this is the most important part:

```
static inline void mmio_write(unsigned long addr, unsigned char val) {
        *(volatile unsigned char *)addr = val;
}

static inline unsigned char mmio_read(unsigned long addr) {
        return *(volatile unsigned char *)addr;
}

void uart_putchar(char c) {
        while (!(mmio_read(UART0 + UART_LSR) & (1 << 5)));
        mmio_write(UART0 + UART_TX, c);
}

void uart_puts(const char *s) {
        while (*s) {
                if (*s == '\n') {
                        uart_putchar('\r');
                }
                uart_putchar(*s++);
        }
}
```

i simply run the the kernel by: `qemu-system-riscv64 -machine virt -nographic -S -s -kernel moonshot.elf`

and attach gdb by:

```
target remote :1234
continue
```

just like last week.

now knekt outputs `Hello from knekt` when running. that is great success! this is why i love programming. why do i feel genuine happiness from seeing a simple string being outputted in my terminal after all these years? anyways... let's move on.

## project layout

now we have enough files in our project to start thinking about structuring the project.
for now, i will structure the project in the following way:

```
moonshot/
├─ arch/riscv/start.S
├─ knekt/kernel.c
├─ knekt/uart.c
├─ knekt/uart.h
├─ linker.ld
├─ Makefile
```

i also added a [Makefile](https://github.com/tavro/moonshot-src/blob/627e6f4067621323bacad15870adb62ed1859a2e/Makefile) to make compiling easier. i found myself compiling by rewriting the same command multiple times, and even compiling in different ways every time.

## debugging helpers

one lesson i have learned from past projects: if you do not build debugging tools early, you will regret it later. so this week i implemented a simple `panic()` function and an assertion macro. the idea is to fail loudly whenever something goes wrong. the code for my panic implementation can be found [here](https://github.com/tavro/moonshot-src/commit/80402d31995c97af57ec7c3e25cf5428d817dbe3), there are a bunch of other things in this commit, so here are the important changes:

```
#define assert(x) do { if (!(x)) panic("Assertion failed: " #x, __FILE__, __LINE__); } while (0)

void panic(const char *msg, const char *file, int line) {
        uart_puts("PANIC: ");
        uart_puts(msg);
        uart_puts(" at ");
        uart_puts(file);
        uart_puts(":");
        char buf[10];
        int n = line, i = 0;
        if (n == 0) uart_puts("0");
        while(n) {
                buf[i++] = '0' + (n % 10);
                n /= 10;
        }
        while(i--) uart_putchar(buf[i]);
        while(1);
}
```

let's add an assert to our `kernel_main()` function to trigger panic. 

```
void kernel_main(void) {
        uart_puts("Hello from knekt\n");
        assert(0);
}
```

after compiling and running, you should see something like this:

```
Hello from knekt
PANIC: Assertion failed: 0 at knekt/kernel.c:5
```

## adding build scripts

since i want others to be able to clone the repository and start experimenting quickly, i added helper scripts.

## first release

now when we have UART output working and some basic debugging is in place, i added some [boot sequence documentation](https://github.com/tavro/moonshot-src/blob/main/docs/BOOT-SEQUENCE.md) and [release notes](https://github.com/tavro/moonshot-src/blob/main/docs/RELEASE.md). now i think the project is ready for a [first release](https://github.com/tavro/moonshot-src/releases/tag/v0.1), even though it is not feature complete.

---

next week i will focus on designing a programming language, or possibly a collection of languages specifically for knekt/moonshot development. the groundwork for this has already begun in parallel, but i want to improve it somewhat before writing about it publicly. for now, i am calling this week a success, the kernel is talking!

:o)
