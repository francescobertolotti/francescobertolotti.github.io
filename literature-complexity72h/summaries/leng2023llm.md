## Introduction

The paper studies whether LLM agents exhibit social behavior in economic interaction tasks.
The authors argue that LLMs are increasingly used as autonomous agents, so their social behavior must be evaluated before deployment.
The focus is not on whether LLMs truly have human-like motives, but on whether their outputs show patterns similar to social preferences.
The paper introduces the SUVA framework: State, Understanding, Value, Action.
SUVA analyzes both final decisions and the chain-of-thought-like utterances leading to those decisions.
The tested social concepts include self-interest, social welfare, fairness, competition, group identity, and reciprocity.
The study evaluates eight models from GPT, LLaMA, and Mistral families.
The key finding is that most models do not behave as purely self-interested agents.
They often generate decisions consistent with social welfare, fairness, and reciprocity.

## Literature Review

The paper connects to research on LLM decision-making in psychology, cognitive science, economics, and game theory.
Prior studies show that LLMs can display reasoning strengths but also limitations in causal inference, exploration, and strategic consistency.
Economic studies have tested LLMs in Prisoner’s Dilemma, Ultimatum Game, and other strategic settings.
Some results suggest fairness and cooperation, while others show selfishness or unstable coordination.
The paper also relates to agent-based modeling, where LLM agents may replace rigid rule-based agents.
It contributes to AI agentic systems by asking whether LLMs are suitable for autonomous social interaction.
The main gap is that prior work often studies final actions only.
This paper also studies how utterance-based “reasoning” predicts final actions.
It therefore links LLM behavior research with explainable AI.

## SUVA Probabilistic Framework

SUVA adapts the human-centered Belief-Desire-Intention model to LLM outputs.
Because LLMs do not have real beliefs, desires, or intentions, the authors replace them with textual constructs.
State means the prompt or social scenario given to the model.
Understanding means how the model describes the task or payoff structure.
Value means the social concepts expressed in the model’s utterance, such as fairness or self-interest.
Action means the final decision selected by the model.
The framework treats LLM output as probabilistic next-token generation.
It analyzes how stated values in the reasoning segment affect the probability of final actions.
The diagram on page 9 shows how SUVA maps prompt, response, coded values, and action into a probabilistic analysis pipeline.

## Prompt Design and Behavioral Games

The authors use dictator-game variants from behavioral economics.
These games are simple but useful for studying resource allocation and social preferences.
In the single-round dictator game, the LLM chooses between two payoff allocations for itself and another player.
This measures distributional preferences such as self-interest, social welfare, competition, and difference aversion.
The paper also adds group identity manipulations.
Group identity is induced through arbitrary or realistic shared traits, such as color, artist preference, hometown, or school.
Two-round dictator games are used to study reciprocity.
Direct reciprocity tests whether the LLM helps someone who previously helped or harmed it.
Indirect reciprocity tests whether the LLM helps someone who previously helped or harmed a third party.

## Action-Level Analysis

The first part of the empirical analysis focuses on final choices.
For distributional preferences, the authors regress the selected action on payoff-based predictors.
Self-interest measures whether the option benefits the LLM-agent itself.
Competition measures whether the option increases the LLM-agent’s relative advantage over the other player.
Difference aversion measures whether the option reduces inequality between players.
Social welfare measures whether the option maximizes total payoff.
For group identity, the model includes interaction terms between ingroup status and these preference variables.
For reciprocity, the authors compare the probability of helping after observing good or bad prior behavior.
This makes social behavior measurable from final LLM decisions.

## Stated-Value Extraction from Reasoning

