## Introduction

The paper studies how LLMs can become a new strategic layer in society.
The key idea is that many agents may appear independent, but they may actually follow instructions from the same LLM.
This shared guidance can correlate their actions even without direct communication.
The authors model LLMs as strategic actors that advise populations of clients.
Clients then interact in many instances of an underlying game.
This creates a **meta-game** among the LLMs, mediated through their clients.
The main question is whether shared LLM guidance can sustain cooperation when the base game has misaligned incentives.
The paper gives both one-shot results and a repeated-game folk theorem.
The central claim is that LLM-mediated populations can cooperate even when ordinary independent agents would not.

## Motivation

The paper starts from the observation that many people and software agents now rely on a small number of LLMs for decisions.
Examples include coding assistants, autonomous software agents, decision-support systems, and human users consulting the same model.
If many clients use the same LLM, their behavior may become statistically and strategically coupled.
This changes the standard game-theoretic assumption that agents choose independently.
For example, in a Prisoner’s Dilemma, two clients advised by the same LLM may both be instructed to cooperate.
This can happen even if individual rationality would normally lead to defection.
The paper therefore studies not only client-level behavior, but LLM-level strategic behavior.
The broader motivation is that LLMs may shape aggregate outcomes in markets, organizations, and resource-allocation systems.
This makes LLMs potential coordination devices, not only individual tools.

## Model Overview

The model contains many clients, many parallel instances of a base game, and a finite set of LLMs.
The base game has several roles, action sets, and role-specific payoff functions.
Clients are assigned to roles in the base game.
Each client is governed by exactly one LLM.
For each role and each LLM, the model specifies the fraction of clients in that role governed by that LLM.
These client shares are common knowledge.
In each game instance, the LLMs governing the participating clients are randomly determined by the population shares.
Clients know their own role and their own governing LLM.
They do not observe which LLM advises the other participants.

## Meta-Actions

An LLM does not directly play a single action in one game.
Instead, it issues instructions to the population of clients it governs.
The collection of instructions issued by an LLM is called a **meta-action**.
A meta-action specifies, for each role, a distribution over strategies recommended to that LLM’s clients.
Because clients are randomly matched into game instances, only the distribution of instructions matters.
The exact identity of each client is not strategically important in the reduced-form model.
This transforms the original client-level interaction into an LLM-level meta-game.
The utility of each LLM is the aggregate expected utility of the clients it governs.
Thus, LLMs are strategic actors whose payoffs depend on how their instructions perform across many clients.

## LLM Utilities

Each LLM’s payoff is the sum of the expected payoffs earned by its governed clients.
The payoff depends on the base game, the client shares, and the meta-actions of all LLMs.
If an LLM governs many clients in several roles, it may partly internalize interactions among those roles.
This is important because it can make cooperation rational at the LLM level.
For example, an LLM advising both sides of a Prisoner’s Dilemma may prefer mutual cooperation.
By contrast, an LLM that mostly advises only one role may behave like a standard player in the base game.
The reduced-form utility expression aggregates over all possible combinations of governing LLMs in each game instance.
This formalization allows the authors to compare one-shot and repeated equilibria.
It also clarifies when LLM guidance changes strategic incentives.

## One-Shot Meta-Games

The paper first studies one-shot interactions among LLMs.
A key result is that the meta-action space can be simplified.
For every equilibrium payoff, there exists an equivalent equilibrium where each LLM uses role-homogeneous meta-actions.
This means the LLM can be viewed as drawing a deterministic action profile and giving consistent role-level instructions.
The result simplifies the analysis without changing equilibrium payoffs.
The one-shot analysis then asks when the LLM meta-game differs from the original base game.
The answer depends on whether an LLM can influence more than one role in the same interaction.
If it cannot, the meta-game collapses back to the base game.
If it can, new equilibria can appear.

## Single-Role Governance

