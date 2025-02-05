# A sequence is a set of predefined steps executed by FarmBot. Sequences
# represent one of the most complicated systems in FarmBot. Sequences implement
# most of the functionality of a programming language such a variables and
# conditional logic.
class Sequence < ApplicationRecord
  # This number (YYYYMMDD) helps us prepare for the future by keeping things
  # versioned. We can use it as a means of identifying legacy sequences when
  # breaking changes happen.
  LATEST_VERSION = 20180209
  NOTHING = { kind: "nothing", args: {} }
  SCOPE_DECLARATION = { kind: "scope_declaration", args: {} }
  DEFAULT_ARGS = { locals: SCOPE_DECLARATION,
                   version: LATEST_VERSION }

  COLORS = %w(blue green yellow orange purple pink gray red)
  include CeleryScriptSettingsBag

  belongs_to :device
  belongs_to :folder
  belongs_to :fbos_config, foreign_key: :boot_sequence_id
  has_one :sequence_usage_report
  has_many :farm_events, as: :executable
  has_many :regimen_items
  has_many :primary_nodes, dependent: :destroy
  has_many :edge_nodes, dependent: :destroy
  has_one :sequence_publication, foreign_key: :author_sequence_id
  belongs_to :sequence_version, optional: true

  # allowable label colors for the frontend.
  [:name, :kind].each { |n| validates n, presence: true }
  validates :color, inclusion: { in: COLORS }
  validates :name, uniqueness: { scope: :device }
  validates :device, presence: true

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults
  around_destroy :delete_nodes_too

  def set_defaults
    self.color ||= "gray"
  end

  def delete_nodes_too
    Sequence.transaction do
      PrimaryNode.transaction do
        EdgeNode.transaction do
          PrimaryNode.where(sequence_id: self.id).destroy_all
          EdgeNode.where(sequence_id: self.id).destroy_all
          yield
        end
      end
    end
  end

  def self.if_still_using(pin)
    # TODO: Perform SQL UNION query here for teh performance
    pins = EdgeNode.where(kind: "pin_id", value: pin.id).pluck(:primary_node_id)
    types = EdgeNode.where(kind: "pin_type", value: pin.class.name).pluck(:primary_node_id)
    union = pins & types # DO NOT USE &&, I ACTUALLY MEANT TO `&` not `&&`!
    all = PrimaryNode.includes(:sequence).where(id: union).pluck(:sequence_id)
    sequences = Sequence.where(id: all)
    yield(sequences) if sequences.count > 0
  end

  # THIS IS AN OVERRIDE - See Sequence#body_as_json
  # Use `#manually_sync!` for most use cases.
  def broadcast?
    if destroyed? then true else false end
  end

  # Eagerly load edge_node, primary_node and usage_report. This is a big deal
  # for performance when serializing sequences.
  def self.with_usage_reports
    self.includes(:sequence_usage_report, :edge_nodes, :primary_nodes)
  end

  # THIS IS AN OVERRIDE - Special serialization required for auto sync.
  # When a sequence is created, we save it to the database to create a primary
  # key, then we iterate over `EdgeNode` and `PrimaryNode`s, assigning that
  # sequence_id as we go.
  # The problem is that the auto-sync mechanism in the app thinks the Sequence
  # is ready to broadcast as soon as it is created. It isn't. It needs to get
  # "linked" with sequence nodes before it can be broadcasted.
  def body_as_json
    return destroyed? ? nil : Sequences::Show.run!(sequence: self)
  end

  def fancy_name
    name
  end

  def self.parameterized?(id)
    PrimaryNode.where(kind: "parameter_declaration", sequence_id: id).exists?
  end

  def kind; "sequence" end
end
