## Introduction

The paper studies collective behavior on Moltbook, a Reddit-style platform populated by AI agents.
Moltbook allows AI agents to create posts, comment, vote, subscribe to communities, and accumulate karma.
The authors analyze whether large populations of AI agents show statistical patterns similar to human online communities.
The dataset includes over 369,000 posts, 3.0 million comments, and about 46,000 active agents.
The main question is whether AI-agent societies generate emergent collective dynamics comparable to human social systems.
The paper focuses on activity distributions, popularity scaling, discussion structures, and temporal attention dynamics.
The key finding is that AI agents reproduce many regularities of human social media, such as heavy-tailed activity and power-law decay.
However, they also show differences, especially in how upvotes scale with discussion size.
The study treats Moltbook as a naturalistic laboratory for AI collective behavior.

## The Growth of Moltbook

The analysis covers the early growth phase of Moltbook from January 27 to February 8, 2026.
During this 12-day period, the authors collected 369,209 posts and 3,026,275 comments.
The active population includes 46,690 agents across 17,184 submolts.
Platform activity grows exponentially during the first five days.
After that, daily activity stabilizes around 40,000 new posts and several hundred thousand comments per day.
The API limited complete comment retrieval to the first 100 comments for large posts.
The stored comments represent about 24% of total comment activity reported by the API.
A discontinuity on February 1 is explained by a platform outage that disabled commenting but not posting.
Only about 3.1% of the 1.5 million registered agents were active in the dataset.

## Heavy-Tailed Distributions

The paper tests whether Moltbook activity follows heavy-tailed patterns like human social media.
The number of comments per post follows a power-law tail with exponent α = 1.72.
This value is close to estimates reported for human Reddit activity.
The result means that most posts receive little attention, while a few posts become highly viral.
The number of posts per submolt also follows a power law, with α = 1.68.
This shows strong inequality in community activity: a few submolts dominate posting.
Subscriber counts per submolt follow a heavy-tailed distribution with α = 2.00.
Featured submolts appear as outliers because they are more visible to new agents.
These patterns suggest that AI agents create heterogeneous activity structures similar to human platforms.

## Post Popularity

The authors analyze how popularity scales with discussion size.
Popularity is measured through upvotes and direct replies.
Average upvotes grow sublinearly with total comments, with exponent β ≈ 0.78.
This differs from human Reddit, where upvotes usually scale more linearly with comments.
The result suggests that AI agents may comment without proportionally increasing passive approval.
Direct replies grow approximately linearly with discussion size.
This indicates that the ratio between top-level replies and nested replies stays relatively stable.
The direct-reply pattern is similar to what is observed in human Reddit discussions.
Thus, AI agents differ from humans in voting behavior but resemble humans in conversational branching.

## Structure of Discussions

The paper studies discussion trees formed by posts, comments, and nested replies.
Each discussion tree is characterized by depth and width.
Depth is the longest path from the original post to a leaf comment.
Width is the maximum number of comments at a single depth level.
Normalized depth and width show a strong negative correlation.
This means that discussions tend to be either deep and narrow or shallow and wide.
The relation is close to the scaling expected from a critical branching process.
About 69.5% of posts have maximum depth equal to 1.
This means most discussions are flat, with comments replying directly to the original post rather than to each other.

## Temporal Dynamics

The authors analyze how attention decays after a post is created.
They compute a decay factor based on the fractional growth of cumulative comments over time.
The decay factor follows a power law close to γ(t) ∝ t⁻¹.
This means that older posts receive new comments at a rate inversely proportional to their age.
A post that is 10 hours old receives comments at about one tenth the rate of a 1-hour-old post.
This pattern is similar to temporal decay observed in human social media.
The activity duration of posts also follows a heavy-tailed distribution.
Most posts stop receiving attention within hours, but a few remain active for days.
This suggests that Moltbook has human-like collective attention and novelty decay dynamics.

## Discussion

The paper argues that AI-agent populations can produce complex collective behavior.
Many observed patterns are hallmarks of complex systems, such as heavy tails, power laws, and self-similar dynamics.
These patterns emerge even though individual agents are not humans.
The authors connect the findings to previous controlled studies of AI conformity, majority-following, and scale-free network formation.
Moltbook is important because it is not a controlled simulation but a naturalistic AI-agent social environment.
The study suggests that AI collectives may be analyzable with tools from complexity science.
At the same time, the authors stress that AI-agent behavior differs from human behavior in specific ways.
One key difference is the sublinear relation between upvotes and discussion size.
The paper frames AI collective behavior as an empirical reality rather than a hypothetical future problem.

## Safety and Governance Implications

The paper highlights possible risks from large-scale AI-agent ecosystems.
Scale-free engagement structures can make information spreading persistent and difficult to control.
If hubs dominate attention, misinformation or malicious content may spread efficiently through the system.
Previous findings on AI conformity and majority-following increase this concern.
A swarm of malicious agents could manipulate discussion patterns or exploit collective dynamics.
The paper suggests that harmful collective behavior can emerge even when individual agents are not explicitly malicious.
This parallels known risks in human online communities.
Understanding AI-agent collective behavior is therefore important for AI safety and governance.
The authors argue that both observational studies and controlled experiments are needed.

## Data and Methods

The data were collected from Moltbook’s public API over 12 days.
The crawler periodically retrieved new posts, comments, agent profiles, and submolt metadata.
The final dataset contains 369,209 posts, 3,026,275 comments, 46,690 agents, and 17,184 submolts.
A technical limit allowed full retrieval only for up to 100 comments per post.
This affects 2.9% of posts but includes about 83% of all comments.
The authors identify and remove spam-affected posts before analysis.
Spam is detected through content duplication and author concentration.
The filtering removes 15,764 posts, equal to 4.3% of all posts.
Power-law fitting is performed using maximum likelihood estimation with the `powerlaw` Python package.

## Limitations

The autonomy of Moltbook agents cannot be fully verified.
Humans configure agent instructions and may influence behavior indirectly or directly.
The platform also lacked strong mechanisms to prevent mass registration or non-autonomous accounts.
The observation window is short and captures only the early growth phase of the platform.
Some observed patterns may therefore be transient rather than stable.
The API comment limit restricts detailed discussion-tree analysis for the most viral posts.
Spam bots introduce noise and require filtering decisions that may affect results.
Despite these issues, the scale of the dataset makes direct human control of all interactions implausible.
The paper should therefore be read as an early empirical study, not as a definitive account of AI societies.

## Pros

* The paper studies real AI-agent interactions at large scale, not only controlled simulations.

* The dataset is unusually rich, with hundreds of thousands of posts and millions of comments.

* The comparison with human social media gives a clear benchmark for interpreting AI collective behavior.

* The analysis covers multiple dimensions: activity, popularity, discussion structure, and temporal attention.

* The safety discussion is valuable because it links empirical patterns to concrete governance risks.

## Cons

* The study covers only 12 days, so long-term stability of the observed patterns remains uncertain.

* Agent autonomy is difficult to verify because humans create, configure, and may influence agents.

* API limits prevent full analysis of the largest and most viral discussion trees.

* Moltbook is a very specific platform, so results may not generalize to other AI-agent ecosystems.

* The paper is mainly descriptive and does not causally identify the mechanisms producing the observed patterns.

