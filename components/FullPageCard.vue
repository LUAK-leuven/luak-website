<template>
  <main>
    <div
      class="relative w-full flex flex-col flex-wrap items-center bg-base-300">
      <h1 class="w-full text-center text-5xl mt-16 mb-10">
        <slot name="title" />
      </h1>
      <div
        class="relative bg-base-100 shadow-md md:w-9/12 w-11/12 shrink-0 grow-0 rounded-2xl mb-28 p-10">
        <div class="empty:hidden mb-4 ml-4 mr-4 text-center break-words">
          <slot name="subtitle" />
        </div>
        <hr v-if="$slots.subtitle" />
        <slot />
      </div>
    </div>
  </main>
</template>
