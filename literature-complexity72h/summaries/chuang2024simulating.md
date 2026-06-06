## Introduction

The paper studies whether LLM-based agents can simulate human opinion dynamics in social networks.
Traditional agent-based models usually represent opinions and messages as numerical values.
This simplification misses the linguistic richness of real human communication.
The authors propose using LLM generative agents as an alternative to classical opinion-dynamics ABMs.
Agents communicate through natural language, role-play personas, and update beliefs after social interaction.
The main empirical domain is opinions about claims with known ground truth, such as global warming or conspiracy theories.
The key finding is that LLM agents tend to converge toward factual consensus, regardless of their initial personas.
This truth-oriented bias limits their ability to simulate fact-resistant human beliefs.
When confirmation bias is explicitly induced through prompts, the agents show more opinion fragmentation.

## Methods: Simulating Opinion Dynamics

The authors simulate opinion dynamics in a network of LLM agents.
At each time step, two agents are randomly selected: one speaker and one listener.
The speaker writes a tweet expressing its current view on a topic.
The listener reads the tweet and produces a verbal reaction.
The verbal reaction is classified into a numerical opinion value.
Opinions range from strongly negative to strongly positive on a five-point scale.
After the interaction, both agents update their memory.
The simulation tracks each agent’s opinion trajectory over time.
This setup preserves the classical ABM structure but replaces numerical messages with natural language.

## Agent Persona and Memory

Each agent has a persona represented in text.
The persona includes name, political leaning, age, gender, ethnicity, education, occupation, and initial belief.
The initial belief is written directly into the agent’s prompt and memory.
Agents maintain a dynamic memory that influences future messages and belief updates.
The authors test two memory strategies: cumulative memory and reflective memory.
Cumulative memory appends new experiences sequentially.
Reflective memory continuously summarizes and integrates past experiences.
Memory can also include optional cognitive bias instructions and closed-world restrictions.
This design allows the model to simulate socially situated agents rather than abstract numerical entities.

## Cognitive Biases

The paper focuses on confirmation bias.
Confirmation bias is the tendency to accept information that supports existing beliefs and reject contradictory information.
The authors introduce this bias through prompt engineering.
They test two levels: weak confirmation bias and strong confirmation bias.
Weak confirmation bias makes agents more likely to believe belief-consistent information.
Strong confirmation bias instructs agents to believe only information that supports their current beliefs.
This manipulation is inspired by classical opinion-dynamics models.
The goal is to test whether LLM agents reproduce the fragmentation seen in traditional ABMs.
The results show that stronger confirmation bias increases final opinion diversity.

## Open-World and Closed-World Settings

The authors distinguish between open-world and closed-world simulations.
In the closed-world setting, agents are instructed not to search for information or consult external people.
This makes belief change depend only on social interaction within the simulated system.
In the open-world setting, agents may introduce external or hallucinated information.
The authors find no hallucination in the closed-world setting.
They observe about 15% hallucination in the open-world setting.
For this reason, the main experiments focus on the closed-world condition.
This choice makes the simulation closer to traditional ABMs, where all relevant information comes from inside the modelled system.
It also makes opinion change easier to attribute to agent interaction.

## Experimental Configuration

The main simulations use ChatGPT, specifically GPT-3.5-turbo-16k, with temperature 0.7.
The number of agents is set to 10.
The number of interaction steps is set to 100.
The memory system is managed through LangChain.
FLAN-T5-XXL is used as an opinion classifier.
The authors also run sensitivity analyses with GPT-4, Vicuna-33B, and a larger network of 20 agents.
Agents are initialized with diverse personas and initial opinions.
The main experiments compare different framings, memory strategies, and levels of confirmation bias.
This design tests whether LLM-agent opinion dynamics are robust across conditions.

## Topics and Framings

The authors use 15 topics with known ground truth.
The topics cover science, history, and common sense.
Examples include global warming, 9/11 conspiracy claims, and whether the sky is blue on a sunny day.
Each topic is presented with two framings.
The true framing states the widely accepted factual claim.
The false framing states the opposite or conspiratorial claim.
For example, global warming can be framed as real or as a government conspiracy.
The phrase “Theory XYZ” is used to reduce wording effects across topics.
This setup allows the authors to test whether agents converge toward truth or preserve persona-based disagreement.

## Evaluation Metrics

The authors evaluate the final opinion distribution using two metrics.
Bias measures the average final opinion across agents.
A positive bias means the group tends to agree with the framed claim.
A negative bias means the group tends to disagree with the framed claim.
Diversity measures the standard deviation of final opinions.
Low diversity indicates consensus.
High diversity indicates fragmentation or polarization.
These metrics are standard in opinion-dynamics research.
They allow comparison between LLM-agent simulations and classical ABM results.

## Initial Opinion Distribution

Most experiments start with a uniform distribution of initial opinions.
This means agents begin with balanced positions across the opinion scale.
The authors also test skewed initial distributions.
For example, all agents may start with strongly negative beliefs.
Other conditions include mixtures such as 8 agents with one extreme belief and 2 with the opposite extreme.
This tests whether LLM agents preserve initial polarization or move toward factual consensus.
The results show that agents often move toward ground truth despite skewed starting beliefs.
Even strongly false initial beliefs are weakened over time.
This suggests that the LLM’s internal factual bias is stronger than the assigned persona in many cases.

## Control Conditions

