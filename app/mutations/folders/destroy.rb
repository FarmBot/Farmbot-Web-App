module Folders
  class Destroy < Mutations::Command
    IN_USE = "This folder still contains %s %s(s). " \
    "They must be removed prior to deletion"

    required do
      model :device
      model :folder
    end

    def validate
      check_subfolders
      check_sequences
    end

    def execute
      folder.destroy! && ""
    end

    private

    def sequences
      @sequences ||= Sequence.where(folder: folder)
    end

    def subfolders
      @subfolders ||= Folder.where(parent: folder)
    end

    def check_sequences
      count = sequences.count
      if count > 0
        add_error :in_use, :in_use, IN_USE % [count, "sequence"]
      end
    end

    def check_subfolders
      count = subfolders.count
      if count > 0
        add_error :in_use, :in_use, IN_USE % [count, "subfolder"]
      end
    end
  end
end
