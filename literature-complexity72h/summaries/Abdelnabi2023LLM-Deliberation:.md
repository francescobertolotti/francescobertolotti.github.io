## Introduction

The paper studies how Large Language Models behave in multi-agent negotiation settings.
The authors argue that future AI assistants may negotiate on behalf of different users or organizations.
Negotiation is used as a benchmark because it requires cooperation, competition, planning, arithmetic, inference, and partial Theory-of-Mind.
The proposed task is more complex than many previous LLM-agent benchmarks because agents must interact over many turns and balance private goals with collective agreement.
A central motivation is safety: LLM agents may face greedy or malicious agents that try to manipulate the negotiation.
The authors use scorable negotiation games, where each possible deal has measurable utility for each party.
This makes it possible to evaluate both agreement success and whether agents act consistently with their assigned role.
The paper shows that even strong models such as GPT-4 still struggle when the negotiation becomes harder.

## Game Description

Each game has six parties and five negotiation issues.
Each issue contains several possible sub-options, and a deal consists of choosing one sub-option for each issue.
Every party has private scores for the sub-options and a private minimum threshold for accepting a deal.
A deal is successful if it satisfies at least five parties, including the project proposer and the veto party.
The game is non-zero-sum: some parties have partially aligned interests, while others have conflicting interests.
The scoring system allows the authors to measure whether an LLM proposes useful, selfish, wrong, or collectively beneficial deals.
The benchmark includes a base game adapted from a negotiation teaching exercise.
The authors also use LLMs to generate new semantically different games, then manually curate them for logical consistency.
Difficulty can be tuned by changing thresholds and reducing the number of feasible successful deals.

## LLMs Playing the Game

Each agent receives an initial prompt with public information, private scores, a minimum threshold, and role-specific instructions.
Agents interact over multiple rounds, using only recent public negotiation history and their own private information.
The leading party first proposes an ideal deal and later makes the final official proposal.
The final deal determines whether the negotiation succeeds and what utility each party receives.
The authors test three main behavioral variants: compromising, greedy, and adversarial.
Compromising agents aim for a balanced agreement above their own threshold.
Greedy agents try to maximize their own score while still reaching agreement.
Adversarial agents try to sabotage the agreement or isolate a target party.
The incentives are expressed in natural language rather than by directly telling agents which deals to choose.

## Baseline Prompting Framework

The authors use a structured Chain-of-Thought-style prompting framework.
The agent first observes the negotiation history and calculates the scores of previous deals.
It then infers the likely preferences of other parties from their public statements.
Next, the agent explores possible candidate deals above its own threshold.
It selects a final deal that should satisfy its goal and be acceptable to other parties.
The framework also includes a private planning step for future negotiation moves.
The private scratchpad and plans are not part of the public negotiation answer.
Ablation experiments test which components are most important for successful negotiation.
The results suggest that inference about others and long-term planning are especially important for GPT-4.

## Experiments and Evaluation

The authors run 24-round negotiations with six agents and a history window of the six most recent interactions.
They evaluate GPT-4, GPT-3.5, Gemini Pro, Llama2, Llama3, and Mixtral models.
Each experiment is repeated 20 times with randomized agent order.
The main metrics are final success, any success, own score, collective score, wrong deals, and score leakage.
Final success measures whether the final proposal satisfies the required parties.
Wrong deals measure whether agents propose deals below their own threshold.
Score leakage measures whether agents reveal confidential scores or thresholds.
GPT-4 performs best overall but still fails often, especially in harder games.
GPT-3.5 has many calculation errors and often leaks private score information.
Some open-source models outperform GPT-3.5 but remain below GPT-4.

## Prompt Ablation Results

