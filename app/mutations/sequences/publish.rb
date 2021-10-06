module Sequences
  class Publish < Mutations::Command
    NOT_YOURS = "Can't publish sequences you didn't create."
    OK_KINDS = %w(axis channel_name is_outdated label message message_type
                  milliseconds number op package pin_mode pin_number pin_type
                  pin_value pointer_type rhs speed value variance version x y z
                  axis_addition axis_overwrite calibrate channel coordinate
                  emergency_lock execute_script execute find_home identifier
                  move_absolute move_relative move nothing numeric pair
                  parameter_application parameter_declaration point power_off
                  random read_pin reboot resource_update safe_z
                  scope_declaration send_message sequence set_servo_angle
                  special_value speed_overwrite take_photo variable_declaration
                  wait zero)

    AUTHORIZATION_REQUIRED = "For security reasons, we can't publish" \
                             " sequences that contain the following content: "
    required do
      model :device, class: Device
      model :sequence, class: Sequence
      string :copyright
    end

    optional do
      string :description
    end

    def validate
      real_accounts_only
      validate_ownership
      enforce_allow_list
    end

    def execute
      ActiveRecord::Base.transaction do
        desc = description || sequence.description
        cr = copyright || sequence.copyright
        sequence.update!(copyright: cr)
        publication.update!(published: true)
        sv = SequenceVersion.create!(sequence_publication: publication,
                                     name: sequence.name,
                                     color: sequence.color,
                                     description: desc,
                                     copyright: cr)
        celery = Sequences::Show.run!(sequence: sequence)
        params = celery.deep_symbolize_keys.slice(:kind, :body, :args).merge(device: device)
        flat_ast = Fragments::Preprocessor.run!(**params)
        Fragments::Create.run!(flat_ast: flat_ast, owner: sv)
        publication
      end.tap { sequence.broadcast!(SecureRandom.uuid) }
    end

    def enforce_allow_list
      problems = illegal_content.uniq.sort.join(", ")
      if problems.present?
        add_error :sequence, :illegal, AUTHORIZATION_REQUIRED + problems
      end
    end

    private

    NO_GUESTS = "Guests cannot publish sequences. Please register first."

    def real_accounts_only
      if device.users.where("email LIKE '%@farmbot.guest'").any?
        add_error :guest_account, :guest_account, NO_GUESTS
      end
    end

    def validate_ownership
      if sequence.device_id != device.id
        raise Errors::Forbidden, NOT_YOURS
      end
    end

    def illegal_content
      illegal(EdgeNode) + illegal(PrimaryNode)
    end

    def illegal(klass)
      klass
        .where(sequence_id: sequence.id)
        .where
        .not(kind: OK_KINDS)
        .pluck(:kind)
        .uniq
        .sort
    end

    def publication
      @publish ||= existing_publication || new_publication
    end

    def existing_publication
      SequencePublication.find_by(author_sequence_id: sequence.id)
    end

    def new_publication
      author = device.users.first
      SequencePublication.create!(cached_author_email: author.email,
                                  author_device_id: device.id,
                                  author_sequence_id: sequence.id,
                                  published: true)
    end
  end
end
