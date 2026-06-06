## Introduction

The paper studies how to make language-model predictions more coherent when different querying modes disagree.
A language model can be used generatively, by asking it to produce an answer, or discriminatively, by asking it to judge whether a candidate answer is correct.
These two modes often give inconsistent signals: an answer may be likely to generate but judged incorrect, or vice versa.
The authors propose a training-free game-theoretic decoding method called Equilibrium Ranking.
The method is based on a signaling game called the Consensus Game.
In this game, a Generator tries to communicate whether an answer is correct or incorrect, and a Discriminator tries to infer that correctness signal.
The goal is to find answers that are supported by both generation and discrimination.
The paper argues that better coherence between these two LM behaviors improves factual accuracy and truthfulness.
The method is evaluated on question answering, reading comprehension, commonsense reasoning, alignment, truthfulness, and math reasoning tasks.

## Language Model Consensus as Equilibrium Search

The paper starts from the problem of selecting the best answer from a finite candidate set.
The candidate set can be the options in a multiple-choice question or sampled answers in a free-form task.
The same LM is queried in two ways: as a Generator and as a Discriminator.
The Generator estimates how likely each answer is under a prompt asking for a correct answer.
The Discriminator estimates whether a given candidate answer is correct or incorrect.
Simple score-combination methods may fail because LM probabilities are often poorly calibrated.
Deliberation methods can help, but they usually require extra LM calls and more computation.
The authors instead formulate consensus as an equilibrium-search problem.
A good prediction should be coherent across both modes and close to the model’s original beliefs.

## The Consensus Game

The Consensus Game is an imperfect-information signaling game.
At the beginning, the environment secretly samples a correctness parameter: correct or incorrect.
The Generator observes this parameter and chooses a natural-language string from the candidate set.
The Discriminator observes only the string and must predict whether the hidden parameter was correct or incorrect.
Both players receive reward 1 if the Discriminator guesses correctly, and 0 otherwise.
At equilibrium, the Generator and Discriminator must agree on which strings signal correctness.
This gives a formal definition of coherence between generative and discriminative LM behavior.
However, ordinary Nash equilibria can be unreasonable because any arbitrary mapping can become self-consistent.
For example, the system could falsely agree that “Nairobi” signals the correct birthplace of Barack Obama.

## Regularized Equilibrium

To avoid unreasonable equilibria, the paper adds KL regularization.
The Generator and Discriminator are penalized for moving too far away from their initial LM-based policies.
The initial Generator policy comes from the LM’s probability of candidates under correct and incorrect prompting.
The initial Discriminator policy comes from the LM’s probability of judging each candidate as correct or incorrect.
The regularization keeps the equilibrium close to the LM’s original knowledge.
This balances two goals: coherence and reasonableness.
Coherence means the Generator and Discriminator agree.
Reasonableness means the agreement is not arbitrary but remains grounded in the base model.
The resulting equilibrium is used to rank candidate answers.

## Equilibrium Ranking

Equilibrium Ranking computes approximate equilibria of the Consensus Game.
It does not train or fine-tune the language model.
Instead, it modifies only the ranking policies over the candidate answers.
The method uses no-regret learning, a standard tool for solving large imperfect-information games.
The update is based on the piKL algorithm, which handles KL-regularized objectives.
The Generator and Discriminator update their policies iteratively using average values from previous play.
The authors run the procedure for 5000 iterations in the experiments.
The computational cost of each iteration is linear in the number of candidate answers.
For most multiple-choice tasks, this overhead is small because there are only four candidate answers.

## Initial Policies and Candidate Sets

For multiple-choice tasks, the candidate set is simply the set of answer options.
For free-form generation tasks, candidates are sampled from the model using nucleus sampling and top-k sampling.
The paper uses nucleus sampling with p = 0.9 and top-k = 50.
Correct prompting corresponds to the ordinary prompt asking for the answer.
Incorrect prompting is created by replacing “Answer:” with “Incorrect Answer:”.
This creates contrast between likely correct and likely incorrect completions.
The Generator policy is normalized across both candidates and correctness values.
The Discriminator policy is normalized across candidates and correctness judgments.
This normalization is intended to improve calibration before equilibrium search.

## Experiments

The paper evaluates Equilibrium Ranking on six benchmarks.
The multiple-choice benchmarks are MMLU, ARC, RACE, and HHH.
TruthfulQA is used to test whether the method helps avoid common human-like falsehoods.
GSM8K is used to test whether the method can combine with Chain-of-Thought and self-consistency.
The tested models are LLaMA-7B and LLaMA-13B.
The main baselines are Generative Ranking, Mutual Information Ranking, Self-Contrastive Ranking, and Discriminative Ranking.
For free-form tasks, greedy decoding is also included.
For GSM8K, majority vote over sampled reasoning paths is included.
The paper reports both Generator-based and Discriminator-based versions of Equilibrium Ranking.

## Results on Multiple-Choice Tasks

Equilibrium Ranking usually matches or outperforms all baselines on MMLU, ARC, RACE, and HHH.
On MMLU, LLaMA-7B with Equilibrium Ranking reaches about 39.9 accuracy, compared with 30.4 for generative ranking.
On MMLU, LLaMA-13B with Equilibrium Ranking reaches about 45.1 accuracy.
On ARC-Challenge, Equilibrium Ranking gives large gains, reaching 58.3 with LLaMA-7B and 61.4 with LLaMA-13B.
These results outperform much larger reported models such as LLaMA-65B and PaLM-540B on some comparisons.
On RACE-Middle and RACE-High, Equilibrium Ranking also provides consistent improvements.
On HHH, LLaMA-7B improves clearly, while LLaMA-13B requires different regularization parameters to exceed the best baseline.
The table on page 7 is central because it shows that the method is especially strong when generative or discriminative scores alone are unreliable.

