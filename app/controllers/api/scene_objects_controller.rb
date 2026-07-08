module Api
  class SceneObjectsController < Api::AbstractController
    def index
      maybe_paginate current_device.scene_objects
    end

    def show
      render json: scene_object
    end

    def create
      mutate SceneObjects::Create.run(raw_json, device: current_device)
    end

    def update
      mutate SceneObjects::Update.run(raw_json, scene_object: scene_object, device: current_device)
    end

    def destroy
      mutate SceneObjects::Destroy.run(scene_object: scene_object, device: current_device)
    end

    private

    def scene_object
      @scene_object ||= current_device.scene_objects.find(params.expect(:id))
    end
  end
end
