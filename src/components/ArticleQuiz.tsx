// src/components/ArticleQuiz.tsx
import { createSignal, For, Show, onMount, createEffect, onCleanup } from 'solid-js';
import type confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ArticleQuizProps {
  postId: string;
}

let quizContainerRef: HTMLDivElement | undefined;

// --- Confetti Lazy Loading and Helpers ---
let confettiCreateFn: typeof confetti | null = null;
let fireworksIntervalId: number | null = null; // Store interval ID for fireworks
let snowIntervalId: number | null = null; // Store interval ID for snow
let isConfettiLoading = false; // Track if confetti is currently loading

async function getConfetti() {
  if (!confettiCreateFn && !isConfettiLoading) {
    isConfettiLoading = true; // Prevent multiple simultaneous load attempts
    try {
      const module = await import('canvas-confetti');
      confettiCreateFn = module.default;
      console.log("canvas-confetti loaded");
    } catch (err) {
      console.error("Failed to load canvas-confetti:", err);
      return null; // Return null if loading failed
    } finally {
      isConfettiLoading = false;
    }
  }
  return confettiCreateFn;
}

// Function to stop ongoing interval-based confetti
const stopConfettiEffects = () => {
  if (fireworksIntervalId !== null) {
    clearInterval(fireworksIntervalId);
    fireworksIntervalId = null;
    console.log("Stopped fireworks interval");
  }
  if (snowIntervalId !== null) {
    clearInterval(snowIntervalId);
    snowIntervalId = null;
    console.log("Stopped snow interval");
  }
};

const triggerCannon = async () => {
  console.log("Attempting to trigger cannon...");
  const fire = await getConfetti();
  if (!fire) {
    console.error("Cannon: Confetti function not available.");
    return;
  }
  console.log("Cannon: Got fire function, firing...");

  const defaults = {
    spread: 70,
    ticks: 50,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    particleCount: 60,
    origin: { x: 0.5, y: 0.7 },
    scalar: 0.6,
    zIndex: 1050
  };

  // Fire cannons slightly offset from bottom corners
  fire({
    ...defaults,
    angle: 90 - 45, // Angle towards top-left

  });
  fire({
    ...defaults,
    angle: 90 + 45, // Angle towards top-right
  });
  console.log("Cannon: Fired.");
};

const triggerFireworks = async () => {
  stopConfettiEffects(); // Stop any previous effects first
  const fire = await getConfetti();
  if (!fire) return;

  console.log("Triggering Fireworks");
  const duration = 4 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1050 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Assign the interval ID
  fireworksIntervalId = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      stopConfettiEffects();
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    fire(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    fire(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
};

const triggerSnow = async () => {
  stopConfettiEffects(); // Stop any previous effects first
  const fire = await getConfetti();
  if (!fire) return;

  console.log("Triggering Snow");
  const duration = 8 * 1000; // Slightly longer duration for snow
  const animationEnd = Date.now() + duration;

  // Assign the interval ID
  snowIntervalId = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      stopConfettiEffects();
      return;
    }
    const particleCount = 2;
    fire({
      particleCount,
      startVelocity: 0,
      ticks: 200 + Math.random() * 100,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: ['#ffffff'],
      shapes: ['circle'],
      gravity: Math.random() * 0.3 + 0.4,
      scalar: Math.random() * 0.4 + 0.6,
      drift: Math.random() * 0.5 - 0.25,
      zIndex: 1050,
    });
  }, 150); // More frequent spawning for better snow effect
};
// --- End Confetti Helpers ---

