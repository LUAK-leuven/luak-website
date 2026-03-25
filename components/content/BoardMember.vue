<script setup lang="ts">
  defineProps<{
    name: string;
    role: string;
    picture: string;
  }>();
</script>
<template>
  <div class="card card-compact w-fit bg-base-100 shadow-xl">
    <figure>
      <!-- use the custom-img class to prevent nuxt-content styling messing up stuff -->
      <NuxtImg class="object-cover w-full custom-img" :src="picture" />
    </figure>
    <div class="card-body">
      <h3 class="card-title my-0">{{ name }}</h3>
      <p class="mb-0">
        <em>{{ role }}</em>
      </p>
    </div>
  </div>
</template>
