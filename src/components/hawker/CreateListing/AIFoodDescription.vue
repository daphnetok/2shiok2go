<template>
  <div class="ai-description-container mb-5">
    <label for="description" class="form-label">Description</label>
    
    <div class="description-layout" :class="{ 'has-ai-preview': showAiPreview }">
      <!-- User's Description Textarea -->
      <div class="user-description-section">
        <textarea
          class="form-control"
          style="height: 150px"
          id="description"
          v-model="localDescription"
          @input="updateParent"
          rows="4"
          placeholder="Add a short description of your dish"
          :disabled="isGenerating"
        ></textarea>
        
        <button
          type="button"
          class="generate-btn m-0"
          id="generateDescBtn"
          @click="generateDescription"
          :disabled="!canGenerate || isGenerating"
        >
          <i class="fas fa-wand-magic-sparkles"></i>
          <span>{{ isGenerating ? "Generating..." : "Generate AI Description" }}</span>
        </button>
      </div>

      <!-- AI Generated Preview (appears on the right) -->
      <transition name="slide-fade">
        <div v-if="showAiPreview" class="ai-preview-section">
          <div class="ai-preview-card">
            <div v-if="isGenerating" class="ai-preview-loading">
              <LoadingSpinner 
                message="AI is crafting your description..." 
                containerClass="compact-spinner"
                messageClass="mt-2 mb-0 small"
              />
            </div>

            <div v-else class="ai-preview-content">
              <div class="ai-preview-header">
                <div class="ai-badge">
                  <span>✨AI Generated</span>
                </div>
                <button 
                  type="button" 
                  class="ai-close-btn" 
                  @click="closeAiPreview"
                  title="Close preview"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="ai-preview-text">
                <p>{{ generatedText }}</p>
              </div>

              <div class="ai-preview-actions">
                <button 
                  type="button" 
                  class="ai-action-btn ai-btn-use"
                  @click="useAiDescription"
                >
                  <i class="fas fa-check"></i>
                  <span>Use This</span>
                </button>
                <button 
                  type="button" 
                  class="ai-action-btn ai-btn-regenerate"
                  @click="generateDescription"
                  :disabled="isGenerating"
                >
                  <i class="fas fa-rotate"></i>
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Hints -->
    <small v-if="!canGenerate" class="text-muted d-block mt-2 mx-2">
      <i class="fas fa-info-circle"></i>
      <span v-if="!props.selectedFile && !props.imageUrl">Upload an image first</span>
      <span v-else-if="!props.foodName">Enter food name to generate description</span>
    </small>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { GoogleGenAI } from "@google/genai";
import LoadingSpinner from "@/components/shared/LoadingSpinner.vue";

// Firebase Storage SDK
import { getStorage, ref as storageRef, getBlob } from "firebase/storage";



const props = defineProps({
  selectedFile: File,
  imageUrl: String,
  foodName: String,
  description: String,
});
const emit = defineEmits(["update:description"]);

const localDescription = ref(props.description || "");
const generatedText = ref("");
const showAiPreview = ref(false);
const isGenerating = ref(false);

// Button enabled if user has a file or existing image URL AND food name
const canGenerate = computed(() => (props.selectedFile || props.imageUrl) && props.foodName?.trim().length > 0);

const updateParent = () => emit("update:description", localDescription.value);

const convertImageToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });

const generateDescription = async () => {
  if (!canGenerate.value) return;

  showAiPreview.value = true;
  isGenerating.value = true;
  generatedText.value = "";

  try {
    const ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });

    let base64Image = "";

    // Helper: convert a Blob or File to base64
    const convertToBase64 = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });

    // 🕓 Timeout wrapper — fallback after 8 seconds
    const withTimeout = (promise, ms = 8000) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), ms)
        ),
      ]);

    // --- Determine source of image ---
    if (props.selectedFile instanceof Blob) {
      // User uploaded a new image
      base64Image = await convertToBase64(props.selectedFile);
    } else if (props.imageUrl) {
      try {
        const storage = getStorage();
        const path = props.imageUrl.includes("/o/")
          ? decodeURIComponent(props.imageUrl.split("/o/")[1].split("?")[0])
          : props.imageUrl;

        const imageRef = storageRef(storage, path);

        // ⏳ Attempt to fetch image with timeout
        const blob = await withTimeout(getBlob(imageRef), 10000);
        base64Image = await convertToBase64(blob);
      } catch (err) {
        if (err.message === "timeout") {
          console.warn("⏰ Image fetch timed out after 8s — using text-only mode");
        } else {
          console.warn("⚠️ Could not load image from Firebase Storage:", err);
        }
        base64Image = null; // fall back to text-only
      }
    }

    // --- Build Gemini prompt ---
    const contents = [];

    if (base64Image) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      });
    }

    contents.push({
      text: `You are a professional food menu writer. The dish is called "${props.foodName}". 
        ${base64Image ? "Analyze the image and" : "Based only on the dish name,"} 
        write an appetizing description in 2-3 sentences that:
        1. Describes key ingredients (if known)
        2. Mentions cooking style or preparation
        3. Highlights what makes it appealing
        4. Appeals to Singaporeans
        Keep it under 200 characters and make it sound delicious.`,
    });

    // --- Generate description ---
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    generatedText.value = response.text?.trim() || "No description generated.";
    console.log("✅ Generated food description:", generatedText.value);
  } catch (err) {
    console.error("Error generating AI description:", err);
    alert("Error generating description. Please try again.");
    showAiPreview.value = false;
  } finally {
    isGenerating.value = false;
  }
};


const useAiDescription = () => {
  localDescription.value = generatedText.value;
  updateParent();
  showAiPreview.value = false;
};

const closeAiPreview = () => {
  showAiPreview.value = false;
};
</script>

<style scoped>
@import './AIFoodDescription.css';
</style>