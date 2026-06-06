## Introduction

The paper studies how well LLM agents can negotiate with each other in dynamic, multi-turn settings.
The authors argue that negotiation is important because future LLM agents may act on behalf of humans in social and economic interactions.
Negotiation requires contextual understanding, strategic reasoning, communication, and some form of theory of mind.
Unlike static benchmarks, negotiation changes during interaction because agents react to offers, counteroffers, and messages.
The paper introduces NEGOTIATIONARENA, an open-source platform for testing LLM negotiation abilities.
The platform supports structured dialogues between two agents and records offers, reasoning, resources, and outcomes.
The study evaluates GPT-4, GPT-3.5, Claude-2, and Claude-2.1 in different negotiation scenarios.
The main findings are that GPT-4 is usually the strongest negotiator, but all models show biases and irrational behaviors.
The paper also shows that social tactics, such as acting desperate or aggressive, can significantly improve negotiation outcomes.

## Scenarios in NEGOTIATIONARENA

NEGOTIATIONARENA is organized around scenarios where two agents exchange messages and proposals.
Each agent has resources, goals, and a limited number of turns to reach an agreement.
The platform includes three main scenarios: Resource Exchange, Multi-Turn Ultimatum, and Seller-Buyer negotiation.
The Resource Exchange scenario tests how agents trade different resources to maximize their final holdings.
The Multi-Turn Ultimatum scenario extends the classical ultimatum game by allowing counteroffers over several turns.
The Seller-Buyer scenario models price negotiation under incomplete information.
In the Seller-Buyer case, the seller knows the production cost, while the buyer knows their willingness to pay.
The scenarios are designed to study both rational negotiation and flexible conversational behavior.
They can also be modified to test emotions, strategies, personalities, or adversarial behaviors.

## NEGOTIATIONARENA Implementation

The platform is implemented in Python and provides abstractions for building negotiation games.
Agents are prompted to use XML-like tags to structure their messages and actions.
The tags specify information such as agent name, resources, goal, reasoning, answer, message, and proposed trade.
This structure allows the platform to parse offers and track game progress automatically.
Some information, such as private reasoning, is hidden from the other agent.
Agents are asked to repeat their resources and goals to reduce hallucinations and state-tracking errors.
The platform saves full game logs, conversations, metadata, and serialized game states.
Saved games can be reloaded, modified, and used for counterfactual analysis.
The framework is flexible enough to study different forms of distributive and integrative negotiation.

## Benchmarking Agents in Negotiation Games

The authors compare GPT-4, GPT-3.5, Claude-2, and Claude-2.1.
Each ordered pair of models is tested because role and turn order can affect the outcome.
The study runs 60 negotiations for each ordered pair in each scenario.
The two main metrics are win rate and average payoff.
A win occurs when one agent ends with more resources than the other.
Games ending in ties are excluded from win-rate calculations.
Average payoff measures the resources obtained after the final trade.
This setup makes it possible to compare models quantitatively while preserving open-ended dialogue.
The experiments show that model identity, role, and turn order all strongly affect negotiation performance.

## Negotiation Results: Resource Exchange

In the Resource Exchange game, the second player tends to outperform the first player.
GPT-4 and Claude-2.1 are the strongest negotiators in this setting.
GPT-3.5 performs worst, partly because of weaker instruction following.
When Claude-2.1 goes first and GPT-4 goes second, GPT-4 wins most games.
When GPT-4 goes first and Claude-2.1 goes second, Claude-2.1 also wins frequently.
GPT-4 appears willing to sacrifice abundant resources to obtain scarce ones.
Claude-2.1 sometimes obtains higher average payoff than GPT-4 despite GPT-4’s higher win rate.
This suggests that different models may optimize different negotiation objectives.
Some models appear to value diversification rather than pure resource maximization.

## Negotiation Results: Multi-Turn Ultimatum

In the Multi-Turn Ultimatum game, Player 1 usually wins.
Claude-2.1 is the most consistent Player 1, often achieving average payoffs above 60.
Claude models tend to make lower initial offers than GPT models.
Lower initial offers leave more room for favorable negotiation outcomes.
When Player 2 is a GPT model, games more often end in draws.
Draws give both players zero payoff and reduce the average payoff of Player 1.
GPT-3.5 sometimes makes illegal or illogical proposals.
These errors can disrupt the opponent’s strategy and reduce the quality of the negotiation.
The results show that weaker agents can negatively affect stronger agents during interaction.

## Negotiation Results: Seller and Buyer

In the Seller-Buyer game, the buyer usually does better than the seller.
The final sale price is often below the midpoint between seller cost and buyer valuation.
GPT-4 is the strongest buyer, obtaining the lowest average prices.
All models perform more similarly when acting as sellers.
The buyer role may offer more flexibility and more strategic leverage.
The task is an incomplete-information game because each player does not know the other’s private valuation.
The results suggest that stronger models can exploit this flexibility more effectively.
The seller role appears harder for LLMs to use advantageously.
Overall, role assignment is central to negotiation success.

