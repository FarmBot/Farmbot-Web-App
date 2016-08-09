module Regimens
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :device, class: Device
      string :name
      string :color # in: whatever
      array :regimen_items do
        hash do
          integer :time_offset
          string :sequence_id
        end
      end
    end

    def execute
      inputs[:regimen_items].map! do |i|
        RegimenItem.new(i)
      end
      Regimen.create(inputs)
    end

    # def input_params
    #   {
    #     device: inputs[:device],
    #     name: inputs[:name],
    #     color: inputs[:color],
    #     regimen_items: format_items_for_mongoid 
    #   }
    # end

    # def format_items_for_mongoid
    #   inputs[:regimen_items].map { |i| find_item_or_give_error(i[:sequence_id]) }
    # end

    # def find_item_or_give_error(id)
    #   find_item(id) || give_error(id)
    # end

    # def find_item(id)
    #   RegimenItem.where(_id: id).first
    # end

    # # FYI: "add_error()" is in use by mutations library.
    # def give_error(id)
    #   add_error :regimen_items, :*, "Attempted to create a Regimen with an item that referenced sequence '#{ id }'."\
    #                                 " Such sequence does not exist."
    # end
  end
end
