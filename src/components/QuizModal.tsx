import { Show, type JSX, createEffect, onCleanup } from 'solid-js'; // Import createEffect, onCleanup

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
  title?: string;
}

export default function Modal(props: ModalProps) {
  const handleBackgroundClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      props.onClose();
    }
  };

  // Effect to handle Escape key press
  createEffect(() => {
    if (!props.isOpen) return; // Only add listener when modal is open

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        props.onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup listener when modal closes or component unmounts
    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  });


  return (
    <Show when={props.isOpen}>
      {/* Overlay */}
      <div
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackgroundClick}
      >
        {/* Modal Content */}
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
          {/* ... (Close button, title, children - unchanged) ... */}
          <button
            onClick={props.onClose}
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors z-50"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Optional Title */}
          <Show when={props.title}>
            <h2 class="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
              {props.title}
            </h2>
          </Show>

          {/* Modal Body (where the quiz will go) */}
          <div class="p-4 md:p-6">
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
}

// // src/components/Modal.tsx
// import { Show, type JSX } from 'solid-js';
//
// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   children: JSX.Element;
//   title?: string;
// }
//
// export default function Modal(props: ModalProps) {
//   const handleBackgroundClick = (event: MouseEvent) => {
//     // Close only if the click is directly on the background, not the content
//     if (event.target === event.currentTarget) {
//       props.onClose();
//     }
//   };
//
//   return (
//     <Show when={props.isOpen}>
//       {/* Overlay */}
//       <div
//         class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
//         onClick={handleBackgroundClick} // Close on background click
//       >
//         {/* Modal Content */}
//         <div class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
//           {/* Close Button */}
//           <button
//             onClick={props.onClose}
//             class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors z-50"
//             aria-label="Close modal"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
//               <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//
//           {/* Optional Title */}
//           <Show when={props.title}>
//             <h2 class="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
//               {props.title}
//             </h2>
//           </Show>
//
//           {/* Modal Body (where the quiz will go) */}
//           <div class="p-4 md:p-6">
//             {props.children}
//           </div>
//         </div>
//       </div>
//     </Show>
//   );
// }
