## Introduction

The paper studies how self-interested LLM agents can cooperate in open-ended multi-agent environments.
The central problem is that agents may have heterogeneous goals and may prefer local rewards over collective success.
Existing multi-agent LLM systems often work well only when roles, workflows, or cooperation rules are predefined.
In less structured settings, agents can fall into social dilemmas and fail to coordinate.
The authors argue that the key challenge is credit assignment: each agent must receive a fair reward for its real contribution.
They propose Shapley-Coop, a workflow based on pricing, negotiation, and Shapley-value reasoning.
The goal is to let agents cooperate while preserving autonomy and self-interest.
The framework is tested in an Escape Room game, a Raid Battle game, and a ChatDEV software-development simulation.
The main finding is that Shapley-Coop improves cooperation and gives more equitable reward allocation.

## Cooperation among Self-Interested LLM Agents

The paper formalizes a system with multiple LLM agents, each maximizing its own local reward.
The collective system has a global reward, but individual goals may not align with this global reward.
This creates social dilemmas, where selfish behavior leads to poor collective outcomes.
The Escape Room example illustrates this problem clearly.
One agent must pull a lever and lose 1 point, while another agent can open the door and gain 10 points.
Without reward transfer, the lever-pulling agent has no incentive to help.
A pricing mechanism can solve this by compensating the helping agent.
This transforms cooperation from a moral request into a rational exchange.
The paper frames cooperation as an incentive-alignment problem rather than only a communication problem.

## Shapley Value for Credit Assignment

The paper uses the Shapley value from cooperative game theory to estimate fair contribution.
The Shapley value measures how much value an agent adds across all possible coalitions.
This is useful when an agent’s value depends on interaction with others.
In the Escape Room, both agents are necessary for success, even though only one directly receives the reward.
The Shapley calculation assigns both agents an equal value of 4.5.
This means that the agent receiving the +10 payoff should transfer 5.5 to the agent who paid the −1 cost.
After redistribution, both agents receive 4.5.
This creates a fair allocation and makes cooperation individually rational.
The paper uses this logic as the foundation for pricing and reward redistribution.

## Shapley-Coop Workflow

Shapley-Coop is a cooperative workflow for self-interested LLM agents.
It has three main components: structured negotiation, short-term Shapley Chain-of-Thought, and long-term Shapley Chain-of-Thought.
The structured negotiation protocol lets agents propose actions, transfers, acceptances, rejections, and counteroffers.
The short-term Shapley CoT helps agents reason during the task about whether compensation is needed.
The long-term Shapley CoT helps agents assign rewards after the task is completed.
The workflow creates a closed loop between planning, negotiation, execution, and redistribution.
Its purpose is to align incentives before action and assign credit after action.
The framework is designed to support spontaneous cooperation without forcing agents into fixed roles.
It treats cooperation as a negotiated economic process.

## Structured Negotiation Protocol

The negotiation protocol standardizes agent communication.
Agents use structured tags to make proposals machine-readable and easier to parse.
They can explicitly state planned actions, such as proposing to open a door or pull a lever.
They can also propose reward transfers and explain the reasoning behind them.
Other agents can agree, disagree, or counter-propose.
This protocol reduces ambiguity and supports transparent bargaining.
It also allows agents to coordinate before acting, rather than only reacting after the outcome.
The protocol is important because ordinary free-form negotiation may fail to produce fair agreements.
In Shapley-Coop, negotiation is tied to contribution reasoning rather than generic persuasion.

## Short-Term Shapley Chain-of-Thought

Short-term Shapley CoT is used during task execution.
Its goal is not to compute exact Shapley values immediately, because future outcomes may still be uncertain.
Instead, agents qualitatively estimate whether their action creates positive or negative externalities.
A positive externality means the action benefits other agents.
A negative externality means the action harms or imposes costs on other agents.
If an agent creates a positive externality, it may ask for compensation.
If it creates a negative externality, it may offer compensation to affected agents.
This helps agents decide whether pricing is necessary before the task is complete.
The mechanism supports real-time incentive alignment.

## Long-Term Shapley Chain-of-Thought

Long-term Shapley CoT is used after the task is completed.
At this stage, the agents can observe the trajectory and total collective reward.
They estimate each agent’s marginal contribution to the final outcome.
They then use Shapley-style reasoning to approximate a fair reward share.
Agents negotiate final transfers based on these estimated contributions.
This mechanism addresses the problem of post-task credit assignment.
It helps distinguish agents who truly contributed from agents who only gained local reward.
It also supports long-term trust because agents can expect fair compensation for useful actions.
The paper treats this as essential for sustained cooperation among self-interested agents.

## Experimental Setup

The authors evaluate four configurations.
LLM-only has no negotiation or cooperation mechanism.
LLM+NEG adds standard negotiation but no Shapley reasoning.
LLM+STS adds short-term Shapley reasoning only.
LLM+SC uses the full Shapley-Coop workflow.
The experiments are conducted in three environments: Escape Room, Raid Battle, and ChatDEV.
The Escape Room tests a simple two-agent social dilemma.
Raid Battle tests multi-agent, multi-turn cooperation with conflicting local rewards.
ChatDEV tests credit assignment in a realistic software-development workflow.
These settings increase in complexity from simple game to practical collaborative task.

## Escape Room Experiment

