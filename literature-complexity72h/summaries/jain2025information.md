## Introduction

The paper studies information diffusion in networks of interacting Large Language Models.
Each LLM receives only a local part of a distributed dataset and tries to answer a shared query.
Some LLMs may know the correct answer, some may hallucinate, and some may say that they do not know.
The authors model this as a networked distributed inference problem.
The main goal is to increase the influence of truthful LLMs and reduce hallucination propagation.
The paper proposes a two-time-scale dynamical model: opinions evolve quickly, while the network structure changes more slowly.
It also proposes a reputation-based preferential attachment mechanism to rewire the network toward reliable nodes.
The method is tested using LLaMA-3.1-8B on synthetic distributed question-answering tasks.
The paper combines network science, mean-field analysis, LLM evaluation, and control optimization.

## Motivation for Networks of LLMs

The paper argues that a network of LLMs can be useful when single centralized LLM processing is unreliable or undesirable.
Long-context tasks can degrade model performance, so splitting content across multiple LLMs may improve reliability.
Distributed processing can also preserve privacy because raw data do not need to be centralized.
Each LLM can process its own private document chunk and share only derived answers or explanations.
Networks of LLMs may also be more robust because truthful nodes can correct hallucinating nodes through interaction.
The authors frame each LLM as a cognitive sensor with local evidence and communicative ability.
The network controller can influence behaviour through prompts or communication constraints.
The challenge is that hallucinated information can spread if unreliable nodes become influential.
This motivates dynamic network reconfiguration based on trust and reputation.

## Related Work

The paper connects to multi-LLM orchestration for question answering and long-context document processing.
Many existing systems coordinate LLMs practically but do not provide a theoretical model of information diffusion.
The paper also builds on network-science work about controlling information flow and diffusion in complex networks.
Previous two-time-scale models have studied consensus in human or sensor networks.
The authors argue that LLM networks require a different perspective because LLMs can reason, hallucinate, and evaluate text.
The work is also related to Bayesian social learning with interacting LLM agents.
However, the paper focuses on dynamic network readjustment rather than fixed sequential interaction.
Its contribution is to combine theoretical mean-field analysis with reputation-based rewiring.
This gives a more formal basis for designing reliable networks of LLM agents.

## System Model

The model contains N LLMs connected by a directed adjacency matrix.
If there is an edge from one LLM to another, the first LLM is influenced by the second one’s previous output.
Each LLM receives a private observation, such as a paragraph from a distributed document.
At each time step, the LLM sees its own previous answer and the previous answers of its neighbours.
It then outputs either an estimate of the true state or “do not know.”
The latent state of each LLM is classified as truthful, hallucinating, or does-not-know.
Truthful means the LLM outputs the correct state.
Hallucinating means it outputs an incorrect answer.
Does-not-know means it explicitly abstains instead of guessing.

## Mean-Field Approximation

The paper uses a mean-field approximation to make the network dynamics analytically tractable.
Instead of tracking every LLM individually, it tracks the fraction of LLMs in each latent state.
The state variables describe the density of truthful, hallucinating, and does-not-know nodes for each degree class.
Transition probabilities depend on how many truthful and hallucinating neighbours an LLM observes.
The dynamics are represented as a Markov process over latent states.
The key quantity of interest is the proportion of truthful LLMs in the population.
The authors derive differential equations for the evolution of these latent-state distributions.
The mean-field approximation is justified by a concentration result for large networks.
This allows the authors to analyze global diffusion without simulating every microscopic interaction.

## Stability of Truthful Equilibrium

The paper proves sufficient conditions under which the all-truthful state is locally asymptotically stable.
This means that if the network is already close to full truthfulness, it tends to return to full truthfulness after small perturbations.
The assumptions require truthful LLMs not to switch away from truth when surrounded by truthful neighbours.
They also require hallucinating or uncertain LLMs to have a positive probability of becoming truthful when enough neighbours are truthful.
A third assumption ensures that if hallucinating and uncertain nodes are rare, links to them are also rare.
The proof uses a Lyapunov function based on the total mass of hallucinating and does-not-know states.
The derivative of this Lyapunov function is negative near the all-truthful equilibrium.
This result is theoretical and local, not a guarantee of global convergence from arbitrary initial states.
It gives conditions for truthful consensus to be stable once the system is near it.

## Two-Time-Scale Dynamics

The paper models LLM opinions and network structure on two different time scales.
The latent states of LLMs evolve quickly through repeated communication.
The network degree distribution evolves more slowly through periodic reconfiguration.
This produces a two-time-scale dynamical system.
The authors then approximate it using singular perturbation theory.
When the fast dynamics converge quickly, the slow system can be analyzed using a quasi-steady-state approximation.
The paper states error bounds showing that the reduced system stays close to the full system under regularity assumptions.
This abstraction helps separate fast information diffusion from slow network rewiring.
It also supports future control-theoretic analysis of LLM networks.

## Reputation-Based Preferential Attachment

The paper proposes a network readjustment algorithm based on reputation scores.
Each LLM is evaluated by its neighbours using the quality of its textual output.
The reputation score is an average grade assigned by neighbouring LLMs.
The algorithm adds edges toward high-reputation nodes and removes edges toward low-reputation nodes.
The goal is to make truthful nodes more influential and hallucinating nodes less influential.
The method is a form of preferential attachment, but based on semantic evaluation rather than network centrality alone.
The algorithm runs periodically on the slower network-reconfiguration time scale.
A theoretical proposition shows that, under grading assumptions, edges from truthful nodes increase with high probability.
This is the paper’s main practical mechanism for reducing hallucination diffusion.