## Insights from the Experiments

Turn order and role strongly influence results in all tested scenarios.
In the ultimatum game, Player 1 has a strong advantage.
In the resource exchange game, Player 2 often has the advantage.
These patterns resemble human negotiation effects, such as anchoring from first offers.
LLMs still make simple but consequential mistakes.
GPT-3.5 often misunderstands goals, legal moves, and stopping conditions.
The authors describe a “babysitting” effect, where stronger models are distracted by correcting weaker models.
For example, GPT-4 may worsen its own offer while trying to fix GPT-3.5’s invalid proposal.
This suggests that weak or confused agents may function as an adversarial burden in multi-agent systems.

## Strategic Social Behavior in Games

The authors test whether social behavior changes negotiation outcomes.
They focus on GPT-4 and add behavioral prompts to one of the agents.
The two tested behaviors are “Cunning” and “Desperate.”
The Cunning prompt asks the agent to be sly, aggressive, and insulting.
The Desperate prompt asks the agent to beg and pretend to be in need.
Both behaviors increase win rate and payoff across the tested games.
The strongest effect appears in the ultimatum game, where Player 2 normally almost never wins.
With Cunning or Desperate behavior, Player 2 wins much more often.
However, Cunning behavior is risky because it can also cause failed agreements and zero payoff.

## Evidence of Irrationality: Seller and Buyer Game

The authors study whether GPT-4 shows irrational negotiation behavior.
In the Seller-Buyer game, GPT-4 displays anchoring bias.
The final accepted price strongly correlates with the seller’s initial price proposal.
GPT-4 also often uses a “split-the-difference” strategy.
This strategy resembles human negotiation but is not always rational.
When the buyer strongly overvalues the object, it should accept or counteroffer lower.
Instead, GPT-4 often makes bad counteroffers above the seller’s initial proposal.
Even prompting the model to be self-interested does not fully fix this behavior.
This suggests that GPT-4 applies generic negotiation scripts even when they are contextually irrational.

## Evidence of Irrationality: Ultimatum Game

The authors compare the classical ultimatum game with a three-turn variant.
In the classical version, GPT-4 behaves rationally by accepting any positive offer.
However, the model sometimes explicitly refers to the known ultimatum game.
This suggests that it may rely on memorized game-theoretic knowledge.
In the three-turn version, the rational strategy should remain similar.
Yet GPT-4’s acceptance behavior changes substantially.
It becomes more sensitive to perceived fairness and rejects low offers more often.
This indicates weak generalization from the classical game to a slightly modified setting.
The authors also show that larger absolute amounts change final split behavior, even when the rational structure is unchanged.

## Related Work

The paper connects to research on signaling games, emergent communication, and negotiation in game theory.
It also relates to studies of human negotiation in economics and psychology.
Prior work has used games such as ultimatum games to test LLM behavior or simulate human behavior.
Other studies have trained or prompted models to improve buyer-seller negotiation performance.
The paper differs by focusing on LLM-to-LLM negotiation without additional learning.
It studies several multi-turn, single-shot games with structured outcomes.
It is also related to negotiation frameworks that test instruction following, faithfulness, and agency.
The authors emphasize their focus on social tactics and irrational behaviors.
NEGOTIATIONARENA is presented as a complementary tool for studying LLM interactions.

## Discussion

The paper presents NEGOTIATIONARENA as a flexible platform for studying LLM negotiation.
The experiments show that GPT-4 is usually the strongest negotiator among the tested models.
However, all models show limitations, biases, and vulnerabilities.
Social tactics such as desperation or aggression can significantly change negotiation outcomes.
This raises concerns because manipulative strategies may exploit LLM agents.
The models also show anchoring, numerosity effects, and poor generalization across similar games.
GPT-3.5’s mistakes show that weaker agents can distort interactions and harm stronger agents’ performance.
The authors argue that understanding these failures is important for building reliable LLM agents.
The platform may help evaluate theory of mind, reasoning, irrationality, and interaction safety.

## Pros

* The paper introduces a practical open-source framework for studying LLM negotiation in multi-turn interactions.

* The three scenarios cover different negotiation structures: resource exchange, ultimatum bargaining, and price negotiation.

* The analysis is not limited to performance; it also studies social tactics, irrationality, and model vulnerabilities.

* The paper provides useful evidence that LLM negotiation behavior is sensitive to role, turn order, and framing.

* The counterfactual and logging design makes the platform valuable for deeper behavioral analysis.

## Cons

* The experiments focus on a small set of models, mostly closed-source frontier models available at the time.

* The negotiation scenarios are simplified and may not capture the full complexity of real-world negotiations.

* Social behavior prompts such as “Cunning” and “Desperate” are useful probes, but they are somewhat artificial.

* The study mainly analyzes LLM-to-LLM interactions, so human-LLM negotiation remains less explored.

* Some results may depend on prompt formatting, XML parsing, and the specific implementation of game rules.

Source: uploaded paper by Bianchi et al. 
