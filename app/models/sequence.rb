# A sequence is a set of predefined steps executed by FarmBot. Sequences
# represent one of the most complicated systems in FarmBot. Sequences implement
# most of the functionality of a programming language such a variables and
# conditional logic.
class Sequence < ActiveRecord::Base
  COLORS = %w(blue green yellow orange purple pink gray red)
  include CeleryScriptSettingsBag

  belongs_to :device
  has_many :regimen_items
  has_many  :sequence_dependencies, dependent: :destroy
  serialize :body, Array
  serialize :args, Hash

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
    self.body ||= []
    self.args ||= {}
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