export default function ArticleQuiz(props: ArticleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = createSignal(0);
  const [selectedOption, setSelectedOption] = createSignal<number | null>(null);
  const [isCorrect, setIsCorrect] = createSignal<boolean | null>(null);
  const [score, setScore] = createSignal(0);
  const [quizCompleted, setQuizCompleted] = createSignal(false);
  const [questions, setQuestions] = createSignal<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  // Add a new signal to track when to show end effects
  const [showEndEffects, setShowEndEffects] = createSignal(false);

  const PASSING_PERCENTAGE = 0.6;

  // --- Effects ---
  onMount(() => {
    if (!isLoading() && quizContainerRef) {
      quizContainerRef.focus();
    }
    // Preload confetti library on mount to avoid delay on first correct answer
    getConfetti().then(() => console.log("Confetti preloaded"));
    loadQuestionsForPost(props.postId);
  });

  // Cleanup confetti intervals if component unmounts unexpectedly
  onCleanup(() => {
    stopConfettiEffects();
  });

  createEffect(() => {
    if (!isLoading() && !error() && quizContainerRef) {
      quizContainerRef.focus();
    }
  });

  // Modified effect to use showEndEffects signal
  createEffect(() => {
    if (quizCompleted() && showEndEffects()) {
      const finalScore = score();
      const totalQuestions = questions().length;
      if (totalQuestions > 0) {
        const percentage = finalScore / totalQuestions;
        if (percentage >= PASSING_PERCENTAGE) {
          triggerFireworks();
        } else {
          triggerSnow();
        }
      }
    }
  });

  // --- Functions ---
  const loadQuestionsForPost = async (postId: string) => {
    setIsLoading(true);
    setError(null);
    // Stop any confetti from a previous load attempt/error state
    stopConfettiEffects();
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Loading questions for post: ${postId}`);
      const dummyQuestions = [
        { question: `What is the main topic of this article (${postId})?`, options: ["Web Dev", "ML", "DB", "Mobile"], correctAnswer: 0 },
        { question: "Which component is used for navigation?", options: ["Nav", "BreadCrumbs", "SiteNav", "Header"], correctAnswer: 1 },
        { question: "Framework for comments?", options: ["React", "Vue", "SolidJS", "Svelte"], correctAnswer: 2 },
        { question: "How is TOC on mobile?", options: ["Hidden", "Bottom", "Top", "Dropdown"], correctAnswer: 2 },
        { question: "Edit suggestion component?", options: ["Suggest", "EditSuggestion", "Feedback", "Editor"], correctAnswer: 1 }
      ];
      if (dummyQuestions && dummyQuestions.length > 0) {
        setQuestions(dummyQuestions);
      } else {
        throw new Error("No questions loaded");
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isCorrect() === null) {
      setSelectedOption(optionIndex);
    }
  };

  // Make checkAnswer async to await triggerCannon
  const checkAnswer = async () => {
    if (selectedOption() === null || isCorrect() !== null || questions().length === 0) return;

    const currentQ = questions()[currentQuestion()];
    if (!currentQ) return;

    const isAnswerCorrect = selectedOption() === currentQ.correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(score() + 1);
      console.log("Correct Answer - Calling triggerCannon");
      try {
        // Make sure to await the triggerCannon call
        await triggerCannon();
      } catch (err) {
        console.error("Error triggering cannon:", err);
      }
    }
  };

  const nextQuestion = () => {
    if (isCorrect() === null || questions().length === 0) return;
    const numQuestions = questions().length;

    if (currentQuestion() < numQuestions - 1) {
      setCurrentQuestion(currentQuestion() + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      quizContainerRef?.focus();
    } else {
      setQuizCompleted(true);
      // Only show end effects when completing the quiz
      setShowEndEffects(true);
    }
  };

  const resetQuiz = () => {
    // First, ensure we stop any effects
    stopConfettiEffects();

    // Then disable the end effects flag before resetting state
    setShowEndEffects(false);

    // Reset the state
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setQuizCompleted(false);
    setError(null);

    // Set focus
    if (quizContainerRef) {
      setTimeout(() => {
        quizContainerRef?.focus();
      }, 0);
    }
  };

  const getOptionClasses = (index: number) => {
    const base = 'p-3 md:p-4 border rounded-md transition-all text-left w-full ';
    const state = isCorrect();
    const currentQ = questions()[currentQuestion()];
    const selected = selectedOption() === index;
    const focusStyle = ' focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-400 ';

    if (state === null) { // Answering phase
      return base + (selected
        ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-400 dark:bg-blue-800/40 cursor-pointer'
        : 'border-gray-600 dark:border-gray-600 hover:bg-gray-700/30 dark:hover:bg-gray-600/40 cursor-pointer') + focusStyle;
    } else { // Feedback phase
      const isCorrectAnswer = index === currentQ?.correctAnswer;
      if (isCorrectAnswer) {
        return base + 'border-green-500 bg-green-900/30 ring-2 ring-green-400 dark:bg-green-800/40 cursor-default' + focusStyle;
      } else if (selected) {
        return base + 'border-red-500 bg-red-900/30 ring-2 ring-red-400 dark:bg-red-800/40 cursor-default opacity-70' + focusStyle;
      } else {
        return base + 'border-gray-700 dark:border-gray-700 bg-gray-800/10 dark:bg-gray-700/20 cursor-default opacity-60';
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle Enter during completed screen
    if (quizCompleted() && event.key === 'Enter') {
      event.preventDefault();
      resetQuiz();
      return;
    }

    if (isLoading() || error() || quizCompleted() || questions().length === 0) {
      return;
    }

    const currentQ = questions()[currentQuestion()];
    if (!currentQ) return;
    const numOptions = currentQ.options.length;
    if (numOptions === 0) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (isCorrect() === null) {
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          setSelectedOption(prev => {
            const current = prev === null ? -1 : prev; // Start from -1 if nothing selected
            let next = (current + direction + numOptions) % numOptions;
            // If starting fresh and going up, go to last item
            if (current === -1 && direction === -1) {
              next = numOptions - 1;
            }
            return next;
          });
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedOption() !== null) {
          if (isCorrect() === null) {
            checkAnswer();
          } else {
            nextQuestion();
          }
        }
        break;
    }
  };

  // --- Render ---
  return (
    <div
      ref={quizContainerRef}
      tabindex="0"
      onKeyDown={handleKeyDown}
      class="w-full text-gray-100 dark:text-gray-100 outline-none relative"
      aria-labelledby="quiz-title"
    >
      {/* Loading State */}
      <Show when={isLoading()}>
        <div class="flex justify-center items-center py-12 min-h-[200px]">
          <svg class="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-3">Loading Questions...</span>
        </div>
      </Show>

      {/* Error State */}
      <Show when={error() && !isLoading()}>
        <div class="text-center py-12 text-red-400">
          <p>Error loading quiz: {error()}</p>
          <button onClick={() => loadQuestionsForPost(props.postId)} class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </Show>

      {/* Quiz Content */}
      <Show when={!isLoading() && !error() && questions().length > 0}>
        <div class="bg-transparent rounded-lg">
          <h2 id="quiz-title" class="sr-only">Article Quiz</h2>

          <Show
            when={!quizCompleted()}
            fallback={
              // Final score screen
              <div class="text-center py-8">
                <h3 class="text-xl font-bold mb-4 text-white">Quiz Completed!</h3>
                <p class="text-lg mb-6 text-gray-300">
                  Your score: <span class="font-bold text-xl text-green-400">{score()}</span> out of {questions().length}
                  {' ('}
                  {
                    (score() / questions().length) >= PASSING_PERCENTAGE
                      ? <span class="text-green-400">Passed! 🎉</span>
                      : <span class="text-red-400">Keep Learning! ❄️</span>
                  }
                  {')'}
                </p>
                <p class="text-sm text-gray-400 mb-4">(Press Enter to take again)</p>
                <button
                  onClick={resetQuiz}
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                >
                  Take Again
                </button>
              </div>
            }
          >
            {/* Question Area */}
            <div class="mb-6">
              <h3 class="text-sm font-medium mb-1 text-gray-400">
                Question {currentQuestion() + 1} of {questions().length}
              </h3>
              <p class="text-lg font-semibold text-white">{questions()[currentQuestion()]?.question}</p>
            </div>

            {/* Options Area */}
            <div class="space-y-3 mb-6" role="radiogroup" aria-labelledby={`question-${currentQuestion()}`}>
              <For each={questions()[currentQuestion()]?.options}>
                {(option, index) => (
                  <button
                    role="radio"
                    aria-checked={selectedOption() === index()}
                    class={getOptionClasses(index())}
                    onClick={() => handleOptionSelect(index())}
                    disabled={isCorrect() !== null}
                  >
                    {option}
                  </button>
                )}
              </For>
            </div>

            {/* Action/Feedback Area */}
            <div class="flex flex-col sm:flex-row justify-between items-center min-h-[40px] mt-6">
              {/* Feedback Message */}
              <div class="w-full sm:w-auto mb-3 sm:mb-0 text-center sm:text-left">
                <Show when={isCorrect() !== null}>
                  <span
                    class={`px-3 py-1 rounded-md text-sm font-medium ${isCorrect()
                      ? 'bg-green-900/70 text-green-200'
                      : 'bg-red-900/70 text-red-200'
                      }`}
                  >
                    {isCorrect() ? 'Correct!' : `Incorrect. The answer was: ${questions()[currentQuestion()]?.options[questions()[currentQuestion()]?.correctAnswer]}`}
                  </span>
                </Show>
              </div>

              {/* Control Buttons */}
              <div class="w-full sm:w-auto">
                <Show
                  when={isCorrect() === null}
                  fallback={
                    <button
                      onClick={nextQuestion}
                      class="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                      {currentQuestion() < questions().length - 1 ? 'Next Question' : 'See Results'}
                    </button>
                  }
                >
                  <button
                    onClick={checkAnswer}
                    disabled={selectedOption() === null}
                    class={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${selectedOption() === null
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500'
                      }`}
                  >
                    Check Answer
                  </button>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
