module Sequences
  class MaybeBootstrap
    PATH             = File.join File.dirname(__FILE__), "public_sequences.json"
    PUBLIC_SEQUENCES = JSON.parse(File.read(PATH))

    def self.run!
      Sequence.transaction do
        PUBLIC_SEQUENCES
          .reject { |p| Sequence.where(is_public: true, name: p["name"]).any? }
          .map    { |p| p[:device] = public_device; p }
          .map    { |p| Sequences::Create.run!(p) }
          .pluck(:id)
          .map    { |id| Sequence.find(id).update_attributes!(is_public: true) }
      end
    end

  private

    def self.public_device
      @public_device ||= maybe_create_public_device
    end

    def self.maybe_create_public_device
      perm = Permission.to_create_public_sequences
      dev  = perm.devices.last
      dev || Device.create!(name: "Sequence Publisher", permissions: [perm])
    end
  end
end
