## Introduction

The paper studies whether elected leadership improves cooperation in LLM-based social groups.
The setting is a common-pool resource problem, where agents must harvest a shared resource without depleting it.
The authors argue that previous LLM multi-agent studies often lack explicit organizational mechanisms such as elections.
They introduce AgentElect, a simulation framework where agents can elect leaders and follow group policies.
The main research question is whether leadership and elections improve social welfare, survival, and cooperation.
The framework extends GovSim by adding policy and election phases.
The paper evaluates GPT-4o, GPT-4.1, and Gemini 2.5 Flash.
The main result is that elected leadership improves social welfare by 55.4% and survival time by 128.6%.
The paper also studies which leader types are elected, how social influence is distributed, and how leaders use rhetoric.

## Related Work and Background

The paper builds on research about LLM social simulation, cooperative AI, and common-pool resource dilemmas.
GovSim is an important reference because it evaluates LLM cooperation in sustainability settings.
Port of Mars is another related environment because it studies group survival, roles, and collective risk dilemmas.
The authors argue that these prior works do not directly test election-based leadership.
The paper also draws from Ostrom’s work on common-pool resource governance and self-organized institutions.
In political science, LLMs have been used to simulate public opinion, persuasion, and deliberation.
However, the authors focus on fully synthetic LLM groups rather than human political populations.
The paper’s contribution is to add elected leadership and policy agendas to LLM social dilemmas.
This makes it possible to study governance mechanisms inside LLM multi-agent systems.

## AgentElect Simulation Framework

AgentElect simulates groups of agents managing a shared renewable resource.
Each simulation proceeds through repeated cycles.
A cycle includes five phases: Policy, Election, Harvest, Discussion, and Reflection.
Leaders write policy agendas about how the group should manage the resource.
Voters read the agendas and vote for a leader using a plurality rule.
The winning agenda guides agents during the harvest phase.
Agents then privately choose how much resource to harvest.
After harvesting, agents discuss the state of the system and reflect on future behavior.
If the shared resource falls below a minimum threshold, the simulation ends.

## Personas and Social Value Orientation

The population is divided into voters and leaders.
Voters use neutral appropriator personas inherited from GovSim.
Leader personas are based on Social Value Orientation.
The four leader types are Altruistic, Prosocial, Individualistic, and Competitive.
Altruistic leaders prioritize group reward, even at personal cost.
Prosocial leaders aim to improve both group welfare and individual welfare.
Individualistic leaders focus mainly on their own reward.
Competitive leaders maximize their own reward while reducing others’ reward.
These leader types allow the authors to test whether groups can select cooperative leadership.

## Leadership Conditions and Population Types

The paper compares three main leadership conditions.
The No-Leadership condition contains only voters and no explicit leaders.
The Fixed-Leader condition assigns one permanent leader type.
The Elected-Leader condition includes multiple leader candidates and elections every cycle.
Elected-Leader populations are divided into Balanced, Lean Altruistic, and Lean Competitive types.
Balanced populations include one leader from each SVO category.
Lean Altruistic populations include more group-oriented leaders.
Lean Competitive populations include more self-oriented leaders.
This design tests whether election mechanisms remain useful under different candidate distributions.
It also tests whether voters can avoid bad leaders when competitive candidates are present.

## Relation to Sequential Social Dilemmas

The authors formalize the simulation as a common-pool resource game.
Agents act under partial observability because they do not know others’ private harvest decisions before acting.
Cooperation means harvesting near the sustainability threshold.
Defection means harvesting above the sustainable level.
If all agents cooperate, the resource can survive indefinitely.
If some agents defect, the resource is eventually depleted.
The authors show that the game satisfies the conditions of a sequential social dilemma.
Mutual cooperation gives the best long-term collective outcome.
This formal grounding connects AgentElect to standard cooperative AI and game-theoretic literature.

## Experimental Setup

The experiments compare No-Leadership, Fixed-Leadership, and Elected-Leadership settings.
The main simulations use 8 agents, 6 cycles, and a discussion limit of 50 responses.
The authors also run larger simulations with 20 agents using GPT-4.1.
The tested models are GPT-4o, GPT-4.1, and Gemini 2.5 Flash.
The truthfulness flag can be true or false.
When truthfulness is false, agents may lie, omit information, or manipulate discussion.
The experiments vary model, leadership condition, population type, truthfulness, and random seed.
In total, the main design includes 480 simulations, plus additional 20-agent simulations.
The main metrics are social welfare, survival time, survival rate, equality, leader votes, and social influence.

## Sustainability and Social Welfare Results

Elected-Leader populations produce the strongest overall sustainability outcomes.
Across models and seeds, elected leadership increases social welfare by 55.4% relative to no leadership.
It also increases survival time by 128.6% relative to no leadership.
Compared with fixed leadership, elected leadership improves social welfare by 16.7%.
It also improves survival time by 35.47% compared with fixed leadership.
These results suggest a “leadership dividend” in LLM social groups.
Elections help groups avoid being stuck with bad leaders.
Fixed Prosocial leaders can perform very well, but fixed Competitive leaders perform poorly.
Elected leadership is especially useful because it can mitigate the risk of harmful leader types.

