import { Portal } from 'solid-js/web';
import { createSignal, Show, onCleanup, createEffect } from 'solid-js'; // Import createEffect
import { Dynamic } from 'solid-js/web';
import Modal from '../components/QuizModal';

interface QuizButtonProps {
  postId: string;
  postTitle: string;
}

export default function QuizButton(props: QuizButtonProps) {
  const [showModal, setShowModal] = createSignal(false);
  const [QuizComponent, setQuizComponent] = createSignal<any>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isComponentLoaded, setIsComponentLoaded] = createSignal(false);

  // Effect to control body scrolling
  createEffect(() => {
    if (showModal()) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    // Cleanup function to ensure the class is removed if the component unmounts while modal is open
    onCleanup(() => {
      document.body.classList.remove('modal-open');
    });
  });


  const openQuizModal = async () => {
    // ... (rest of the openQuizModal logic is unchanged)
    if (!isComponentLoaded()) {
      setIsLoading(true);
      try {
        const module = await import('./ArticleQuiz');
        setQuizComponent(() => module.default);
        setIsComponentLoaded(true);
      } catch (error) {
        console.error("Failed to load quiz component:", error);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }
    setShowModal(true); // This triggers the createEffect above
  };

  const closeQuizModal = () => {
    setShowModal(false); // This triggers the createEffect above
  };

  onCleanup(() => {
    setQuizComponent(null);
    setIsComponentLoaded(false);
    // Ensure cleanup if component is destroyed
    document.body.classList.remove('modal-open');
  });

  return (
    <div class="my-8 py-6 border-t border-gray-200 dark:border-gray-700">
      {/* ... (rest of the component is unchanged) ... */}
      <div class="flex flex-col items-center justify-center">
        {/* Button to open the modal */}
        <button
          onClick={openQuizModal}
          class="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:text-white dark:focus:ring-blue-800"
          disabled={isLoading()}
        >
          <span class="relative flex items-center space-x-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-800">
            {isLoading() ? (
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <span>Test Your Knowledge</span>
              </>
            )}
          </span>
        </button>
        <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Take a quick quiz about "{props.postTitle}"
        </p>

        {/* Portal wrapping Modal */}
        <Portal mount={document.body}>
          <Modal isOpen={showModal()} onClose={closeQuizModal} title={`Quiz: ${props.postTitle}`}>
            {/* ... modal content ... */}
            <Show when={QuizComponent()}>
              <Dynamic component={QuizComponent()} postId={props.postId} />
            </Show>
            <Show when={!QuizComponent() && isLoading()}>
              <div class="flex justify-center items-center h-40">
                <p class="text-gray-600 dark:text-gray-400">Loading Quiz...</p>
              </div>
            </Show>
          </Modal>
        </Portal>
      </div>
    </div>
  );
}