The paper includes two control conditions.
In the no-interaction condition, agents keep their personas but do not communicate with each other.
Instead, each agent independently reports its opinion multiple times.
In the no-interaction and no-role-playing condition, the model is queried without persona-based agents.
These controls test whether convergence is caused by social interaction or by the LLM’s inherent tendencies.
The results show that a truth-oriented tendency appears even without interaction.
This suggests that the LLM itself has a strong factual-consensus bias.
Social interaction can amplify or reveal this tendency, but it is not the only cause.
The controls are important for interpreting LLM-agent simulations correctly.

## Results: Convergence Toward Ground Truth

The main result is that LLM agents tend to converge toward the factual position.
Under false framing, agents collectively move toward disagreement with the false claim.
Under true framing, agents tend to agree with the true claim.
This happens even when agents are initially assigned diverse or skeptical personas.
The effect appears with both cumulative and reflective memory.
It is also visible in the global warming example, where agents move away from conspiracy claims.
The authors interpret this as an inherent bias toward accurate information.
This bias is useful for safe LLM behavior but problematic for social simulation.
It prevents the model from naturally reproducing persistent misinformation beliefs.

## Results: Confirmation Bias and Fragmentation

Adding confirmation bias reduces consensus and increases diversity.
Weak confirmation bias produces more dispersed final opinions than no confirmation bias.
Strong confirmation bias produces the highest level of opinion fragmentation.
This pattern holds across cumulative and reflective memory.
It also matches findings from classical ABMs.
In traditional models, confirmation bias prevents agents from integrating contradictory evidence.
Here, prompt-induced confirmation bias creates a similar group-level effect.
This suggests that LLM agents can reproduce some known opinion-dynamics mechanisms.
However, the bias must be explicitly induced because it does not emerge strongly by default.

## Results: Effect of Initial Opinion Distribution

The authors test whether strongly biased initial beliefs can overcome the LLM’s truth tendency.
In the global warming case, agents still shift toward ground truth under many initial conditions.
When all agents initially endorse a false claim, they often move toward rejecting it.
When all agents initially deny a true claim, they may not fully reverse their view, but they shift toward truth.
When even a minority of agents starts with the factual view, the group often moves toward factual consensus.
This shows that the model’s truth-oriented bias is robust.
Initial polarization affects trajectories but does not fully determine final outcomes.
The finding is important because human groups can remain fact-resistant for social and ideological reasons.
LLM agents may therefore underestimate the persistence of real-world misinformation.

## Results: False Versus True Framing

The agents show a stronger tendency to reject false claims than to endorse true claims.
Under false framing, the final bias is strongly negative.
Under true framing, the final bias is positive but weaker.
The authors consider whether this could be caused by the opinion classifier.
They validate FLAN-T5-XXL against human ratings and do not find a systematic classifier bias.
They therefore suggest that the effect comes from the LLM agents themselves.
A possible explanation is that RLHF and safety training make the model especially ready to refute false information.
The model may be less strongly trained to actively endorse true information.
This asymmetry is important for understanding how alignment affects simulations.

## Sensitivity Analyses

The authors test whether results depend on the specific model or network size.
They repeat analyses using GPT-4 and Vicuna-33B.
They also test a larger network with 20 agents.
The same broad trends appear across these conditions.
The truth-convergence effect remains visible.
Confirmation bias still increases opinion diversity.
The authors also run repeated simulations on global warming to test randomness from temperature sampling.
The effects of framing and confirmation bias remain consistent across runs.
These analyses support the robustness of the main findings, although broader model testing is still needed.

## Related Work

The paper builds on classical agent-based models of opinion dynamics.
Traditional ABMs use mathematical rules to represent how agents update beliefs after receiving messages.
These models are useful but often reduce opinions and communication to simple numerical values.
The paper also connects to recent work on generative agents and LLM-based social simulation.
Previous studies show that LLM agents can simulate social behaviors, social media posts, and group interactions.
This study extends that direction to opinion dynamics.
The authors argue that LLM agents offer richer natural-language interaction than classical ABMs.
However, they also show that LLM alignment and truthfulness biases can distort social realism.
The paper therefore contributes both a method and a warning for LLM-based social simulation.

## Limitations

The study mainly uses RLHF-trained models, which may explain the truth-converging tendency.
Other language models could show different opinion dynamics.
The opinion scale is one-dimensional, which simplifies complex belief systems.
The topics have clear ground truth, while many real debates are ambiguous or value-laden.
The study focuses mainly on initial beliefs and does not deeply analyze other demographic features.
The network structure is simple because agents can interact broadly rather than through realistic social networks.
Future work should test homophily, echo chambers, and structured social graphs.
The authors also suggest fine-tuning LLMs on real-world discourse to better simulate resistant beliefs.
This would make LLM agents more realistic for studying misinformation and polarization.

## Pros

* The paper clearly shows how LLM agents can extend classical opinion-dynamics ABMs through natural-language interaction.

* The experimental design is strong because it includes framings, memory types, confirmation-bias levels, and control conditions.

* The finding that LLM agents converge toward truth is important for understanding both the promise and limits of LLM social simulation.

* The confirmation-bias manipulation successfully reproduces a known ABM result: stronger bias leads to opinion fragmentation.

* The paper is useful methodologically because it connects LLM-agent simulations with standard opinion-dynamics metrics.

## Cons

* The truth-convergence tendency makes the agents less realistic for simulating persistent misinformation or fact-resistant groups.

* The study uses topics with known ground truth, so it says less about moral, political, or subjective opinion dynamics.

* Opinion is reduced to a single scalar value, which misses multidimensional beliefs and nuanced attitude change.

* The agents interact in a simplified network, without realistic homophily, communities, or platform algorithms.

* Prompt-induced confirmation bias may reproduce fragmentation, but it is not the same as modeling deeper psychological mechanisms.