## Theoretical Guarantee for Reconfiguration

The paper assumes that the grading function is noisy but informative.
Truthful nodes should receive higher expected grades than does-not-know nodes, which should receive higher grades than hallucinating nodes.
The algorithm only uses nodes with enough neighbours so that grades are statistically reliable.
Using Hoeffding-style concentration, the authors bound the probability of selecting the correct type of node.
They then show that one run of the algorithm increases the number of edges from truthful nodes with high probability.
This result depends on the reputation scores being sufficiently separated across latent states.
It also depends on candidate edge-addition and edge-removal sets being non-empty.
The guarantee is probabilistic and structural, not a direct guarantee that all LLMs become truthful.
It supports the idea that peer evaluation can improve the network’s information topology.

## Numerical Setup

The experiments use a distributed question-answering task.
The dataset contains 20 scenarios, each with a question, correct answer, and supporting document.
Each document is split into five paragraphs.
Some paragraphs contain the answer, while others do not.
The experiment uses a network of 100 LLMs based on LLaMA-3.1-8B.
Each LLM receives one random paragraph as private information.
About 30% of LLMs receive paragraphs containing the correct answer.
LLMs repeatedly reconsider their answers using their neighbours’ opinions.
Every 200 iterations, the network is updated using the reputation-based preferential attachment algorithm.

## Network Reconfiguration Results

The paper compares the proposed method with static preferential attachment based on PageRank, closeness, eigenvector centrality, and degree centrality.
The proposed reputation-based readjustment produces faster and more consistent convergence toward truthful answers.
The average proportion of correct answers increases more strongly than with centrality-based network initialization.
The system does not reach the exact all-truthful equilibrium predicted by the ideal theory.
Instead, it stabilizes near a state with about 90% truthful nodes, 10% hallucinating nodes, and almost no does-not-know nodes.
The authors report average grades of 6.65 for truthful nodes, 5.50 for does-not-know nodes, and 4.98 for hallucinating nodes.
This supports the assumption that LLM-based grading is informative.
The result suggests that semantic reputation is more useful than purely structural centrality.
The graph on page 6 shows the proposed method outperforming the static baselines over communication iterations.

## Token Efficiency and Control Optimization

The paper treats the control variable as the communication budget or output token limit.
More tokens may allow richer explanations, but they also increase cost and do not always improve truthfulness.
The authors define a cost function combining expected communication cost and penalty for non-truthful final states.
They test different soft token thresholds across the 20 questions.
Truthfulness peaks around a moderate token budget rather than at the largest budget.
Hallucination also changes with the token threshold and eventually plateaus.
This shows that simply allowing longer communication is not always better.
The authors use SPSA-style stochastic approximation to optimize the control variable.
The optimized token budget decreases from 45 to about 18 while reducing the overall cost.

## Interpretation of the Results

The experiments support the idea that LLM networks can improve distributed inference through interaction.
However, interaction alone is not sufficient because hallucinated answers can also diffuse.
Network structure matters because influential nodes can shape the beliefs of many other LLMs.
Reputation-based rewiring improves the system by increasing exposure to more reliable nodes.
The results also show that communication length must be controlled, not simply maximized.
Moderate token budgets may provide enough information without excessive cost or added hallucination.
The paper’s theory and experiments align around the idea of controlled information propagation.
The method is especially relevant for privacy-sensitive or long-document settings.
It provides an early mathematical framework for designing networks of LLM agents.

## Limitations

The stability theorem gives sufficient local conditions, not a general global convergence result.
The experimental equilibrium is near truthfulness but not exactly all-truthful.
The experiments use synthetic datasets and one open-source model, LLaMA-3.1-8B.
The network size is 100 LLMs, which is useful but still limited for large-scale deployment claims.
The reputation mechanism depends on LLMs being able to grade neighbours reliably.
If several LLMs share the same bias, they may reinforce each other’s wrong answers.
The token-control optimization uses a practical stochastic method rather than exact ODE parameter estimation.
The theoretical model abstracts away much of the complexity of natural-language communication.
Future work is needed for richer datasets, heterogeneous models, adversarial nodes, and stronger convergence guarantees.

## Pros

* The paper gives a concrete mathematical model for information diffusion in LLM networks, instead of only proposing a heuristic multi-agent architecture.

* The three-state latent model is specific and useful because it distinguishes truthful answers, hallucinations, and explicit uncertainty.

* The reputation-based preferential attachment mechanism is well matched to LLMs because it uses their ability to evaluate text, not only graph centrality.

* The experiments show a specific practical gain: reputation-based rewiring converges closer to truthful consensus than PageRank, closeness, eigenvector, or degree-based baselines.

* The token-budget optimization is valuable because it shows that communication cost and truthfulness must be jointly optimized, not treated separately.

## Cons

* The theoretical stability result is local and based on strong assumptions about transition probabilities and grading quality.

* The experiments use only LLaMA-3.1-8B, so it is unclear whether the same network dynamics hold for stronger, weaker, or heterogeneous LLM populations.

* The synthetic task setup is controlled and useful, but it may not capture the ambiguity and adversarial noise of real distributed knowledge systems.

* The reputation mechanism could fail when hallucinating nodes produce convincing explanations that neighbouring LLMs grade highly.

* The system stabilizes near 90% truthful nodes rather than the all-truthful equilibrium, so the practical gap between theory and experiment remains important.

