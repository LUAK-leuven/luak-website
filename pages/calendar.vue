<template>
  <main>
    <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
      <h1 class="w-full text-center text-5xl mt-28 p-10 fixed z-0">Calendar</h1>
      <div
        class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 rounded mb-28 z-10 mt-72 flex justify-center p-10"
      >
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FBrussels&showTabs=0&showTitle=0&showPrint=0&showCalendars=0&src=bmhsNGlmbXJpczlvZXB0OGloYTB2ZTI2anNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23EF6C00"
          style="border-width: 0"
          width="800"
          height="600"
          frameborder="0"
          scrolling="no"
        />
      </div>
    </div>
  </main>
</template>
