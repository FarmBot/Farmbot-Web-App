module Devices
  module Seeders
    class StressData
      include Constants

      PRODUCT_LINES = {
        "genesis_xl_1.8_stress_250" => 250,
        "genesis_xl_1.8_stress_500" => 500,
        "genesis_xl_1.8_stress_750" => 750,
        "genesis_xl_1.8_stress_1000" => 1_000,
      }.freeze

      CROP_DATA = [
        %w[Spinach spinach],
        %w[Broccoli broccoli],
        %w[Beet beet],
      ].freeze

      IMAGE_PATH = Rails.public_path.join("soil.png")

      attr_reader :device, :count

      def self.count_for(product_line)
        PRODUCT_LINES[product_line]
      end

      def self.stress?(product_line)
        count_for(product_line).present?
      end

      def initialize(device, count)
        @device = device
        @count = count
      end

      def seed!
        [plant_rows, soil_height_rows, weed_rows].each do |rows|
          Point.insert_all!(rows)
        end
        Image.insert_all!(image_rows, returning: %w[id]).then do |result|
          attach_images(result.rows.flatten)
        end
        SensorReading.insert_all!(sensor_reading_rows)
        update_demo_settings
      end

      private

      def plant_rows
        count.times.map do |i|
          crop_name, slug = CROP_DATA[i % CROP_DATA.length]
          x, y = coordinate(i)
          timestamp = timestamp(i)
          {
            created_at: timestamp,
            updated_at: timestamp,
            device_id: device.id,
            pointer_type: "Plant",
            name: crop_name,
            openfarm_slug: slug,
            plant_stage: i.even? ? "planted" : "planned",
            planted_at: timestamp,
            radius: 25,
            depth: 5,
            x: x,
            y: y,
            z: 0,
            meta: {},
          }
        end
      end

      def soil_height_rows
        count.times.map do |i|
          x, y = coordinate(i, x_offset: 35, y_offset: 20)
          timestamp = timestamp(i)
          {
            created_at: timestamp,
            updated_at: timestamp,
            device_id: device.id,
            pointer_type: "GenericPointer",
            name: "Soil Height",
            radius: 0,
            x: x,
            y: y,
            z: -550 + (i % 101),
            meta: { color: "gray", at_soil_level: "true" },
          }
        end
      end

      def weed_rows
        count.times.map do |i|
          x, y = coordinate(i, x_offset: 70, y_offset: 40)
          timestamp = timestamp(i)
          {
            created_at: timestamp,
            updated_at: timestamp,
            device_id: device.id,
            pointer_type: "Weed",
            name: "Stress Weed #{i + 1}",
            plant_stage: "active",
            radius: 20 + (i % 6),
            x: x,
            y: y,
            z: 0,
            meta: { color: i.even? ? "red" : "yellow" },
          }
        end
      end

      def image_rows
        count.times.map do |i|
          x, y = coordinate(i, x_offset: 105, y_offset: 60)
          timestamp = timestamp(i)
          {
            created_at: timestamp,
            updated_at: timestamp,
            device_id: device.id,
            attachment_processed_at: timestamp,
            meta: { x: x, y: y, z: 0, name: "Stress Image #{i + 1}" }.to_yaml,
          }
        end
      end

      def sensor_reading_rows
        count.times.map do |i|
          x, y = coordinate(i, x_offset: 140, y_offset: 80)
          timestamp = timestamp(i)
          {
            created_at: timestamp,
            updated_at: timestamp,
            read_at: timestamp,
            device_id: device.id,
            pin: 59,
            mode: ANALOG,
            value: 300 + ((i * 37) % 600),
            x: x,
            y: y,
            z: 0,
          }
        end
      end

      def attach_images(image_ids)
        blob = File.open(IMAGE_PATH) do |file|
          ActiveStorage::Blob.create_and_upload!(
            io: file,
            filename: "stress-soil.png",
            content_type: "image/png",
          )
        end
        rows = image_ids.map do |image_id|
          {
            name: "attachment",
            record_type: "Image",
            record_id: image_id,
            blob_id: blob.id,
            created_at: Time.now,
          }
        end
        ActiveStorage::Attachment.insert_all!(rows)
      end

      def update_demo_settings
        device.update!(max_images_count: count)
        device.web_app_config.update!(
          show_images: true,
          show_points: true,
          show_plants: true,
          show_sensor_readings: true,
          show_moisture_interpolation_map: true,
          show_weeds: true,
          show_spread: true,
          three_d_garden: true,
        )
      end

      def coordinate(index, x_offset: 0, y_offset: 0)
        col_count = Math.sqrt(count).ceil
        row_count = (count.to_f / col_count).ceil
        col = index % col_count
        row = index / col_count
        [
          clamp(100 + col * x_spacing(col_count) + x_offset, map_size_x),
          clamp(100 + row * y_spacing(row_count) + y_offset, map_size_y),
        ].map(&:round)
      end

      def x_spacing(col_count)
        span(map_size_x).fdiv([col_count - 1, 1].max)
      end

      def y_spacing(row_count)
        span(map_size_y).fdiv([row_count - 1, 1].max)
      end

      def span(axis_length)
        [axis_length - 200, 1].max
      end

      def clamp(value, max)
        value.clamp(0, max)
      end

      def map_size_x
        @map_size_x ||= device.web_app_config.map_size_x
      end

      def map_size_y
        @map_size_y ||= device.web_app_config.map_size_y
      end

      def timestamp(index)
        @timestamp ||= Time.now
        @timestamp - index.seconds
      end
    end
  end
end
