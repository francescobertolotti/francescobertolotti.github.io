## Introduction

The paper studies whether populations of LLM agents can spontaneously develop social conventions.
Social conventions are shared behavioral rules that allow groups to coordinate without central control.
The authors focus on naming conventions as a simple model of norm formation.
The main question is whether LLM agents can create population-wide conventions through local pairwise interactions.
A second question is whether collective biases can emerge even when individual agents appear unbiased.
A third question is whether small committed minorities can overturn an established convention.
The paper treats LLM agents as artificial social actors, not as simulations of human participants.
The work is positioned within complex systems, social convention theory, and AI alignment.
The main concern is that multi-agent LLM systems may develop group-level behaviors not visible in isolated models.

## Experimental Setting

The authors use a naming game framework inspired by models of linguistic convention formation.
A population contains N LLM agents that interact in randomly selected pairs.
At each interaction, both agents choose a “name” from a finite pool of W possible names.
If both agents choose the same name, they receive a positive payoff.
If they choose different names, they receive a negative payoff.
Agents only have local incentives to coordinate with their current partner.
There is no explicit instruction to create a global convention.
Each agent has a memory of its last H interactions, including choices, success or failure, and accumulated score.
The default setting uses N = 24 agents, W = 10 possible names, and memory length H = 5.

## Prompting

Each LLM agent receives a system prompt and a user prompt.
The system prompt explains the game rules, payoff structure, and response format.
The user prompt asks the agent to select a name for the current interaction.
Agents are prompted to think step by step and consider their recent interaction history.
The prompt does not give an explicit strategy or tell agents how to use memory.
The name pool is shown as a list of letters from the English alphabet.
The order of names is randomized at each interaction to reduce ordering bias.
Agents are asked to maximize their own accumulated score given the behavior of the co-player.
The authors also use meta-prompting checks to verify that models understand the task instructions.

## Spontaneous Emergence

The first main result is that global conventions spontaneously emerge in LLM populations.
Across all tested models, local pairwise coordination leads to population-wide agreement on one name.
The system moves from an initially disordered state to an ordered consensus state.
This is interpreted as symmetry breaking because one option becomes dominant among many initially equivalent options.
The empirical dynamics are similar to the theoretical minimal naming game model.
Most models reach a shared convention by around population round 15.
Llama-2-70b-Chat converges more slowly than the newer models.
The result is robust to larger populations and larger name pools.
Populations as large as N = 200 and name pools as large as W = 26 still reach consensus.

## Collective Bias in Convention Selection

After showing that conventions emerge, the authors ask which convention becomes dominant.
In principle, all letters are equivalent, so each should have the same probability of becoming the final convention.
Empirically, the final convention distribution is not uniform.
Some names are much more likely to become the accepted convention than others.
This collective bias appears across models, although the preferred names differ by model.
The bias is not explained by presentation order because the name list is randomized.
Some models show individual bias in their first memory-free choice, but this does not explain all results.
Even when individual agents are initially unbiased, repeated interactions can create collective bias.
The paper therefore distinguishes individual bias from dynamically emergent collective bias.

## Origin of Collective Bias

To study the mechanism of collective bias, the authors focus on the simpler case W = 2.
With only two names, agents may appear statistically unbiased in their first interaction.
After one interaction, agents usually keep a successful name and switch after failure.
By the third interaction, asymmetric response patterns emerge from different memory states.
Some memory configurations make agents more likely to choose one name than the other.
This creates a “strong convention” and a “weak convention.”
Once the strong convention appears in successful interactions, it is reinforced by later choices.
The resulting bias is a product of interaction history, memory, and local adaptation.
This means group-level bias can emerge even when isolated agents do not show clear bias.

## Tipping Points and Critical Mass

The authors then study whether established conventions can be overturned.
They initialize a population in full consensus on one convention.
They introduce a committed minority of adversarial agents that always use an alternative convention.
If the committed minority is large enough, the whole population switches to the minority convention.
Below the critical threshold, the population remains in a mixed state because committed agents keep using their preferred name.
The critical mass depends on both the LLM model and the relative strength of the conventions.
Strong conventions are harder to overturn than weak conventions.
In some cases, very small minorities can flip the convention.
In other cases, the required group is so large that it is no longer really a minority.

## Discussion

The paper shows that LLM populations can develop social conventions without central coordination.
It also shows that collective biases can arise from multi-agent interaction, not only from isolated model behavior.
This has important implications for AI alignment because testing one model alone may miss group-level risks.
The results suggest that LLM societies may have model-specific norm dynamics.
The paper also highlights that social conventions in LLM populations can be stable but not immutable.
Committed minorities can create tipping points and impose alternative conventions.
This can be beneficial if used to promote positive norms, but dangerous if exploited for manipulation.
The authors argue that future work should study larger populations, richer semantic spaces, and structured social networks.
They also emphasize the importance of mixed human-LLM ecosystems.

## Materials and Methods

The experiments use homogeneous populations of agents instantiated from the same LLM.
The tested models are Llama-3-70B-Instruct, Llama-3.1-70B-Instruct, Llama-2-70b-Chat, and Claude-3.5-Sonnet.
The Llama 3 models are accessed through Hugging Face inference APIs.
Llama-2-70b-Chat is quantized to 4-bit and run locally on an A100 GPU.
The authors use nonzero temperature to model nondeterministic behavior.
They use K-sampling to restrict generation to high-probability outputs.
Individual bias is measured by observing first-round choices when agent memory is empty.
For W = 2, bias is tested with an exact binomial test.
For W = 10, bias is tested with a chi-square test.
Critical mass is measured as the smallest committed minority able to flip consensus.

## Pros

- The paper gives a clear complex-systems framework for studying emergent behavior in LLM populations.

- The naming game is simple, but powerful enough to reveal convention formation, collective bias, and tipping points.

- The distinction between individual bias and collective bias is conceptually important for AI alignment.

- The experiments are robust across multiple LLMs, population sizes, name pools, and prompt variations.

- The committed-minority analysis connects LLM multi-agent systems to social change and norm manipulation.

## Cons

- The experimental setting is highly simplified, so real-world generalization remains uncertain.

- The conventions are abstract letters, not semantically rich social norms or culturally sensitive behaviors.

- The populations are mostly unstructured and randomly mixed, unlike real social networks.

- The study uses homogeneous LLM populations, while real AI ecosystems may contain heterogeneous models and humans.

- The results depend on prompt design, model sampling parameters, and memory representation, which may affect reproducibility.