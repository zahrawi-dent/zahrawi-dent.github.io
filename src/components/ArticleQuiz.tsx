import { createSignal, For, Show, onMount, createEffect, onCleanup } from 'solid-js'; // Import createEffect, onCleanup
import '../styles/fireworks.css';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ArticleQuizProps {
  postId: string;
}

let quizContainerRef: HTMLDivElement | undefined; // Ref for the main quiz container

// ... Fireworks component remains the same ...
const Fireworks = () => {
  // This structure assumes your fireworks.css defines styles for .fireworks-container > .firework
  // Adjust based on your actual CSS file.
  return (
    <div class="fixed inset-0 z-50 pointer-events-none fireworks-container">
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="firework"></div>
    </div>
  );
};


export default function ArticleQuiz(props: ArticleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = createSignal(0);
  const [selectedOption, setSelectedOption] = createSignal<number | null>(null);
  const [isCorrect, setIsCorrect] = createSignal<boolean | null>(null);
  const [score, setScore] = createSignal(0);
  const [quizCompleted, setQuizCompleted] = createSignal(false);
  const [showFireworks, setShowFireworks] = createSignal(false);
  const [questions, setQuestions] = createSignal<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Focus the container and add keyboard listener when component mounts & loads
  onMount(() => {
    if (!isLoading() && quizContainerRef) {
      quizContainerRef.focus(); // Focus the container
    }
  });
  // Add effect to focus if loading finishes after mount
  createEffect(() => {
    if (!isLoading() && !error() && quizContainerRef) {
      quizContainerRef.focus();
    }
  })

  // Fetch or define questions when the component mounts
  onMount(() => {
    loadQuestionsForPost(props.postId);
  });

  // ... loadQuestionsForPost, handleOptionSelect, checkAnswer, nextQuestion, resetQuiz, getOptionClasses remain largely the same ...
  // (Make sure checkAnswer and nextQuestion are callable from keyboard handler)
  // --- loadQuestionsForPost ---
  const loadQuestionsForPost = async (postId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // --- Dummy Implementation (as before) ---
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      console.log(`Loading questions for post: ${postId}`);
      const dummyQuestions = [
        { question: `What is the main topic of this article (${postId})?`, options: ["Web Dev", "ML", "DB", "Mobile"], correctAnswer: 0 },
        { question: "Which component is used for navigation?", options: ["Nav", "BreadCrumbs", "SiteNav", "Header"], correctAnswer: 1 },
        { question: "Framework for comments?", options: ["React", "Vue", "SolidJS", "Svelte"], correctAnswer: 2 },
        { question: "How is TOC on mobile?", options: ["Hidden", "Bottom", "Top", "Dropdown"], correctAnswer: 2 },
        { question: "Edit suggestion component?", options: ["Suggest", "EditSuggestion", "Feedback", "Editor"], correctAnswer: 1 }
      ];
      // Ensure we only set non-empty questions
      if (dummyQuestions && dummyQuestions.length > 0) {
        setQuestions(dummyQuestions);
      } else {
        throw new Error("No questions loaded");
      }

    } catch (err) {
      console.error("Error loading questions:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setQuestions([]); // Clear questions on error
    } finally {
      setIsLoading(false);
    }
  };
  // --- handleOptionSelect ---
  const handleOptionSelect = (optionIndex: number) => {
    if (isCorrect() === null) {
      setSelectedOption(optionIndex);
    }
  };
  // --- checkAnswer ---
  const checkAnswer = () => {
    if (selectedOption() === null || isCorrect() !== null || questions().length === 0) return;

    const currentQ = questions()[currentQuestion()];
    if (!currentQ) return; // Safety check

    const isAnswerCorrect = selectedOption() === currentQ.correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(score() + 1);
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 3000);
    }
  };
  // --- nextQuestion ---
  const nextQuestion = () => {
    if (isCorrect() === null || questions().length === 0) return;
    const numQuestions = questions().length;

    if (currentQuestion() < numQuestions - 1) {
      setCurrentQuestion(currentQuestion() + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      // Focus container again for next question navigation
      quizContainerRef?.focus();
    } else {
      setQuizCompleted(true);
      setShowFireworks(false);
    }
  };
  // --- resetQuiz ---
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setQuizCompleted(false);
    setShowFireworks(false);
    // Don't set isLoading to false here unless you are actually reloading
    // setIsLoading(false);
    setError(null);
    // Refocus after reset
    quizContainerRef?.focus();
    // Optionally reload questions
    // loadQuestionsForPost(props.postId);
  };
  // --- getOptionClasses (example, ensure it visually represents selectedOption()) ---
  const getOptionClasses = (index: number) => {
    const base = 'p-3 md:p-4 border rounded-md transition-all text-left w-full ';
    const state = isCorrect();
    const currentQ = questions()[currentQuestion()];
    const selected = selectedOption() === index;

    // Base state for focus outline when navigating with keyboard
    const focusStyle = ' focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-400 ';


    if (state === null) { // Answering phase
      return base + (selected
        ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-400 dark:bg-blue-800/40 cursor-pointer'
        : 'border-gray-600 dark:border-gray-600 hover:bg-gray-700/30 dark:hover:bg-gray-600/40 cursor-pointer') + focusStyle;
    } else { // Feedback phase - disable cursor, maybe remove hover
      const isCorrectAnswer = index === currentQ?.correctAnswer;
      if (isCorrectAnswer) {
        return base + 'border-green-500 bg-green-900/30 ring-2 ring-green-400 dark:bg-green-800/40 cursor-default' + focusStyle; // Highlight correct
      } else if (selected) {
        return base + 'border-red-500 bg-red-900/30 ring-2 ring-red-400 dark:bg-red-800/40 cursor-default opacity-70' + focusStyle; // Highlight incorrect selection
      } else {
        return base + 'border-gray-700 dark:border-gray-700 bg-gray-800/10 dark:bg-gray-700/20 cursor-default opacity-60'; // Other incorrect options (no focus needed here)
      }
    }
  };


  // Keyboard navigation handler
  const handleKeyDown = (event: KeyboardEvent) => {
    // Only navigate if quiz is active and not completed
    if (isLoading() || error() || quizCompleted() || questions().length === 0) {
      // Allow Enter on completed screen to reset
      if (quizCompleted() && event.key === 'Enter') {
        event.preventDefault();
        resetQuiz();
      }
      return;
    }

    const currentQ = questions()[currentQuestion()];
    if (!currentQ) return;
    const numOptions = currentQ.options.length;
    if (numOptions === 0) return; // No options to navigate

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        // Allow navigation only before checking answer
        if (isCorrect() === null) {
          setSelectedOption(prev => (prev === null ? 0 : (prev + 1) % numOptions));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Allow navigation only before checking answer
        if (isCorrect() === null) {
          setSelectedOption(prev => (prev === null ? numOptions - 1 : (prev - 1 + numOptions) % numOptions));
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedOption() !== null) {
          if (isCorrect() === null) { // If answering
            checkAnswer();
          } else { // If feedback is shown
            nextQuestion();
          }
        }
        break;
    }
  };


  return (
    // Add ref and tabindex=0 to the main container, attach keydown listener
    <div
      ref={quizContainerRef}
      tabindex="0" // Make it focusable
      onKeyDown={handleKeyDown} // Attach listener here
      class="w-full text-gray-100 dark:text-gray-100 outline-none" // Added outline-none to hide default focus ring if needed
      aria-labelledby="quiz-title" // For accessibility
    >
      <Show when={showFireworks()}>
        <Fireworks />
      </Show>

      {/* Loading State */}
      <Show when={isLoading()}>
        {/* ... loading spinner ... */}
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
          {/* Add an ID for aria-labelledby */}
          <h2 id="quiz-title" class="sr-only">Article Quiz</h2>

          <Show
            when={!quizCompleted()}
            fallback={
              // Final score screen
              <div class="text-center py-8">
                <h3 class="text-xl font-bold mb-4 text-white">Quiz Completed!</h3>
                <p class="text-lg mb-6 text-gray-300">
                  Your score: <span class="font-bold text-xl text-green-400">{score()}</span> out of {questions().length}
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

            {/* Options Area - Use buttons or role="button" for semantics */}
            <div class="space-y-3 mb-6" role="radiogroup" aria-labelledby={`question-${currentQuestion()}`}> {/* Group options */}
              <For each={questions()[currentQuestion()]?.options}>
                {(option, index) => (
                  <button
                    role="radio" // Semantics for keyboard nav
                    aria-checked={selectedOption() === index()} // State for screen readers
                    class={getOptionClasses(index())}
                    onClick={() => handleOptionSelect(index())}
                    disabled={isCorrect() !== null} // Disable after checking
                  >
                    {option}
                  </button>
                )}
              </For>
            </div>

            {/* Action/Feedback Area */}
            {/* ... (rest of the feedback/button logic remains the same) ... */}
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
                  when={isCorrect() === null} // Show "Check Answer" when no answer submitted yet
                  fallback={
                    // Show "Next" or "See Results" after checking
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
                    disabled={selectedOption() === null} // Disable if no option selected
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

// // src/components/ArticleQuiz.tsx
// import { createSignal, For, Show, onMount } from 'solid-js';
// import '../styles/fireworks.css'; // Import the CSS here!
//
// interface QuizQuestion {
//   question: string;
//   options: string[];
//   correctAnswer: number;
// }
//
// interface ArticleQuizProps {
//   postId: string; // Receive postId to load relevant questions
// }
//
// // Define Fireworks component directly or just the structure if CSS handles it all
// const Fireworks = () => {
//   // This structure assumes your fireworks.css defines styles for .fireworks-container > .firework
//   // Adjust based on your actual CSS file.
//   return (
//     <div class="fixed inset-0 z-50 pointer-events-none fireworks-container">
//       <div class="firework"></div>
//       <div class="firework"></div>
//       <div class="firework"></div>
//       <div class="firework"></div>
//       <div class="firework"></div>
//       <div class="firework"></div>
//     </div>
//   );
// };
//
//
// export default function ArticleQuiz(props: ArticleQuizProps) {
//   const [currentQuestion, setCurrentQuestion] = createSignal(0);
//   const [selectedOption, setSelectedOption] = createSignal<number | null>(null);
//   const [isCorrect, setIsCorrect] = createSignal<boolean | null>(null);
//   const [score, setScore] = createSignal(0);
//   const [quizCompleted, setQuizCompleted] = createSignal(false);
//   const [showFireworks, setShowFireworks] = createSignal(false);
//   const [questions, setQuestions] = createSignal<QuizQuestion[]>([]);
//   const [isLoading, setIsLoading] = createSignal(true);
//   const [error, setError] = createSignal<string | null>(null);
//
//   // Fetch or define questions when the component mounts
//   onMount(() => {
//     loadQuestionsForPost(props.postId);
//   });
//
//   // Simulate fetching/generating questions based on postId
//   const loadQuestionsForPost = async (postId: string) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // --- Real Implementation ---
//       // const response = await fetch(`/api/quiz-questions?postId=${postId}`);
//       // if (!response.ok) throw new Error('Failed to fetch questions');
//       // const data = await response.json();
//       // setQuestions(data.questions);
//       // --- End Real Implementation ---
//
//       // --- Dummy Implementation (as before) ---
//       await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
//       // You could potentially use postId here to vary the dummy questions
//       console.log(`Loading questions for post: ${postId}`);
//       const dummyQuestions = [
//         { question: `What is the main topic of this article (${postId})?`, options: ["Web Dev", "ML", "DB", "Mobile"], correctAnswer: 0 },
//         { question: "Which component is used for navigation?", options: ["Nav", "BreadCrumbs", "SiteNav", "Header"], correctAnswer: 1 },
//         { question: "Framework for comments?", options: ["React", "Vue", "SolidJS", "Svelte"], correctAnswer: 2 },
//         // Add more questions...
//       ];
//       setQuestions(dummyQuestions);
//       // --- End Dummy Implementation ---
//
//     } catch (err) {
//       console.error("Error loading questions:", err);
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const handleOptionSelect = (optionIndex: number) => {
//     // Allow selection only before checking answer
//     if (isCorrect() === null) {
//       setSelectedOption(optionIndex);
//     }
//   };
//
//   const checkAnswer = () => {
//     if (selectedOption() === null || isCorrect() !== null) return; // Prevent re-checking
//
//     const isAnswerCorrect = selectedOption() === questions()[currentQuestion()].correctAnswer;
//     setIsCorrect(isAnswerCorrect);
//
//     if (isAnswerCorrect) {
//       setScore(score() + 1);
//       setShowFireworks(true);
//       // Hide fireworks after animation duration (e.g., 3 seconds)
//       setTimeout(() => setShowFireworks(false), 3000);
//     }
//   };
//
//   const nextQuestion = () => {
//     // Proceed only if an answer has been checked (correct or incorrect)
//     if (isCorrect() === null) return;
//
//     if (currentQuestion() < questions().length - 1) {
//       setCurrentQuestion(currentQuestion() + 1);
//       setSelectedOption(null);
//       setIsCorrect(null);
//     } else {
//       setQuizCompleted(true);
//       // Ensure fireworks are off when quiz completes, unless you want them on the final screen
//       setShowFireworks(false);
//     }
//   };
//
//   const resetQuiz = () => {
//     // Potentially reload questions if they could change, or just reset state
//     // loadQuestionsForPost(props.postId); // Optional: reload questions
//     setCurrentQuestion(0);
//     setSelectedOption(null);
//     setIsCorrect(null);
//     setScore(0);
//     setQuizCompleted(false);
//     setShowFireworks(false); // Ensure fireworks are off
//     setIsLoading(false); // Ensure loading is false if not reloading questions
//     setError(null);
//   };
//
//   // Determine button styles and states more cleanly
//   const getOptionClasses = (index: number) => {
//     const base = 'p-3 md:p-4 border rounded-md transition-all text-left w-full ';
//     const state = isCorrect(); // null, true, or false
//     const currentQ = questions()[currentQuestion()];
//     const selected = selectedOption() === index;
//
//     if (state === null) { // Answering phase
//       return base + (selected
//         ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-400 dark:bg-blue-800/40 cursor-pointer'
//         : 'border-gray-600 dark:border-gray-600 hover:bg-gray-700/30 dark:hover:bg-gray-600/40 cursor-pointer');
//     } else { // Feedback phase
//       const isCorrectAnswer = index === currentQ.correctAnswer;
//       if (isCorrectAnswer) {
//         return base + 'border-green-500 bg-green-900/30 ring-2 ring-green-400 dark:bg-green-800/40 cursor-default'; // Highlight correct
//       } else if (selected) {
//         return base + 'border-red-500 bg-red-900/30 ring-2 ring-red-400 dark:bg-red-800/40 cursor-default opacity-70'; // Highlight incorrect selection
//       } else {
//         return base + 'border-gray-700 dark:border-gray-700 bg-gray-800/10 dark:bg-gray-700/20 cursor-default opacity-60'; // Other incorrect options
//       }
//     }
//   };
//
//   return (
//     // Removed outer container, as modal provides padding
//     <div class="w-full text-gray-100 dark:text-gray-100">
//       {/* Keep fireworks attached here */}
//       <Show when={showFireworks()}>
//         <Fireworks />
//       </Show>
//
//       {/* Loading State */}
//       <Show when={isLoading()}>
//         <div class="flex justify-center items-center py-12 min-h-[200px]">
//           <svg class="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
//             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           <span class="ml-3">Loading Questions...</span>
//         </div>
//       </Show>
//
//       {/* Error State */}
//       <Show when={error()}>
//         <div class="text-center py-12 text-red-400">
//           <p>Error loading quiz: {error()}</p>
//           <button onClick={() => loadQuestionsForPost(props.postId)} class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//             Retry
//           </button>
//         </div>
//       </Show>
//
//       {/* Quiz Content */}
//       <Show when={!isLoading() && !error() && questions().length > 0}>
//         {/* Using bg-transparent as modal provides the background */}
//         <div class="bg-transparent rounded-lg">
//           {/* Removed overall title, handled by modal */}
//
//           <Show
//             when={!quizCompleted()}
//             fallback={
//               <div class="text-center py-8">
//                 <h3 class="text-xl font-bold mb-4 text-white">Quiz Completed!</h3>
//                 <p class="text-lg mb-6 text-gray-300">
//                   Your score: <span class="font-bold text-xl text-green-400">{score()}</span> out of {questions().length}
//                 </p>
//                 <button
//                   onClick={resetQuiz}
//                   class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
//                 >
//                   Take Again
//                 </button>
//               </div>
//             }
//           >
//             {/* Question Area */}
//             <div class="mb-6">
//               <h3 class="text-sm font-medium mb-1 text-gray-400">
//                 Question {currentQuestion() + 1} of {questions().length}
//               </h3>
//               <p class="text-lg font-semibold text-white">{questions()[currentQuestion()]?.question}</p>
//             </div>
//
//             {/* Options Area */}
//             <div class="space-y-3 mb-6">
//               <For each={questions()[currentQuestion()]?.options}>
//                 {(option, index) => (
//                   <button
//                     class={getOptionClasses(index())}
//                     onClick={() => handleOptionSelect(index())}
//                     disabled={isCorrect() !== null} // Disable buttons after checking
//                   >
//                     {option}
//                   </button>
//                 )}
//               </For>
//             </div>
//
//             {/* Action/Feedback Area */}
//             <div class="flex flex-col sm:flex-row justify-between items-center min-h-[40px] mt-6">
//               {/* Feedback Message */}
//               <div class="w-full sm:w-auto mb-3 sm:mb-0 text-center sm:text-left">
//                 <Show when={isCorrect() !== null}>
//                   <span
//                     class={`px-3 py-1 rounded-md text-sm font-medium ${isCorrect()
//                       ? 'bg-green-900/70 text-green-200'
//                       : 'bg-red-900/70 text-red-200'
//                       }`}
//                   >
//                     {isCorrect() ? 'Correct!' : `Incorrect. The answer was: ${questions()[currentQuestion()].options[questions()[currentQuestion()].correctAnswer]}`}
//                   </span>
//                 </Show>
//               </div>
//
//               {/* Control Buttons */}
//               <div class="w-full sm:w-auto">
//                 <Show
//                   when={isCorrect() === null} // Show "Check Answer" when no answer submitted yet
//                   fallback={
//                     // Show "Next" or "See Results" after checking
//                     <button
//                       onClick={nextQuestion}
//                       class="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
//                     >
//                       {currentQuestion() < questions().length - 1 ? 'Next Question' : 'See Results'}
//                     </button>
//                   }
//                 >
//                   <button
//                     onClick={checkAnswer}
//                     disabled={selectedOption() === null} // Disable if no option selected
//                     class={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${selectedOption() === null
//                       ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
//                       : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500'
//                       }`}
//                   >
//                     Check Answer
//                   </button>
//                 </Show>
//               </div>
//             </div>
//           </Show>
//         </div>
//       </Show>
//     </div>
//   );
// }

// // ArticleQuiz.tsx - A SolidJS MCQ quiz component with fireworks animation
// import { createSignal, createEffect, For, Show, onMount } from 'solid-js';
//
// interface QuizQuestion {
//   question: string;
//   options: string[];
//   correctAnswer: number;
// }
//
// interface ArticleQuizProps {
//   postId: string;
// }
//
// const Fireworks = () => {
//   return (
//     <div class="fixed inset-0 z-50 pointer-events-none">
//       <div class="absolute inset-0 flex items-center justify-center">
//         <div class="firework"></div>
//         <div class="firework delay-1"></div>
//         <div class="firework delay-2"></div>
//       </div>
//     </div>
//   );
// };
//
// export default function ArticleQuiz(props: ArticleQuizProps) {
//   const [currentQuestion, setCurrentQuestion] = createSignal(0);
//   const [selectedOption, setSelectedOption] = createSignal<number | null>(null);
//   const [isCorrect, setIsCorrect] = createSignal<boolean | null>(null);
//   const [score, setScore] = createSignal(0);
//   const [quizCompleted, setQuizCompleted] = createSignal(false);
//   const [showFireworks, setShowFireworks] = createSignal(false);
//   const [questions, setQuestions] = createSignal<QuizQuestion[]>([]);
//   const [isLoading, setIsLoading] = createSignal(true);
//
//   onMount(() => {
//     // In a real implementation, this would fetch questions from an API
//     // or load them from a data file based on the postId
//     loadQuestionsForPost(props.postId);
//   });
//
//   // This simulates fetching questions for the specific post
//   const loadQuestionsForPost = (postId: string) => {
//     // In production, you'd fetch questions from an API endpoint
//     // For now, we'll use dummy questions
//     setTimeout(() => {
//       const dummyQuestions = [
//         {
//           question: "What is the main topic of this article?",
//           options: [
//             "Web Development",
//             "Machine Learning",
//             "Database Design",
//             "Mobile App Development"
//           ],
//           correctAnswer: 0
//         },
//         {
//           question: "Which component is used for navigation in the article?",
//           options: [
//             "NavigationBar",
//             "BreadCrumbs",
//             "SiteNav",
//             "HeaderLinks"
//           ],
//           correctAnswer: 1
//         },
//         {
//           question: "What framework is used for the comments section?",
//           options: [
//             "React",
//             "Vue",
//             "SolidJS",
//             "Svelte"
//           ],
//           correctAnswer: 2
//         },
//         {
//           question: "How is the table of contents displayed on mobile devices?",
//           options: [
//             "It's hidden completely",
//             "It's shown at the bottom of the article",
//             "It's shown above the article",
//             "It uses a dropdown menu"
//           ],
//           correctAnswer: 2
//         },
//         {
//           question: "Which component allows users to suggest edits to the article?",
//           options: [
//             "SuggestChanges",
//             "EditSuggestion",
//             "ContentFeedback",
//             "ArticleEditor"
//           ],
//           correctAnswer: 1
//         }
//       ];
//       setQuestions(dummyQuestions);
//       setIsLoading(false);
//     }, 500); // Simulate network delay
//   };
//
//   const handleOptionSelect = (optionIndex: number) => {
//     setSelectedOption(optionIndex);
//   };
//
//   const checkAnswer = () => {
//     if (selectedOption() === null) return;
//
//     const isAnswerCorrect = selectedOption() === questions()[currentQuestion()].correctAnswer;
//     setIsCorrect(isAnswerCorrect);
//
//     if (isAnswerCorrect) {
//       setScore(score() + 1);
//       setShowFireworks(true);
//
//       // Hide fireworks after 3 seconds
//       setTimeout(() => {
//         setShowFireworks(false);
//       }, 3000);
//     }
//   };
//
//   const nextQuestion = () => {
//     if (currentQuestion() < questions().length - 1) {
//       setCurrentQuestion(currentQuestion() + 1);
//       setSelectedOption(null);
//       setIsCorrect(null);
//     } else {
//       setQuizCompleted(true);
//     }
//   };
//
//   const resetQuiz = () => {
//     setCurrentQuestion(0);
//     setSelectedOption(null);
//     setIsCorrect(null);
//     setScore(0);
//     setQuizCompleted(false);
//   };
//
//   return (
//     <>
//       <Show when={showFireworks()}>
//         <Fireworks />
//       </Show>
//
//       <Show when={!isLoading()} fallback={
//         <div class="flex justify-center py-12">
//           <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
//             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//         </div>
//       }>
//         <div class="bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg p-6">
//           <h2 class="text-2xl font-bold text-white dark:text-white mb-6 text-center">
//             Test Your Understanding
//           </h2>
//
//           <Show
//             when={!quizCompleted()}
//             fallback={
//               <div class="text-center">
//                 <h3 class="text-xl font-bold mb-4 text-white">Quiz Completed!</h3>
//                 <p class="text-lg mb-6 text-white">
//                   Your score: {score()} out of {questions().length}
//                 </p>
//                 <button
//                   onClick={resetQuiz}
//                   class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                 >
//                   Take Again
//                 </button>
//               </div>
//             }
//           >
//             <div class="mb-6 text-white">
//               <h3 class="text-lg font-medium mb-2">
//                 Question {currentQuestion() + 1} of {questions().length}
//               </h3>
//               <p class="text-lg">{questions()[currentQuestion()].question}</p>
//             </div>
//
//             <div class="space-y-3 mb-6">
//               <For each={questions()[currentQuestion()].options}>
//                 {(option, index) => (
//                   <div
//                     class={`p-4 border rounded-md cursor-pointer transition-colors text-white ${selectedOption() === index()
//                       ? 'border-blue-500 bg-blue-900/30 dark:bg-blue-900/30'
//                       : 'border-gray-600 dark:border-gray-600 hover:bg-gray-700/30 dark:hover:bg-gray-700/30'
//                       }`}
//                     onClick={() => handleOptionSelect(index())}
//                   >
//                     {option}
//                   </div>
//                 )}
//               </For>
//             </div>
//
//             <div class="flex justify-between">
//               <Show when={isCorrect() !== null}>
//                 <div
//                   class={`px-4 py-2 rounded-md ${isCorrect()
//                     ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
//                     : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
//                     }`}
//                 >
//                   {isCorrect() ? 'Correct!' : 'Incorrect. Try again!'}
//                 </div>
//               </Show>
//
//               <Show
//                 when={isCorrect() === null}
//                 fallback={
//                   <button
//                     onClick={nextQuestion}
//                     class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ml-auto"
//                   >
//                     {currentQuestion() < questions().length - 1 ? 'Next Question' : 'See Results'}
//                   </button>
//                 }
//               >
//                 <button
//                   onClick={checkAnswer}
//                   disabled={selectedOption() === null}
//                   class={`px-6 py-2 rounded-md transition-colors ml-auto ${selectedOption() === null
//                     ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
//                     : 'bg-blue-600 text-white hover:bg-blue-700'
//                     }`}
//                 >
//                   Check Answer
//                 </button>
//               </Show>
//             </div>
//           </Show>
//         </div>
//       </Show>
//     </>
//   );
// }