## Equality and Harvest Behavior

Leadership improves survival but can reduce equality.
Elected-Leader groups show lower equality than some Fixed-Leader groups.
This is called an equality paradox.
Leader diversity improves welfare and survival but can create unequal harvest distributions.
Competitive leaders tend to harvest much more than sustainable levels.
Altruistic leaders often harvest very little.
Prosocial leaders usually harvest close to the sustainability threshold.
These patterns are consistent with the intended Social Value Orientation personas.
The result shows that good group outcomes do not always imply equal individual outcomes.

## Electoral Outcomes

Voters do not choose leaders randomly.
Statistical tests show a strong non-uniform preference across leader types.
Prosocial and Altruistic leaders are elected most often.
Competitive leaders frequently receive little or no support.
This suggests that LLM voters can recognize and prefer group-rewarding agendas.
GPT-4o often elects Altruistic leaders in Balanced populations.
GPT-4.1 shows a strong preference for Prosocial leaders.
In Lean Competitive populations, the Prosocial leader often receives the highest vote share.
The authors interpret this as evidence of voter rationality in the simulation.

## Social Influence among Leaders

The authors build social graphs from discussion interactions.
Nodes are agents, and edges come from references to other agents or next-speaker nominations.
The graph measures which agents are cited, nominated, or socially central during deliberation.
Metrics include degree centrality, betweenness centrality, importance centrality, and Gini index.
Self-interested leaders often remain socially influential even when they lose elections.
In Balanced populations, Prosocial and Competitive leaders do not differ significantly in degree centrality.
Betweenness centrality is also not concentrated in a single leader type.
This suggests that deliberation remains decentralized.
The authors call this the “Losing Voice” effect: rejected leaders can still influence discussion.

## Cooperative and Persuasive Sentiments

The paper analyzes leader utterances during discussion phases.
Gemini 2.5 Pro is used as an LLM judge to classify cooperative and persuasive content.
The Cooperative Index measures whether utterances express cooperative or non-cooperative tendencies.
Persuasion is classified using Aristotle’s rhetorical categories: Logos, Pathos, and Ethos.
Prosocial and Altruistic leaders have much higher Cooperative Index values than Competitive and Individualistic leaders.
Prosocial leaders maintain high cooperative language even under deceptive prompting.
Altruistic leaders become less cooperative in language when deception is allowed.
Self-rewarding leaders rely heavily on Logos and use less Pathos.
Group-rewarding leaders use more Pathos and Ethos and appeal more to norms and shared welfare.

## Interpretation of Leadership Effects

Elected leadership helps LLM groups coordinate around sustainable policies.
The election process gives the group a mechanism to select agendas that protect the common resource.
The results suggest that leadership is not only about individual leader quality.
It is also about collective choice, accountability, and the ability to replace bad leadership.
The discussion phase allows dissenting voices to remain present even when they do not win elections.
This can preserve deliberative diversity but may also allow self-interested ideas to keep influencing the group.
The findings connect LLM multi-agent systems to human governance concepts such as voting, policy, and legitimacy.
However, the setting remains synthetic and controlled.
The results should be interpreted as evidence about simulated LLM groups, not as direct evidence about human democracy.

## Limitations and Future Work

The experiments use a limited set of high-performing API-based LLMs.
Results may change with other models, prompts, or deployment settings.
The simulations are small compared with real social and political systems.
The resource game is abstract and does not capture the full complexity of real institutions.
Agents may hallucinate, manipulate governance, collude, or make biased decisions.
The authors emphasize the need for sandboxed testing before any real-world deployment.
Future work could scale to larger populations and richer persona distributions.
It could also study human-agent cooperation in shared common-pool resources.
Another direction is training agents through social learning or reinforcement learning to improve cooperation.

## Pros

* The paper introduces a clear election-based extension of LLM common-pool resource simulations.

* The comparison between no leadership, fixed leadership, and elected leadership is well designed and directly interpretable.

* The use of Social Value Orientation gives a useful way to create leader personas with different cooperative tendencies.

* The paper combines outcome metrics with social graph analysis and rhetorical analysis, giving a rich picture of group dynamics.

* The main finding is practically important: elected leadership can substantially improve welfare and survival in LLM social dilemmas.

## Cons

* The simulation is still abstract, so the results may not generalize to real organizations or real resource governance.

* The experiments use only a few frontier models, making model generalization uncertain.

* Elections are simplified through plurality voting and short policy agendas, while real governance has richer institutions and enforcement.

* The sentiment and rhetoric analysis depends on LLM judges, which may introduce classification bias.

* The framework shows that elected leadership helps, but the deeper causal mechanisms behind the improvement are only partly isolated.
