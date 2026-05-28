import "farmbot/dist/resources/configs/web_app";

declare module "farmbot/dist/resources/configs/web_app" {
  interface WebAppConfig {
    top_down_view: boolean;
    viewpoint_heading: number;
  }
}
