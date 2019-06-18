module Devices
  module Seeders
    class DemoAccountSeeder < ExpressXlOneZero
      BASE_URL = "/app-resources/img/demo_accounts/"
      FEEDS = {
        "Express XL" => "Express_XL_Demo_Webcam.JPG",
        "Express" => "Express_Demo_Webcam.JPG",
        "Genesis XL" => "Genesis_XL_Demo_Webcam.jpg",
        "Genesis" => "Genesis_Demo_Webcam.jpg",
      }

      def webcam_feeds
        # device.webcam_feeds.destroy_all!
        FEEDS.map do |(name, url)|
          p = { name: name,
                url: (BASE_URL + url),
                device: device }
          WebcamFeeds::Create.run!(p)
        end
      end
    end
  end
end
