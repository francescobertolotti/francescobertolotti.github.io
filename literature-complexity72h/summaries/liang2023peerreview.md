## Introduction

The paper proposes a multi-agent collaboration method for improving LLM reasoning.
The motivation is that single LLMs often fail to self-correct once they have produced an initial wrong answer.
The authors argue that external feedback from other agents can help overcome this limitation.
Their method is inspired by academic peer review.
Each agent first creates an independent solution, then reviews the solutions of other agents, and finally revises its own answer.
The approach is tested on mathematical, commonsense, and symbolic reasoning tasks.
The main finding is that peer review collaboration improves accuracy across all ten evaluated datasets.
The paper also shows that feedback exchange is more useful than simply sharing final solutions.
Confidence scores in reviews help mainly in mathematical reasoning, but they can be miscalibrated in non-math tasks.

## Related Work

The paper builds on Chain-of-Thought prompting, self-consistency, plan-and-solve prompting, and least-to-most prompting.
These methods improve single-agent reasoning by encouraging step-by-step problem solving or multiple reasoning paths.
The paper also discusses self-correction methods, where one LLM reviews and revises its own answer.
Prior work suggests that self-correction is weak without external feedback.
The paper then connects to multi-agent collaboration, including CAMEL, multi-agent debate, code review, and collaborative evaluation.
The theoretical inspiration is similar to the “Society of Mind” idea: intelligence can emerge from interacting modules.
Unlike simple majority voting or debate, this paper emphasizes structured peer feedback.
The agents do not only see other answers; they critique reasoning steps and state confidence in their critiques.
This makes the method closer to academic review than ordinary answer aggregation.

## Methodology: Multi-Agent Peer Review

The method has three stages: creation, review, and revision.
In the creation stage, each agent independently solves the same question using Chain-of-Thought reasoning.
In the review stage, each agent reviews the reasoning process of every other agent.
The review asks the agent to examine the solution step by step and provide feedback.
The reviewer also gives a confidence score from 1 to 10.
In the revision stage, each agent receives peer solutions and peer reviews.
It then revises its original answer using this external information.
The final system answer is selected by majority vote over the revised answers.
The diagram on page 3 shows the full process using a GSM8K example where agents correct each other’s mistakes.

## Stage 1: Create

Each agent receives the problem independently.
The agents generate their own reasoning chains and final answers.
This independence is important because it creates diversity among initial solutions.
Even when all initial answers are wrong, different agents may make different partial errors.
One agent may identify the correct starting value but apply the wrong operation.
Another may apply the correct operation but use the wrong starting value.
These partial differences can become useful during peer review.
The method therefore does not require every agent to be correct at the beginning.
It relies on agents producing complementary reasoning traces.

## Stage 2: Review

Each agent receives another agent’s solution and reviews it step by step.
The reviewer identifies whether the reasoning is correct or where it fails.
The reviewer also assigns a confidence score to its feedback.
This confidence score is meant to help the receiving agent weigh feedback reliability.
The paper’s example shows that an initially wrong agent can still provide useful feedback to another wrong agent.
This is important because reasoning errors may be distributed across agents.
A wrong final answer does not imply that every part of the reasoning is useless.
The review stage extracts useful partial information from different agents.
This is the main difference from majority voting, which only uses final answers.

## Stage 3: Revise

In the revision stage, each agent receives peer feedback and revises its initial solution.
The prompt asks the agent to use other agents’ solutions and feedback as additional information.
The agent can keep its original answer or change it.
The revised answers are then aggregated through majority vote.
The method does not explicitly force consensus.
This is intended to preserve balance and avoid making agents converge artificially.
The paper’s case study shows agents using peer feedback to correct mistaken arithmetic or mistaken interpretation.
The revision step is where external feedback becomes operational.
Without this step, peer review would not directly affect the final prediction.

## Benchmarks

The experiments use ten reasoning datasets.
Six datasets test mathematical reasoning: GSM8K, SVAMP, AQuA, MultiArith, AddSub, and SingleEq.
Two datasets test commonsense reasoning: ARC-Challenge and StrategyQA.
Two datasets test symbolic reasoning: Colored Objects and Penguins.
The datasets include numeric answers, multiple-choice answers, and yes/no answers.
Table 1 on page 4 summarizes the dataset sizes, domains, average word lengths, and answer formats.
This benchmark selection is useful because it tests whether peer review works beyond math.
The main model used in the experiments is GPT-3.5-turbo-0613.
Additional models are used in later collaboration analysis.

## Baselines

