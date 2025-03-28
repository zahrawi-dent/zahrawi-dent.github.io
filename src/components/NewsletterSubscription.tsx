import { createSignal, createEffect } from "solid-js";

interface FormData {
  name: string;
  email: string;
  interests: string[];
  terms: boolean;
}

const NewsletterSubscription = () => {
  const [formData, setFormData] = createSignal<FormData>({
    name: "",
    email: "",
    interests: [],
    terms: false,
  });

  const [submissionStatus, setSubmissionStatus] = createSignal<{
    success: boolean | null;
    message: string;
  }>({
    success: null,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Reset previous submission status
    setSubmissionStatus({ success: null, message: "" });
    setIsSubmitting(true);

    try {
      // Simulate form submission (replace with actual endpoint)
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData()),
      });

      if (response.ok) {
        setSubmissionStatus({
          success: true,
          message: "Thank you for subscribing! Check your email for a confirmation.",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          interests: [],
          terms: false,
        });
      } else {
        throw new Error("Subscription failed");
      }
    } catch (error) {
      setSubmissionStatus({
        success: false,
        message: "Oops! Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="mx-auto max-w-xl rounded-lg bg-gray-800 p-8 shadow-2xl">
      <div class="mb-6 text-center">
        <h2 class="mb-4 text-3xl font-bold text-white">Stay Informed, Stay Healthy</h2>
        <p class="text-gray-400">
          Subscribe to our newsletter for the latest dental insights, tips, and breakthroughs.
        </p>
      </div>

      <form onSubmit={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <label for="name" class="block text-sm text-gray-300">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData().name}
            onInput={(e) => handleInputChange("name", e.currentTarget.value)}
            class="w-full rounded-md bg-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your full name"
          />
        </div>

        <div class="space-y-2">
          <label for="email" class="block text-sm text-gray-300">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData().email}
            onInput={(e) => handleInputChange("email", e.currentTarget.value)}
            class="w-full rounded-md bg-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm text-gray-300">Interests (Optional)</label>
          <div class="grid grid-cols-2 gap-2">
            {[
              { value: "oral-health", label: "Oral Health", color: "text-blue-500" },
              { value: "cosmetic-dentistry", label: "Cosmetic Dentistry", color: "text-purple-500" },
              { value: "dental-tech", label: "Dental Technology", color: "text-green-500" },
              { value: "patient-care", label: "Patient Care", color: "text-red-500" },
            ].map((interest) => (
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData().interests.includes(interest.value)}
                  onChange={() => handleInterestToggle(interest.value)}
                  class={`form-checkbox ${interest.color} border-gray-600 bg-gray-700`}
                />
                <span class="ml-2 text-gray-300">{interest.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div class="space-y-2">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData().terms}
              onChange={() => handleInputChange("terms", !formData().terms)}
              required
              class="form-checkbox border-gray-600 bg-gray-700 text-blue-500"
            />
            <span class="ml-2 text-gray-300">I agree to receive email updates and privacy policy</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting() || !formData().terms}
          class={`w-full transform rounded-md py-3 text-white transition-all duration-300 ease-in-out ${isSubmitting() ? "cursor-not-allowed bg-gray-600" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 hover:from-blue-600 hover:to-purple-700"} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
        >
          {isSubmitting() ? "Submitting..." : "Subscribe to Newsletter"}
        </button>

      </form>

      {submissionStatus().message && (
        <div
          class={`mt-4 rounded-md p-3 text-center ${submissionStatus().success === true ? "bg-green-600 text-white" : "bg-red-600 text-white"
            } `}
        >
          {submissionStatus().message}
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscription;
