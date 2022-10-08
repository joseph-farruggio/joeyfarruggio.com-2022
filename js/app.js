import Alpine from "alpinejs";
import intersect from "@alpinejs/intersect";
import persist from "@alpinejs/persist";

Alpine.plugin(intersect);
Alpine.plugin(persist);

document.addEventListener("alpine:init", () => {
  Alpine.data("app", () => ({}));

  Alpine.data("visibleNavHighlighter", () => ({
    headings: undefined,
    visibleHeadingId: null,

    init() {
      // Grab all the headings inside the main container.
      this.headings = document.querySelectorAll(
        "h2:not(.ignore-toc), h3:not(.ignore-toc), h4:not(.ignore-toc)"
      );

      this.assignHeadingIds();

      this.onScroll();
    },

    assignHeadingIds() {
      // If a heading doesn't have an [id], we'll give it one
      // based on its text content.
      this.headings.forEach((heading) => {
        if (heading.id) return;

        heading.id = heading.textContent.replace(/\s+/g, "-").toLowerCase();
      });
    },

    onScroll() {
      // We're gonna highlight the first heading above an imaginary
      // drawn horizontally across the center of the screen.

      // Get the distance from the top of that line.
      let relativeTop = window.innerHeight / 2;

      let headingsByDistanceFromTop = {};

      // Populate an object of headings by their distance from our
      // imaginary lines as the keys.
      this.headings.forEach((heading) => {
        headingsByDistanceFromTop[
          heading.getBoundingClientRect().top - relativeTop
        ] = heading;
      });

      // Grab the first one that is above that line.
      let closestNegativeTop = Math.max(
        ...Object.keys(headingsByDistanceFromTop).filter((top) => top < 0)
      );

      // If we couldn't find one, don't highlight anything.
      if (
        closestNegativeTop >= 0 ||
        [Infinity, NaN, -Infinity].includes(closestNegativeTop)
      )
        return (this.visibleHeadingId = null);

      // Otherwise, highlight that heading.
      this.visibleHeadingId = headingsByDistanceFromTop[closestNegativeTop].id;
    },
  }));

  Alpine.store("showToc", false);
});

window.Alpine = Alpine;
Alpine.start();