## Results on TruthfulQA

TruthfulQA tests whether models avoid generating false answers that are common in human text.
The authors sample 10 candidate answers and rank them using different methods.
For LLaMA-7B, Equilibrium Ranking gives only modest improvements over greedy decoding.
For LLaMA-13B, the gains are stronger.
LLaMA-13B with ER-G reaches about 39.83 BLEU-Acc, compared with 33.05 for greedy decoding.
This is important because TruthfulQA often shows negative scaling, where larger models can become less truthful.
The result suggests that Equilibrium Ranking can partly mitigate this negative scaling.
The method improves truthfulness without training a new verifier.
However, the absolute TruthfulQA scores remain relatively low.

## Results on GSM8K

GSM8K tests grade-school mathematical reasoning.
The authors generate 20 Chain-of-Thought reasoning paths for each problem.
They then aggregate answers using self-consistency and ranking-based scores.
Equilibrium Ranking is not used as a reasoning method by itself.
Instead, it is used to score candidate reasoning paths and final answers.
For LLaMA-7B, ER-D slightly improves over majority vote, reaching about 15.1 compared with 14.7.
For LLaMA-13B, Equilibrium Ranking performs roughly on par with the best baselines.
The results show that the method is compatible with Chain-of-Thought and self-consistency.
The gains in math reasoning are smaller than in multiple-choice factual benchmarks.

## Related Work

The paper relates to decoding methods such as top-k sampling, nucleus sampling, and typical sampling.
Those methods focus mainly on fluency, diversity, and text quality, not correctness.
It also relates to re-ranking methods that train separate verifiers or ranking models.
Unlike those methods, Equilibrium Ranking uses the existing LM in a training-free way.
The paper also connects to deliberation methods such as Chain-of-Thought, Tree-of-Thought, self-refinement, and multi-agent debate.
The difference is that the “debate” happens through regret-minimization dynamics, not through natural-language conversation among multiple LM instances.
The method is also related to game-theoretic pragmatics and signaling games.
Its technical foundation comes from no-regret learning in imperfect-information games.
This makes the paper unusual because it imports game-solving tools into LM decoding.

## Theoretical Guarantees

The paper uses regret decomposition to break the game into local learning problems.
The Generator updates separately for correct and incorrect hidden states.
The Discriminator updates separately for each candidate answer.
The piKL algorithm guarantees logarithmic regret growth under the stated conditions.
Low regret implies convergence toward coarse correlated equilibria of the regularized game.
Regularization keeps the average policy close to the initial LM policy.
This is important because unregularized equilibria may be coherent but false.
The theory therefore supports both stability and groundedness.
The guarantees are strongest for the abstract game formulation, while empirical performance depends on candidate quality and LM scoring quality.

## Practical Interpretation

Equilibrium Ranking can be understood as a principled reconciliation method.
It asks: which answer would survive if the model’s generator and verifier had to agree under a regularized game?
This is useful when generation and verification each contain partial information.
The method is especially attractive because it does not require fine-tuning, human labels, or a separate verifier model.
It can also be combined with sampling and deliberation methods.
Its strongest use case is ranking a finite set of candidate answers.
It is less directly suited to unconstrained long-form generation unless a good candidate-generation process exists.
The approach shifts decoding from pure likelihood maximization to equilibrium-based consistency.
This makes correctness a property of agreement between model affordances rather than a single score.

## Limitations

The method depends on the quality of the candidate answer set.
If the correct answer is not sampled or not present among the options, Equilibrium Ranking cannot recover it.
The experiments focus mostly on question answering and short-form answers.
Long-form generation is mentioned as future work but not tested deeply.
The method uses the same LM as both Generator and Discriminator, so shared model biases may remain.
The incorrect-answer prompt is simple and may not always produce a reliable contrastive signal.
Hyperparameters are mostly fixed at 0.1, so task-specific tuning is not deeply explored.
The method improves ranking but does not explain answers or verify facts externally.
Its truthfulness gains therefore remain bounded by the base model’s internal knowledge and candidate samples.

## Pros

* The paper gives a specific formal solution to a real decoding problem: disagreement between generative and discriminative LM queries.

* The Consensus Game is well designed because it separates coherence from reasonableness and then uses KL regularization to connect them.

* The method is training-free, so it can improve decoding without collecting labels, training a verifier, or modifying model weights.

* The empirical gains are strong on ARC-Challenge and RACE, where small LLaMA models sometimes outperform much larger reported models.

* The method is modular: it can be combined with candidate sampling, Chain-of-Thought, and self-consistency rather than replacing them.

## Cons

* The method can only rank candidates that already exist, so performance depends strongly on candidate generation quality.

* The use of “Incorrect Answer:” as the main contrastive prompt is simple and may be fragile across domains or prompt formats.

* Both Generator and Discriminator come from the same base LM, so equilibrium can still reinforce shared false beliefs or biases.

* The method is mostly validated on short-answer QA; its usefulness for long-form, open-ended, or creative generation remains uncertain.

* The HHH result for LLaMA-13B shows that fixed hyperparameters are not always optimal, so the method may require tuning in some settings.
