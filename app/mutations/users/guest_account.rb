module Users
  class GuestAccount < Mutations::Command
    SEED_PATH = "./app/mutations/users/default_guest_data.rb"
    SEED_DATA = eval(File.read(SEED_PATH))

    def run
      # First pass, most important resources ===
      create_user
      update_device

      # Second pass, stuff that's not very relational ===
      create_fbos_config
      create_firmware_config
      create_web_app_config
      create_images
      create_pin_bindings
      create_sensors
      create_webcam_feeds
      create_tools

      # Third pass, relational stuff ===
      create_points
      create_farm_events
      create_logs
      create_peripherals
      create_regimens
      create_sequences
    end

private

    def update_device
      @device = @user.device
      @device.update_attributes!(SEED_DATA[:device])
    end

    def create_fbos_config
      @device.fbos_config.update_attributes!(SEED_DATA[:fbos_config])
    end

    def create_firmware_config
      @device.firmware_config.update_attributes!(SEED_DATA[:firmware_config])
    end

    def create_web_app_config
      @device.web_app_config.update_attributes!(SEED_DATA[:web_app_config])
    end

    def create_tools
      binding.pry
      SEED_DATA[:device]
    end

    def create_points
      binding.pry
      SEED_DATA[:points]
    end

    def create_farm_events
      binding.pry
      SEED_DATA[:farm_events]
    end

    def create_images
      Images::Create.run!(SEED_DATA[:images].merge(device: @device))
    end

    def create_logs
      binding.pry
      SEED_DATA[:logs]
    end

    def create_peripherals
      binding.pry
      SEED_DATA[:peripherals]
    end

    def create_pin_bindings
      binding.pry
      SEED_DATA[:pin_bindings]
    end

    def create_regimens
      binding.pry
      SEED_DATA[:regimens]
    end

    def create_sensors
      binding.pry
      SEED_DATA[:sensors]
    end

    def create_sequences
      binding.pry
      SEED_DATA[:sequences]
    end

    def create_user
      password = SecureRandom.alphanumeric(10)
      email    = "guest#{(User.last.try(:id) || 0) + 2}@farmbot.io"
      params   = SEED_DATA[:user].merge(email: email,
                                        password:              password,
                                        password_confirmation: password,
                                        agree_to_terms:        true)
      Users::Create.run!(params)
      @user    = User.find_by(email: email)
    end

    def create_webcam_feeds
      binding.pry
      SEED_DATA[:webcam_feeds]
    end
  end
end
