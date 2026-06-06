## Introduction

The paper studies LLM agents as strategic decision-makers in repeated social dilemmas.
The authors argue that evaluating LLMs only through factual correctness is insufficient when LLMs act in interactive systems.
They focus on behavioural intentions, defined as decision rules mapping past interaction histories to current actions.
The work extends FAIRGAME, a framework for testing LLMs in game-theoretic environments.
The paper adds two main experimental modules: payoff-scaled Prisoner’s Dilemma and multi-agent Public Goods Game.
It also adds a machine-learning pipeline to classify LLM behaviour into canonical repeated-game strategies.
The main tested models include GPT-4o, Claude 3.5 Haiku, Mistral Large, and later also Claude 3.5 Sonnet and Llama 3.1 405B.
The central finding is that LLM strategic behaviour depends strongly on incentives, language, model architecture, and personality prompts.
The paper treats these effects as important for AI governance and multi-agent system safety.

## Background: LLMs, Game Theory, and FAIRGAME

The paper builds on repeated-game theory, where strategies such as ALLC, ALLD, TFT, and WSLS describe behavioural intentions.
In this framework, cooperation and defection are not single actions but patterns over repeated interaction.
FAIRGAME is used as the computational base for controlled LLM-agent experiments.
It separates game specification from execution through JSON configurations and language-specific prompt templates.
It can vary payoff matrices, languages, model backends, horizons, and personality descriptions.
During execution, each LLM receives the rules, history, round index, and context, then produces a discrete action.
The original FAIRGAME mainly focused on two-player symmetric matrix games.
This paper extends it to payoff scaling and multi-agent public goods dynamics.
The goal is to move from simple cooperation rates toward interpretable strategic patterns.

## Research Questions

RQ1 asks whether LLM agents change cooperation when all Prisoner’s Dilemma payoffs are uniformly scaled.
This isolates the effect of stake magnitude while preserving the same strategic structure.
RQ2 asks whether FAIRGAME can be extended from two-player games to multi-agent Public Goods Games.
This allows the authors to study free-riding, coordination, and group-level cooperation.
RQ3 asks whether machine-learning classifiers can infer LLM behavioural intentions from repeated-game trajectories.
The classifiers are trained on canonical strategies and then applied to FAIRGAME logs.
The broader aim is to understand systematic biases across models, languages, personalities, and roles.
The paper therefore combines game-theoretic design with data-driven strategy recognition.
This makes the work both methodological and empirical.

## Payoff-Scaled Prisoner’s Dilemma

The Prisoner’s Dilemma uses two options: Option A represents defection and Option B represents cooperation.
The baseline payoff matrix satisfies the standard ordering T > R > P > S.
The authors scale all payoffs by λ while keeping the payoff ranking unchanged.
The tested scaling factors are λ = 0.1, 1.0, and 10.0.
This creates very low, ordinary, and high stake regimes without changing the formal game.
The games last 10 rounds, and agents observe the full public history of past actions and payoffs.
The tested models are GPT-4o, Claude 3.5 Haiku, and Mistral Large.
The same game is instantiated in English and Vietnamese.
The authors evaluate 40 games with 400 decisions per setting.

## Public Goods Game Extension

The multi-agent experiment uses a repeated Public Goods Game with three LLM agents.
Each agent decides whether to contribute 10 units to a common pool or keep the endowment.
Total contributions are multiplied by a factor r and redistributed equally to all agents.
The tested multiplication factors are r = 1.1, 2.0, and 2.9.
The group size is N = 3, which is the smallest size where non-dyadic effects can appear.
The game lasts 10 rounds, and agents know the finite horizon.
The implementation replaces static payoff matrices with a dynamic payoff module.
The history is extended from pairwise records to vector-valued multi-agent histories.
The prompt templates are adapted so that agents reason over group-level incentives and histories.

## Machine-Learning Strategy Recognition

