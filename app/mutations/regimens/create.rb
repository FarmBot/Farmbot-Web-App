module Regimens
  class Create < Mutations::Command
    required do
      model :device, class: Device
      string :name
      string :color # in: whatever
      array :items do
        hash do
          integer :timeOffset
          string :sequence_id
        end
      end
    end

    def execute
      Regimen.create!(input_params)
    end

    def input_params
      {
        device: inputs[:device],
        name: inputs[:name],
        color: inputs[:color],
        items: format_items_for_mongoid 
      }
    end

    def format_items_for_mongoid
      inputs[:items].map { |i| find_item_or_give_error(i[:sequence_id]) }
    end

    def find_item_or_give_error(id)
      find_item(id) || give_error(id)
    end

    def find_item(id)
      Sequence.where(_id: id).first
    end

    # FYI: "add_error()" is in use by mutations library.
    def give_error(id)
      binding.pry
      add_error :items, :*, "Attempted to create a Regimen with an item that referenced sequence '#{ id }'."\
                            " Such sequence does not exist."
    end
  end
end