The paper defines an LLM as **single-role** if it governs clients in at most one role.
If every LLM is single-role, the meta-game does not create new strategic possibilities.
The aggregate outcomes of one-shot meta-game Nash equilibria are exactly the mixed Nash equilibria of the base game.
This means shared LLM guidance matters only when one LLM can coordinate across multiple roles.
The intuition is simple: if each LLM controls only one role, it cannot internalize cross-role externalities.
It behaves like a standard role-specific player.
Thus, the strategic novelty comes from multi-role governance.
This is an important boundary result.
It shows that not every use of LLM advice changes game-theoretic structure.

## Prisoner’s Dilemma Example

The paper applies the one-shot model to a Prisoner’s Dilemma.
There are two LLMs, and one LLM governs a large share of clients in both roles.
The large LLM often effectively plays against itself.
Because of this, it may instruct its clients to cooperate.
The small LLM mostly interacts with clients governed by the large LLM.
It therefore defects and exploits the cooperative mass.
In the example, the large LLM obtains lower average utility than the small LLM.
The paper proves a general pattern: for sufficiently large client share, the large LLM does worse in any equilibrium.
This shows that having more clients can be strategically harmful in some games.

## Coordination Game Example

The paper then studies a three-role majority coordination game.
Each role chooses either 0 or 1.
A prize is divided among the roles that choose the majority action.
In this case, a large LLM can benefit from governing many clients across several roles.
Its clients are more likely to form the majority.
The paper shows that, in this game, larger market share is advantageous.
This contrasts directly with the Prisoner’s Dilemma example.
The same multi-role governance structure can be harmful in one game and beneficial in another.
The effect of client share therefore depends on the strategic structure of the base game.

## Bounded Coordination Example

The third one-shot example shows that market share effects can be non-monotone.
The game has ten symmetric roles and actions from 1 to 100.
A prize is awarded to roles whose action is chosen by exactly four roles.
There are three LLMs: large, medium, and small.
The large LLM governs five roles, the medium governs four roles, and the small governs one role.
The medium LLM obtains the highest average utility.
It is exactly large enough to create a winning group of four.
The large LLM has an extra role that dilutes its average payoff.
The small LLM is too small to form a winning group.
This example shows that intermediate scale can be optimal.

## Lessons from the One-Shot Setting

The one-shot results show that LLM guidance can reshape equilibrium behavior.
However, this happens only when an LLM can influence multiple roles in the same interaction.
The effect of client share has no universal direction.
A larger LLM can be worse off in a Prisoner’s Dilemma.
A larger LLM can be better off in a majority coordination game.
A medium-sized LLM can be best in a bounded coordination game.
Thus, shared LLM guidance does not automatically imply cooperation or dominance.
The outcome depends on the base game and the distribution of clients across LLMs.
This sets up the repeated-game analysis, where long-run incentives become more powerful.

## Repeated Setting

The repeated setting considers the same meta-game played over time.
LLMs receive discounted utility from all future periods.
After each period, each LLM observes the actions played in the games involving its own clients.
However, it does not observe which LLM governed the other clients in those games.
This creates imperfect and indirect monitoring.
An LLM can see that something happened in its clients’ interactions.
But it may not be able to identify which LLM caused the observed behavior.
This informational structure is central to the paper.
It prevents the direct use of the standard repeated-game folk theorem.

## Feasibility and Individual Rationality

The repeated-game theorem uses two standard concepts.
A payoff vector is **feasible** if it lies in the convex hull of payoff vectors generated by meta-action profiles.
This means the payoff can be achieved through some combination or cycle of meta-actions.
Each LLM also has a **minmax payoff**.
This is the minimum payoff it can guarantee itself when the other LLMs act against it.
A feasible payoff vector is individually rational if every LLM receives at least its minmax payoff.
It is strictly individually rational if every LLM receives strictly more than its minmax payoff.
These are the standard ingredients of a folk theorem.
The novelty is proving the result under LLM-mediated indirect observation.

## Folk Theorem for LLMs