The paper trains classifiers to recognize canonical repeated-game strategies from action sequences.
The target strategies are ALLC, ALLD, TFT, and WSLS.
Synthetic trajectories are generated from these strategies under noise levels ε = 0 and ε = 0.05.
The tested classifiers include Logistic Regression, Random Forest, Neural Network, and LSTM.
The trained model is then applied to FAIRGAME trajectories produced by LLM agents.
Raw action labels are converted into state-action sequences based on outcomes such as Reward, Punishment, Temptation, and Sucker.
The model outputs a probability distribution over strategy classes for each agent.
The main analysis uses high-confidence classifications with probability above 0.9.
Lower-confidence cases are treated as potentially ambiguous or emergent behaviours.

## Payoff Magnitude Sensitivity Results

The payoff-scaling experiment shows that stake magnitude affects LLM cooperation.
Very low payoff magnitude, λ = 0.1, produces higher total penalties and more frequent defection.
Ordinary and high payoff settings show broadly similar patterns, with smaller local differences.
This suggests that LLM agents do not simply follow the unchanged strategic structure of the game.
They also react to the absolute numerical scale of payoffs.
GPT-4o becomes more selfish when the payoff matrix is scaled down.
Mistral Large shows the opposite tendency, with more defection when payoffs are higher.
Claude 3.5 Haiku shows weaker and less consistent sensitivity to payoff magnitude.
The results indicate that incentive scaling can interact with model-specific numerical reasoning.

## Cross-Linguistic Effects in Prisoner’s Dilemma

The Prisoner’s Dilemma results show strong differences between English and Vietnamese prompts.
Some models reverse their behaviour when the language changes.
In Vietnamese, cooperative pairings involving GPT-4o and Mistral often favour defection more strongly.
The authors interpret this as evidence that language is not only a translation layer.
It can act as a strategic variable shaping how models interpret incentives and social context.
Claude 3.5 Haiku may misinterpret small payoff magnitudes in Vietnamese when λ = 0.1.
This can lead to behaviour that appears to maximize penalties instead of minimizing them.
The paper links this to linguistic bias and numerical reasoning differences across languages.
This is one of the most important safety-relevant findings of the paper.

## Public Goods Game Cooperation Rates

In the Public Goods Game, cooperation generally increases as the multiplication factor r increases.
This pattern is consistent with game-theoretic expectations for public goods settings.
Higher r makes group contribution more collectively beneficial.
The pattern appears across Claude 3.5 Haiku, Mistral Large, and GPT-4o.
However, cooperation tends to decline over the 10 rounds.
English prompts usually start with higher cooperation and decline more smoothly.
Vietnamese prompts often show a sharper early collapse in cooperation.
By the end of the game, Vietnamese conditions frequently reach lower cooperation levels.
This suggests that language affects both initial cooperation and response to early free-riding.

## End-Game Effects and Coordination

The Public Goods Game shows clear end-game movement toward non-cooperation.
As the final rounds approach, cooperation rates decline across models.
At the same time, agents do not become chaotic or divergent.
Instead, mismatch between agents decreases, meaning they converge toward similar behaviour.
Mistral Large shows the strongest convergence, with mismatch approaching zero by round 10.
Claude 3.5 Haiku and GPT-4o keep slightly higher disagreement but still become more aligned.
Selfish personality prompts lead to rapid convergence toward consistent non-cooperation.
Cooperative prompts preserve more behavioural diversity for longer.
This means cooperative framing delays convergence to defection but does not fully prevent it.

## Model-Specific Behavioural Biases

The paper identifies distinct behavioural profiles for different LLMs.
Claude 3.5 Haiku shows the strongest prosocial bias, keeping some cooperation even under selfish framing.
This suggests that Claude’s alignment training may resist explicit selfish instructions.
GPT-4o shows the strongest personality adherence, reaching zero cooperation under selfish prompts.
However, GPT-4o also shows the strongest cross-language divergence under cooperative prompts.
Mistral Large is the most linguistically stable, with similar cooperation across English and Vietnamese.
Mistral also shows lower behavioural variance and more predictable responses.
These profiles imply that model choice is itself a strategic design decision in multi-agent systems.
Different models offer different trade-offs between cooperation, stability, instruction-following, and linguistic sensitivity.

## Classifier Robustness

