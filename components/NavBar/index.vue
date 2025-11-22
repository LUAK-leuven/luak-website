<script setup lang="ts">
  const user = await useLuakMember();
</script>

<template>
  <div class="drawer">
    <input id="my-drawer-3" class="drawer-toggle" type="checkbox" />

    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="flex justify-center top-3 z-40 w-full fixed">
        <div class="navbar bg-base-200 w-11/12 rounded-md">
          <div class="flex-1">
            <NuxtLink class="btn btn-ghost p-1" to="/">
              <NuxtImg class="h-full" src="/luak-logo.png" :quality="50" />
            </NuxtLink>
          </div>
          <div class="flex-none hidden md:block">
            <NavBarMenu class="menu-horizontal px-1 items-center" />
          </div>
          <NavBarHamburgerButton />
        </div>
      </div>
      <slot />
      <div v-if="user.isBoard" class="fab">
        <!-- a focusable div with tabindex is necessary to work on all browsers. role="button" is necessary for accessibility -->
        <div
          class="btn btn-lg btn-circle bg-blue-400 m-1"
          tabindex="0"
          role="button">
          <svg
            class="size-6"
            aria-label="New"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>

        <!-- buttons that show up when FAB is open -->
        <NuxtLink class="btn btn-lg btn-circle text-2xl" to="/board/rental"
          >🧗‍♀️</NuxtLink
        >
        <NuxtLink
          class="btn btn-lg btn-circle text-2xl"
          to="/board/subscriptions-overview"
          >👥</NuxtLink
        >
      </div>
    </div>
    <div class="drawer-side z-50">
      <label
        class="drawer-overlay"
        for="my-drawer-3"
        aria-label="close sidebar" />
      <NavBarMenu class="p-4 w-80 min-h-full bg-base-200" />
    </div>
  </div>
</template>

<style>
  /* From daisyui 5.5.x */
  .fab {
    @layer daisyui.l1.l2.l3 {
      @apply pointer-events-none fixed end-4 bottom-4 z-[999] flex flex-col-reverse items-end gap-2 text-sm whitespace-nowrap;
      > * {
        @apply pointer-events-auto flex items-center gap-2;
        &:hover,
        &:has(:focus-visible) {
          @apply z-[1];
        }
      }
      > [tabindex] {
        &:first-child {
          @apply relative grid;
          transition-property: opacity, visibility, rotate;
          transition-duration: 0.2s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      }

      .fab-close {
        @apply absolute end-0 bottom-0;
      }
      .fab-main-action {
        @apply absolute end-0 bottom-0;
      }
      &:focus-within {
        &:has(.fab-close),
        &:has(.fab-main-action) {
          > [tabindex] {
            @apply rotate-90 opacity-0;
          }
        }
      }
      > :nth-child(n + 2) {
        @apply invisible scale-[80] opacity-0;
        transition-property: opacity, scale, visibility;
        transition-duration: 0.2s;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

        &.fab-main-action,
        &.fab-close {
          @apply scale-100;
        }
      }
      > :nth-child(3) {
        transition-delay: 30ms;
      }
      > :nth-child(4) {
        transition-delay: 60ms;
      }
      > :nth-child(5) {
        transition-delay: 90ms;
      }
      > :nth-child(6) {
        transition-delay: 120ms;
      }
      /* checkbox method experiment - not a good idea because it needs a second click to close */
      /* > label {
    @apply relative;
    > input {
      @apply pointer-events-none absolute inset-0 opacity-0;
    }
  } */
      /* &:has(:checked), */
      &:focus-within {
        > [tabindex]:first-child {
          @apply pointer-events-none;
        }
        > :nth-child(n + 2) {
          @apply visible scale-100 opacity-100;
        }
      }
    }
  }
  .fab-flower {
    @layer daisyui.l1.l2.l3 {
      @apply grid;
      --position: 0rem;
      > *:nth-child(-n + 2) {
        --position: 0rem;
      }
      > * {
        grid-area: 1/1;
        --degree: 180deg;
        --flip-degree: calc(180deg - var(--degree));
        transform: translateX(calc(cos(var(--degree)) * var(--position)))
          translateY(calc(sin(var(--degree)) * calc(-1 * var(--position))));
        [dir='rtl'] & {
          transform: translateX(calc(cos(var(--flip-degree)) * var(--position)))
            translateY(
              calc(sin(var(--flip-degree)) * calc(-1 * var(--position)))
            );
        }
      }
      > :nth-child(n + 7) {
        @apply hidden;
      }
      &:has(:nth-child(3)) {
        --position: 140%;
        > :nth-child(3) {
          --degree: 135deg;
        }
      }
      &:has(:nth-child(4)) {
        --position: 140%;
        > :nth-child(3) {
          --degree: 165deg;
        }
        > :nth-child(4) {
          --degree: 105deg;
        }
      }
      &:has(:nth-child(5)) {
        --position: 180%;
        > :nth-child(3) {
          --degree: 180deg;
        }
        > :nth-child(4) {
          --degree: 135deg;
        }
        > :nth-child(5) {
          --degree: 90deg;
        }
      }
      &:has(:nth-child(6)) {
        --position: 220%;
        > :nth-child(3) {
          --degree: 180deg;
        }
        > :nth-child(4) {
          --degree: 150deg;
        }
        > :nth-child(5) {
          --degree: 120deg;
        }
        > :nth-child(6) {
          --degree: 90deg;
        }
      }
    }
  }
</style>
