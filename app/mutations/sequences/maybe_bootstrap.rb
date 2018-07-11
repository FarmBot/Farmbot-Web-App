module Sequences
  class MaybeBootstrap
    PATH             = File.join File.dirname(__FILE__), "public_sequences.json"
    PUBLIC_SEQUENCES = JSON.parse(File.read(PATH))

    def self.run!
      Sequence.transaction do
        public_device.save!
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
      @public_device ||= Device.find_or_create_by!(name: "Public FarmBot")
    end
  end
end
