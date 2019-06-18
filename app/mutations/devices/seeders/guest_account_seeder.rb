module Devices
  module Seeders
    class GuestAccountSeeder < ExpressXlOneZero
      BASE_URL = "/app-resources/img/demo_accounts/"
      FEEDS = {
        "Express" => "Express_Demo_Webcam.JPG",
        "Express XL" => "Express_XL_Demo_Webcam.JPG",
        "Genesis" => "Genesis_Demo_Webcam.jpg",
        "Genesis XL" => "Genesis_XL_Demo_Webcam.jpg",
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
