module Devices
  class SeedData < Mutations::Command
    PRODUCT_LINES = ["genesis"]
    required do
      model  :device
      string :product_line, in: PRODUCT_LINES
    end

    def execute
      add_plants
    end

    private

    def add_plants
      Plant.create!(device: device,
                    x: rand(40...1500),
                    y: rand(40...800),
                    radius: rand(30...60),
                    name: "Celery",
                    openfarm_slug: "celery")
    end
  end
end
