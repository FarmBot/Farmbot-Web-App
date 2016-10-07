class Sequence < ActiveRecord::Base
  belongs_to :device
  has_many :regimen_items
  serialize :body, Array
  serialize :args, Hash

  # allowable label colors for the frontend.
  COLORS = %w(blue green yellow orange purple pink gray red)
  PARAM_SCHEMA = {
      x:               Fixnum,
      y:               Fixnum,
      z:               Fixnum,
      speed:           Fixnum,
      pin_number:      Fixnum,
      pin_value:       Fixnum,
      pin_mode:        Fixnum,
      data_label:      String,

      # STUFF IM ADDING:
      data_value:      String,
      data_type:       String,
      # /STUFF IM ADDING

      milliseconds:    Fixnum,
      message:         String,
      sub_sequence_id: Fixnum, # TODO Requires contextual analysis.
      lhs:             String,
      op:              String,
      rhs:             Fixnum,
    }

    ARGS_SCHEMA = {

      # STUFF IM ADDING:
      var_set: [:data_label],
      var_get: [:data_label, :data_type, :data_value],
      # /STUFF IM ADDING

      move_absolute: [ :x, :y, :z, :speed],
      move_relative: [ :x, :y, :z, :speed ],        
      write_pin:     [ :pin_number, :pin_value, :pin_mode ],
      read_pin:      [ :pin_number, :data_label],
      wait:          [ :milliseconds ],
      send_message:  [ :message ],
      execute:       [ :sub_sequence_id ],
      if_statement:  [ :lhs, :op, :rhs, :sub_sequence_id ]
    }
    NODE_KINDS = ARGS_SCHEMA.keys.map(&:to_s)

    ALLOWED_DATA_TYPES = ["string", "integer"]
    ALLOWED_OPS = ["<", ">", "is", "not"]
    ALLOWED_PIN_MODES = [0, 1]
    ALLOWED_LHS = [ "x", "y", "z", "s", "busy",
                    "param_version", "movement_timeout_x",
                    "movement_timeout_y", "movement_timeout_z",
                    "movement_invert_endpoints_x", "movement_invert_endpoints_y",
                    "movement_invert_endpoints_z", "movement_invert_motor_x",
                    "movement_invert_motor_y", "movement_invert_motor_z",
                    "movement_steps_acc_dec_x", "movement_steps_acc_dec_y",
                    "movement_steps_acc_dec_z", "movement_home_up_x",
                    "movement_home_up_y", "movement_home_up_z", "movement_min_spd_x",
                    "movement_min_spd_y", "movement_min_spd_z", "movement_max_spd_x",
                    "movement_max_spd_y", "movement_max_spd_z", "time", "pin0", "pin1",
                    "pin2", "pin3", "pin4", "pin5", "pin6", "pin7", "pin8", "pin9",
                    "pin10", "pin11", "pin12", "pin13", ]

  [ :name, :kind ].each { |n| validates n, presence: true }
  validates_inclusion_of :color, in: COLORS
  validates_uniqueness_of :name, scope: :device

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.color ||= COLORS.sample
    self.kind ||= "sequence"
    self.body ||= []
    self.args ||= {}
  end
end