The Escape Room experiment uses DeepSeek-v3 as the base LLM.
The LLM-only setup fails because agents do not have incentives to help each other.
The LLM+NEG setup sometimes achieves cooperation but does not reliably solve reward conflict.
The LLM+STS setup avoids some social dilemmas but can produce unfair payoff allocation.
The first agent to reach agreement may gain too much.
The full LLM+SC setup achieves 100% success and payoff allocation close to the optimal 4.5 for each agent.
This shows that negotiation alone is not enough.
Agents need principled contribution reasoning to produce both cooperation and fairness.
The experiment demonstrates the basic mechanism of Shapley-Coop in the simplest setting.

## Raid Battle Experiment

Raid Battle is a cooperative role-playing game with four hero agents fighting a boss.
Each hero can use Taunt, Fireball, or Heal.
Fireball gives higher immediate local reward because it directly damages the boss.
Taunt and Heal are less rewarded locally but are essential for team survival.
This creates a social dilemma because self-interested agents prefer damage-dealing over support.
The boss has increasing difficulty levels with 2000, 2500, or 3000 HP.
The team must defeat the boss within 10 turns.
The global reward depends on both survival and efficiency.
This environment tests whether Shapley-Coop can support role specialization and long-term coordination.

## Raid Battle Results

LLM+SC performs better than ordinary negotiation in contribution scores and team coordination.
LLM+NEG agents focus too much on damage-dealing and neglect Taunt.
This increases damage taken and creates more pressure on healing.
LLM+SC produces a more balanced distribution of damage, healing, and taunting.
Agents share support responsibilities more effectively.
This improves team sustainability and collective performance.
The framework also improves reward allocation accuracy compared with short-term Shapley reasoning alone.
LLM+STS underestimates some support roles, especially taunting and healing.
LLM+SC better recognizes that support actions have high marginal value even when they give low local reward.

## ChatDEV Experiment

The paper also evaluates Shapley-Coop in ChatDEV, a virtual software company environment.
ChatDEV includes roles such as CEO, CTO, Programmer, Reviewer, Counselor, and CPO.
Agents collaborate through design, coding, testing, and documentation phases.
The authors use two software tasks: a BMI Calculator and ArtCanvas.
The BMI Calculator computes body mass index from user input.
ArtCanvas is a virtual painting studio with canvas, brushes, and color palettes.
The experiment tests whether Shapley-Coop can allocate credit in realistic multi-role work.
This is harder than the games because contributions differ in type and visibility.
Leadership, coding, documentation, and debugging all contribute differently.

## ChatDEV Credit Assignment

The authors use Weighted Earned Value to estimate role contributions.
This metric combines four artifact types: code, approved decisions, documents, and verified bug fixes.
Each artifact type receives a weight inspired by software engineering benchmarks.
The resulting contribution ranges are compared with allocated rewards.
For most roles, the gap between data-driven contribution and assigned reward is below 6%.
Programmer and Reviewer roles show near-perfect alignment.
Leadership roles show small discrepancies because management contributions are harder to quantify.
The results suggest that Shapley-Coop can approximate fair credit allocation in practical collaborative workflows.
The framework is especially useful when contributions are heterogeneous and not equally visible.

## Related Work

The paper relates to research on LLMs in multi-agent games and strategic decision-making.
Prior work shows that LLMs often perform well in competitive settings but struggle in cooperative social dilemmas.
It also connects to workflow-enhanced LLM agent systems.
Structured workflows help reduce stochastic errors, improve planning, and make multi-agent coordination more reliable.
The paper differs from role-based or rule-based approaches because it focuses on self-interested agents.
It does not assume that agents already share the same goal.
Instead, it uses pricing and reward redistribution to align incentives.
The paper also connects to cooperative game theory and economic mechanisms for managing externalities.
Its main contribution is combining these ideas into an LLM-agent workflow.

## Conclusion

The paper introduces Shapley-Coop as a workflow for coordinating self-interested LLM agents.
The framework combines structured negotiation with short-term and long-term Shapley reasoning.
Short-term reasoning helps agents decide whether compensation is needed before acting.
Long-term reasoning helps agents redistribute rewards after observing the outcome.
Across Escape Room, Raid Battle, and ChatDEV, the framework improves cooperation and credit assignment.
The results show that fair pricing mechanisms can make cooperation rational for autonomous agents.
The paper also shows that support roles can be undervalued without proper contribution accounting.
A stated limitation is that pricing is not yet dynamically adjusted during collaboration.
Future work should develop adaptive real-time incentive mechanisms for evolving multi-agent tasks.

## Pros

* The paper gives a clear incentive-based solution to cooperation problems among self-interested LLM agents.

* The use of Shapley value is theoretically well motivated because it directly addresses marginal contribution and fair credit assignment.

* The framework combines pre-task negotiation and post-task redistribution, which makes it more complete than simple bargaining.

* The experiments cover increasing complexity, from a simple social dilemma to a multi-step game and a software engineering workflow.

* The Raid Battle results are especially useful because they show how Shapley-Coop values support roles such as healing and taunting.

## Cons

* The Shapley calculations are simplified and heuristic, especially in complex trajectories where exact marginal contribution is hard to estimate.

* The experiments rely heavily on structured prompts and protocols, so robustness to prompt variation remains uncertain.

* The Escape Room experiment uses only one base model, which limits evidence about generalization across LLMs.

* Dynamic pricing during collaboration is not fully solved, so the framework may struggle in rapidly changing environments.

* The ChatDEV validation uses proxy contribution metrics, which may not capture all qualitative aspects of software teamwork.