The main theorem states that any feasible and strictly individually rational payoff vector can be approximately sustained.
For any desired precision, there is a repeated-game strategy profile that forms an ε-equilibrium.
If the discount factor is sufficiently high, each LLM’s payoff can be made arbitrarily close to the target vector.
This means that a very wide class of outcomes can be sustained through long-run incentives.
In particular, cooperative outcomes can be sustained even when the base game has misaligned incentives.
The theorem applies despite indirect monitoring.
It does not follow directly from the standard folk theorem.
The proof requires special strategies for detecting and punishing deviations without directly observing the deviator.
This is the paper’s main theoretical contribution.

## Why the Standard Folk Theorem Does Not Apply

In ordinary repeated games, players usually observe enough to identify who deviated.
Here, the strategic actors are the LLMs, but observations arrive through clients.
Clients do not know which LLM advised their opponents.
Therefore, an LLM may observe that the aggregate action frequencies changed, but not who caused the change.
A deviation can be detectable without being attributable.
This breaks the usual punishment logic.
The paper’s proof solves this attribution problem.
It constructs a review and testing process that eventually identifies or clears LLMs.
This makes long-run punishment possible even under indirect observation.

## Heist Example

The paper uses a stylized heist example to illustrate the attribution problem.
There are three roles: planner, burglar, and driver.
Each role names another role as responsible for the crime.
If every role is named exactly once, evidence is inconclusive and everyone gets payoff 0.
If two roles accuse the same role, that role is punished and the others receive a benefit.
Three LLMs mostly govern one role each, but also govern small shares of the other roles.
A blame cycle can produce payoff 0 for all LLMs.
This payoff is feasible and individually rational, but not a one-shot equilibrium.
In the repeated setting, the folk theorem implies that it can be sustained.
The challenge is that deviations in blame frequencies do not immediately reveal which LLM deviated.

## Proof Idea: Implementation Cycle

The proof begins by approximating the target payoff with a finite cycle of meta-action profiles.
This is called the implementation cycle.
If all LLMs follow the cycle repeatedly, the average payoff is close to the target vector.
The main problem is making this cycle incentive-compatible.
The repeated strategy is organized into phases.
Each phase reviews one LLM.
During normal play, all LLMs follow the implementation cycle.
During review, the LLM under review sometimes performs prescribed test moves.
These tests are designed to create observable changes in action frequencies.

## Proof Idea: Test Moves and Clearing

In the review phase for LLM (j), that LLM privately randomizes test moves.
The other LLMs do not know exactly when a test is supposed to occur.
The population shares determine the maximum observable effect that LLM (j) can produce alone.
If the observed action-frequency change exceeds what (j)’s test could explain, then (j) is cleared.
This means the deviation must have involved another LLM.
The review process then moves to the next LLM.
This mechanism prevents non-reviewed deviators from gaining too much.
If they deviate often enough to matter, they are likely to overlap with a test period.
That overlap creates an excess deviation and clears the reviewed LLM.

## Proof Idea: Punishment

If the true deviator is the LLM currently under review, the strategy uses frequency checks.
The number of apparent deviations in a review block should concentrate around the expected number of tests.
If the count falls outside a tolerance band, the reviewed LLM is blamed.
The other LLMs then switch to a punishment phase.
During punishment, they play meta-actions that approximately minmax the deviating LLM.
If deviations remain inside the tolerance band, the reviewed LLM can only gain a limited amount.
The proof chooses parameters so that this gain is smaller than the error tolerance.
This completes the approximate equilibrium construction.
The result works because patient LLMs value future cooperation more than short-run deviation gains.

## Extensions

The theorem is stated in a continuum-population model.
The authors explain that the construction can extend to sufficiently large finite populations.
This matters because real deployments contain large but finite numbers of clients.
The theorem also extends when client shares are not known exactly.
It is enough that the shares are drawn from commonly known distributions.
The result can also handle shares that vary over time.
The requirement is that the relevant distributions are commonly known in each period.
These extensions make the model more flexible.
However, they remain theoretical rather than empirical.

## Related Work

