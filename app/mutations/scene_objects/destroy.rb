module SceneObjects
  class Destroy < Mutations::Command
    required do
      model :device, class: Device
      model :scene_object, class: SceneObject
    end

    def execute
      scene_object.destroy! && ""
    end
  end
end