The paper compares peer review against both single-agent and multi-agent baselines.
Zero-shot Chain-of-Thought asks one model to reason step by step and answer.
Self-correct asks one model to review and revise its own answer.
Multi-agent Majority samples multiple reasoning chains and selects the most common answer.
Multi-agent Debate lets agents see others’ solutions and update their own solutions over multiple rounds.
These baselines are strong because they represent common ways to improve reasoning without training.
The comparison is especially important because peer review could otherwise be mistaken for simple majority voting.
The paper shows that structured feedback gives additional value beyond multiple independent answers.
This supports the claim that critique matters, not only diversity.

## Main Results: Mathematical Reasoning

Peer review achieves the best accuracy on all six mathematical reasoning datasets.
On GSM8K, it reaches 83.20%, compared with 81.80% for Multi-agent Majority and 81.60% for Multi-agent Debate.
On SVAMP, it reaches 83.60%, clearly above 79.80% for Multi-agent Majority and 78.40% for Debate.
On AQuA, it reaches 65.35%, compared with 62.60% for Debate.
The gains are especially visible on harder datasets where initial reasoning errors are common.
Self-correction performs worse than Zero-shot CoT on all math datasets in Table 2.
This supports the paper’s argument that self-review without external feedback is unreliable.
Peer review improves because agents can detect errors made by others more easily than their own.
Table 2 on page 5 is the central evidence for the method on math tasks.

## Main Results: Commonsense Reasoning

Peer review also improves performance on commonsense reasoning.
On ARC-Challenge, peer review reaches 88.40%, above Zero-shot CoT, Multi-agent Majority, and Debate.
On StrategyQA, it reaches 69.80%, slightly above Multi-agent Debate at 69.40%.
The gains are smaller than in some mathematical datasets.
This suggests that peer review is helpful but not equally powerful across all reasoning types.
Self-correction performs very poorly in these tasks, especially on ARC-Challenge.
This reinforces the limitation of internal self-revision.
The results show that peer review can generalize beyond arithmetic.
However, commonsense tasks may require different forms of confidence calibration and evidence checking.

## Main Results: Symbolic Reasoning

Peer review improves symbolic reasoning on both tested datasets.
On Colored Objects, it reaches 73.20%, above Zero-shot CoT at 66.13% and Debate at 69.60%.
On Penguins, it reaches 79.45%, above Zero-shot CoT at 70.78% and Debate at 76.71%.
This is important because symbolic reasoning often depends on exact state tracking.
Self-correction collapses strongly on Colored Objects, reaching only 28.27%.
This shows that asking a model to revise itself can severely damage performance in some symbolic tasks.
External peer feedback avoids some of this degradation.
The results in Table 4 suggest that peer critique is useful when reasoning requires checking attributes or relations.
Still, the symbolic benchmark set is small, with only two datasets.

## Ablation: Confidence in Reviews

The paper tests whether confidence scores matter.
For math datasets, removing confidence usually reduces accuracy.
For example, on GSM8K, performance drops from 83.20% to 82.60%.
On SVAMP, it drops from 83.60% to 82.60%.
The authors argue that confidence helps agents focus on more reliable feedback.
However, confidence does not consistently help in commonsense and symbolic reasoning.
On Colored Objects, the version without confidence is actually higher than the full method.
The paper explains this through overconfidence and miscalibration in LLM verbalized confidence.
Thus, confidence is useful only when it is sufficiently correlated with feedback correctness.

## Ablation: Removing Peer Solutions

The paper also tests whether agents need to see peer solutions during revision.
When peer solutions are removed, performance decreases in 9 out of 10 datasets.
This means that solutions provide useful complementary information beyond the reviews alone.
However, feedback-only peer review still outperforms Multi-agent Debate in 8 out of 10 datasets.
This is a key result because Multi-agent Debate mainly exchanges solutions.
The finding suggests that feedback is more valuable than solution sharing.
Solutions help, but critique helps more.
The best configuration uses both: peer solutions plus peer reviews with confidence.
This supports the design of the full peer-review pipeline.

## Answer-Change Analysis

The paper compares how answers change after self-correction and peer review.
In self-correction, the model often fails to change wrong answers into correct ones.
Even worse, it sometimes changes correct answers into incorrect ones.
On GSM8K, self-correction is more likely to damage a correct answer than to fix an incorrect one.
Peer review shows the opposite pattern.
The proportion of incorrect-to-correct changes is much larger than correct-to-incorrect changes.
Figure 3 on page 6 illustrates this difference for GSM8K.
The same pattern is also reported for the Penguins dataset.
This provides direct evidence that external feedback improves revision quality.

## Number of Agents and Review Rounds

