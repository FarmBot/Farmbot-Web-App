# PROBLEM: As time passes, we must update the format and structure of sequences
#          created by users. Backwards incompatibilities and breaking changes
#          over time will cause sequences to become outdated. Forcing users to
#          update their sequences manually after updates is tedious and error
#           prone.
# SOLUTION: Every time we make a breaking change to the way Sequences work, we
#           write a migration to go along with it. Migrations run one-at-a-time
#           and ensure that sequences never become incompatible with new
#           features.
# HOW:      To create a new migration, create a subclass of SequenceMigration.
#           Give it a VERSION number and a CREATED_ON date. Add the class name
#           to the array in SequenceMigration::Base.descendants. Perform all
#           transformations inside of the #up() method. The migration will
#           automagically run if the API determines a sequence is out of date.
module SequenceMigration
  class Base
    # MAGIC NUMBER. Assume that versionless sequences are "legacy" sequences
    # from a time before versioning. Since the lowest migration version is 0, a
    # version of -1 will require all migrations to run.
    LEGACY_VERSION = -1
    VERSION        = "YOU MUST CHANGE THIS!!!"

    # I shouldn't need to do this, as this method comes with ActiveSupport, but
    # its acting weird with autoloading right now :shipit:. TODO: See if there
    # is a way to automatically infer all classes
    def self.descendants
      [
        AddVersionInfo,
        UpdateChannelNames,
        AddToolsToMoveAbs,
        UpdateIfStatement,
        CleanupArgNames
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
      Rollbar.info "RUNNING MIGRATION #{sequence_version} on #{sequence.id}"
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
