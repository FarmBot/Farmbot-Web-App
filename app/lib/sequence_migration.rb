module SequenceMigration
  class Base
    # Assume that versionless sequences are "legacy" sequences from a time before
    # versioning. Since the lowest migration version is 0, a version of -1 will
    # require all migrations
    LEGACY_VERSION = -1
    VERSION        = "YOU MUST CHANGE THIS!!!"

    # I shouldn't need to do this, as this method comes with ActiveSupport, but
    # its acting weird with autoloading right now :shipit:.
    def self.descendants
      [
        AddVersionInfo,
        UpdateChannelNames,
        AddToolsToMoveAbs,
        UpdateIfStatement
      ]
    end

    def self.latest_version
      self.descendants.map{ |k| k::VERSION }.max
    end

    attr_accessor :sequence

    def initialize(sequence)
      @sequence = sequence
    end

    def before
      expected_version = self.class::VERSION - 1
      incorrect_version = sequence_version != expected_version
      if incorrect_version
        raise "Version must be #{expected_version} to run #{self.class}"
      end
    end

    def after
      sequence.args["version"] ||= LEGACY_VERSION
      sequence.args["version"] += 1
    end

    def up
      throw "You forgot to implement an `up()` method on your migration"
    end

    def run
      before
      up
      after
    end

    def self.generate_list(sequence)
      theirs = sequence.args["version"] || LEGACY_VERSION
      descendants
        .select { |x| x::VERSION > theirs }
        .sort   { |a, b| a::VERSION <=> b::VERSION }
        .map    { |x| x.new(sequence) }
    end

    def sequence_version
      sequence.args["version"] || LEGACY_VERSION
    end
  end
end
