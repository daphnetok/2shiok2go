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
            <!-- Loading State -->
            <div v-if="isGenerating" class="ai-preview-loading">
              <LoadingSpinner 
                message="AI is crafting your description..." 
                containerClass="compact-spinner"
                messageClass="mt-2 mb-0 small"
              />
            </div>

            <!-- Generated Content -->
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

const props = defineProps({
  selectedFile: File,
  foodName: String,
  description: String,
  imageUrl: String
});
const emit = defineEmits(["update:description"]);

const localDescription = ref(props.description || "");
const generatedText = ref("");
const showAiPreview = ref(false);
const isGenerating = ref(false);

const canGenerate = ref(false);
watch(
  () => [props.foodName, props.selectedFile, props.imageUrl],
  ([newName, newFile, newImage]) => {
    canGenerate.value = !!newName && (!!newFile || !!newImage);
  },
  { immediate: true }
);

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

    const base64Image = await convertImageToBase64(props.selectedFile);

    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: `You are a professional food menu writer. The dish is called "${props.foodName}". 
          Analyze the image and write an appetizing description in 2-3 sentences that:
          1. Describes the key ingredients visible in the photo
          2. Mentions the cooking style or preparation method
          3. Highlights what makes this dish appealing and delicious
          4. Appeals to Singaporeans

          Keep the total description under 200 characters. Make it sound delicious and inviting.`,
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    generatedText.value = response.text;
    console.log("Successful generation of food description");
    console.log(response.text);
  } catch (err) {
    console.error("Error generating:", err);
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

// generateDescription(props.selectedFile)
</script>

<style scoped>
@import './AIFoodDescription.css';
</style>