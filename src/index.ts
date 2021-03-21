import joplin from "api";

// Entry point for the plugin
joplin.plugins.register({
  onStart: async function () {
    console.info("Toc plugin");
  },
});
