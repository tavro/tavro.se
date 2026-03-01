# moonshot devlog week 3

as i mentioned at the end of week two, this week i focused on designing a programming language for moonshot development. i call it c0, and it is a stage-0 bootstrap compiler written entirely in RISC-V assembly. the code can be found [here](https://github.com/tavro/coff-toolchain).

## what is a stage-0 compiler?

a stage-0 bootstrap compiler is the lowest level of a self-hosting compiler chain. the idea is to write a minimal compiler in assembly that can compile a simple language, which can then be used to write a more sophisticated compiler. this approach is inspired by [rowl0](https://github.com/nineties/amber/tree/master/rowl0), but my implementation targets RISC-V instead of x86.

the goal of c0 is not to be a beautiful or ergonomic language. the goal is to be minimal and powerful enough to write the next stage compiler.

## the c0 language

c0 is intentionally minimal. everything is a machine word. there are no types at runtime. here is an example of what c0 code looks like:

```
factorial: (p0) {
    if (p0 <= 1) {
        return 1
    };
    x0 = p0 - 1;
    x1 = factorial(x0);
    return p0 * x1
}

main: () {
    return factorial(5)
}
```

the naming conventions are positional:
- `p0`, `p1`, `p2`, ... are function parameters
- `x0`, `x1`, `x2`, ... are local variables (stack-allocated)
- `UPPERCASE` identifiers are compile-time macros

this removes the need for a symbol table for locals. the compiler knows exactly where each variable lives based on its name.

## compiler architecture

the compiler is split into four main files:

```
c0/
├── main.s          # entry point, initializes UART and runs compiler
├── lexer.s         # tokenizes c0 source into tokens
├── compiler.s      # parses tokens and emits code
├── codegen.s       # helper functions for emitting RISC-V assembly
├── library/
│   └── runtime.s   # UART I/O and utility functions
```

### the lexer

the lexer is implemented as a state machine. it reads characters from UART input and produces tokens. the interesting part is the character classification table:

```
lexer_character_group:
    .word  0,  1,  1,  1,  1,  1,  1,  1,  1,  2, 13,  1,  1,  2,  1,  1
    ...
```

each character maps to a group (whitespace, digit, letter, symbol, etc.) which drives the state machine transitions. this is a classic technique for building fast lexers.

### the parser

the parser is a recursive descent parser. it directly emits RISC-V assembly as it parses. there is no AST. this is called a "one-pass" compiler.

for example, when parsing an addition expression, the compiler:
1. parses the left operand, result goes to `a0`
2. pushes `a0` to stack
3. parses the right operand, result goes to `a0`
4. pops left operand to `t0`
5. emits `add a0, t0, a0`

here is a simplified view of the expression precedence:

```
or_expression      -> xor_expression (| xor_expression)*
xor_expression     -> and_expression (^ and_expression)*
and_expression     -> equality_expr (& equality_expr)*
equality_expr      -> relational_expr (== | != relational_expr)*
relational_expr    -> additive_expr (< | > | <= | >= additive_expr)*
additive_expr      -> mult_expr (+ | - mult_expr)*
mult_expr          -> prefix_expr (* | / | % prefix_expr)*
prefix_expr        -> [+ | - | * | & | ~] simple_item
simple_item        -> identifier | constant | (expr) | array_ref | call
```

### code generation

the code generator emits RISC-V assembly text to UART. all the helper functions like `_li`, `_la`, `_add`, `_sw` just output the corresponding assembly instruction text.

function calls use a fixed-size stack frame of 96 bytes:

```
# frame layout (96 bytes total):
#   92(sp) = ra
#   88(sp) = s0 (old frame pointer)
#   84(sp) = saved a0 (p0)
#   80(sp) = saved a1 (p1)
#   ...
#   52(sp) to 0(sp) = local variables (x0 to x12)
```

this means functions can have up to 8 parameters (passed in `a0-a7`) and up to 13 local variables. for a stage-0 compiler, this is more than enough.

## running the compiler

the compiler reads c0 source from UART and outputs RISC-V assembly to UART. the Makefile shows how to use it:

```
# use: (echo ""; cat your_code.c0) | make run
run: $(TARGET)
    $(QEMU) -machine virt -serial stdio -display none -bios none -kernel $<
```

the leading newline is needed because QEMU drops the first character from piped stdin. i spent an embarrassing amount of time debugging this.

when you run:

```
(echo ""; echo 'main: () { return 42 }') | make run
```

you get RISC-V assembly output:

```
.text
.global main
main:
    addi sp, sp, -96
    sw ra, 92(sp)
    sw s0, 88(sp)
    addi s0, sp, 96
    ...
    li a0, 42
    lw ra, 92(sp)
    lw s0, 88(sp)
    addi sp, sp, 96
    ret
```

## test programs

i wrote several test programs to verify the compiler works:

fibonacci:
```
fib: (p0) {
    if (p0 <= 1) {
        return p0
    };
    x0 = fib(p0 - 1);
    x1 = fib(p0 - 2);
    return x0 + x1
}

main: () {
    return fib(10)
}
```

this should return 55, which is `fib(10)`.

## lessons learned this week

### UART input is tricky

QEMU has significant latency when reading piped input. i had to implement a timeout-based approach for detecting EOF:

```
# first time waiting -> use very long timeout (QEMU has latency)
li      t5, 50000000 # ~5+ seconds of polling at QEMU speed
```

after receiving the first character, i switch to a shorter timeout for detecting end-of-input.

### assembly is tedious but satisfying

writing a compiler in assembly forces you to think. i like that.

## what is next

the goal is to eventually have a c0-to-RISC-V compiler written in c0 itself (self-hosting), but that is further down the road. this has been very time consuming, so i think that i will start with something more simple next week, we will see...

for now, i have a working compiler that can compile recursive functions and pointer operations and i think i understand it. i am happy with that. that is enough for me.

:o)