The paper connects to cooperative AI, game theory, LLM agents, and strategic mediation.
It differs from work on “cooperation between copies” because it treats one LLM as a strategic entity guiding many clients.
It also differs from experimental studies of LLM agents in games.
Here, the strategic players are not individual LLM agents directly playing the base game.
Instead, LLMs interact indirectly through the populations they advise.
The paper also relates to repeated games with imperfect monitoring and anonymous random matching.
However, the monitoring problem is different because clients, not LLMs, are directly matched.
The work also connects to mediation, program equilibrium, delegation, and recommendation systems.
Its distinct contribution is modeling strategic LLMs as population-level instruction providers.

## Limitations

The paper is theoretical and forward-looking.
It is not an empirical claim about current LLM deployments.
The model assumes that LLMs can be treated as rational strategic actors.
It also assumes random matching across many instances of the base game.
The base game is fixed and identical across instances.
The model assumes known client shares or known distributions over client shares.
Most importantly, clients are assumed to follow LLM instructions faithfully.
This is realistic for some software agents but stronger for human users.
The model abstracts away prompt variation, partial compliance, switching between providers, and institutional constraints.

## Impact and Risks

The paper argues that LLMs can act as powerful coordination devices.
This can be beneficial when LLMs guide populations toward efficient or cooperative outcomes.
For example, shared LLM guidance could reduce overuse of shared resources or improve coordination in distributed systems.
However, the same mechanism could also sustain harmful coordination.
Possible examples include tacit price collusion, coordinated bidding, and market division.
The paper therefore warns that LLMs should not be studied only as individual decision-support tools.
They should also be studied as systems that shape population-level behavior.
This creates new questions for regulation, mechanism design, and market governance.
The broader message is that generative AI introduces a new strategic layer into social and economic interaction.

## Future Research

The authors identify several directions for future work.
One direction is endogenous LLM shares.
In reality, users may switch providers or consult multiple models.
This means LLM objectives may depend on user retention as well as client payoffs.
Another direction is stochastic and evolving environments.
Real AI-guided populations do not repeatedly face the exact same game forever.
A third direction is harmful coordination.
The same folk-theorem logic that sustains cooperation may also sustain collusion or other undesirable equilibria.
The authors suggest revisiting many classical models under AI-mediated behavior.

## Overall Interpretation

The paper gives a formal theory of LLMs as strategic population-level coordinators.
Its main insight is that shared reliance on LLMs can change the strategic structure faced by clients.
In one-shot settings, this matters only when an LLM can influence multiple roles in the same interaction.
In repeated settings, the result is much stronger: many cooperative outcomes can be sustained through long-run incentives.
The key technical challenge is indirect observation and weak attribution.
The paper solves this through review phases, randomized test moves, clearing rules, and punishment phases.
The result is important because it shows how cooperation can emerge without direct communication among clients.
It is also important because the same logic can support harmful coordination.
The paper is best read as a theoretical warning and foundation for studying AI-guided strategic populations.

## Pros

* The paper introduces a clear formal model for a new phenomenon: strategic interaction among LLMs mediated through large populations of clients.

* The single-role governance result is useful because it precisely identifies when LLM guidance does **not** change one-shot equilibrium structure.

* The three one-shot examples are specific and informative: large share hurts in Prisoner’s Dilemma, helps in majority coordination, and can be dominated by medium share in bounded coordination.

* The folk theorem is technically important because it sustains cooperation despite indirect monitoring and clients not knowing opponents’ governing LLMs.

* The paper highlights a concrete dual-use implication: LLM-mediated coordination can support beneficial cooperation but also harmful collusion-like outcomes.

## Cons

* The model assumes LLMs are rational strategic actors, which is a useful abstraction but not yet empirically validated for current deployed models.

* The assumption that clients faithfully follow LLM instructions is strong, especially for human users who may ignore, reinterpret, or strategically use advice.

* The repeated-game proof is elegant but highly abstract, so practical mechanisms for detecting and punishing deviations in real LLM ecosystems remain unclear.

* The model uses fixed base games and random matching, while real AI-guided environments often involve changing tasks, networks, institutions, and information flows.

* The paper does not provide simulations or empirical tests, so its claims are theoretical possibilities rather than measured behavior in actual LLM-mediated populations.

