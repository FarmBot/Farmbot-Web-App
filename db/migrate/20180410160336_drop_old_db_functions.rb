class DropOldDbFunctions < ActiveRecord::Migration[5.1]
  def up
    # These are old database functions that were created by the
    # `polymorphic_constraints` gem. No longer needed.
    execute "DROP FUNCTION IF EXISTS public.check_pointer_upsert_integrity() CASCADE;"
    execute "DROP FUNCTION IF EXISTS public.check_pointer_delete_integrity() CASCADE;"
  end

  def down
    # ???
  end
end
