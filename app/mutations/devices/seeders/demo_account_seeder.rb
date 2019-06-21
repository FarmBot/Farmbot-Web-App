module Devices
  module Seeders
    class DemoAccountSeeder < ExpressOneZero
      BASE_URL = "/app-resources/img/demo_accounts/"
      FEEDS = {
        "Express XL" => "Express_XL_Demo_Webcam.JPG",
        "Express" => "Express_Demo_Webcam.JPG",
        "Genesis XL" => "Genesis_XL_Demo_Webcam.jpg",
        "Genesis" => "Genesis_Demo_Webcam.jpg",
      }
      UNUSED_ALERTS = ["api.seed_data.missing", "api.user.not_welcomed"]

      def webcam_feeds
        # device.webcam_feeds.destroy_all!
        FEEDS.map do |(name, url)|
          p = { name: name,
                url: (BASE_URL + url),
                device: device }
          WebcamFeeds::Create.run!(p)
        end
      end

      MARKETING_BULLETIN = GlobalBulletin.find_or_create_by(slug: "buy-a-farmbot") do |gb|
        gb.href = "https://farm.bot"
        gb.href_label = "Visit our website"
        gb.slug = "buy-a-farmbot"
        gb.title = "Buy a FarmBot"
        gb.type = "info"
        gb.content = [
          "Ready to get a FarmBot of your own? Check out our website to",
          " learn more about our various products. We offer FarmBots at",
          " all different price points, sizes, and capabilities so you'",
          "re sure to find one that suits your needs.",
        ].join("")
      end

      DEMO_ALERTS = [
        Alert::DEMO,
        Alert::BULLETIN.merge(slug: "buy-a-farmbot", priority: 9999),
      ]

      def misc
        device.alerts.where(problem_tag: UNUSED_ALERTS).destroy_all
        DEMO_ALERTS
          .map { |p| p.merge(device: device) }
          .map { |p| Alerts::Create.run!(p) }
      end
    end
  end
end
