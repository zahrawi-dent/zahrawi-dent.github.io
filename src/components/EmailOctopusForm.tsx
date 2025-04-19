// EmailOctopusForm.tsx
import { createSignal, onMount, onCleanup, Show } from "solid-js";

// Define types for form props
type EmailOctopusFormProps = {
  formActionUrl: string;
  emailFieldName?: string;
  firstNameFieldName?: string;
  lastNameFieldName?: string;
  honeypotFieldName: string;
  recaptchaSiteKey: string;
};

// Default values for the form
// const DEFAULT_FORM_ACTION = import.meta.env.VITE_EMAIL_OCTOPUS_FORM_ACTION || "";
// const DEFAULT_HONEYPOT_FIELD = import.meta.env.VITE_EMAIL_OCTOPUS_HONEYPOT_FIELD || "";
// const DEFAULT_RECAPTCHA_SITE_KEY = import.meta.env.VITE_EMAIL_OCTOPUS_RECAPTCHA_SITE_KEY || "";

const DEFAULT_EMAIL_FIELD = "field_0";
const DEFAULT_FIRST_NAME_FIELD = "field_1";
const DEFAULT_LAST_NAME_FIELD = "field_2";


// Form message types
type MessageType = "success" | "error" | "info" | null;

// Define the main component
export default function EmailOctopusForm(props: EmailOctopusFormProps) {
  // Use provided props or default values
  const formAction = props.formActionUrl;
  const emailField = props.emailFieldName || DEFAULT_EMAIL_FIELD;
  const firstNameField = props.firstNameFieldName || DEFAULT_FIRST_NAME_FIELD;
  const lastNameField = props.lastNameFieldName || DEFAULT_LAST_NAME_FIELD;
  const honeypotField = props.honeypotFieldName;
  const recaptchaSiteKey = props.recaptchaSiteKey;

  // Form state
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [messageType, setMessageType] = createSignal<MessageType>(null);

  // Set up global callback function for reCAPTCHA
  const handleFormSubmit = async (token: string) => {
    const form = document.getElementById("emailoctopus-custom-form") as HTMLFormElement;
    if (!form) {
      setMessage("Form elements not found for submission.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("Submitting...");
    setMessageType("info");

    const formData = new FormData(form);

    // Handle recaptcha response
    if (formData.has("g-recaptcha-response")) {
      formData.set("recaptcha-response", formData.get("g-recaptcha-response") as string);
      formData.delete("g-recaptcha-response");
    }

    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.append(key, value.toString());
    }

    try {
      const response = await fetch(formAction, {
        method: "POST",
        body: params,
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.warn("Response was not JSON. Status:", response.status);
        const textResponse = await response.text();
        console.warn("Response text:", textResponse);
        responseData = {
          success: response.ok,
          message: `Server responded with status ${response.status}.`,
        };
      }

      if (response.ok && responseData.success) {
        setMessage("Success! You are subscribed (or check your email for confirmation).");
        setMessageType("success");
        form.reset();
      } else {
        console.error("Submission failed:", response.status, responseData);
        setMessage(responseData.message ||
          `Submission failed. Please check your details and try again. (Status: ${response.status})`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Network error during submission:", error);
      setMessage("A network error occurred. Please check your connection and try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);

      // Reset reCAPTCHA if needed
      if (typeof window.grecaptcha !== "undefined") {
        try {
          window.grecaptcha.reset();
        } catch (e) {
          console.warn("Could not reset grecaptcha", e);
        }
      }
    }
  };

  // Initialize reCAPTCHA on component mount
  onMount(() => {
    // Load reCAPTCHA script dynamically
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Set up global callback function for reCAPTCHA
    window.onSubmitWithRecaptcha = (token: string) => {
      handleFormSubmit(token);
    };

    onCleanup(() => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Clean up the global function
      delete window.onSubmitWithRecaptcha;
    });
  });

  // Form submission handler
  // Handle initial form submission - initiates reCAPTCHA
  const initFormSubmit = (e: Event) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");
    setMessageType(null);

    // Check form validity
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Execute reCAPTCHA
    if (typeof window.grecaptcha !== "undefined") {
      try {
        window.grecaptcha.execute();
      } catch (error) {
        console.error("Error executing reCAPTCHA:", error);
        setMessage("Could not initiate reCAPTCHA. Please try again.");
        setMessageType("error");
      }
    } else {
      console.error("grecaptcha is not defined. Check API script loading.");
      setMessage("reCAPTCHA script not loaded. Please refresh.");
      setMessageType("error");
    }
  };



  // Get appropriate CSS classes for message display
  const getMessageClasses = () => {
    const baseClasses = "py-2 px-4 rounded-lg text-center";

    switch (messageType()) {
      case "success":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case "error":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case "info":
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      default:
        return `${baseClasses} hidden`;
    }
  };

  return (
    <div class="w-full max-w-md mx-auto bg-grey-900 rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
      <div class="p-8">
        <h2 class="text-2xl font-bold text-center mb-6 text-white">Subscribe to our Newsletter</h2>

        <form
          method="post"
          action={formAction}
          id="emailoctopus-custom-form"
          class="space-y-6"
          onSubmit={initFormSubmit}
        >
          {/* Email Field */}
          <div class="form-group">
            <label for="eo-email-field" class="block text-sm font-medium text-white mb-1">
              Email Address <span class="text-red-500">*</span>
            </label>
            <input
              id="eo-email-field"
              name={emailField}
              type="email"
              placeholder="your@email.com"
              required
              class="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            />
          </div>

          {/* First Name Field */}
          <div class="form-group">
            <label for="eo-fname-field" class="block text-sm font-medium text-white mb-1">
              First Name
            </label>
            <input
              id="eo-fname-field"
              name={firstNameField}
              type="text"
              placeholder="John"
              class="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            />
          </div>

          {/* Last Name Field */}
          <div class="form-group">
            <label for="eo-lname-field" class="block text-sm font-medium text-white mb-1">
              Last Name
            </label>
            <input
              id="eo-lname-field"
              name={lastNameField}
              type="text"
              placeholder="Doe"
              class="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            />
          </div>

          {/* Honeypot field (hidden) */}
          <div class="eo-hp-field" aria-hidden="true" style="position: absolute; left: -5000px;">
            <input
              type="text"
              name={honeypotField}
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          {/* Status Message Area */}
          <div
            id="eo-form-message"
            class={getMessageClasses()}
            role="status"
          >
            {message()}
          </div>

          {/* Submit Button with matching gradient style */}
          <div class="text-center">
            <button
              type="submit"
              class="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 text-lg font-bold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 g-recaptcha"
              data-sitekey={recaptchaSiteKey}
              data-callback="onSubmitWithRecaptcha"
              data-action="submit"
              disabled={isSubmitting()}
            >
              {isSubmitting() ? "Submitting..." : "Submit"}
            </button>
          </div>

          {/* reCAPTCHA Notice */}
          <div class="text-center">
            <small class="text-xs text-gray-500">
              This site is protected by reCAPTCHA and the Google
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:text-blue-700 transition-colors ml-1"
              >Privacy Policy</a> and
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:text-blue-700 transition-colors ml-1"
              >Terms of Service</a> apply.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add window interface augmentation for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
    onSubmitWithRecaptcha: (token: string) => Promise<void>;
  }
}
