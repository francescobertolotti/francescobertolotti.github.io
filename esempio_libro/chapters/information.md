# An introduction to Information Theory

## Why Information?

Information is a basic concept for understanding communication, computation, data, and complex systems. 

At first sight, information seems to be everywhere: in a sentence, in a measurement, in a genetic sequence, in a file, in a signal, or in a scientific model. But these examples are very different. A word has meaning, a number has precision, a signal has a physical form, and a dataset has structure. We need a concept that can connect these cases without confusing them.

:::details Information begins with alternatives
There is information when more than one state is possible.

If only one outcome can occur, nothing is learned when it occurs. If several outcomes are possible, the actual outcome reduces uncertainty.
:::end:::

:::details Shannon's theory measures uncertainty, not meaning
In Shannon's theory, information is not the same as meaning.

The theory asks a narrower question: how much uncertainty is reduced when a message or event is observed?

This is why the same mathematical framework can apply to words, electrical signals, files, and measurements.

Try this short binary guessing game. Each good yes/no question cuts the alternatives, so you can feel what a bit does before seeing formulas.

:::binary-riddle:::
:::end:::

:::details Information links knowledge and transmission
Information theory gives a way to study how messages are selected, encoded, compressed, transmitted, and recovered.

This makes it useful both for technical communication systems and for broader questions about data, models, and complexity.
:::end:::

The key move is to treat information as a measurable relation between possible states and observed states. This does not explain everything about meaning or interpretation, but it gives a precise starting point.

## A First Model of Information

We can represent uncertainty as a space of alternatives, then ask questions that partition that space.

:::figure
src: assets/chapters/information/figures/possibility-space.svg
alt: Possibility space represented as a set of alternatives
caption: A first model: information acts on a space of possible states.
layout: inline
:::

:::figure
src: assets/chapters/information/figures/communication-chain.svg
alt: Source to destination through encoder, channel, and decoder
caption: Minimal communication pipeline: source, coding, channel, decoding.
layout: wide
:::

:::figure-step
frames: assets/chapters/information/figures/communication-step-1.svg, assets/chapters/information/figures/communication-step-2.svg, assets/chapters/information/figures/communication-step-3.svg
step-captions: Step 1: start from source and destination.|Step 2: activate encoding and decoding stages.|Step 3: activate the channel and noise as the central issue.
caption: Progressive activation of the communication model.
layout: inline
:::

## Events, Probability, and Surprise

## Entropy and Information

## Compression
