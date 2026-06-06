## Introduction

The paper studies speaker-addressee detection in tragic plays using LLMs.
Its motivation is literary as well as computational: who speaks to whom is a strong signal of power, exclusion, alliance, and dramatic tension.
Standard dramatic social network analysis often relies on co-occurrence or undirected links, which misses the direction of speech acts.
The authors therefore treat addressee identification as the key step needed to build more meaningful directed networks.
The goal is not only accuracy, but a scalable pipeline for multilingual dramatic analysis.

## Pipeline and Corpus

The method uses a four-stage pipeline.
First, dramatic texts are collected and preprocessed from raw files.
Second, an LLM identifies the receiver or receivers of each line.
Third, those predictions are converted into a directed weighted graph, where nodes are characters and edges represent speech acts.
Finally, the graph is deployed in a web-based visualization so the network can be explored with centrality and clustering tools.

## Dataset and Annotation

The evaluation uses 14 complex scenes drawn from 9 plays in 4 languages from the DraCor ecosystem.
The scenes were selected because they involved at least five participants and pragmatically difficult speech patterns such as plural address, audience-directed speech, or soliloquies.
Two professional linguists independently annotated the speaker-receiver relations.
Their Cohen’s kappa is `0.63`, which is moderate but clearly above chance for such a difficult task.
This is important because the paper evaluates against real human disagreement rather than pretending the task is perfectly objective.

## Prompting and Evaluation Design

The authors compare three open models: Gemma3-27B, Llama3.3-70B, and Qwen3-8B.
Each model is tested with sliding windows of 5, 7, or 10 lines, plus a full-scene setting.
The overlap between windows is controlled so that adjacent turns remain visible without excessive repetition.
The prompt asks for JSON output with a receiver list for each line, including special labels such as `ALL` and self-address.
Performance is measured with both exact match and partial match, where partial match gives credit for any overlap with at least one annotation.

## Main Results

Llama3.3-70B is the strongest model across all window settings.
Its best setting reaches `77.31%` exact match and `86.97%` partial match.
Because partial match can be forgiving, the paper also reports `94.81%` precision, `84.72%` recall, and `88.75%` F1 for the best configuration.
Performance generally improves as context expands from short windows to the whole scene.
This suggests that addressee detection in drama depends strongly on broader discourse context rather than only local adjacency.

## What the Network View Adds

The paper argues that directed speech graphs reveal dramatic structure better than simple co-presence graphs.
A speaking to B is not the same as B speaking to A, especially in conflict-heavy plays.
The case studies show how the inferred networks highlight dominance, isolation, and conversational bottlenecks.
The method also handles cases where the addressee is delayed, implicit, or displaced by intervening dialogue.
This makes the pipeline useful for computational literary studies, not just as a narrow NLP task.

## Interpretation

The paper’s main contribution is methodological rather than theoretical.
It turns a labor-intensive literary annotation task into a partially automated multilingual workflow.
At the same time, it shows that LLMs can outperform simple turn-taking heuristics because they use wider pragmatic context.
The authors present this as an extension of dramatic social network analysis toward more faithful interaction modeling.
The most convincing part is the connection between line-level addressee recovery and richer network interpretation.

## Pros

- The paper solves a real bottleneck in literary network analysis by moving from undirected co-occurrence to directed speech relations.
- The multilingual design is a strong point, because it shows the method is not tied to one canon, one language, or one annotation tradition.
- Reporting exact match, partial match, and precision-recall metrics gives a more honest picture than relying on one forgiving measure.
- The pipeline is practically useful, since it goes all the way from raw text to interactive network visualization rather than stopping at classification scores.

## Cons

- The annotated dataset is still small, so the reported performance may be optimistic relative to broader dramatic corpora.
- Inter-annotator agreement is only moderate, which is understandable, but it also limits how confidently one can interpret small performance differences.
- The method depends heavily on context-window design and prompt format, so robustness across alternative prompting setups remains uncertain.
- Directed addressee detection captures an important part of dramatic structure, but it still misses non-verbal power, irony, staging, and other theatrical cues outside the spoken line.
