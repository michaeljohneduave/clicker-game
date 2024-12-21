/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "clicker-game",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("Vpc");
    const db = new sst.aws.Postgres("Db", {
      vpc
    });
    const web = new sst.aws.SvelteKit("Web", {
      link: [db],
      vpc
    });
  },
});
