module Regimens
  module Helpers
    ITEM_LIMIT = 500
    TOO_MANY_ITEMS = "Regimens can't have more than #{ITEM_LIMIT} items"

    def validate_regimen_items!
      if regimen_items.count > ITEM_LIMIT
        add_error(:regimen_items, :too_many, TOO_MANY_ITEMS)
      end
    end
  end
end