// import { Portal } from 'solid-js/web'; // 1. Import Portal
// import { createSignal, Show, onCleanup } from 'solid-js';
// import { Dynamic } from 'solid-js/web';
// import Modal from '../components/QuizModal';
//
// interface QuizButtonProps {
//   postId: string;
//   postTitle: string;
// }
//
// export default function QuizButton(props: QuizButtonProps) {
//   const [showModal, setShowModal] = createSignal(false);
//   const [QuizComponent, setQuizComponent] = createSignal<any>(null);
//   const [isLoading, setIsLoading] = createSignal(false);
//   const [isComponentLoaded, setIsComponentLoaded] = createSignal(false);
//
//   const openQuizModal = async () => {
//     if (!isComponentLoaded()) {
//       setIsLoading(true);
//       try {
//         const module = await import('./ArticleQuiz');
//         setQuizComponent(() => module.default);
//         setIsComponentLoaded(true);
//       } catch (error) {
//         console.error("Failed to load quiz component:", error);
//         setIsLoading(false);
//         return;
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     setShowModal(true);
//   };
//
//   const closeQuizModal = () => {
//     setShowModal(false);
//   };
//
//   onCleanup(() => {
//     setQuizComponent(null);
//     setIsComponentLoaded(false);
//   });
//
//   return (
//     <div class="my-8 py-6 border-t border-gray-200 dark:border-gray-700">
//       <div class="flex flex-col items-center justify-center">
//         {/* Button to open the modal */}
//         <button
//           onClick={openQuizModal}
//           class="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:text-white dark:focus:ring-blue-800"
//           disabled={isLoading()}
//         >
//           {/* ... button content (unchanged) ... */}
//           <span class="relative flex items-center space-x-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-800">
//             {isLoading() ? (
//               <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
//                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
//                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : (
//               <>
//                 <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
//                 </svg>
//                 <span>Test Your Knowledge</span>
//               </>
//             )}
//           </span>
//         </button>
//         <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
//           Take a quick quiz about "{props.postTitle}"
//         </p>
//
//         {/* 2. Wrap the Modal component in Portal, mounting it to document.body */}
//         <Portal mount={document.body}>
//           <Modal isOpen={showModal()} onClose={closeQuizModal} title={`Quiz: ${props.postTitle}`}>
//             <Show when={QuizComponent()}>
//               <Dynamic component={QuizComponent()} postId={props.postId} />
//             </Show>
//             <Show when={!QuizComponent() && isLoading()}>
//               <div class="flex justify-center items-center h-40">
//                 <p class="text-gray-600 dark:text-gray-400">Loading Quiz...</p>
//               </div>
//             </Show>
//           </Modal>
//         </Portal>
//       </div>
//     </div>
//   );
// }

// // QuizButton.tsx - A SolidJS component that lazy-loads the quiz
// import { createSignal, Show, createEffect, onCleanup } from 'solid-js';
// import { Dynamic } from 'solid-js/web';
// import { loadFireworksCSS } from '../fireworksService';
//
// interface QuizButtonProps {
//   postId: string;
//   postTitle: string;
// }
//
// export default function QuizButton(props: QuizButtonProps) {
//   const [showQuiz, setShowQuiz] = createSignal(false);
//   const [QuizComponent, setQuizComponent] = createSignal<any>(null);
//   const [isLoading, setIsLoading] = createSignal(false);
//
//   const toggleQuiz = async () => {
//     if (!showQuiz() && !QuizComponent()) {
//       setIsLoading(true);
//       // Load the CSS and component in parallel
//       const [_, module] = await Promise.all([
//         loadFireworksCSS(),
//         import('./ArticleQuiz')
//       ]);
//       setQuizComponent(() => module.default);
//       setIsLoading(false);
//     }
//     setShowQuiz(!showQuiz());
//   };
//
//   // Cleanup function to improve performance
//   onCleanup(() => {
//     setQuizComponent(null);
//   });
//
//   return (
//     <div class="my-8 py-6 border-t border-gray-200 dark:border-gray-700">
//       <div class="flex flex-col items-center justify-center">
//         <Show
//           when={!showQuiz()}
//           fallback={
//             <button
//               onClick={toggleQuiz}
//               class="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-all"
//             >
//               Hide Quiz
//             </button>
//           }
//         >
//           <button
//             onClick={toggleQuiz}
//             class="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:text-white dark:focus:ring-blue-800"
//             disabled={isLoading()}
//           >
//             <span class="relative flex items-center space-x-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-800">
//               {isLoading() ? (
//                 <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
//                   <circle
//                     class="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     stroke-width="4"
//                   ></circle>
//                   <path
//                     class="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//               ) : (
//                 <>
//                   <svg
//                     class="h-5 w-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       stroke-linecap="round"
//                       stroke-linejoin="round"
//                       stroke-width="2"
//                       d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//                     ></path>
//                   </svg>
//                   <span>Test Your Knowledge</span>
//                 </>
//               )}
//             </span>
//           </button>
//           <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
//             Take a quick quiz about "{props.postTitle}"
//           </p>
//         </Show>
//
//         <Show when={showQuiz() && QuizComponent()}>
//           <div class="w-full">
//             <Dynamic component={QuizComponent()} postId={props.postId} />
//           </div>
//         </Show>
//       </div>
//     </div>
//   );
// }