The paper studies how performance changes with more agents and more review rounds.
Accuracy generally improves as the number of agents increases from 2 to 4.
Performance then declines when using 5 agents.
This suggests that more agents can help, but too many may introduce noise or context-length problems.
The best result in the reported analysis appears around 4 agents.
Increasing the number of review rounds does not produce clear improvement.
More rounds may even reduce performance because the context becomes longer and noisier.
Figure 4 on page 7 shows these trends on GSM8K and SVAMP.
The practical implication is that peer review should be limited and carefully budgeted.

## Confidence Calibration

The authors manually annotate 600 feedback examples from GSM8K and 600 from Penguins.
They compare verbalized confidence scores with actual feedback correctness.
Most confidence scores fall in the 80–100% range.
However, the actual accuracy within these confidence bins is much lower than the stated confidence.
This shows strong overconfidence and miscalibration.
The problem is worse on Penguins than on GSM8K.
Figure 5 on page 8 shows the confidence distributions and reliability diagrams.
This explains why confidence helps more in math than in non-math tasks.
The result is important because confidence scores are useful only if they are not blindly trusted.

## Collaboration Across Different LLMs

The paper studies collaboration between different LLMs on GSM8K.
It compares model pairs using capability gap and answer diversity.
More capable models tend to provide more useful feedback.
For example, Claude-instant-1.2 improves GPT-3.5-turbo-0613 more than GPT-3.5-turbo-0301 does.
However, if the capability gap is too large, the stronger model benefits little from the weaker one.
The best collaboration seems to occur when models have small capability gaps but high diversity.
Two GPT-3.5 versions mutually improve because they are similar in capability but diverse in outputs.
Two Claude models are less useful to each other because their diversity is lower.
Table 5 on page 7 summarizes these cross-model collaboration effects.

## Role Prompt Analysis

The default experiments do not use explicit role prompts.
The authors also test whether diverse role prompts improve collaboration.
Roles include AI Assistant, Math Teacher, Mathematical Scientist, Engineer, and Computer Scientist.
In the single-role condition, all agents use the same AI Assistant role.
In the diverse-role condition, agents are assigned different roles.
The diverse-role setup performs better on GSM8K and SVAMP.
This suggests that role diversity can improve multi-agent collaboration.
The result fits the paper’s broader idea that diversity matters.
However, this analysis is limited to two datasets and automatically generated roles.

## Case Study

The appendix includes a complete GSM8K peer review example.
The problem asks about selling books over three years.
One agent initially gives the correct answer, while two agents give wrong answers.
During review, agents identify mistakes in each other’s interpretation and arithmetic.
Some reviews are correct, while others are themselves flawed.
The revision stage shows how agents combine this imperfect feedback.
Eventually, the agents converge on the correct solution.
This case study illustrates the mechanism behind the aggregate gains.
It also shows that peer review can work even when feedback quality is mixed.

## Limitations

The method increases token consumption because every agent must create, review, and revise.
This makes the approach more expensive than single-agent prompting or simple majority voting.
The experiments mostly use GPT-3.5-turbo-0613, so generalization to newer or smaller models is not fully established.
Confidence scores are often overconfident and miscalibrated, especially in non-math tasks.
More review rounds do not necessarily help and may harm performance through long-context noise.
The paper does not deeply study adversarial or malicious reviewers.
It also does not provide a formal theory of when peer review should improve reasoning.
The role-prompt and cross-model analyses are informative but relatively limited.
Future work should optimize agent composition, cost, role design, and feedback reliability.

## Pros

* The creation-review-revision pipeline is specific and well motivated because it targets the known weakness of single-model self-correction.

* The experiments cover ten datasets across math, commonsense, and symbolic reasoning, showing that the gains are not limited to one benchmark.

* The ablation studies are useful because they separate the value of confidence scores, peer feedback, and peer solutions.

* The answer-change analysis gives concrete evidence that peer review fixes wrong answers more often than it damages correct ones.

* The cross-model analysis is specific and insightful: collaboration works best when models have enough diversity but not an excessive capability gap.

## Cons

* The method is token-expensive because each problem requires multiple initial solutions, pairwise reviews, and revised answers.

* Confidence scores are strongly overconfident, so their usefulness depends on the task; on non-math datasets they can fail to improve or even reduce performance.

* The main experiments rely on GPT-3.5-turbo-0613, which limits evidence about robustness across model families and newer LLMs.

* More review rounds do not improve performance, suggesting that the method is sensitive to context growth and discussion noise.

* The paper does not test adversarial reviewers, so it remains unclear whether peer review is robust when one agent gives persuasive but wrong feedback.
