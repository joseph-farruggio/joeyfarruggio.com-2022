import Alpine from "alpinejs";
import intersect from "@alpinejs/intersect";
import persist from "@alpinejs/persist";
import initVimeoPlayer from "./components/VimeoPlayer";

Alpine.plugin(intersect);
Alpine.plugin(persist);

document.addEventListener("alpine:init", () => {
  Alpine.data("app", () => ({
    dark: true,
    showAll: false,

    showTestimonials() {
      this.showAll = !this.showAll;
      if (!this.showAll) {
        document.getElementById("testimonials").scrollIntoView({
          behavior: "smooth",
        });
      }
    },

    toggleTheme() {
      if (window.localStorage.theme != "dark") {
        document.documentElement.classList.add("dark");
        window.localStorage.theme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        window.localStorage.theme = "light";
      }

      console.log(window.localStorage.theme);

      this.dark = !this.dark;
    },

    init() {
      if (
        window.localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        this.dark = true;
      } else {
        this.dark = false;
      }
    },
  }));
});

initVimeoPlayer();

window.Alpine = Alpine;
Alpine.start();
