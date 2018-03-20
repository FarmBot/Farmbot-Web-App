# A sequence is a set of predefined steps executed by FarmBot. Sequences
# represent one of the most complicated systems in FarmBot. Sequences implement
# most of the functionality of a programming language such a variables and
# conditional logic.
class Sequence < ApplicationRecord
  # This number (YYYYMMDD) helps us prepare for the future by keeping things
  # versioned. We can use it as a means of identifying legacy sequences when
  # breaking changes happen.
  LATEST_VERSION    = 20180209
  NOTHING           = { kind: "nothing", args: {} }
  SCOPE_DECLARATION = { kind: "scope_declaration", args: {} }
  DEFAULT_ARGS      = { locals:      SCOPE_DECLARATION,
                        version:     LATEST_VERSION }
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
  has_many  :farm_events, as: :executable
  has_many  :regimen_items
  has_many  :primary_nodes,         dependent: :destroy
  has_many  :edge_nodes,            dependent: :destroy
  serialize :body, CustomSerializer.new(Array)
  serialize :args, CustomSerializer.new(Hash)

  # allowable label colors for the frontend.
  [ :name, :kind ].each { |n| validates n, presence: true }
  validates :color, inclusion: { in: COLORS }
  validates :name, uniqueness: { scope: :device }
  validates  :device, presence: true

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults
  around_destroy :delete_nodes_too
  def set_defaults
    self.color           ||= "gray"
    self.kind            ||= "sequence"
  end

  def self.random
    Sequence.order("RANDOM()").first
  end

  def delete_nodes_too
    Sequence.transaction do
      PrimaryNode.where(sequence_id: self.id).destroy_all
      EdgeNode.where(sequence_id: self.id).destroy_all
      yield
    end
  end

  def self.if_still_using(pin)
    # TODO: Perform SQL UNION query here for teh performance
    pins  = EdgeNode.where(kind: "pin_id", value: pin.id).pluck(:primary_node_id)
    types = EdgeNode.where(kind: "pin_type", value: pin.class.name).pluck(:primary_node_id)
    union = pins & types # DO NOT USE &&, I ACTUALLY MEANT TO `&` not `&&`!
    all   = PrimaryNode.includes(:sequence).where(id: union).pluck(:sequence_id)
    sequences = Sequence.where(id: all)
    yield(sequences) if sequences.count > 0
  end

  def body=(*)
    puts "WARNING: #{__method__} is deprecated."
    nil
  end

  def args=(*)
    puts "WARNING: #{__method__} is deprecated."
    nil
  end

  def body(*)
    puts "WARNING: #{__method__} is deprecated."
    nil
  end

  def args(*)
    puts "WARNING: #{__method__} is deprecated."
    nil
  end
end
