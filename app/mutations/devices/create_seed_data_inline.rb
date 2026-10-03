module Devices
  # Used by background jobs that must finish seeding before continuing.
  class CreateSeedDataInline < CreateSeedData
    protected

    def schedule_seeds!
      run_seeds!
    end
  end
end