The strategy-recognition experiment compares several machine-learning models.
Logistic Regression and Random Forest perform well on clean synthetic data.
Their performance degrades when 5% execution noise is introduced.
The LSTM is more robust under noise and maintains the highest reported performance, around 94%.
This is because LSTMs can capture temporal dependencies in action sequences.
Flattened feature models lose part of the sequential structure of repeated-game strategies.
The authors therefore use the LSTM as the main intent-recognition model.
High-confidence filtering is used to avoid over-interpreting ambiguous sequences.
This makes the analysis more conservative but excludes some potentially novel LLM behaviours.

## Strategy Distribution Across Models

The strategy classification reveals strong differences across LLM architectures.
Claude 3.5 Sonnet is cooperative-dominant, with ALLC around 31.7% and WSLS around 29.6%.
Llama 3.1 405B Instruct strongly favours WSLS, around 46.5%, the highest single-strategy share reported.
Mistral Large has the most balanced distribution, with TFT, ALLC, WSLS, and ALLD all present at comparable levels.
GPT-4o shows an adaptive-cooperative profile, mainly using WSLS and ALLC.
GPT-4o also has the lowest reported ALLD rate, around 10.2%.
These results suggest that strategic behaviour is not explained only by model scale.
It likely depends on training, alignment, and model-specific response tendencies.
The classification results make model-level behavioural differences easier to interpret than raw cooperation rates.

## Language Effects on Strategy Classes

The paper finds strong language effects on inferred strategies.
Arabic and Vietnamese prompts tend to produce more ALLD-like behaviour.
French and Chinese show stronger cooperative tendencies.
English and Chinese often favour WSLS, suggesting more adaptive outcome-dependent behaviour.
French shows moderate-to-high TFT usage, indicating reciprocal conditional cooperation.
Vietnamese and Chinese generally show lower TFT use.
Arabic has the lowest ALLC rate and the highest defection tendency.
The relative ranking of languages remains stable across several models.
The authors interpret this as possible linguistic-cultural priming embedded in model training data.

## Discussion and Limitations

The ten-round horizon is useful for observing early dynamics but too short for stable long-term strategy formation.
Longer games may reveal reputation-building, forgiveness, or more complex conditional strategies.
The main linguistic comparison in the game experiments focuses on English and Vietnamese, limiting generalization.
The Public Goods Game uses only three agents, so larger-group effects such as coalition formation remain underexplored.
The classifier recognizes only four canonical strategies, which may miss hybrid or novel LLM strategies.
High-confidence filtering improves reliability but excludes ambiguous behaviours that could be theoretically important.
The study lacks matched human experiments, so it cannot fully compare LLM strategies with human behaviour.
The authors propose future work with longer trajectories, more languages, more games, communication, and human benchmarks.
These limitations do not weaken the main findings, but they constrain their generality.

## Pros

* The payoff-scaling Prisoner’s Dilemma is a strong design choice because it isolates absolute stake sensitivity while preserving the same payoff ordering.

* The Public Goods Game extension makes FAIRGAME more useful because it moves beyond dyadic games and captures free-riding and group coordination.

* The strategy-recognition pipeline is valuable because it translates raw LLM actions into interpretable behavioural classes such as ALLC, ALLD, TFT, and WSLS.

* The cross-linguistic results are specific and important: English and Vietnamese prompts can produce substantially different cooperation trajectories under identical rules.

* The model-specific profiles are practically useful: Claude appears more prosocial, GPT-4o more instruction-sensitive, and Mistral more linguistically stable.

## Cons

* The 10-round horizon is too short to infer mature repeated-game strategies such as stable reputation, forgiveness, or long-term reciprocity.

* The strategy classifier is restricted to four canonical labels, so it may force genuinely mixed or emergent LLM behaviours into human-designed categories.

* The language analysis is promising but incomplete, because the core game experiments focus mainly on English and Vietnamese.

* The Public Goods Game uses only three agents, so claims about coalition-like behaviour remain limited and need larger groups.

* The absence of matched human-subject experiments makes it unclear whether the observed behaviours are human-like or artifacts of model alignment and prompting.