Without Chain-of-Thought, both GPT-4 and GPT-3.5 perform worse.
GPT-4 benefits strongly from inferring other agents’ preferences and from planning future moves.
Removing the planning step causes negotiation progress to saturate in later rounds.
For GPT-4, explicit candidate generation can sometimes reduce performance because agents may focus too much on locally high-scoring deals.
GPT-3.5 benefits more from structured exploration because it struggles with arithmetic and deal feasibility.
GPT-4 makes fewer wrong deals than GPT-3.5, suggesting better arithmetic and role alignment.
The results show that negotiation success depends on more than language fluency.
Models need arithmetic, social inference, strategic adaptation, and memory across turns.

## Mixed Population Experiments

The paper studies mixed populations where GPT-4 and GPT-3.5 agents negotiate together.
Adding GPT-3.5 agents lowers the success rate of the whole group.
The largest drop occurs when the leading proposer is GPT-3.5.
This suggests that weaker agents can reduce collective outcomes in multi-agent systems.
The results also raise fairness concerns: users represented by weaker models may obtain worse deals.
Mixed-capability environments may therefore create asymmetric power between users.
This is important for real-world AI assistants, where different people may use models with different abilities.

## Results on Other Models and Games

GPT-4 obtains the highest final success among the tested models.
Llama3-70B comes relatively close to GPT-4 on success, calculation accuracy, and low score leakage.
Llama2-70B and Mixtral perform better than GPT-3.5 but still show more errors.
Gemini Pro performs below GPT-4 and several open-source models in this benchmark.
The benchmark remains difficult even for state-of-the-art models.
The authors also test rewritten and newly generated games.
Performance varies across games even when the number of feasible deals is similar.
Games with dense and conflicting preferences are harder because small deal changes can strongly affect agreement.
Reducing the number of feasible successful deals makes the benchmark substantially harder.

## Greedy and Adversarial Variants

The authors test whether LLM behavior changes when agents receive different high-level incentives.
GPT-4 agents behave consistently with their assigned role: compromising agents favor collective score, greedy agents favor own score, and adversarial agents reduce collective score.
Greedy agents can influence the negotiation and obtain better outcomes at the expense of others.
When the leading proposer is greedy, the success rate drops sharply.
Adversarial agents can sometimes prevent agreement, especially when they target a specific party.
Targeted adversarial behavior is more effective when the adversary can align with powerful parties such as the proposer or veto party.
The results show that multi-agent LLM systems may be vulnerable to manipulation and coalition formation.
They also show that other agents sometimes resist obvious adversarial behavior by converging toward majority-supported deals.

## Related Work

Previous work has evaluated LLM agents in web browsing, knowledge synthesis, repeated games, and simpler negotiation tasks.
The authors argue that their benchmark is more complex because it involves six agents, multiple issues, private utilities, veto power, and multi-turn interaction.
Unlike two-player negotiation, this setting makes malicious behavior harder to detect and more realistic.
The task also requires indirect semantic inference about other agents’ goals.
The paper connects negotiation to broader questions in LLM agency, Theory-of-Mind, planning, cooperation, and AI safety.
Its main contribution is not only performance evaluation but also the study of manipulation and adversarial dynamics in multi-agent LLM systems.

## Pros

- The benchmark is well designed because it combines arithmetic, strategic reasoning, social inference, and multi-turn interaction in one task.
- The scoring system makes evaluation more rigorous than purely qualitative analysis of agent conversations.
- The paper studies safety-relevant behaviors such as greed, manipulation, coalition formation, and targeted adversarial action.
- The benchmark is extensible because new games can be generated and difficulty can be tuned by changing thresholds.
- The ablation study is useful because it shows which prompting components support negotiation success.

## Cons

- The benchmark still depends heavily on prompt design, so results may change with different prompting strategies.
- The use of natural language incentives makes the behavioral variants realistic, but also less controlled than formal game-theoretic policies.
- The experiments focus mainly on LLM-only simulations, so it is unclear how well the findings transfer to human-AI negotiation.
- GPT-4 is also used as a judge for score leakage, which may introduce model-specific evaluation bias.
- The games are complex but still simplified compared to real negotiations, where preferences, trust, and side communication are more dynamic.