The second part of the analysis studies the reasoning text produced before the final action.
The authors use deductive coding, a qualitative social-science method.
They build a codebook based on concepts from behavioral economics.
Each sentence in the chain-of-thought-like response is labeled as task understanding or as a stated value.
Examples of stated values include fairness, altruism, cooperation, self-interest, and competition.
The final answer is extracted separately from the action segment.
Each response becomes a sequence of coded labels followed by a final action.
This allows the authors to analyze the path from utterance-based reasoning to decision.
The method does not claim that LLMs truly possess values; it studies values expressed in generated text.

## Predictability and Tree-Based Visualization

The authors test whether stated values predict final actions.
They use machine-learning models to predict the final choice from coded reasoning features and prompt parameters.
High prediction accuracy would indicate that the reasoning text is meaningfully related to the final decision.
The authors also build probabilistic decision trees from repeated responses to the same prompt.
Tree nodes represent understanding labels, stated values, and final actions.
Edges represent conditional probabilities between reasoning steps.
This visualization shows common reasoning paths that lead to different choices.
It provides a readable way to inspect how LLMs move from stated values to actions.
The purpose is to make LLM social decision-making less opaque.

## Probabilistic Dependency Analysis

The paper also estimates which stated values statistically change the probability of a final action.
For each response, the authors mark whether each value appears in the reasoning.
They then use fixed-effects regressions controlling for the specific prompt.
This isolates how stochastic variation in stated values relates to final decisions under the same game conditions.
Mentions of altruism, fairness, and cooperation increase the likelihood of prosocial choices.
Mentions of self-interest and competition reduce the likelihood of prosocial choices.
This supports the claim that utterance-based reasoning is predictive, not purely decorative.
The method gives a quantitative bridge between qualitative coding and action prediction.
It is one of the paper’s strongest methodological contributions.

## Models and Experimental Scale

The study evaluates eight LLMs.
The proprietary models are GPT-3.5 and GPT-4.
The Meta models are LLaMA 2 13B, LLaMA 2 70B, LLaMA 3 8B, and LLaMA 3 70B.
The Mistral models are Mistral 7B and Mixtral 8x7B.
For distributional preferences, each model is run 1,200 times.
For group identity effects, each model is run 9,600 times.
For direct and indirect reciprocity, each model is also run 1,200 times.
The main experiments use temperature 0.2 and chain-of-thought prompting.
Prompt sensitivity tests vary temperature, incentives, CoT, personas, and real-world contexts.

## Results: Distributional Preferences

Most models do not generate purely self-interested decisions.
They often show positive sensitivity to social welfare.
Competition is generally weak across models.
Difference aversion appears in some models, especially LLaMA 2 70B and Mixtral 8x7B, but it is not dominant overall.
For GPT and Mistral models, larger or newer models tend to show less self-interest and more social welfare orientation.
For LLaMA models, the opposite pattern appears: larger models show more self-interest.
The authors suggest this may reflect differences in training or alignment procedures.
The figure on page 21 shows these model-level differences across self-interest, competition, difference aversion, and social welfare.
This result is important because model family matters, not only model scale.

## Results: Group Identity Effects

The paper tests whether shared group identity changes distributional preferences.
Higher-capacity models show group identity effects more often.
These effects mean that LLMs may change decisions when the other player is described as part of the same group.
The group identity manipulations include both minimal groups and realistic social similarities.
The effect is not uniform across all models or all preference dimensions.
The figure on page 22 shows interaction effects between shared identity and preference factors.
The result suggests that LLMs can reproduce ingroup-sensitive patterns present in human social data.
This is useful for simulation but also risky because it may reproduce group-based bias.
The finding supports testing LLM agents before using them in social or organizational simulations.

## Results: Direct and Indirect Reciprocity

The models show patterns consistent with direct reciprocity.
They are more likely to help an agent who previously helped them.
They are less likely to help an agent who previously misbehaved toward them.
The models also show indirect reciprocity.
They respond to whether another agent helped or harmed a third party.
This means the models can generate behavior consistent with reputation-based social judgment.
The reciprocity effects differ across model families and model sizes.
The figure on page 22 shows both direct and indirect reciprocity across the tested LLMs.
This is relevant for multi-agent systems where agents observe each other’s past actions.

