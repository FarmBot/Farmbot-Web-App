module ConfigHelpers
  module ActiveStorage
    REQUIRED_KEYS = %w[
      GOOGLE_CLOUD_KEYFILE_JSON
      GCS_PROJECT
      GCS_BUCKET
    ].freeze

    def self.service
      REQUIRED_KEYS.all? { |key| ENV.key?(key) } ? :google : :local
    end
  end
end
