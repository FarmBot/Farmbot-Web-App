# A sequence is a set of predefined steps executed by FarmBot. Sequences
# represent one of the most complicated systems in FarmBot. Sequences implement
# most of the functionality of a programming language such a variables and
# conditional logic.
class Sequence < ActiveRecord::Base
  # Does some extra magic for serialized columns for us, such as providing a 
  # default value and making hashes have indifferent access.
  class CustomSerializer
    def initialize(default)
      @default = default
    end

    def load(value)
      output = value ? YAML.load(value) : @default.new
      if(output.respond_to?(:with_indifferent_access))
        return output.with_indifferent_access
      else
        return output.map(&:with_indifferent_access)
      end
    end

    def dump(value)
      YAML.dump(value || @default.new)
    end
  end

  COLORS = %w(blue green yellow orange purple pink gray red)
  include CeleryScriptSettingsBag

  belongs_to :device
  has_many :regimen_items
  has_many  :sequence_dependencies, dependent: :destroy
  serialize :body, CustomSerializer.new(Array)
  serialize :args, CustomSerializer.new(Hash)

  # allowable label colors for the frontend.
  [ :name, :kind ].each { |n| validates n, presence: true }
  validates :color, inclusion: { in: COLORS }
  validates :name, uniqueness: { scope: :device }

  after_find :maybe_migrate

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.color ||= "gray"
    self.kind ||= "sequence"
  end

  def maybe_migrate
    # spot check with Sequence.order("RANDOM()").first.maybe_migrate
    Sequences::Migrate.run!(sequence: self, device: self.device)
  end

  # Helper used for QAing stuff on staging. Grabs a random sequence from the
  # database, runs a migration (does not save) and prints to screen.
  def self.spot_check
    s = random
    puts "Sequence ##{s.id} ========="
    puts s.maybe_migrate.body.to_yaml
  end

  def self.random
    Sequence.order("RANDOM()").first
  end

  def traverse(&blk)
    hash = as_json
      .tap { |x| x[:kind] = "sequence" }
      .deep_symbolize_keys
      .slice(:kind, :args, :body)
    CeleryScript::JSONClimber.climb(hash, &blk)
  end
end
