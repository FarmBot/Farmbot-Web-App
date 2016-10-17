FarmBot::Application.routes.draw do

  namespace :api, defaults: {format: :json} do
    resource :sync, only: [:show]
    resource :public_key, only: [:show]
    resource :tokens, only: [:create]
    resource :users, only: [:create]
    resource :device, only: [:show, :destroy, :create, :update]
    resources :plants, only: [:create, :destroy, :index]
    resources :regimens, only: [:create, :destroy, :index, :update]
    resources :planting_area, only: [:create, :destroy]
    resources :sequences, only: [:create, :update, :destroy, :index, :show]
    resources :schedules, only: [:create, :update, :destroy, :index]
    resources :corpuses, only: [:index, :show]
  end

  devise_for :users, :controllers => {:registrations => "registrations"}

  # Routes for the single page Javascript app.

  # Routes for the single page Javascript app.
  get "/app", to: 'dashboard#index', as: :dashboard
  match "/app/*path", to: 'dashboard#index', via: :all

end

