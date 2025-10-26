<template>
  <div class="ai-description-container mb-5">
    <div>
      <label for="description" class="form-label">Food Description</label>
      <textarea
        class="form-control"
        id="description"
        v-model="localDescription"
        @input="updateParent"
        rows="4"
        placeholder="Write your own description or click on the button below for AI to generate a description of your dish..."
        :disabled="isGenerating"
      ></textarea>
      <div class="m-0">
        <button
        type="button"
        class="btn btn-outline-primary btn-sm mb-2 mx-0"
        id="generateDescBtn"
        @click="generateDescription"
        :disabled="!canGenerate || isGenerating"
        >
          {{ isGenerating ? "Generating..." : "Generate AI Description ✨" }}
        </button>
        <small class="text-muted d-block">
            <span v-if="!selectedFile">Upload an image first</span>
            <span v-else-if="!foodName">Enter food name to generate description</span>
            <span v-else>✨ Click the button above to generate an AI description</span>
        </small>
      </div>
      
    </div>

    

    
  </div>
</template>



<script setup>
import { ref, computed, watch } from "vue";
import { GoogleGenAI } from "@google/genai";


const props = defineProps({
  selectedFile: File,
  foodName: String,
  description: String,
});
const emit = defineEmits(["update:description"]);

const localDescription = ref(props.description || "");
const isGenerating = ref(false);

watch(
  () => props.description,
  (newVal) => (localDescription.value = newVal)
);

const canGenerate = computed(
  () => props.selectedFile && props.foodName?.trim().length > 0
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
  isGenerating.value = true;

  try {
    // const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });

    // const base64Image = await convertImageToBase64(props.selectedFile);
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
        4. Uses descriptive words that make customers want to order it

        Keep the total description under 200 characters. Make it sound delicious and inviting.`,
    },
  ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    localDescription.value = response.text;
    console.log("Successful generation of food description")
    console.log(response.text)
    updateParent();
  }
   catch (err) {
    console.error("Error generating:", err);
    alert("Error generating description. Check console for details.");
  } finally {
    isGenerating.value = false;
  }
};

// generateDescription(props.selectedFile)
</script>

<style src="./CreateListing.css"></style>