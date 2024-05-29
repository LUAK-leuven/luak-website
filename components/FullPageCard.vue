<template>
    <main>
        <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
          <h1 class="w-full text-center text-5xl mt-5 p-10">
            <slot name="title"/>
          </h1>
          <div
            class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 rounded mb-28 z-10"
          >
            <div class="p-10">
              <slot/>
            </div>
          </div>
        </div>
    </main>
  </template>
  