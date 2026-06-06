## Introduction

The paper studies how language affects opinion dynamics in LLM-based agent simulations.
Traditional opinion dynamics models often represent opinions and messages as numerical values.
This simplification makes it difficult to study how arguments, language, and fallacies influence opinion change.
The authors propose LODAS, a Language-Driven Opinion Dynamics model for agent-based simulations.
In LODAS, agents are LLM instances that debate the Ship of Theseus paradox.
Agents hold discrete opinions from strongly disagree to strongly agree.
During interactions, one agent tries to persuade another through natural language.
The receiving agent can accept, reject, or ignore the argument and may update its opinion.
The paper focuses especially on agreement bias, sycophancy, and logical fallacies in LLM-agent debates.

## Results

The study simulates populations of 140 LLM agents.
Each agent has an opinion in the range from 0 to 6, corresponding to strongly disagree through strongly agree.
At each time step, agents interact pairwise in a mean-field setting, where all agents can interact with all others.
One agent acts as Opponent and provides a persuasive argument.
The other acts as Discussant and decides whether to accept, reject, or ignore the argument.
The topic is the Ship of Theseus paradox, chosen because it has no clear scientific ground truth.
The statement is framed in two ways: “the ship is the same” and “the ship is different.”
The authors test Mistral-7B-Instruct and Llama-3-8B agents.
They analyze both opinion evolution and the linguistic structure of generated arguments.

## Balanced Scenario

In the balanced scenario, opinions are initially uniformly distributed across the seven possible opinion values.
This provides a neutral baseline for studying the effects of interaction.
In both Mistral and Llama populations, agents tend to converge toward agreement with the presented statement.
Negative and neutral opinions disappear quickly during the first iterations.
Positive opinions grow, especially mildly agree, agree, and strongly agree.
With the positive statement, most agents converge around agree, with some strongly agree.
With the negative statement, strongly agree becomes more dominant.
Mistral agents show a stronger and faster tendency toward agreement than Llama agents.
Llama agents accept a broader range of opinions, while Mistral agents accept agreeing opinions more selectively.

## Logical Fallacies in the Balanced Scenario

The authors analyze the language produced by Opponents and Discussants.
Opponents often generate repeated arguments, especially in Llama populations.
Discussants usually produce more varied responses than Opponents.
Both Mistral and Llama Opponents frequently use fallacies of relevance.
Fallacies of credibility and appeals to emotion are also common.
Llama Opponents are more successful than Mistral Opponents when persuading through fallacious arguments.
In the balanced setting, Llama fallacious arguments change Discussants’ opinions about 72–75% of the time.
Mistral fallacious arguments change Discussants’ opinions about 45–49% of the time.
Discussants, especially Llama agents, often introduce circular reasoning in their explanations.

## Polarized Scenario

In the polarized scenario, the population starts with only extreme opinions.
Agents are divided between strongly agree and strongly disagree.
This setup is designed to test whether LODAS can reproduce persistent polarization.
Instead, the population still converges toward agreement with the presented statement.
Strongly disagreeing agents quickly move toward milder and then agreeing opinions.
Strongly agreeing agents may also soften their position temporarily.
Eventually, the population reaches consensus or majority agreement.
Negative framing creates more unstable dynamics, with agreement clusters coexisting longer.
The authors conclude that polarized initial conditions do not preserve opposite opinion clusters in these LLM populations.

## Logical Fallacies in the Polarized Scenario

The polarized setting produces less linguistic variety than the balanced one.
This reduction is especially strong for Mistral Opponents, which repeat many statements.
Llama agents mainly use fallacies of relevance and credibility.
Mistral agents produce a wider variety of fallacies.
In polarized settings, Mistral agents often appeal to emotion when trying to persuade others.
Fallacious arguments are highly associated with opinion change in this scenario.
Llama agents show opinion change after fallacious arguments in about 76–77% of cases.
Mistral agents show a high effect too, especially in the “same boat” case.
The results suggest that fallacies can strongly support convergence even in initially polarized populations.

## Unbalanced Scenario

In the unbalanced scenario, about 60% of agents initially strongly disagree with the statement.
The remaining agents hold disagree or mildly disagree opinions.
This setup tests whether LLMs still move toward agreement when the initial distribution is heavily negative.
Mistral agents quickly reduce the strongly disagree group and move toward agreement.
For Mistral, the population eventually reaches agreement or mild agreement, even from a negative starting point.
Llama agents behave differently depending on the statement framing.
With the positive statement, Llama agents form disagreement clusters and do not reach positive agreement.
With the negative statement, strongly disagree becomes dominant.
This is the main scenario where the agreement tendency is less general across models.

## Logical Fallacies in the Unbalanced Scenario

Llama agents remain more prone than Mistral agents to fallacious reasoning.
Llama Opponents continue to rely mostly on fallacies of relevance.
In the negative framing, Llama agents fail to generate many positive opinions.
Mistral Opponents show a stronger tendency to appeal to emotion.
This is especially visible in the positive “same boat” framing.
Discussants in both models mostly produce fallacies of relevance and credibility.
Llama Discussants sometimes add circular reasoning.
Fallacious arguments still produce opinion changes, but less strongly than in balanced and polarized scenarios.
The authors suggest that a highly negative initial setup may encourage slightly more reasoned persuasive statements.

## Methods

LODAS represents each agent as an LLM instance with a discrete opinion.
The opinion scale ranges from strongly disagree to strongly agree.
Agents are implemented using AutoGen AssistantAgent.
At each time step, a random pair of agents is selected.
One agent becomes the Opponent and the other becomes the Discussant.
The Opponent must defend its current opinion and produce a persuasive argument.
The Discussant reads the argument and decides whether to accept, reject, or ignore it.
If the Discussant accepts, its opinion moves one step toward the Opponent’s opinion.
The simulations use 30 iterations, with 140 pairwise interactions per iteration.
Logical fallacies are detected using a DistilBERT-based fallacy classification model.

## Discussion

The paper argues that LLM agents show a strong tendency toward agreement.
This agreement appears both as agreement with the presented statement and as agreement with other agents.
The authors interpret this as a form of agreeableness or sycophancy.
Mistral agents tend to accept agreeing opinions and reject disagreeing opinions more selectively.
Llama agents are more broadly accepting, even of opposing positions.
Despite differences between models, both show a tendency to move toward consensus.
The linguistic analysis shows that LLM agents often persuade through logically flawed arguments.
Agents are also influenced by fallacious arguments and may change their opinions after reading them.
This raises concerns for human-LLM interaction, because LLMs may reinforce false or harmful beliefs.

## Pros

* The paper introduces a useful framework for studying opinion dynamics through natural language rather than only numerical rules.

* The use of LLM agents allows the authors to study argumentation, persuasion, fallacies, and opinion change together.

* The comparison between balanced, polarized, and unbalanced initial conditions gives a clear view of how starting states affect dynamics.

* The analysis of logical fallacies is a strong contribution because it connects language quality with persuasion and opinion change.

* The results reveal important risks of LLM agents, especially agreeableness, sycophancy, and vulnerability to fallacious reasoning.

## Cons

* The agents are simple and lack personality, demographics, memory depth, and richer cognitive diversity.

* The mean-field interaction structure is unrealistic because real social systems have networks, communities, and echo chambers.

* The topic is deliberately non-controversial, so the results may not generalize to political, moral, or scientific debates.

* The fallacy detection depends on an external classifier, so errors in classification may affect the linguistic analysis.

* The study uses only two open models, so the conclusions may not transfer to larger proprietary LLMs or other architectures.
