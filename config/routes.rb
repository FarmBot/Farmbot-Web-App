FarmBot::Application.routes.draw do

  namespace :api, defaults: {format: :json} do
    resource :public_key, only: [:show]
    resource :tokens, only: [:create]
    resource :users, only: [:create]
    resource :device, only: [:show, :destroy, :create, :update]
    resources :plants, only: [:create, :destroy, :index]
    resources :regimens, only: [:create, :destroy, :index, :update]
    resources :planting_area, only: [:create, :destroy]
    resources :sequences, only: [:create, :update, :destroy, :index, :show] do
      resources :steps, only: [:show, :create, :index, :update, :destroy]
    end
    resources :schedules, only: [:create, :update, :destroy, :index]
  end

  devise_for :users, :controllers => {:registrations => "registrations"}

  # Routes for the single page Javascript app.
  # get "/app", to: 'dashboard#index', as: :dashboard
  # match "/app/*path", to: redirect("/app"), via: :all

end
