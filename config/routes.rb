FarmBot::Application.routes.draw do

  namespace :api, defaults: {format: :json} do
    resource :tokens, only: [:create]
    resource :users, only: [:create]
    resource :device, only: [:show, :destroy, :create, :update]
    resources :plants, only: [:create, :destroy, :index]
    resources :planting_area, only: [:create, :destroy]
    resources :sequences, only: [:create, :update, :destroy, :index, :show] do
      resources :steps, only: [:show, :create, :index, :update, :destroy]
    end
    resources :schedules, only: [:create, :update, :destroy, :index]
  end

  devise_for :users, :controllers => {:registrations => "registrations"}

  # Routes for the single page Javascript app.
  web_app_path = "/app"
  get web_app_path, to: 'dashboard#index', as: :dashboard
  match web_app_path + "/*path", to: redirect(web_app_path), via: :all

end
