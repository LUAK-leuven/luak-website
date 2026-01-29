<template>
  <div class="relative w-full flex flex-col flex-wrap items-center">
    <h1 class="w-full text-center text-5xl mt-16 mb-10">
      <slot name="title" />
    </h1>
    <page-card>
      <div class="empty:hidden mb-4 ml-4 mr-4 text-center break-words">
        <slot name="subtitle" />
      </div>
      <hr v-if="$slots.subtitle" />
      <slot />
    </page-card>
  </div>
</template>
