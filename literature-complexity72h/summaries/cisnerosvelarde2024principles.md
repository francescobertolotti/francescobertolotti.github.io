# On the Principles behind Opinion Dynamics in Multi-Agent Systems of Large Language Models

- Chiave BibTeX: `cisnerosvelarde2024principles`
- Anno: `2024`
- Categorie: `consensus`
- PDF: [cisnerosvelarde2024principles.pdf](/Users/janalopi/Library/Mobile Documents/com~apple~CloudDocs/AAA ACCADEMIA/2026-202X RTDa Cattolica/Scuole/Complexity 72h - 2026/Materiale preliminare/pdf/cisnerosvelarde2024principles.pdf)
- Pagine: `82`
- Dominio principale: `opinion dynamics setting, consensus`

## Quadra Rapida
- We study the evolution of opinions inside a population of interacting large language models (LLMs).
- Every LLM needs to decide how much funding to allocate to an item with three initial possibilities: full, partial, or no funding.
- We identify biases that drive the exchange of opinions based on the LLM’s tendency to find consensus with the other LLM’s opinion, display caution when specifying funding, and consider ethical concerns in its opinion.

## Riassunto Per Sezioni

### Abstract
- We study the evolution of opinions inside a population of interacting large language models (LLMs).
- Every LLM needs to decide how much funding to allocate to an item with three initial possibilities: full, partial, or no funding.

### 1 Introduction
- Large Language Models (LLMs) have become increasingly relevant because of their understanding of natural language .
- The bias towards equity-consensus is expressed by the preference of an LLM to look for a mid-point between its own funding for Item A and the other interacting LLM’s funding.
- An Item B is introduced as competing for funding when justifying partial or no funding for Item A.

### 4 Analysis of the FreeForm Case
- We provide an analysis on the opinion formation process and the possible principles behind it.
- Case 2: An item has a positive or negative connotation Item A is positive.
- Item B competes for funding against Item A, so one would expect a similar effect to having a negative Item A; i.e., the reduction of funding for Item A.

### 5 Analysis of the ClosedForm Case
- The 1In Mistral, a comparison to the neutral Item A is less meaningful due to the large amount of unspecified funding.
- Given this information, this is an example of how to read the table: for Llama 3 agents with no memory of past opinions, 82.54% out of 63 combinations have all 20 simulations displaying consensus on partial funding when there is no initial consensus. final consensus opinion is partial funding for Item A unless there is an initial consensus on a different opinion.

### 6 Analysis when Agents Have Memory of Past Opinions
- Thus far, agents are only aware of their current opinions, i.e., they arememoryless.
- We also find that when opinions start in consensus, the final funding opinions are more likely to be closer to the initial consensus than when they are memoryless.

### 7 Conclusion
- We study how the final opinion distribution of a population of LLMs depends on the initial opinion distribution and the discussion subject.