## Prompt Sensitivity Analysis

The paper checks whether the results are robust to prompt changes.
Changing incentive scales, such as wages and conversion rates, does not eliminate the main distributional preference patterns.
Temperature changes from 0.2 to 0.8 have limited effect on distributional preferences and reciprocity.
Removing chain-of-thought prompting can change social preferences in model-specific ways.
For GPT-4 and Mixtral 8x7B, CoT tends to increase prosociality.
For LLaMA 3 70B, CoT can lead to more deliberative and quantitative reasoning, which may increase self-interest.
The figure on page 25 summarizes sensitivity to different incentive structures.
The result shows that prompt design matters, especially when CoT is included.
This limits the idea that LLM social behavior is a fixed property of the base model.

## Results: Tracing Reasoning to Action

The authors show that coded reasoning features can predict final actions with high reliability.
This means that the stated values in responses are strongly associated with the decisions that follow.
The paper uses prediction models such as XGBoost to test this relationship.
The result supports the usefulness of analyzing CoT-like utterances.
Tree visualizations show recurring paths from understanding and values to final actions.
For example, a path mentioning fairness or altruism often leads to a more prosocial action.
A path mentioning self-interest or competition often leads to a less prosocial action.
Probabilistic dependency analysis confirms these patterns statistically.
This makes SUVA useful as an explainability framework for LLM social decisions.

## Implications for LLM Agents

The paper argues that SUVA can help practitioners choose LLMs for social applications.
Different model families express different social preference patterns.
For example, LLaMA models may be more self-interest-oriented than GPT or Mistral models in these experiments.
This matters for chatbots, autonomous agents, organizational tools, and agent-based simulations.
The framework can also help evaluate whether a model aligns with specific organizational values.
In agent-based modeling, SUVA can reduce the risk of using opaque LLM agents with unknown behavioral tendencies.
The paper also contributes to explainable AI by linking reasoning text to decisions.
Its main practical message is that LLM agents should be evaluated socially before deployment.
This is especially important when they make decisions involving allocation, cooperation, or conflict.

## Limitations

The paper studies LLM outputs in stylized behavioral-economics games.
These games are useful and controlled, but they simplify real social interaction.
The study does not prove that LLMs have genuine social preferences, intentions, or values.
The measured “values” are labels applied to generated utterances.
The results depend on prompting choices, especially the use of chain-of-thought instructions.
The reasoning analysis depends on deductive coding, which may introduce coding assumptions.
The tested models are representative but not exhaustive.
The framework analyzes text-action associations, not internal model mechanisms.
Real-world deployment would require further validation in domain-specific tasks.

## Pros

* The SUVA framework is specific and useful because it connects prompts, coded reasoning, and final actions in one probabilistic structure.

* The paper goes beyond final-choice analysis by showing that utterance-based reasoning predicts LLM decisions in social games.

* The experimental design is strong because it uses canonical dictator-game variants to separately test distributional preferences, group identity, and reciprocity.

* The model-family comparison is informative: GPT/Mistral and LLaMA show different capacity-related trends in self-interest and social welfare.

* The tree visualization and probabilistic dependency analysis provide practical tools for explainability in LLM-agent social decision-making.

## Cons

* The dictator-game setting is controlled but narrow, so the results may not generalize to richer negotiations, repeated games, or real organizational interactions.

* The framework labels generated text as “values,” but these are surface utterance patterns and not evidence of internal preferences or stable motivations.

* Chain-of-thought prompting changes behavior in model-specific ways, so SUVA results can depend strongly on whether and how reasoning is elicited.

* Deductive coding relies on a human-designed codebook, so important emergent reasoning categories may be missed or forced into predefined labels.

* The paper compares several model families, but the results can become outdated quickly as LLM training, alignment, and API versions change.

