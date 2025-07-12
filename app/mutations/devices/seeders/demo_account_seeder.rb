module Devices
  module Seeders
    class DemoAccountSeeder < AbstractSeeder
      BASE_URL = "/app-resources/img/demo_accounts/"
      FEEDS = {
        "Express XL" => "Express_XL_Demo_Webcam.JPG",
        "Express" => "Express_Demo_Webcam.JPG",
        "Genesis XL" => "Genesis_XL_Demo_Webcam.jpg",
        "Genesis" => "Genesis_Demo_Webcam.jpg",
      }
      UNUSED_ALERTS = ["api.seed_data.missing", "api.user.not_welcomed"]

      def feed(product_line)
        feed_name = ""
        feed_name += "Genesis" if product_line.include?("genesis")
        feed_name += "Express" if product_line.include?("express")
        feed_name += " XL" if product_line.include?("xl")
        feed_name
      end

      def create_webcam_feed(product_line)
        feed_name = feed(product_line)
        WebcamFeeds::Create.run!({ name: feed_name,
                                   url: BASE_URL + FEEDS[feed_name],
                                   device: device })
      end

      def add_plants(product_line)
        spinach_row_count = product_line.include?("xl") ? 28 : 13
        spinach_col_count = product_line.include?("genesis_xl") ? 4 : 2
        (0..(spinach_row_count - 1)).map do |i|
          (0..(spinach_col_count - 1)).map do |j|
            Points::Create.run!(device: device,
                                pointer_type: "Plant",
                                name: "Spinach",
                                openfarm_slug: "spinach",
                                plant_stage: "planned",
                                x: 400 + i * 200,
                                y: 100 + j * 200 + (j > 1 ? 2100 : 0),
                                z: 0)
          end
        end
        broccoli_row_count = product_line.include?("xl") ? 9 : 4
        broccoli_col_count = if product_line.include?("genesis_xl")
            3
          elsif product_line.include?("xl")
            2
          else
            1
          end
        (0..(broccoli_row_count - 1)).map do |i|
          (0..(broccoli_col_count - 1)).map do |j|
            Points::Create.run!(device: device,
                                pointer_type: "Plant",
                                name: "Broccoli",
                                openfarm_slug: "broccoli",
                                plant_stage: "planned",
                                x: 600 + i * 600,
                                y: 700 + j * 600 + (j > 0 ? 300 : 0),
                                z: 0)
          end
        end
        beet_row_count = product_line.include?("xl") ? 57 : 27
        beet_col_count = product_line.include?("xl") ? 2 : 2
        (0..(beet_row_count - 1)).map do |i|
          (0..(beet_col_count - 1)).map do |j|
            Points::Create.run!(device: device,
                                pointer_type: "Plant",
                                name: "Beet",
                                openfarm_slug: "beet",
                                plant_stage: "planned",
                                x: 200 + i * 100,
                                y: 1100 + j * 100 + (j > 1 ? 200 : 0),
                                z: 0)
          end
        end
      end

      def add_soil_height_points(product_line)
        (0..3).each do |i|
          (0..3).each do |j|
            Points::Create.run!(device: device,
                      pointer_type: "GenericPointer",
                      name: "Soil Height",
                      x: rand(0..(product_line.include?("xl") ? 5700 : 2700)),
                      y: rand(0..(product_line.include?("xl") ? 2700 : 1200)),
                      z: rand(-550..-450),
                      radius: 0,
                      meta: { color: "gray", at_soil_level: "true" })
          end
        end
      end

      def add_point_groups
        add_point_group(name: "Spinach plants", openfarm_slug: "spinach")
        add_point_group(name: "Broccoli plants", openfarm_slug: "broccoli")
        add_point_group(name: "Beet plants", openfarm_slug: "beet")
      end

      def marketing_bulletin
        GlobalBulletin.find_or_create_by(slug: "buy-a-farmbot") do |gb|
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
      end

      DEMO_ALERTS = [
        Alert::DEMO,
        Alert::BULLETIN.merge(slug: "buy-a-farmbot", priority: 9999),
      ]

      DEMO_LOGS = [
        {message: "Your FarmBot says hi!", type: "fun", verbosity: 3},
      ]

      # Note: At the time of publish, FBOS v8.0.0
      # was the latest release. We are setting
      # demo accounts to v100 because:
      #  * We don't want to update this value
      #    on every FBOS release.
      #  * We don't want demo users hitting bugs
      #    by setting their account to the beta
      #    tester FBOS version `1000.0.0`.
      READ_COMMENT_ABOVE = "100.0.0"

      def before_product_line_seeder
        device
          .web_app_config
          .update!(
            discard_unsaved: true,
            three_d_garden: true,
            show_points: false
          )
        device
          .fbos_config
          .update!(
            safe_height: -200,
          )
      end

      def after_product_line_seeder(product_line)
        create_webcam_feed(product_line)
        add_plants(product_line)
        add_soil_height_points(product_line)
        add_point_groups

        marketing_bulletin
        device.alerts.where(problem_tag: UNUSED_ALERTS).destroy_all
        DEMO_ALERTS
          .map { |p| p.merge(device: device) }
          .map { |p| Alerts::Create.run!(p) }
        DEMO_LOGS
          .map { |p| p.merge(device: device) }
          .map { |p| Logs::Create.run!(p) }
        device
          .update!(fbos_version: READ_COMMENT_ABOVE)
      end
    end
  end
end
